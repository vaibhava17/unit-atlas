from datetime import datetime, timezone
from typing import Optional

from beanie import PydanticObjectId

from app.models.contribution import Contribution, ContributionStatus
from app.models.unit import Unit, Location


class ContributionError(Exception):
    pass


async def submit_contribution(
    unit_name: str,
    country: str,
    conversion_factor: float,
    state: Optional[str] = None,
    region: Optional[str] = None,
    aliases: list[str] | None = None,
    source: Optional[str] = None,
    notes: Optional[str] = None,
) -> Contribution:
    if region and not state:
        raise ContributionError("region requires state")

    # duplicate detection: same name+location+factor
    dup = await Contribution.find_one(
        Contribution.unit_name == unit_name.lower(),
        Contribution.location.country == country,
        Contribution.location.state == state,
        Contribution.location.region == region,
        Contribution.conversion_factor == conversion_factor,
        Contribution.status != ContributionStatus.rejected,
    )
    if dup:
        raise ContributionError("Duplicate contribution already exists")

    doc = Contribution(
        unit_name=unit_name.lower(),
        location=Location(country=country, state=state, region=region),
        conversion_factor=conversion_factor,
        aliases=[a.lower() for a in (aliases or [])],
        source=source,
        notes=notes,
    )
    await doc.insert()
    return doc


async def list_contributions(
    status: Optional[str] = None,
) -> list[Contribution]:
    if status:
        return await Contribution.find(
            Contribution.status == status
        ).sort("-submitted_at").to_list()
    return await Contribution.find_all().sort("-submitted_at").to_list()


async def approve_contribution(contribution_id: str) -> Contribution:
    doc = await Contribution.get(PydanticObjectId(contribution_id))
    if not doc:
        raise ContributionError("Contribution not found")

    if doc.status != ContributionStatus.pending:
        raise ContributionError(f"Cannot approve: status is '{doc.status.value}'")

    # upsert into units collection
    existing = await Unit.find_one(
        Unit.name == doc.unit_name,
        Unit.location.country == doc.location.country,
        Unit.location.state == doc.location.state,
        Unit.location.region == doc.location.region,
    )

    now = datetime.now(timezone.utc)

    if existing:
        existing.conversion_factor = doc.conversion_factor
        if doc.aliases:
            merged = list(set(existing.aliases + doc.aliases))
            existing.aliases = merged
        existing.updated_at = now
        await existing.save()
    else:
        unit = Unit(
            name=doc.unit_name,
            location=doc.location,
            conversion_factor=doc.conversion_factor,
            aliases=doc.aliases,
            confidence="community",
            updated_at=now,
        )
        await unit.insert()

    doc.status = ContributionStatus.approved
    doc.reviewed_at = now
    await doc.save()
    return doc


async def reject_contribution(contribution_id: str) -> Contribution:
    doc = await Contribution.get(PydanticObjectId(contribution_id))
    if not doc:
        raise ContributionError("Contribution not found")

    if doc.status != ContributionStatus.pending:
        raise ContributionError(f"Cannot reject: status is '{doc.status.value}'")

    doc.status = ContributionStatus.rejected
    doc.reviewed_at = datetime.now(timezone.utc)
    await doc.save()
    return doc
