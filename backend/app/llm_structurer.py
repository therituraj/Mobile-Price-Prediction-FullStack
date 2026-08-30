import json
import os
from typing import Optional

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

SYSTEM_PROMPT = """You are a phone-recommendation structuring assistant.
You will be given raw web search results about mobile phones. Extract exactly
5 distinct real phone models that best match the user's target specs/budget.

Respond with ONLY a JSON array (no prose, no markdown fences) of exactly 5 objects,
each with keys: "name" (string), "company" (string), "price" (string, include currency
symbol as found in the source, or "N/A"), "specs" (short string, e.g. "8GB RAM, 128GB, 4.4 rating"),
"reason" (one short sentence on why it fits the user's target), "source_url" (string or null).
Never invent phones that weren't mentioned in the search results."""


async def structure_with_llm(
    tavily_raw: dict,
    company: Optional[str],
    rating: float,
    ram_gb: float,
    rom_gb: float,
    budget: float
):
    """
    Uses Groq to turn raw Tavily search JSON into a clean, structured list of
    5 phone recommendations. Returns a list[dict] or None if unavailable/failed.
    """
    if not GROQ_API_KEY:
        return None

    try:
        from groq import AsyncGroq
    except ImportError:
        return None

    user_context = (
        f"User target: company preference={company or 'any'}, rating~{rating}, "
        f"RAM={ram_gb}GB, ROM={rom_gb}GB, predicted budget=₹{int(budget)}.\n\n"
        f"Raw search results JSON:\n{json.dumps(tavily_raw)[:12000]}"
    )

    try:
        client = AsyncGroq(api_key=GROQ_API_KEY)

        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1200,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_context,
                },
            ],
        )

        text = response.choices[0].message.content

        if not text:
            return None

        text = text.strip()

        # Remove markdown fences if the model accidentally adds them
        if text.startswith("```json"):
            text = text[len("```json"):].strip()
        elif text.startswith("```"):
            text = text[len("```"):].strip()

        if text.endswith("```"):
            text = text[:-3].strip()

        parsed = json.loads(text)

        if isinstance(parsed, list):
            return parsed[:5]

        return None

    except Exception:
        return None