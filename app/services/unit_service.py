import re
from typing import Optional

from app.models.unit import Unit


async def find_units(
    country: Optional[str] = None,
    state: Optional[str] = None,
    region: Optional[str] = None,
) -> list[Unit]:
    """Fallback resolution: region → state → country → global. Merge global units."""
    if not country and not state and not region:
        return await Unit.find_all().to_list()

    queries = []

    # always include global units (no location)
    queries.append(
        Unit.find(
            Unit.location.country == None,  # noqa: E711
            Unit.location.state == None,  # noqa: E711
        ).to_list()
    )

    if country and not state:
        # country-level: all units under this country (all states + regions)
        queries.append(
            Unit.find(
                {"location.country": _iregex(country)}
            ).to_list()
        )

    if country and state and not region:
        # state-level: include state units + all region units under this state
        queries.append(
            Unit.find(
                {
                    "location.country": _iregex(country),
                    "location.state": _iregex(state),
                }
            ).to_list()
        )

    if country and state and region:
        # state-level first (less specific)
        queries.append(
            Unit.find(
                {
                    "location.country": _iregex(country),
                    "location.state": _iregex(state),
                    "location.region": None,
                }
            ).to_list()
        )
        # region-level last (most specific, wins dedupe)
        queries.append(
            Unit.find(
                {
                    "location.country": _iregex(country),
                    "location.state": _iregex(state),
                    "location.region": _iregex(region),
                }
            ).to_list()
        )

    results: list[Unit] = []
    for coro in queries:
        results.extend(await coro)

    # dedupe: key by name+region so same unit from different regions both appear
    # when region is specified, key by name only (most specific wins)
    seen: dict[str, Unit] = {}
    for unit in results:
        if region:
            key = unit.name
        else:
            key = f"{unit.name}|{unit.location.region or ''}"
        seen[key] = unit
    return list(seen.values())


async def find_unit_by_name(
    name: str,
    country: Optional[str] = None,
    state: Optional[str] = None,
    region: Optional[str] = None,
) -> Optional[Unit]:
    """Find unit by name or alias with fallback resolution."""
    name_lower = name.lower()

    # build candidates from most general → most specific
    candidates: list[Unit] = []

    # try name match
    name_query = {"$or": [
        {"name": _iregex(name_lower)},
        {"aliases": _iregex(name_lower)},
    ]}

    all_matches = await Unit.find(name_query).to_list()

    if not all_matches:
        return None

    # score by specificity: higher = more specific match
    def _specificity(u: Unit) -> int:
        score = 0
        if country and u.location.country and u.location.country.lower() == country.lower():
            score += 1
        if state and u.location.state and u.location.state.lower() == state.lower():
            score += 2
        if region and u.location.region and u.location.region.lower() == region.lower():
            score += 4
        return score

    all_matches.sort(key=_specificity, reverse=True)
    return all_matches[0]


def _iregex(value: str) -> dict:
    """Case-insensitive regex match for MongoDB."""
    return {"$regex": f"^{re.escape(value)}$", "$options": "i"}
