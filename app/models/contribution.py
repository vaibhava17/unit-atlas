from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from beanie import Document
from pydantic import Field

from app.models.unit import Location


class ContributionStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Contribution(Document):
    unit_name: str
    location: Location = Field(default_factory=Location)
    conversion_factor: float
    aliases: list[str] = []
    source: Optional[str] = None
    notes: Optional[str] = None
    status: ContributionStatus = ContributionStatus.pending
    votes: int = 0
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None

    class Settings:
        name = "contributions"
        indexes = [
            "unit_name",
            "status",
            [
                ("unit_name", 1),
                ("location.country", 1),
                ("location.state", 1),
                ("location.region", 1),
                ("conversion_factor", 1),
            ],
        ]
