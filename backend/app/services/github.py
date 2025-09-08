import httpx
import jwt
import time
import re
from typing import Optional, Dict, List, Tuple, Any
from datetime import datetime, timedelta, timezone
from app.config import settings
import structlog

logger = structlog.get_logger()


class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.graphql_url = "https://api.github.com/graphql"
        
    def parse_repo_url(self, repo_url: str) -> Tuple[str, str]:
        """Parse GitHub repository URL to extract owner and repo name."""
        # Remove trailing slash and .git
        url = repo_url.rstrip('/').rstrip('.git')
        
        # Match GitHub URL patterns
        patterns = [
            r'https://github\.com/([^/]+)/([^/]+)/?$',
            r'git@github\.com:([^/]+)/([^/]+)\.git$',
            r'github\.com/([^/]+)/([^/]+)/?$'
        ]
        
        for pattern in patterns:
            match = re.match(pattern, url)
            if match:
                return match.group(1), match.group(2)
        
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")
    
    def _generate_app_token(self) -> str:
        """Generate JWT token for GitHub App authentication."""
        if not settings.github_app_id or not settings.github_app_private_key:
            raise ValueError("GitHub App credentials not configured")
        
        now = int(time.time())
        payload = {
            'iat': now - 60,  # Issued 60 seconds in the past
            'exp': now + 600,  # Expires in 10 minutes
            'iss': settings.github_app_id
        }
        
        return jwt.encode(payload, settings.github_app_private_key, algorithm='RS256')
    
    async def _get_installation_token(self, owner: str, repo: str) -> Optional[str]:
        """Get installation access token for a specific repository."""
        if not settings.github_app_configured:
            return None
        
        try:
            app_token = self._generate_app_token()
            headers = {
                'Authorization': f'Bearer {app_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            async with httpx.AsyncClient() as client:
                # Get installation for the repository
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo}/installation",
                    headers=headers
                )
                
                if response.status_code != 200:
                    logger.warning(f"No GitHub App installation found for {owner}/{repo}")
                    return None
                
                installation_id = response.json()['id']
                
                # Get access token for the installation
                response = await client.post(
                    f"{self.base_url}/app/installations/{installation_id}/access_tokens",
                    headers=headers
                )
                
                if response.status_code == 201:
                    return response.json()['token']
                
        except Exception as e:
            logger.error(f"Failed to get installation token: {e}")
        
        return None
    
    async def _get_repo_access_token(self, owner: str, repo: str, user_token: Optional[str] = None) -> Tuple[Optional[str], str]:
        """
        Determine the best access token for a repository.
        Returns (token, install_status)
        """
        # Try GitHub App installation token first
        installation_token = await self._get_installation_token(owner, repo)
        if installation_token:
            return installation_token, "app"
        
        # Fall back to user OAuth token if provided
        if user_token:
            return user_token, "oauth"
        
        return None, "none"
    
    async def _make_graphql_request(self, query: str, variables: Dict[str, Any], token: str) -> Dict[str, Any]:
        """Make a GraphQL request to GitHub API."""
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'query': query,
            'variables': variables
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.graphql_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    
    async def get_repository_activity(self, owner: str, repo: str, user_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch repository activity including metadata, last commit, and contributors.
        """
        token, install_status = await self._get_repo_access_token(owner, repo, user_token)
        
        if not token:
            raise ValueError(f"No access to repository {owner}/{repo}. Please install the GitHub App or provide OAuth access.")
        
        # Calculate the date for contributor window
        since_date = (datetime.now(timezone.utc) - timedelta(days=settings.contributor_window_days)).isoformat()
        
        # GraphQL query to get repository data
        query = """
        query RepoActivity($owner: String!, $name: String!, $since: GitTimestamp!) {
          repository(owner: $owner, name: $name) {
            nameWithOwner
            isPrivate
            url
            defaultBranchRef {
              name
              target {
                ... on Commit {
                  committedDate
                  author {
                    user {
                      login
                    }
                    email
                    name
                  }
                  history(since: $since, first: 100) {
                    totalCount
                    nodes {
                      committedDate
                      author {
                        user {
                          login
                        }
                        email
                        name
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
            }
            pullRequests(states: OPEN, first: 1, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                number
                updatedAt
                author {
                  login
                }
              }
            }
          }
        }
        """
        
        variables = {
            'owner': owner,
            'name': repo,
            'since': since_date
        }
        
        try:
            result = await self._make_graphql_request(query, variables, token)
            
            if 'errors' in result:
                raise ValueError(f"GraphQL errors: {result['errors']}")
            
            repo_data = result['data']['repository']
            if not repo_data:
                raise ValueError(f"Repository {owner}/{repo} not found")
            
            # Process the data
            processed_data = self._process_repository_data(repo_data, install_status)
            
            # If we have more commits to fetch, get them
            if (repo_data.get('defaultBranchRef') and 
                repo_data['defaultBranchRef'].get('target') and
                repo_data['defaultBranchRef']['target'].get('history', {}).get('pageInfo', {}).get('hasNextPage')):
                
                additional_commits = await self._fetch_additional_commits(
                    owner, repo, token, since_date,
                    repo_data['defaultBranchRef']['target']['history']['pageInfo']['endCursor']
                )
                processed_data['contributors'].update(additional_commits)
            
            return processed_data
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                raise ValueError(f"Access denied to repository {owner}/{repo}")
            elif e.response.status_code == 404:
                raise ValueError(f"Repository {owner}/{repo} not found")
            else:
                raise ValueError(f"GitHub API error: {e.response.status_code}")
    
    async def _fetch_additional_commits(self, owner: str, repo: str, token: str, since_date: str, cursor: str) -> Dict[str, Dict]:
        """Fetch additional commits if pagination is needed."""
        query = """
        query AdditionalCommits($owner: String!, $name: String!, $since: GitTimestamp!, $cursor: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(since: $since, first: 100, after: $cursor) {
                    nodes {
                      committedDate
                      author {
                        user {
                          login
                        }
                        email
                        name
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        contributors = {}
        has_next_page = True
        current_cursor = cursor
        
        while has_next_page:
            variables = {
                'owner': owner,
                'name': repo,
                'since': since_date,
                'cursor': current_cursor
            }
            
            result = await self._make_graphql_request(query, variables, token)
            history = result['data']['repository']['defaultBranchRef']['target']['history']
            
            # Process commits
            for commit in history['nodes']:
                author_login = self._get_author_login(commit['author'])
                if author_login:
                    if author_login not in contributors:
                        contributors[author_login] = {
                            'login': author_login,
                            'commits': 0,
                            'last_commit_at': None
                        }
                    
                    contributors[author_login]['commits'] += 1
                    commit_date = datetime.fromisoformat(commit['committedDate'].replace('Z', '+00:00'))
                    
                    if (not contributors[author_login]['last_commit_at'] or 
                        commit_date > contributors[author_login]['last_commit_at']):
                        contributors[author_login]['last_commit_at'] = commit_date
            
            # Check if we need to continue pagination
            page_info = history['pageInfo']
            has_next_page = page_info['hasNextPage']
            current_cursor = page_info['endCursor']
        
        return contributors
    
    def _get_author_login(self, author: Dict) -> Optional[str]:
        """Extract author login from commit author data."""
        if author.get('user') and author['user'].get('login'):
            return author['user']['login']
        return None
    
    def _process_repository_data(self, repo_data: Dict, install_status: str) -> Dict[str, Any]:
        """Process raw GitHub repository data into our format."""
        result = {
            'owner': repo_data['nameWithOwner'].split('/')[0],
            'name': repo_data['nameWithOwner'].split('/')[1],
            'html_url': repo_data['url'],
            'visibility': 'private' if repo_data['isPrivate'] else 'public',
            'install_status': install_status,
            'contributors': {},
            'last_commit_at': None,
            'last_actor': None,
            'default_branch': None,
            'last_open_pr': None
        }
        
        # Process default branch and commits
        if repo_data.get('defaultBranchRef'):
            result['default_branch'] = repo_data['defaultBranchRef']['name']
            
            if repo_data['defaultBranchRef'].get('target'):
                target = repo_data['defaultBranchRef']['target']
                
                # Last commit info
                if target.get('committedDate'):
                    result['last_commit_at'] = datetime.fromisoformat(
                        target['committedDate'].replace('Z', '+00:00')
                    )
                    result['last_actor'] = self._get_author_login(target.get('author', {}))
                
                # Process commit history for contributors
                if target.get('history', {}).get('nodes'):
                    for commit in target['history']['nodes']:
                        author_login = self._get_author_login(commit['author'])
                        if author_login:
                            if author_login not in result['contributors']:
                                result['contributors'][author_login] = {
                                    'login': author_login,
                                    'commits': 0,
                                    'last_commit_at': None
                                }
                            
                            result['contributors'][author_login]['commits'] += 1
                            commit_date = datetime.fromisoformat(commit['committedDate'].replace('Z', '+00:00'))
                            
                            if (not result['contributors'][author_login]['last_commit_at'] or 
                                commit_date > result['contributors'][author_login]['last_commit_at']):
                                result['contributors'][author_login]['last_commit_at'] = commit_date
        
        # Process latest open PR
        if repo_data.get('pullRequests', {}).get('nodes'):
            pr = repo_data['pullRequests']['nodes'][0]
            result['last_open_pr'] = {
                'number': pr['number'],
                'updated_at': datetime.fromisoformat(pr['updatedAt'].replace('Z', '+00:00')),
                'author': pr['author']['login'] if pr['author'] else 'unknown'
            }
        
        return result


# Global instance
github_service = GitHubService()