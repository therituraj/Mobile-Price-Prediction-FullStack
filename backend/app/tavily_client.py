import os
from typing import Optional

import httpx

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")
TAVILY_URL = "https://api.tavily.com/search"


async def search_top_phones(company: Optional[str], rating: float, ram_gb: float, rom_gb: float, budget: float):
    """
    Queries Tavily for the current best phones matching the predicted budget
    and requested specs. Returns raw Tavily result dicts, or None if no
    TAVILY_API_KEY is configured / the call fails (caller should fall back).
    """
    if not TAVILY_API_KEY:
        return None

    brand_part = f"{company} " if company else ""
    query = (
        f"best {brand_part}mobile phones 2026 around {int(budget)} INR "
        f"with {int(ram_gb)}GB RAM {int(rom_gb)}GB storage rating {rating}"
        f"from the ecommerce websites like amazon,flipkart,messho or company official websites no other source."
    )

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "advanced",
        "include_answer": True,
        "max_results": 8,
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(TAVILY_URL, json=payload)
            resp.raise_for_status()
            return resp.json()
    except Exception:
        return None
