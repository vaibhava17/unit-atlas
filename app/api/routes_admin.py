from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.auth import require_admin

from app.models.schemas import ContributionResponse
from app.services.contribution_service import (
    list_contributions,
    approve_contribution,
    reject_contribution,
    ContributionError,
)

router = APIRouter(dependencies=[Depends(require_admin)])
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


@router.get("/contributions", response_model=list[ContributionResponse])
@limiter.limit("30/minute")
async def get_contributions(request: Request, status: Optional[str] = Query(None)):
    docs = await list_contributions(status)
    return [_to_response(d) for d in docs]


@router.post("/approve/{contribution_id}", response_model=ContributionResponse)
@limiter.limit("20/minute")
async def approve(request: Request, contribution_id: str):
    try:
        doc = await approve_contribution(contribution_id)
        return _to_response(doc)
    except ContributionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reject/{contribution_id}", response_model=ContributionResponse)
@limiter.limit("20/minute")
async def reject(request: Request, contribution_id: str):
    try:
        doc = await reject_contribution(contribution_id)
        return _to_response(doc)
    except ContributionError as e:
        raise HTTPException(status_code=400, detail=str(e))
