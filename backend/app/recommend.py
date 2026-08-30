import json
import os
from typing import Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "phones.json")

with open(DATA_PATH) as f:
    PHONES = json.load(f)


def local_recommendations(company: Optional[str], rating: float, ram_gb: float, rom_gb: float, budget: float, top_n: int = 5):
    """
    Ranks the curated local phone catalogue by closeness to the user's target
    spec/budget. Used when Tavily/LLM keys aren't configured, so the product
    always returns a polished, usable result out of the box.
    """
    def score(phone):
        price_diff = abs(phone["price"] - budget) / max(budget, 1)
        rating_diff = abs(phone["rating"] - rating) / 5
        ram_diff = abs(phone["ram_gb"] - ram_gb) / max(ram_gb, 1)
        rom_diff = abs(phone["rom_gb"] - rom_gb) / max(rom_gb, 1)
        brand_bonus = 0
        if company and phone["company"].lower() == company.strip().lower():
            brand_bonus = -0.35  # strongly prefer matching brand
        return price_diff * 1.4 + rating_diff * 0.6 + ram_diff * 0.5 + rom_diff * 0.4 + brand_bonus

    ranked = sorted(PHONES, key=score)[:top_n]
    results = []
    for p in ranked:
        results.append(
            {
                "name": p["name"],
                "company": p["company"],
                "price": f"₹{p['price']:,}",
                "specs": f"{p['ram_gb']}GB RAM · {p['rom_gb']}GB storage · {p['rating']}★",
                "reason": (
                    f"Closely matches your target of ₹{int(budget):,}"
                    + (f" from {company}" if company else "")
                    + f" with similar RAM/storage/rating."
                ),
                "source_url": None,
            }
        )
    return results
