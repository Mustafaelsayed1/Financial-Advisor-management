import os
import json
import torch
import logging
import threading
import time
import GPUtil
import pandas as pd
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments,
    DataCollatorForLanguageModeling
)
import uvicorn


# -----------------------------------------------------------------------------
# CONFIGURATION & PATHS
# -----------------------------------------------------------------------------

load_dotenv(os.path.join(os.getcwd(), "../../server/.env"))
MONGO_URL = os.getenv("MONGO_URL")

BASE_MODEL_DIR = "./meta-llama"
MODEL_PATH = os.path.join(BASE_MODEL_DIR, "Llama-3.2-1B")
FINE_TUNED_MODEL_PATH = "./fine_tuned_llama"
CACHE_PATH = "./cached_datasets"
TOKENIZED_CACHE = os.path.join(CACHE_PATH, "tokenized_dataset")
FINETUNE_JSON_PATH = "./financial_finetune.json"

os.makedirs(CACHE_PATH, exist_ok=True)

# -----------------------------------------------------------------------------
# LOGGING & DEVICE CONFIGURATION
# -----------------------------------------------------------------------------

device = "cuda" if torch.cuda.is_available() else "cpu"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# -----------------------------------------------------------------------------
# MONGODB & FASTAPI SETUP
# -----------------------------------------------------------------------------

try:
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    db = client["financial_ai"]
    client.server_info()
    logger.info("✅ MongoDB connected successfully.")
except Exception as e:
    logger.error(f"❌ MongoDB Connection Failed: {e}")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# GPU MONITORING
# -----------------------------------------------------------------------------

def monitor_gpu():
    """Monitors GPU usage and switches device if necessary."""
    global device
    while True:
        try:
            gpus = GPUtil.getGPUs()
            if not gpus:
                logger.warning("⚠️ No GPUs detected. Running on CPU.")
                return

            gpu_mem = gpus[0].memoryUsed
            logger.info(f"🔥 GPU Memory Usage: {gpu_mem / 1024:.2f} GB")

            if gpu_mem > 3000:  # 3GB threshold for RTX 3050
                logger.warning("⚠️ High GPU Memory! Offloading model to CPU.")
                device = "cpu"
                torch.cuda.empty_cache()
            elif gpu_mem < 2500 and device == "cpu":
                logger.info("✅ GPU memory freed! Moving back to GPU...")
                device = "cuda"
        except Exception as e:
            logger.error(f"⚠️ GPU Monitoring Error: {e}")
        time.sleep(5)

gpu_monitor_thread = threading.Thread(target=monitor_gpu, daemon=True)
gpu_monitor_thread.start()

# -----------------------------------------------------------------------------
# DATASET LOADING & PROCESSING FUNCTIONS
# -----------------------------------------------------------------------------

def load_json_dataset():
    """Loads the financial fine-tuning dataset from a JSON file."""
    if not os.path.exists(FINETUNE_JSON_PATH):
        raise FileNotFoundError(f"❌ Dataset file not found at {FINETUNE_JSON_PATH}")
    with open(FINETUNE_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("❌ Dataset is not a valid JSON list.")
    return data

def format_text(example):
    """
    Formats dataset samples into a single text field.
    If the 'text' field exists and is non-empty, it is ignored and rebuilt.
    """
    instruction = str(example.get("instruction", ""))
    input_text = str(example.get("input", ""))
    output_text = str(example.get("output", ""))
    return {
        "text": f"### Instruction:\n{instruction}\n\n### Input:\n{input_text}\n\n### Response:\n{output_text}"
    }

def tokenize_function(example, tokenizer):
    """
    Tokenizes the text field and returns numerical token IDs and attention masks.
    """
    text = example["text"].strip()
    tokenized = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=512,
        return_tensors="pt",
    )
    return {
        "input_ids": tokenized["input_ids"].squeeze().tolist(),
        "attention_mask": tokenized["attention_mask"].squeeze().tolist(),
    }

