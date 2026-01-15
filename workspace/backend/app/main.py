"""
Sparkie - The Queen Bee's Chatbot API
Main FastAPI application entry point.
"""
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from app.config import settings
from app.models.database import init_db, close_db
from app.services.minimax import init_minimax_service, close_minimax_service
from app.services.modelscope_image import init_modelscope_service, close_modelscope_service
from app.routers import chat_router, auth_router, multimodal_router


# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    level=settings.log_level,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
           "<cyan>{level}</cyan> | "
           "<yellow>{message}</yellow>"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info("🐝 Sparkie Hive starting up...")
    
    await init_db()
    logger.info("Database initialized")
    
    await init_minimax_service()
    logger.info("MiniMax service ready")
    
    await init_modelscope_service()
    logger.info("ModelScope image service ready")
    
    logger.info("Sparkie is ready to serve! ✨")
    
    yield
    
    logger.info("🐝 Sparkie Hive shutting down...")
    await close_modelscope_service()
    await close_minimax_service()
    await close_db()
    logger.info("Sparkie says goodbye! 👋")


# Create FastAPI app
app = FastAPI(
    title="Sparkie API",
    description="The Queen Bee's Chatbot API for Polleneer",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(multimodal_router, prefix="/api/v1")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Check if the API is healthy."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Sparkie API",
        "database": "connected"
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Sparkie API",
        "version": "1.0.0",
        "description": "The Queen Bee's Chatbot API for Polleneer",
        "documentation": "/docs",
        "health": "/health"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug
    )
