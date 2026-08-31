from typing import List, Optional

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    company: Optional[str] = Field(
        None, description="Brand name, e.g. 'Samsung'. Optional but improves accuracy."
    )
    rating: float = Field(..., ge=1, le=5, description="Expected/known rating out of 5")
    ram_gb: float = Field(..., gt=0, le=64, description="RAM size in GB")
    rom_gb: float = Field(..., gt=0, le=2048, description="Storage size in GB")


class RecommendedPhone(BaseModel):
    name: str
    company: Optional[str] = None
    price: Optional[str] = None
    specs: Optional[str] = None
    reason: Optional[str] = None
    source_url: Optional[str] = None


class PredictResponse(BaseModel):
    predicted_price: float
    currency: str = "INR"
    price_range_low: float
    price_range_high: float
    input_echo: PredictRequest
    recommendations: List[RecommendedPhone]
    recommendation_source: str  # "tavily+llm" | "tavily" | "local_fallback"

class PredictV2Request(BaseModel):
    rating: float
    ram_gb: float
    storage_gb: float
    battery_mah: float
    display_inches: float
    refresh_hz: float
    rear_camera_mp: float