def prepare_dataset():
    """Loads, formats, tokenizes, and splits the dataset."""
    if os.path.exists(TOKENIZED_CACHE):
        logger.info("✅ Loading cached tokenized dataset.")
        return torch.load(TOKENIZED_CACHE)

    raw_data = load_json_dataset()
    formatted_data = [format_text(example) for example in raw_data]

    tokenizer, _ = load_llama()
    tokenized_data = [tokenize_function(sample, tokenizer) for sample in formatted_data]

    train_size = int(0.8 * len(tokenized_data))
    dataset = {
        "train": tokenized_data[:train_size],
        "test": tokenized_data[train_size:]
    }

    # Save dataset
    torch.save(dataset, TOKENIZED_CACHE)
    logger.info("✅ Dataset processed and cached.")

    return dataset

# -----------------------------------------------------------------------------
# MODEL LOADING
# -----------------------------------------------------------------------------

def load_llama():
    """Loads the LLaMA tokenizer and model with proper device handling."""
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    tokenizer.pad_token = tokenizer.eos_token

    logger.info("🚀 Loading model...")

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        low_cpu_mem_usage=True,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto"  # ✅ Let Accelerate handle device placement
    )

    logger.info("✅ Model loaded successfully!")
    return tokenizer, model


# -----------------------------------------------------------------------------
# FINE-TUNING
# -----------------------------------------------------------------------------

def fine_tune_llama():
    """Fine-tunes the LLaMA model using the prepared dataset."""
    dataset = prepare_dataset()
    tokenizer, model = load_llama()

    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
        pad_to_multiple_of=8
    )

    training_args = TrainingArguments(
        output_dir=FINE_TUNED_MODEL_PATH,
        eval_strategy="steps",
        save_strategy="steps",
        save_steps=1000,
        eval_steps=1000,
        per_device_train_batch_size=2,
        per_device_eval_batch_size=2,
        gradient_accumulation_steps=64,
        num_train_epochs=2,
        learning_rate=5e-5,
        weight_decay=0.01,
        warmup_steps=100,
        save_total_limit=5,
        logging_dir="./logs",
        optim="adamw_torch",
        report_to="none",
        remove_unused_columns=False,
        load_best_model_at_end=True
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"],
        data_collator=data_collator
    )

    trainer.train()
    trainer.save_model(FINE_TUNED_MODEL_PATH)
    tokenizer.save_pretrained(FINE_TUNED_MODEL_PATH)
    logger.info("🎉 Fine-tuning completed successfully!")

# -----------------------------------------------------------------------------
# IMPROVED RESPONSE GENERATION
# -----------------------------------------------------------------------------

def preprocess_prompt(message, user_id, salary):
    """
    Creates a more natural conversation starter with context for better responses.
    
    Args:
        message: The user's message
        user_id: User identifier for personalization
        salary: User's salary for financial context
    
    Returns:
        A properly formatted prompt for the model
    """
    income_level = "low" if salary < 50000 else "moderate" if salary < 100000 else "high"
    persona = (
        "You are an empathetic, helpful financial advisor with years of experience helping people manage their finances. "
        "You are talking to a real person with real financial concerns, so be thoughtful and considerate. "
        f"This person has a {income_level} income level (${salary}/year). "
        "Keep your responses conversational, warm, and avoid being overly formal or robotic. "
        "Use simple language and avoid jargon unless explaining a specific financial concept. "
        "If you're uncertain, it's okay to acknowledge limitations rather than making up information. "
        "Occasionally ask clarifying questions if that would help provide better advice."
    )
    
    # Classify the type of financial query
    query_type = "general"
    if any(term in message.lower() for term in ["invest", "stock", "bond", "etf", "fund", "portfolio"]):
        query_type = "investment"
    elif any(term in message.lower() for term in ["save", "saving", "emergency", "budget"]):
        query_type = "saving"
    elif any(term in message.lower() for term in ["debt", "loan", "credit", "mortgage"]):
        query_type = "debt"
    elif any(term in message.lower() for term in ["retire", "retirement", "401k", "ira"]):
        query_type = "retirement"
    
    context = {
        "investment": (
            "Consider their income level when making investment recommendations. "
            "Suggest lower-risk options for those with less financial security."
        ),
        "saving": (
            "Recommend saving 3-6 months of expenses for emergency funds. "
            "Suggest specific percentages based on their income level."
        ),
        "debt": (
            "Prioritize high-interest debt payoff. "
            "Be sensitive that debt can be a stressful topic."
        ),
        "retirement": (
            "Consider their current income when making retirement suggestions. "
            "Explain concepts like compound interest in simple terms."
        ),
        "general": (
            "Provide balanced advice that considers their financial situation. "
            "When appropriate, suggest resources for further learning."
        )
    }
    
    # Format the final prompt
    formatted_prompt = f"{persona}\n\nCONVERSATION CONTEXT:\n{context[query_type]}\n\nUser: {message}\n\nFinancial Advisor:"
    
    return formatted_prompt

