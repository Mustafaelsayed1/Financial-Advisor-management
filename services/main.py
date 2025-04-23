from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import uvicorn
import os
from dotenv import load_dotenv
from services.agent.agent import financial_agent  # Import AI agent logic
import logging

# ✅ Load environment variables
load_dotenv(".env")

app = FastAPI(title="Financial Advisor AI")

# ✅ Define Input Model for Chat Requests
class ChatRequest(BaseModel):
    userId: str
    salary: float
    message: str

# ✅ Define Input Model for Forecast Requests
class ForecastRequest(BaseModel):
    forecast_type: str

# ✅ API Endpoints for Forecast Models
@app.post("/predict")
def forecast(request: ForecastRequest):
    """Runs the corresponding forecasting script based on the type."""
    script_mapping = {
        "gold": "./gold/Gold_Forecasting.py",
        "real_estate": "./real_estate/Real_Estate_Forecasting.py",
        "stocks": "./stock/Stock_Price_Forecasting.py"
    }

    script = script_mapping.get(request.forecast_type)

    if not script:
        raise HTTPException(status_code=400, detail="Invalid forecast type")

    try:
        result = subprocess.run(
            ["python", f"services/{script}"], 
            capture_output=True, 
            text=True, 
            check=True
        )
        return {"forecast": result.stdout.strip()}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {e.stderr}")

# ✅ AI Chat Endpoint
@app.post("/api/chat")
def chat_with_ai(request: ChatRequest):
    """Handles AI financial chat responses with improved human-like interaction."""
    # Validate required fields
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Set default values if not provided
    user_id = request.userId if hasattr(request, 'userId') and request.userId else "anonymous"
    salary = request.salary if hasattr(request, 'salary') and request.salary else 60000
    
    try:
        # Log the incoming request for monitoring
        logging.info(f"Chat request received from user {user_id[:5]}***")
        
        # Get response from the financial agent
        response = financial_agent(user_id, salary, request.message)
        
        # Return the enhanced, human-like response
        return {"response": response}
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="I'm having trouble processing your request at the moment. Could you try again in a little while?"
        )

# ✅ Home Route
@app.get("/")
def home():
    return {"message": "Financial AI Advisor API is running!"}

# ✅ Run Server with Configurable Port
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", 8000)))
