from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.config import settings

# Convert postgres:// to postgresql:// for SQLAlchemy 2.0
database_url = settings.database_url
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# Async database setup
if database_url.startswith("postgresql://"):
    async_database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("sqlite:///"):
    async_database_url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
else:
    async_database_url = database_url

# Create async engine with appropriate settings
if "sqlite" in async_database_url:
    async_engine = create_async_engine(
        async_database_url, 
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    async_engine = create_async_engine(async_database_url, echo=False)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Sync database setup for migrations
if "sqlite" in database_url:
    sync_engine = create_engine(
        database_url, 
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    sync_engine = create_engine(database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()