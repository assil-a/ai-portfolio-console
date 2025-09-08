from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.models import Project, ProjectContributor
from app.schemas import ProjectListResponse, ProjectDetailResponse, ContributorResponse, LastOpenPR
from app.services.github import github_service
import structlog

logger = structlog.get_logger()


class ProjectService:
    
    async def create_project(self, db: AsyncSession, repo_url: str, user_token: Optional[str] = None) -> Project:
        """Create a new project by fetching data from GitHub."""
        # Parse repository URL
        owner, name = github_service.parse_repo_url(repo_url)
        
        # Check if project already exists
        existing_project = await self.get_project_by_owner_name(db, owner, name)
        if existing_project:
            # Refresh existing project instead
            return await self.refresh_project(db, existing_project.id, user_token)
        
        # Fetch repository data from GitHub
        repo_data = await github_service.get_repository_activity(owner, name, user_token)
        
        # Create project record
        project = Project(
            owner=repo_data['owner'],
            name=repo_data['name'],
            html_url=repo_data['html_url'],
            default_branch=repo_data['default_branch'],
            visibility=repo_data['visibility'],
            last_commit_at=repo_data['last_commit_at'],
            last_actor=repo_data['last_actor'],
            install_status=repo_data['install_status']
        )
        
        db.add(project)
        await db.flush()  # Get the project ID
        
        # Create contributor records
        await self._update_contributors(db, project.id, repo_data['contributors'])
        
        await db.commit()
        await db.refresh(project)
        
        logger.info(f"Created project {owner}/{name} with {len(repo_data['contributors'])} contributors")
        return project
    
    async def get_project_by_owner_name(self, db: AsyncSession, owner: str, name: str) -> Optional[Project]:
        """Get project by owner and name."""
        result = await db.execute(
            select(Project).where(Project.owner == owner, Project.name == name)
        )
        return result.scalar_one_or_none()
    
    async def get_project_by_id(self, db: AsyncSession, project_id: uuid.UUID) -> Optional[Project]:
        """Get project by ID with contributors loaded."""
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.contributors))
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()
    
    async def list_projects(
        self, 
        db: AsyncSession, 
        limit: int = 50, 
        offset: int = 0, 
        order_by: str = "last_commit_at_desc",
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        """List projects with pagination and filtering."""
        
        # Build base query
        query = select(Project)
        
        # Add search filter
        if search:
            search_term = f"%{search.lower()}%"
            query = query.where(
                or_(
                    func.lower(Project.owner).like(search_term),
                    func.lower(Project.name).like(search_term),
                    func.lower(func.concat(Project.owner, '/', Project.name)).like(search_term)
                )
            )
        
        # Add ordering
        if order_by == "last_commit_at_desc":
            query = query.order_by(desc(Project.last_commit_at))
        elif order_by == "last_commit_at_asc":
            query = query.order_by(asc(Project.last_commit_at))
        elif order_by == "name_asc":
            query = query.order_by(asc(Project.owner), asc(Project.name))
        elif order_by == "name_desc":
            query = query.order_by(desc(Project.owner), desc(Project.name))
        elif order_by == "created_at_desc":
            query = query.order_by(desc(Project.created_at))
        else:
            query = query.order_by(desc(Project.last_commit_at))
        
        # Get total count
        count_query = select(func.count(Project.id))
        if search:
            search_term = f"%{search.lower()}%"
            count_query = count_query.where(
                or_(
                    func.lower(Project.owner).like(search_term),
                    func.lower(Project.name).like(search_term),
                    func.lower(func.concat(Project.owner, '/', Project.name)).like(search_term)
                )
            )
        
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination
        query = query.limit(limit).offset(offset)
        
        # Execute query
        result = await db.execute(query)
        projects = result.scalars().all()
        
        # Get contributor counts for each project
        project_list = []
        for project in projects:
            contributor_count = await self._get_contributor_count(db, project.id)
            project_data = ProjectListResponse.model_validate(project)
            project_data.active_contributors_90d = contributor_count
            project_list.append(project_data)
        
        return {
            "projects": project_list,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    
    async def get_project_detail(self, db: AsyncSession, project_id: uuid.UUID) -> Optional[ProjectDetailResponse]:
        """Get detailed project information."""
        project = await self.get_project_by_id(db, project_id)
        if not project:
            return None
        
        # Get contributors
        contributors_result = await db.execute(
            select(ProjectContributor)
            .where(ProjectContributor.project_id == project_id)
            .order_by(desc(ProjectContributor.commits_90d))
        )
        contributors = contributors_result.scalars().all()
        
        # Convert to response format
        contributors_response = [
            ContributorResponse.model_validate(contributor) for contributor in contributors
        ]
        
        # Create project detail response
        project_detail = ProjectDetailResponse.model_validate(project)
        project_detail.contributors_90d = contributors_response
        project_detail.default_branch_ref = project.default_branch
        
        # Note: last_open_pr would need to be fetched from GitHub API in real-time
        # For MVP, we'll leave it as None since it's optional
        
        return project_detail
    
    async def refresh_project(self, db: AsyncSession, project_id: uuid.UUID, user_token: Optional[str] = None) -> Project:
        """Refresh project data from GitHub."""
        project = await self.get_project_by_id(db, project_id)
        if not project:
            raise ValueError(f"Project with ID {project_id} not found")
        
        # Fetch updated data from GitHub
        repo_data = await github_service.get_repository_activity(
            project.owner, project.name, user_token
        )
        
        # Update project fields
        project.default_branch = repo_data['default_branch']
        project.visibility = repo_data['visibility']
        project.last_commit_at = repo_data['last_commit_at']
        project.last_actor = repo_data['last_actor']
        project.install_status = repo_data['install_status']
        
        # Update contributors
        await self._update_contributors(db, project.id, repo_data['contributors'])
        
        await db.commit()
        await db.refresh(project)
        
        logger.info(f"Refreshed project {project.owner}/{project.name}")
        return project
    
    async def _update_contributors(self, db: AsyncSession, project_id: uuid.UUID, contributors_data: Dict[str, Dict]):
        """Update contributors for a project."""
        # Delete existing contributors
        await db.execute(
            select(ProjectContributor).where(ProjectContributor.project_id == project_id)
        )
        
        # Create new contributor records
        for login, data in contributors_data.items():
            contributor = ProjectContributor(
                project_id=project_id,
                login=login,
                commits_90d=data['commits'],
                last_commit_at=data['last_commit_at']
            )
            db.add(contributor)
    
    async def _get_contributor_count(self, db: AsyncSession, project_id: uuid.UUID) -> int:
        """Get the number of contributors for a project."""
        result = await db.execute(
            select(func.count(ProjectContributor.id))
            .where(ProjectContributor.project_id == project_id)
        )
        return result.scalar() or 0


# Global instance
project_service = ProjectService()