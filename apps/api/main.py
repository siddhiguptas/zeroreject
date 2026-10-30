from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.api.core.config import settings
from apps.api.core.database import init_db
from apps.api.routers import ingestion, compiler, execution, judge_audit, voice

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    yield

app = FastAPI(
    title="ZeroReject (PramaanFix) Engine",
    description="Deterministic Pre-Flight Bureaucratic Rejection Elimination & Self-Healing Agent API",
    version="2026.1",
    lifespan=lifespan
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(ingestion.router)
app.include_router(compiler.router)
app.include_router(execution.router)
app.include_router(judge_audit.router)
app.include_router(voice.router)

@app.get("/health")
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "ZeroReject (PramaanFix) Engine",
        "version": "2026.1",
        "environment": settings.ENVIRONMENT,
        "database": "SQLite (WAL Mode)" if settings.DATABASE_URL.startswith("sqlite") else "PostgreSQL",
        "zero_mock_policy": "ENFORCED"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)

