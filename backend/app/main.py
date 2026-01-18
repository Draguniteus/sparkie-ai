"""
Sparkie - The Queen Bee's Chatbot API
Main FastAPI application entry point.
"""
import os
import sys
from fastapi.staticfiles import StaticFiles
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


# Root endpoint - serve Next.js frontend
from fastapi.responses import FileResponse

@app.get("/", tags=["Root"])
async def root():
    """Serve the Next.js frontend."""
    # Next.js 14 with App Router structure - look in root after copying
    index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'app', 'index.html'))
    if os.path.exists(index_path):
        return FileResponse(index_path)
    # Fallback for older Next.js structure
    fallback_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'pages', 'index.html'))
    if os.path.exists(fallback_path):
        return FileResponse(fallback_path)
    return {
        "error": "Frontend not found",
        "message": "Please run 'cd frontend && npm run build' to generate the Next.js build files"
    }


# Serve Next.js static files
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'static'))
if os.path.exists(static_dir):
    app.mount("/_next/static", StaticFiles(directory=static_dir), name="static")


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


# Catch-all route for Next.js frontend - must be last
@app.get("/{path:path}", tags=["Catch-all"])
async def serve_frontend(path: str):
    """Serve the Next.js frontend for any non-API path."""
    # Skip API paths - they should be handled by routers
    if path.startswith("api/"):
        return JSONResponse(
            status_code=404,
            content={"error": "Not found", "detail": f"API endpoint /{path} not found"}
        )

    # Check for static/public files first (favicon, manifest, avatar)
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public'))
    public_path = os.path.join(public_dir, path)
    if os.path.isfile(public_path):
        return FileResponse(public_path)

    # Serve Next.js pages
    # Check for common Next.js paths
    frontend_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'app', path, 'index.html')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'app', f'{path}.html')),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'app', 'index.html')),
    ]

    for frontend_path in frontend_paths:
        if os.path.exists(frontend_path):
            return FileResponse(frontend_path)

    # Fallback to index.html for client-side routing
    index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'server', 'app', 'index.html'))
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {
        "error": "Frontend not found",
        "message": "Please run 'cd frontend && npm run build' to generate the Next.js build files"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug
    )
