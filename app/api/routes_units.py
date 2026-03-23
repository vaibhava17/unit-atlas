from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import UnitResponse
from app.services.unit_service import find_units, find_unit_by_name

router = APIRouter()


def _to_response(unit) -> UnitResponse:
    return UnitResponse(
        name=unit.name,
        category=unit.category,
        base_unit=unit.base_unit,
        country=unit.location.country,
        state=unit.location.state,
        region=unit.location.region,
        conversion_factor=unit.conversion_factor,
        aliases=unit.aliases,
        confidence=unit.confidence,
        relation=unit.relation.model_dump() if unit.relation else None,
        variants=[v.model_dump() for v in unit.variants],
    )


@router.get("/units", response_model=list[UnitResponse])
async def get_units(
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
):
    if region and not state:
        raise HTTPException(status_code=400, detail="region requires state")
    units = await find_units(country, state, region)
    return [_to_response(u) for u in units]


@router.get("/unit/{name}", response_model=UnitResponse)
async def get_unit(
    name: str,
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
):
    if region and not state:
        raise HTTPException(status_code=400, detail="region requires state")
    unit = await find_unit_by_name(name, country, state, region)
    if not unit:
        raise HTTPException(status_code=404, detail=f"Unit '{name}' not found")
    return _to_response(unit)
