from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from app.database import get_db
from app.schemas import (
    ProjectSubmission, ProjectListResponse, ProjectDetailResponse, 
    ProjectsListResponse, ErrorResponse
)
from app.services.project import project_service
from app.utils import (
    validate_github_url, validate_org_access, sanitize_input,
    validate_search_query, validate_sort_order
)
import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/overview/metrics")
async def get_overview_metrics(
    db: AsyncSession = Depends(get_db)
):
    """
    Get overview metrics for the dashboard.
    
    Returns:
    - Total stars across all repositories
    - Number of active repositories (with commits in last 30 days)
    - Total open pull requests
    - Total contributors across all projects
    """
    try:
        metrics = await project_service.get_overview_metrics(db)
        return metrics
    
    except Exception as e:
        logger.error(f"Error getting overview metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/", response_model=ProjectDetailResponse)
async def create_project(
    submission: ProjectSubmission,
    db: AsyncSession = Depends(get_db),
    user_token: Optional[str] = None  # TODO: Extract from OAuth session
):
    """
    Submit a new GitHub repository for tracking.
    
    The system will:
    1. Parse the repository URL
    2. Determine access method (GitHub App or OAuth)
    3. Fetch repository metadata and activity
    4. Store project and contributor information
    """
    try:
        repo_url = str(submission.repo_url)
        
        # Validate GitHub URL format
        if not validate_github_url(repo_url):
            raise HTTPException(status_code=400, detail="Invalid GitHub repository URL format")
        
        # Parse owner from URL for org validation
        from app.services.github import github_service
        owner, name = github_service.parse_repo_url(repo_url)
        
        # Check organization access if configured
        if not validate_org_access(owner):
            raise HTTPException(
                status_code=403, 
                detail=f"Access to organization '{owner}' is not allowed"
            )
        
        project = await project_service.create_project(db, repo_url, user_token)
        return await project_service.get_project_detail(db, project.id)
    
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Failed to create project: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Unexpected error creating project: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/", response_model=ProjectsListResponse)
async def list_projects(
    limit: int = Query(50, ge=1, le=100, description="Number of projects to return"),
    offset: int = Query(0, ge=0, description="Number of projects to skip"),
    order: str = Query("last_activity_at_desc", description="Sort order"),
    search: Optional[str] = Query(None, description="Search term for owner/repo name"),
    db: AsyncSession = Depends(get_db)
):
    """
    List all tracked repositories with pagination and filtering.
    
    Supported order values:
    - last_activity_at_desc (default)
    - last_activity_at_asc
    - name_asc
    - name_desc
    - created_at_desc
    """
    try:
        # Validate search query
        if search and not validate_search_query(search):
            raise HTTPException(status_code=400, detail="Invalid search query")
        
        # Sanitize search input
        clean_search = sanitize_input(search) if search else None
        
        # Map order parameter to internal format
        order_mapping = {
            "last_activity_at_desc": "last_commit_at_desc",
            "last_activity_at_asc": "last_commit_at_asc",
            "name_asc": "name_asc",
            "name_desc": "name_desc",
            "created_at_desc": "created_at_desc"
        }
        
        internal_order = order_mapping.get(order, "last_commit_at_desc")
        
        # Validate sort order
        if not validate_sort_order(internal_order):
            raise HTTPException(status_code=400, detail="Invalid sort order")
        
        result = await project_service.list_projects(
            db, limit=limit, offset=offset, order_by=internal_order, search=clean_search
        )
        
        return ProjectsListResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing projects: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific project.
    
    Returns:
    - Repository metadata
    - Last activity information
    - List of contributors in the last 90 days
    - Installation status
    """
    try:
        project = await project_service.get_project_detail(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return project
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/{project_id}/refresh", response_model=ProjectDetailResponse)
async def refresh_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user_token: Optional[str] = None  # TODO: Extract from OAuth session
):
    """
    Refresh project data from GitHub.
    
    This will:
    1. Re-fetch repository metadata
    2. Update last activity information
    3. Refresh contributor statistics
    4. Update installation status
    """
    try:
        project = await project_service.refresh_project(db, project_id, user_token)
        return await project_service.get_project_detail(db, project.id)
    
    except ValueError as e:
        logger.warning(f"Failed to refresh project {project_id}: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        else:
            raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Unexpected error refreshing project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
