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


MODE_V2_PATH = os.path.join(DATA_DIR, "mobile_price_prediction_model_v2_random_forest.pkl")


class PredictorV2:
    def __init__(self):
        self.model = joblib.load(MODE_V2_PATH)

    def predict(
        self,
        rating: float,
        ram_gb: float,
        storage_gb: float,
        battery_mah: float,
        display_inches: float,
        refresh_hz: float,
        rear_camera_mp: float,
    ) -> float:

        features = pd.DataFrame([{
            "rating": rating,
            "ram_gb": ram_gb,
            "storage_gb": storage_gb,
            "battery_mah": battery_mah,
            "display_inches": display_inches,
            "refresh_hz": refresh_hz,
            "rear_camera_mp": rear_camera_mp,
        }])

        prediction = self.model.predict(features)

        return round(float(prediction[0]), 2)



predictor_v2 = PredictorV2()
predictor = PricePredictor()