def generate_response(prompt, user_id="anonymous", salary=60000):
    """
    Generates a more human-like response using the LLaMA model with improved parameters.
    
    Args:
        prompt: The user's message
        user_id: User identifier for personalization
        salary: User's salary for financial context
        
    Returns:
        A natural, conversational response
    """
    # Enhance the prompt with context and persona
    enhanced_prompt = preprocess_prompt(prompt, user_id, salary)
    
    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(FINE_TUNED_MODEL_PATH)
    model = AutoModelForCausalLM.from_pretrained(FINE_TUNED_MODEL_PATH).to(device)
    
    # Tokenize input
    inputs = tokenizer(enhanced_prompt, return_tensors="pt").to(device)
    
    # Generate with improved parameters for more natural text
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=800,              # Allow longer responses for complex financial advice
            min_length=100,              # Ensure substantive responses
            do_sample=True,              # Enable sampling for more natural text
            temperature=0.8,             # Slightly higher temperature for creativity
            top_p=0.92,                  # Nucleus sampling for diverse responses
            top_k=50,                    # Limit vocabulary to prevent nonsense
            repetition_penalty=1.2,      # Discourage repetitive text
            no_repeat_ngram_size=3,      # Prevent repeating the same phrases
            early_stopping=True          # Stop when complete
        )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract just the assistant's response
    if "Financial Advisor:" in response:
        response = response.split("Financial Advisor:")[1].strip()
    
    # Add a friendly touch for certain queries
    if "thank" in prompt.lower():
        response += "\n\nIs there anything else I can help you with today?"
    
    return response

# Create a function to serve as the main entry point for financial advice
def financial_agent(user_id, salary, message):
    """
    Main entry point for the financial AI agent.
    
    Args:
        user_id: User identifier
        salary: User's salary 
        message: User's message/query
        
    Returns:
        A human-like financial advice response
    """
    try:
        # Generate response with the enhanced parameters
        response = generate_response(message, user_id, float(salary))
        
        # Log interaction for improvement
        logger.info(f"Generated response for user {user_id[:5]}*** (Success)")
        return response
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Could you try asking in a different way, or perhaps try again in a moment?"

# -----------------------------------------------------------------------------
# FASTAPI ENDPOINTS
# -----------------------------------------------------------------------------

@app.post("/api/fine-tune")
def fine_tune():
    try:
        fine_tune_llama()
        return {"message": "Fine-tuning completed successfully."}
    except Exception as e:
        logger.error(f"❌ Fine-tuning error: {e}")
        raise HTTPException(status_code=500, detail="Fine-tuning failed.")

@app.post("/api/chat")
async def chat(input_data: BaseModel):
    try:
        response = generate_response(input_data.message)
        return {"response": response}
    except Exception as e:
        logger.error(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message.")

# -----------------------------------------------------------------------------
# RUN FASTAPI SERVER
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("agent:app", host="0.0.0.0", port=5000, reload=True)
