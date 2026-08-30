import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .llm_structurer import structure_with_llm
from .model import predictor
from .recommend import local_recommendations
from .schemas import PredictRequest, PredictResponse, RecommendedPhone
from .tavily_client import search_top_phones

app = FastAPI(title="Mobile Price Predictor API", version="1.0.0")

origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/companies")
def companies():
    return {"companies": predictor.known_companies}


@app.post("/api/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    try:
        price = predictor.predict(req.rating, req.ram_gb, req.rom_gb)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    low, high = round(price * 0.9, -2), round(price * 1.1, -2)

    # 1. Try live web search (Tavily) for current market phones near this budget/spec.
    tavily_raw = await search_top_phones(req.company, req.rating, req.ram_gb, req.rom_gb, price)

    recommendations = None
    source = "local_fallback"

    if tavily_raw:
        # 2. Structure the raw search results into clean JSON via the LLM.
        structured = await structure_with_llm(tavily_raw, req.company, req.rating, req.ram_gb, req.rom_gb, price)
        if structured:
            recommendations = structured
            source = "tavily+llm"
        else:
            # Tavily worked but LLM structuring didn't -> best-effort raw mapping.
            raw_results = tavily_raw.get("results", [])[:5]
            if raw_results:
                recommendations = [
                    {
                        "name": r.get("title", "Unknown phone"),
                        "company": req.company,
                        "price": None,
                        "specs": None,
                        "reason": r.get("content", "")[:160],
                        "source_url": r.get("url"),
                    }
                    for r in raw_results
                ]
                source = "tavily"

    if not recommendations:
        recommendations = local_recommendations(req.company, req.rating, req.ram_gb, req.rom_gb, price)
        source = "local_fallback"

    return PredictResponse(
        predicted_price=price,
        price_range_low=low,
        price_range_high=high,
        input_echo=req,
        recommendations=[RecommendedPhone(**r) for r in recommendations],
        recommendation_source=source,
    )
