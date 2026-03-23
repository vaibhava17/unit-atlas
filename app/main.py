from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import init_db
from app.api.routes_units import router as units_router
from app.api.routes_convert import router as convert_router
from app.api.routes_contribute import router as contribute_router
from app.api.routes_admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="UnitAtlas",
    description="Geo-aware unit measurement API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(units_router, prefix="/api/v1")
app.include_router(convert_router, prefix="/api/v1")
app.include_router(contribute_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1/admin")


@app.get("/health")
async def health():
    return {"status": "ok"}
