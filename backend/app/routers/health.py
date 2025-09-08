from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

from app.database import get_db
from app.schemas import HealthResponse
import structlog

logger = structlog.get_logger()

router = APIRouter(tags=["health"])


@router.get("/healthz", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint.
    
    Returns application status and basic system information.
    Used by Docker health checks and monitoring systems.
    """
    try:
        # Test database connection
        await db.execute(text("SELECT 1"))
        
        return HealthResponse(
            status="ok",
            timestamp=datetime.utcnow(),
            version="1.0.0"
        )
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="error",
            timestamp=datetime.utcnow(),
            version="1.0.0"
        )