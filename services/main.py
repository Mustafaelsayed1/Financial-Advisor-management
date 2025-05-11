from fastapi import FastAPI, APIRouter, Query, HTTPException
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
import warnings
from typing import List, Dict
import logging
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Gold Price Forecasting API",
    description="API for gold price historical data and predictions",
    version="1.0.0"
)

router = APIRouter(prefix="/api/gold")

MODEL_DIR = "gold_models"
DATA_FILE = "data.csv"
os.makedirs(MODEL_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

warnings.filterwarnings("ignore")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_PURITIES = ["24K", "22K", "21K", "18K", "14K", "12K", "10K", "9K"]

def load_gold_data(purity: str) -> pd.DataFrame:
    """Load and validate gold data for specific purity"""
    try:
        column_name = f"{purity} - Global Price"
        df = pd.read_csv(DATA_FILE, parse_dates=['Date'])
        
        if column_name not in df.columns:
            raise ValueError(f"Column {column_name} not found")
            
        df = df[['Date', column_name]].copy()
        df.columns = ['Date', 'Close']
        df = df.set_index('Date').sort_index()
        
        if len(df) < 100:
            raise ValueError("Insufficient data (minimum 100 records)")
        if df['Close'].isnull().any():
            raise ValueError("Missing values in price data")
            
        return df
    except Exception as e:
        logger.error(f"Data loading failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add technical indicators to the data"""
    df['SMA_50'] = df['Close'].rolling(50).mean()
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    return df.dropna()

def train_model(df: pd.DataFrame, purity: str) -> bool:
    """Train and save model for specific purity"""
    try:
        df = prepare_features(df)
        features = df[['Close', 'SMA_50', 'EMA_20']]
        
        scaler = MinMaxScaler()
        scaled_features = scaler.fit_transform(features)
        
        model = RandomForestRegressor(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        model.fit(scaled_features[:, 1:], scaled_features[:, 0])
        
        purity_dir = f"{MODEL_DIR}/{purity}"
        os.makedirs(purity_dir, exist_ok=True)
        
        joblib.dump(model, f"{purity_dir}/model.pkl")
        joblib.dump(scaler, f"{purity_dir}/scaler.pkl")
        df.to_csv(f"{purity_dir}/training_data.csv")
        
        return True
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        return False

def generate_predictions(purity: str, days: int = 15) -> List[Dict[str, float]]:
    """Generate price predictions for specific purity"""
    try:
        purity_dir = f"{MODEL_DIR}/{purity}"
        model = joblib.load(f"{purity_dir}/model.pkl")
        scaler = joblib.load(f"{purity_dir}/scaler.pkl")
        df = pd.read_csv(f"{purity_dir}/training_data.csv", index_col='Date', parse_dates=True)
        
        last = df.iloc[-1]
        current_close = last['Close']
        sma = last['SMA_50']
        ema = last['EMA_20']
        
        predictions = []
        for i in range(1, days + 1):
            X = np.array([[current_close, sma, ema]])
            X_scaled = scaler.transform(X)[:, 1:]
            
            pred_scaled = model.predict(X_scaled)[0]
            pred_array = np.array([[pred_scaled, sma, ema]])
            predicted_close = scaler.inverse_transform(pred_array)[0][0]
            
            # Update indicators
            ema = (ema * 19 + predicted_close) / 20
            sma = (sma * 49 + predicted_close) / 50
            current_close = predicted_close
            
            predictions.append({
                "date": (datetime.today() + timedelta(days=i)).strftime('%Y-%m-%d'),
                "price": round(float(predicted_close), 2)
            })
        
        return predictions
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/historical", response_model=Dict[str, List[Dict[str, float]]])
async def get_historical(
    purity: str = Query("24K", enum=VALID_PURITIES),
    period: str = Query("1y", enum=["max", "5y", "3y", "1y", "6mo", "3mo", "1mo", "7d", "1d"])
):
    try:
        df = load_gold_data(purity)
        
        period_map = {
            "max": df.index.min(),
            "5y": datetime.today() - timedelta(days=5*365),
            "3y": datetime.today() - timedelta(days=3*365),
            "1y": datetime.today() - timedelta(days=365),
            "6mo": datetime.today() - timedelta(days=180),
            "3mo": datetime.today() - timedelta(days=90),
            "1mo": datetime.today() - timedelta(days=30),
            "7d": datetime.today() - timedelta(days=7),
            "1d": datetime.today() - timedelta(days=1),
        }
        
        df = df[df.index >= period_map[period]]
        if period == "1d":
            df = df.tail(2)
        
        return {
            "symbol": purity,
            "data": [{
                "date": date.strftime('%Y-%m-%d'),
                "price": round(float(close), 2)
            } for date, close in zip(df.index, df['Close'])]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/predict", response_model=Dict[str, List[Dict[str, float]]])
async def get_predictions(
    purity: str = Query("24K", enum=VALID_PURITIES),
    days: int = Query(15, ge=1, le=30)
):
    try:
        predictions = generate_predictions(purity, days)
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/retrain", response_model=Dict[str, str])
async def retrain_model(purity: str = Query("24K", enum=VALID_PURITIES)):
    try:
        df = load_gold_data(purity)
        if train_model(df, purity):
            return {"status": "success", "message": f"Model for {purity} retrained"}
        raise HTTPException(status_code=500, detail="Training failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    try:
        for purity in VALID_PURITIES:
            model_path = f"{MODEL_DIR}/{purity}/model.pkl"
            if not os.path.exists(model_path):
                logger.info(f"Training initial model for {purity}")
                df = load_gold_data(purity)
                train_model(df, purity)
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
