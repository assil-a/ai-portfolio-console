from pydantic_settings import BaseSettings
from typing import Optional, List
import os
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # Server configuration
    port: int = 8080
    
    # Database configuration
    database_url: str = "postgresql://postgres:postgres@localhost:5432/ai_portfolio"
    
    # GitHub App configuration
    github_app_id: Optional[str] = None
    github_app_private_key_path: Optional[str] = None
    _github_app_private_key: Optional[str] = None
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
    def github_app_private_key(self) -> Optional[str]:
        logger.info(f"Attempting to read private key from {self.github_app_private_key_path}")
        if self._github_app_private_key:
            return self._github_app_private_key
        if self.github_app_private_key_path:
            logger.info(f"File exists: {os.path.exists(self.github_app_private_key_path)}")
            try:
                with open(self.github_app_private_key_path, 'r') as f:
                    self._github_app_private_key = f.read()
                logger.info("Successfully read private key")
                return self._github_app_private_key
            except FileNotFoundError:
                logger.error("Private key file not found")
                return None
        logger.warning("Private key path not set")
        return None

    @property
    def github_app_configured(self) -> bool:
        return bool(self.github_app_id and self.github_app_private_key)
    
    @property
    def oauth_configured(self) -> bool:
        return bool(self.oauth_github_client_id and self.oauth_github_client_secret)


settings = Settings()