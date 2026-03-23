from typing import Optional

from app.services.unit_service import find_unit_by_name


class ConversionError(Exception):
    pass


async def convert(
    value: float,
    from_unit: str,
    to_unit: str,
    country: Optional[str] = None,
    state: Optional[str] = None,
    region: Optional[str] = None,
) -> dict:
    from_doc = await find_unit_by_name(from_unit, country, state, region)
    if not from_doc:
        raise ConversionError(f"Unit '{from_unit}' not found")

    to_doc = await find_unit_by_name(to_unit, country, state, region)
    if not to_doc:
        raise ConversionError(f"Unit '{to_unit}' not found")

    # convert via sqft base: value * from_factor / to_factor
    result = value * (from_doc.conversion_factor / to_doc.conversion_factor)

    return {
        "value": value,
        "from_unit": from_doc.name,
        "to_unit": to_doc.name,
        "result": round(result, 6),
        "from_factor": from_doc.conversion_factor,
        "to_factor": to_doc.conversion_factor,
    }
