from typing import Optional

from pydantic import BaseModel, Field


class UnitResponse(BaseModel):
    name: str
    category: str
    base_unit: str
    country: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    conversion_factor: float
    aliases: list[str] = []
    confidence: Optional[str] = None
    relation: Optional[dict] = None
    variants: list[dict] = []


class ConvertRequest(BaseModel):
    value: float = Field(gt=0)
    from_unit: str
    to_unit: str
    country: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None


class ConvertResponse(BaseModel):
    value: float
    from_unit: str
    to_unit: str
    result: float
    from_factor: float
    to_factor: float
