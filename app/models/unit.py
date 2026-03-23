from datetime import datetime, timezone
from typing import Optional

from beanie import Document
from pydantic import BaseModel, Field


class Location(BaseModel):
    country: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None


class Relation(BaseModel):
    parent: str
    ratio: str


class Variant(BaseModel):
    value: float
    confidence: Optional[str] = None


class Unit(Document):
    name: str
    category: str = "area"
    base_unit: str = "sqft"
    location: Location = Field(default_factory=Location)
    conversion_factor: float
    aliases: list[str] = []
    confidence: Optional[str] = None
    relation: Optional[Relation] = None
    variants: list[Variant] = []
    version: str = "v1"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "units"
        indexes = [
            "name",
            "aliases",
            [
                ("name", 1),
                ("location.country", 1),
                ("location.state", 1),
                ("location.region", 1),
            ],
        ]
