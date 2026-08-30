"""
Trains a RandomForestRegressor to predict a mobile phone's price (INR)
from Rating, RamSize_GB, RomSize_GB and Company.

We don't ship a scraped real-world price dataset, so this script generates
a large synthetic dataset from a realistic pricing formula (brand premium +
spec scaling + noise). Swap `generate_synthetic_data()` for a real CSV load
(e.g. pd.read_csv("your_real_data.csv")) if you have actual market data —
the rest of the pipeline (encoding, training, saving) stays the same.

Run:
    python train_model.py
Outputs:
    app/data/model.pkl        (trained sklearn pipeline)
    app/data/companies.json   (list of companies the model was trained on)
"""
import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

RNG = np.random.default_rng(42)

COMPANY_PREMIUM = {
    "Apple": 42000,
    "Samsung": 11000,
    "Google": 19000,
    "OnePlus": 8000,
    "Nothing": 6000,
    "Xiaomi": -1500,
    "Vivo": -500,
    "Oppo": -500,
    "Motorola": -2000,
    "Realme": -3500,
    "Poco": -4500,
    "Infinix": -6500,
}

RAM_CHOICES = [2, 3, 4, 6, 8, 12, 16]
ROM_CHOICES = [32, 64, 128, 256, 512, 1024]

DATA_DIR = os.path.join(os.path.dirname(__file__), "app", "data")


def price_formula(rating, ram_gb, rom_gb, company):
    base = 2800
    price = (
        base
        + ram_gb * 950
        + rom_gb * 42
        + (rating - 3.0) * 9000
        + COMPANY_PREMIUM.get(company, 0)
    )
    # storage/ram synergy: flagship-tier ram+rom combos cost disproportionately more
    if ram_gb >= 12 and rom_gb >= 256:
        price *= 1.12
    noise = RNG.normal(0, price * 0.06)
    return max(3499, price + noise)


def generate_synthetic_data(n_rows=6000):
    companies = list(COMPANY_PREMIUM.keys())
    rows = []
    for _ in range(n_rows):
        company = RNG.choice(companies)
        rating = round(float(RNG.uniform(3.0, 5.0)), 1)
        ram_gb = int(RNG.choice(RAM_CHOICES))
        rom_gb = int(RNG.choice(ROM_CHOICES))
        price = round(price_formula(rating, ram_gb, rom_gb, company), -2)
        rows.append(
            {
                "Company": company,
                "Rating": rating,
                "RamSize_GB": ram_gb,
                "RomSize_GB": rom_gb,
                "Price": price,
            }
        )
    return pd.DataFrame(rows)


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    df = generate_synthetic_data()

    X = df[["Company", "Rating", "RamSize_GB", "RomSize_GB"]]
    y = df["Price"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("company", OneHotEncoder(handle_unknown="ignore"), ["Company"]),
        ],
        remainder="passthrough",
    )

    model = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=120,
                    max_depth=10,
                    min_samples_leaf=3,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Validation MAE: ₹{mae:,.0f}")
    print(f"Validation R^2: {r2:.4f}")

    joblib.dump(model, os.path.join(DATA_DIR, "model.pkl"))
    with open(os.path.join(DATA_DIR, "companies.json"), "w") as f:
        json.dump(sorted(COMPANY_PREMIUM.keys()), f, indent=2)

    print(f"Saved model to {os.path.join(DATA_DIR, 'model.pkl')}")


if __name__ == "__main__":
    main()
