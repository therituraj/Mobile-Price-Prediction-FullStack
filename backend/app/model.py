import os
import joblib
import json
import numpy as np
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_PATH = os.path.join(DATA_DIR, "knn_mobile_model.pkl")
SCALER_PATH = os.path.join(DATA_DIR, "scaler.pkl")
COMPANIES_PATH = os.path.join(DATA_DIR, "companies.json")


class PricePredictor:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Load the model first."
            )
        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)

        if not os.path.exists(COMPANIES_PATH):
            raise FileNotFoundError( f"Companies file not found at {COMPANIES_PATH}." )
        
        with open(COMPANIES_PATH, "r", encoding="utf-8") as f:
            self.known_companies = json.load(f)


    def predict(self, rating: float, ram_gb: float, rom_gb: float) -> float:
        sample_input = pd.DataFrame(
            [[rating, ram_gb, rom_gb]], 
            columns=['Rating', 'RamSize_GB', 'RomSize_GB']
        )
        sample_scaled = self.scaler.transform(sample_input)
        predicted_price_log = self.model.predict(sample_scaled)[0]
        predicted_price = np.expm1(predicted_price_log)

        return round(float(predicted_price),2)


predictor = PricePredictor()
