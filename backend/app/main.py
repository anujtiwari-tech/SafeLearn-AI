from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import init_db
from .routers import auth, threats, dashboard, scan, learning, feedback, settings as settings_router, classroom, teacher, student

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

# CORS Middleware Configuration
# Note: CORSMiddleware should be added as early as possible (at the end of middleware list)
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc) if settings.DEBUG else None},
    )

# Include Routers
app.include_router(auth.router)
app.include_router(threats.router)
app.include_router(dashboard.router)
app.include_router(scan.router)
app.include_router(learning.router)
app.include_router(settings_router.router)
app.include_router(feedback.router)
app.include_router(classroom.router)
app.include_router(teacher.router)
app.include_router(student.router)

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