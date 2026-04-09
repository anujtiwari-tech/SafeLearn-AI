from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import init_db
from .routers import auth, threats, dashboard, scan, learning, feedback, settings as settings_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting SafeLearn AI Backend...")
    init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable Cybersecurity for Students",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.responses import JSONResponse
from fastapi import Request

# CORS Middleware - Mirroring Origin for Robust Auth
@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    origin = request.headers.get("origin")
    response = await call_next(request)
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    
    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS":
        return JSONResponse(
            content="OK",
            headers={
                "Access-Control-Allow-Origin": origin or "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            }
        )
    return response

# Include Routers
app.include_router(auth.router)
app.include_router(threats.router)
app.include_router(dashboard.router)
app.include_router(scan.router)
app.include_router(learning.router)
app.include_router(settings_router.router)
app.include_router(feedback.router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to SafeLearn AI API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafeLearn AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)