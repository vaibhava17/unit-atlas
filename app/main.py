from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.database import init_db
from app.api.routes_units import router as units_router
from app.api.routes_convert import router as convert_router
from app.api.routes_contribute import router as contribute_router
from app.api.routes_admin import router as admin_router

STATIC_DIR = Path(__file__).parent.parent / "static"

limiter = Limiter(key_func=get_remote_address)


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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(units_router, prefix="/api/v1")
app.include_router(convert_router, prefix="/api/v1")
app.include_router(contribute_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1/admin")


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve Next.js static export
if STATIC_DIR.exists():
    # _next assets
    app.mount("/_next", StaticFiles(directory=STATIC_DIR / "_next"), name="next_assets")

    @app.get("/{path:path}")
    async def serve_spa(request: Request, path: str):
        # try exact file
        file_path = STATIC_DIR / path
        if file_path.is_file():
            return FileResponse(file_path)

        # try path/index.html (Next.js trailingSlash)
        index_path = STATIC_DIR / path / "index.html"
        if index_path.is_file():
            return HTMLResponse(index_path.read_text())

        # fallback to root index.html
        root_index = STATIC_DIR / "index.html"
        if root_index.is_file():
            return HTMLResponse(root_index.read_text())

        return HTMLResponse("Not found", status_code=404)
