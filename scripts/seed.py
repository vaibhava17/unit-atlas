"""Seed MongoDB from unitatlas.area.v1.yml"""

import asyncio
from datetime import datetime, timezone
from pathlib import Path

import yaml
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings
from app.models.unit import Unit, Location, Relation, Variant

YML_PATH = Path(__file__).parent.parent / "data" / "unitatlas.area.v1.yml"


def parse_yml() -> list[dict]:
    """Parse YML into flat list of unit dicts."""
    with open(YML_PATH) as f:
        data = yaml.safe_load(f)

    version = data.get("version", "v1")
    base_unit = data.get("base_unit", "sqft")
    category = data.get("category", "area")
    now = datetime.now(timezone.utc)

    units = []

    for country_code, country_data in data.get("countries", {}).items():
        # global_units (no state/region)
        for unit_name, unit_data in country_data.get("global_units", {}).items():
            units.append(_build_unit(
                unit_name, unit_data, category, base_unit, version, now,
                country=None, state=None, region=None,
            ))

        for state_key, state_data in country_data.get("states", {}).items():
            # state-level units
            for unit_name, unit_data in state_data.get("units", {}).items():
                units.append(_build_unit(
                    unit_name, unit_data, category, base_unit, version, now,
                    country=country_code, state=state_key, region=None,
                ))

            # region-level units
            for region_key, region_data in state_data.get("regions", {}).items():
                if isinstance(region_data, dict) and "units" in region_data:
                    for unit_name, unit_data in region_data["units"].items():
                        units.append(_build_unit(
                            unit_name, unit_data, category, base_unit, version, now,
                            country=country_code, state=state_key, region=region_key,
                        ))
                elif isinstance(region_data, dict) and "variants" in region_data:
                    # MP's katha-like case: region key is actually a unit name with variants
                    units.append(_build_unit(
                        region_key, region_data, category, base_unit, version, now,
                        country=country_code, state=state_key, region=None,
                    ))

    return units


def _build_unit(
    name, data, category, base_unit, version, now,
    country=None, state=None, region=None,
) -> dict:
    variants = []
    conversion_factor = 0.0
    confidence = data.get("confidence")

    if "variants" in data:
        for v in data["variants"]:
            conf = v.get("confidence") if isinstance(v, dict) else None
            val = v.get("value", v) if isinstance(v, dict) else v
            variants.append(Variant(value=float(val), confidence=conf))
        # use first variant as primary conversion_factor
        conversion_factor = variants[0].value
    elif "value" in data:
        conversion_factor = float(data["value"])

    relation = None
    if "relation" in data:
        relation = Relation(
            parent=data["relation"]["parent"],
            ratio=str(data["relation"]["ratio"]),
        )

    aliases = data.get("aliases", [])

    return {
        "name": name,
        "category": category,
        "base_unit": base_unit,
        "location": Location(country=country, state=state, region=region),
        "conversion_factor": conversion_factor,
        "aliases": aliases,
        "confidence": confidence,
        "relation": relation,
        "variants": variants,
        "version": version,
        "updated_at": now,
    }


async def seed():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    await init_beanie(database=client[settings.database_name], document_models=[Unit])

    # clear existing
    await Unit.delete_all()

    units_data = parse_yml()
    docs = [Unit(**u) for u in units_data]
    await Unit.insert_many(docs)
    print(f"Seeded {len(docs)} units into '{settings.database_name}.units'")


if __name__ == "__main__":
    asyncio.run(seed())
