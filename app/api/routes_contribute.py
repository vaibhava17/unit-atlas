from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ContributeRequest, ContributionResponse
from app.services.contribution_service import submit_contribution, ContributionError

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def _to_response(doc) -> ContributionResponse:
    return ContributionResponse(
        id=str(doc.id),
        unit_name=doc.unit_name,
        country=doc.location.country,
        state=doc.location.state,
        region=doc.location.region,
        conversion_factor=doc.conversion_factor,
        aliases=doc.aliases,
        source=doc.source,
        notes=doc.notes,
        status=doc.status,
        votes=doc.votes,
        submitted_at=doc.submitted_at.isoformat(),
        reviewed_at=doc.reviewed_at.isoformat() if doc.reviewed_at else None,
    )


@router.post("/contribute", response_model=ContributionResponse, status_code=201)
@limiter.limit("10/minute")
async def contribute(request: Request, req: ContributeRequest):
    try:
        doc = await submit_contribution(
            unit_name=req.unit_name,
            country=req.country,
            state=req.state,
            region=req.region,
            conversion_factor=req.conversion_factor,
            aliases=req.aliases,
            source=req.source,
            notes=req.notes,
        )
        return _to_response(doc)
    except ContributionError as e:
        raise HTTPException(status_code=400, detail=str(e))
