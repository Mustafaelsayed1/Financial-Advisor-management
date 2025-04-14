from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import os

app = Flask(__name__)

# ✅ Use clean absolute local path to your fine-tuned model
model_path = os.path.abspath(r"services/agent/Phi-Model/phi2-finetuned-LM/phi2-finetuned-LM")
tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(model_path, local_files_only=True)

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.get_json()
        instruction = data.get("instruction", "")

        inputs = tokenizer(instruction, return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=150)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return jsonify({"output": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
