#!/usr/bin/env python3
"""
Migration script to add GitHub metrics columns to the projects table.
Run this script to update your existing database schema.
"""

import asyncio
import os
from sqlalchemy import text
from app.database import get_async_engine

async def run_migration():
    """Add GitHub metrics columns to projects table."""
    engine = get_async_engine()
    
    # SQL commands to add new columns
    migration_sql = [
        "ALTER TABLE projects ADD COLUMN stargazer_count INTEGER DEFAULT 0;",
        "ALTER TABLE projects ADD COLUMN fork_count INTEGER DEFAULT 0;",
        "ALTER TABLE projects ADD COLUMN watchers_count INTEGER DEFAULT 0;",
        "ALTER TABLE projects ADD COLUMN open_issues_count INTEGER DEFAULT 0;",
        "ALTER TABLE projects ADD COLUMN open_prs_count INTEGER DEFAULT 0;"
    ]
    
    async with engine.begin() as conn:
        for sql in migration_sql:
            try:
                await conn.execute(text(sql))
                print(f"✓ Executed: {sql}")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"⚠ Column already exists: {sql}")
                else:
                    print(f"✗ Error executing {sql}: {e}")
                    raise
    
    print("✓ Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
