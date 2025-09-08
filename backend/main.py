from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import sys
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import projects_router, health_router
from app.middleware import rate_limit_middleware

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting AI Portfolio Console API")
    logger.info(f"GitHub App configured: {settings.github_app_configured}")
    logger.info(f"OAuth configured: {settings.oauth_configured}")
    yield
    logger.info("Shutting down AI Portfolio Console API")


# Create FastAPI application
app = FastAPI(
    title="AI Portfolio Console API",
    description="API for managing and monitoring GitHub repository portfolios",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "message": "An unexpected error occurred"}
    )


# Include routers
app.include_router(health_router)
app.include_router(projects_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "AI Portfolio Console API",
        "version": "1.0.0",
        "description": "API for managing and monitoring GitHub repository portfolios",
        "github_app_configured": settings.github_app_configured,
        "oauth_configured": settings.oauth_configured
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_config=None  # Use structlog configuration
    )