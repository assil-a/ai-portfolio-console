import re
from typing import List
from app.config import settings


def validate_github_url(url: str) -> bool:
    """Validate GitHub repository URL format."""
    patterns = [
        r'^https://github\.com/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$',
        r'^git@github\.com:[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+\.git$',
        r'^github\.com/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$'
    ]
    
    return any(re.match(pattern, url.strip()) for pattern in patterns)


def validate_org_access(owner: str) -> bool:
    """Check if organization is in allowed list (if configured)."""
    if not settings.allowed_orgs_list:
        return True  # No restrictions if not configured
    
    return owner.lower() in [org.lower() for org in settings.allowed_orgs_list]


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input by removing potentially dangerous characters."""
    if not text:
        return ""
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limit length
    return sanitized[:max_length].strip()


def validate_search_query(query: str) -> bool:
    """Validate search query to prevent injection attacks."""
    if not query:
        return True
    
    # Check length
    if len(query) > 100:
        return False
    
    # Allow only alphanumeric, spaces, hyphens, underscores, and forward slashes
    return bool(re.match(r'^[a-zA-Z0-9\s._/-]+$', query))


def validate_sort_order(order: str) -> bool:
    """Validate sort order parameter."""
    allowed_orders = [
        'last_commit_at_desc',
        'last_commit_at_asc',
        'name_asc',
        'name_desc',
        'created_at_desc',
        'last_activity_at_desc',
        'last_activity_at_asc'
    ]
    return order in allowed_orders