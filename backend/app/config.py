import base64
from pydantic_settings import BaseSettings
from typing import Optional, List
from pathlib import Path
import os


class Settings(BaseSettings):
    # Server configuration
    port: int = 8080
    
    # Database configuration
    database_url: str = "postgresql://postgres:postgres@localhost:5432/ai_portfolio"
    
    # GitHub App configuration
    github_app_id: Optional[str] = None
    github_app_private_key: Optional[str] = None
    github_app_private_key_path: Optional[str] = None
    github_app_private_key_b64: Optional[str] = None
    github_webhook_secret: Optional[str] = None
    
    # GitHub OAuth configuration
    oauth_github_client_id: Optional[str] = None
    oauth_github_client_secret: Optional[str] = None
    
    # Application configuration
    contributor_window_days: int = 90
    allowed_orgs: Optional[str] = None
    
    # Admin authentication
    admin_basic_auth_user: Optional[str] = None
    admin_basic_auth_pass: Optional[str] = None
    
    # Rate limiting
    rate_limit_requests_per_minute: int = 60
    
    class Config:
        env_file = ".env"
    
    @property
    def allowed_orgs_list(self) -> List[str]:
        if not self.allowed_orgs:
            return []
        return [org.strip() for org in self.allowed_orgs.split(",")]
    
    @property
    def load_github_app_private_key(self) -> str:
        # 1) path (Docker secret/volume)
        if self.github_app_private_key_path and Path(self.github_app_private_key_path).exists():
            return Path(self.github_app_private_key_path).read_text()
        # common default for compose secrets
        p = Path("/run/secrets/github_app_private_key")
        if p.exists():
            return p.read_text()
        # 2) base64 env
        if self.github_app_private_key_b64:
            return base64.b64decode(self.github_app_private_key_b64).decode()
        # 3) inline env (escaped newlines)
        if self.github_app_private_key:
            return self.github_app_private_key.replace("\\n", "\n")
        raise RuntimeError("GitHub App private key not configured")
    
    @property
    def oauth_configured(self) -> bool:
        return bool(self.oauth_github_client_id and self.oauth_github_client_secret)

    @property
    def github_app_configured(self) -> bool:
        """Return True when GitHub App ID and private key are available.

        This method is defensive: it will attempt to resolve the private key via
        the existing loaders but will swallow errors and return False instead of
        raising during application startup.
        """
        if not self.github_app_id:
            return False
        try:
            _ = self.load_github_app_private_key
            return True
        except Exception:
            return False


settings = Settings()