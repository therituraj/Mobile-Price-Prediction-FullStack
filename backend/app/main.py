import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .llm_structurer import structure_with_llm
from .model import predictor,predictor_v2
from .recommend import local_recommendations
from .schemas import PredictRequest, PredictResponse, RecommendedPhone, PredictV2Request
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

    tavily_raw = await search_top_phones(req.company, req.rating, req.ram_gb, req.rom_gb, price)

    recommendations = None
    source = "local_fallback"

    if tavily_raw:
        structured = await structure_with_llm(tavily_raw, req.company, req.rating, req.ram_gb, req.rom_gb, price)
        if structured:
            recommendations = structured
            source = "tavily+llm"
        else:
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

@app.post("/api/predictor_v2")
def predict(data: PredictV2Request):
    try:
        price = predictor_v2.predict(
            rating=data.rating,
            ram_gb=data.ram_gb,
            storage_gb=data.storage_gb,
            battery_mah=data.battery_mah,
            display_inches=data.display_inches,
            refresh_hz=data.refresh_hz,
            rear_camera_mp=data.rear_camera_mp,
        )

        return {
            "success": True,
            "price": price,
            "message": "Prediction generated successfully"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "message": "Invalid prediction input",
                "error": str(e)
            }
        )

    except Exception as e:
        print(f"Predictor v2 error: {e}")

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": "Unable to generate prediction. Please try again later."
            }
        )