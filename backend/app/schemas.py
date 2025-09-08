from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class VisibilityEnum(str, Enum):
    public = "public"
    private = "private"


class InstallStatusEnum(str, Enum):
    app = "app"
    oauth = "oauth"
    none = "none"


class ProjectSubmission(BaseModel):
    repo_url: HttpUrl = Field(..., description="GitHub repository URL")


class ContributorResponse(BaseModel):
    login: str
    commits: int = Field(..., alias="commits_90d")
    last_commit_at: Optional[datetime]

    class Config:
        from_attributes = True
        populate_by_name = True


class ProjectListResponse(BaseModel):
    id: uuid.UUID
    owner: str
    name: str
    html_url: str
    default_branch: Optional[str]
    visibility: Optional[VisibilityEnum]
    last_commit_at: Optional[datetime]
    last_actor: Optional[str]
    active_contributors_90d: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LastOpenPR(BaseModel):
    number: int
    updated_at: datetime
    author: str


class ProjectDetailResponse(BaseModel):
    id: uuid.UUID
    owner: str
    name: str
    html_url: str
    default_branch: Optional[str]
    visibility: Optional[VisibilityEnum]
    last_commit_at: Optional[datetime]
    last_actor: Optional[str]
    contributors_90d: List[ContributorResponse] = []
    last_open_pr: Optional[LastOpenPR] = None
    default_branch_ref: Optional[str] = None
    install_status: InstallStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectsListResponse(BaseModel):
    projects: List[ProjectListResponse]
    total: int
    limit: int
    offset: int


class HealthResponse(BaseModel):
    status: str = "ok"
    timestamp: datetime
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None