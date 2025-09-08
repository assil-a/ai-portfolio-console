#!/usr/bin/env python3
"""
Create database tables using the working database configuration.
"""

import asyncio
from sqlalchemy import text
from app.database import async_engine

async def create_tables():
    """Create all database tables."""
    
    # SQL for creating tables with SQLite-compatible UUID (as TEXT)
    create_projects_sql = """
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        name TEXT NOT NULL,
        html_url TEXT NOT NULL,
        default_branch TEXT,
        visibility TEXT CHECK (visibility IN ('public','private')),
        last_commit_at TIMESTAMP,
        last_actor TEXT,
        install_status TEXT CHECK (install_status IN ('app','oauth','none')) DEFAULT 'none',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (owner, name)
    );
    """
    
    create_contributors_sql = """
    CREATE TABLE IF NOT EXISTS project_contributors (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        login TEXT NOT NULL,
        commits_90d INTEGER NOT NULL DEFAULT 0,
        last_commit_at TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, login)
    );
    """
    
    create_refresh_queue_sql = """
    CREATE TABLE IF NOT EXISTS project_refresh_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        queued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
    );
    """
    
    async with async_engine.begin() as conn:
        print("Creating projects table...")
        await conn.execute(text(create_projects_sql))
        
        print("Creating project_contributors table...")
        await conn.execute(text(create_contributors_sql))
        
        print("Creating project_refresh_queue table...")
        await conn.execute(text(create_refresh_queue_sql))
        
        print("✅ All tables created successfully!")
        
        # Verify tables were created
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [row[0] for row in result.fetchall()]
        print(f"📋 Tables in database: {tables}")

if __name__ == "__main__":
    asyncio.run(create_tables())