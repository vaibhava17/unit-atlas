from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ConvertRequest, ConvertResponse
from app.services.convert_service import convert, ConversionError

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/convert", response_model=ConvertResponse)
@limiter.limit("30/minute")
async def convert_units(request: Request, req: ConvertRequest):
    if req.region and not req.state:
        raise HTTPException(status_code=400, detail="region requires state")
    try:
        result = await convert(
            value=req.value,
            from_unit=req.from_unit,
            to_unit=req.to_unit,
            country=req.country,
            state=req.state,
            region=req.region,
        )
        return result
    except ConversionError as e:
        raise HTTPException(status_code=404, detail=str(e))
