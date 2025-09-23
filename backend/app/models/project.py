from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import os

# Use String for UUID in SQLite, UUID for PostgreSQL
if "sqlite" in os.getenv("DATABASE_URL", ""):
    def UUIDColumn(*args, **kwargs):
        return Column(String(36), *args, **kwargs)
else:
    from sqlalchemy.dialects.postgresql import UUID
    def UUIDColumn(*args, **kwargs):
        return Column(UUID(as_uuid=True), *args, **kwargs)


class Project(Base):
    __tablename__ = "projects"

    id = UUIDColumn(primary_key=True, default=uuid.uuid4)
    owner = Column(String, nullable=False)
    name = Column(String, nullable=False)
    html_url = Column(Text, nullable=False)
    default_branch = Column(String)
    visibility = Column(String)  # 'public' or 'private'
    last_commit_at = Column(DateTime(timezone=True))
    last_actor = Column(String)
    install_status = Column(String, default='none')  # 'app', 'oauth', 'none'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    contributors = relationship("ProjectContributor", back_populates="project", cascade="all, delete-orphan")
    refresh_queue = relationship("ProjectRefreshQueue", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.owner}/{self.name}>"


class ProjectContributor(Base):
    __tablename__ = "project_contributors"

    id = UUIDColumn(primary_key=True, default=uuid.uuid4)
    project_id = UUIDColumn(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    login = Column(String, nullable=False)
    commits_90d = Column(Integer, nullable=False, default=0)
    last_commit_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="contributors")

    def __repr__(self):
        return f"<ProjectContributor {self.login} ({self.commits_90d} commits)>"


class ProjectRefreshQueue(Base):
    __tablename__ = "project_refresh_queue"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    project_id = UUIDColumn(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    queued_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))

    # Relationships
    project = relationship("Project", back_populates="refresh_queue")

    def __repr__(self):
        return f"<ProjectRefreshQueue {self.project_id} queued at {self.queued_at}>"