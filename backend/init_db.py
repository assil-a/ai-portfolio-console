#!/usr/bin/env python3
"""
Initialize the database with tables.
"""

import asyncio
from app.database import async_engine, Base
from app.models import Project, ProjectContributor, ProjectRefreshQueue

async def init_database():
    """Create all database tables."""
    async with async_engine.begin() as conn:
        # Drop all tables (for testing)
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_database())