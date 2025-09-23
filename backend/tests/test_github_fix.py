import pytest
import httpx
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.github import github_service
from app.config import settings


@pytest.fixture
def mock_settings():
    """Mock settings with GitHub App configured."""
    with patch('app.services.github.settings') as mock:
        mock.github_app_id = "12345"
        mock.github_app_configured = True
        mock.load_github_app_private_key = "fake-private-key"
        yield mock


class TestGitHubInstallationTokenFix:

    @pytest.mark.asyncio
    async def test_installation_not_found_returns_helpful_error(self, mock_settings):
        """Test that 404 from installation endpoint returns installation URL."""
        with patch('app.services.github.jwt.encode', return_value="fake-jwt"):
            mock_response = MagicMock()
            mock_response.status_code = 404

            with patch('httpx.AsyncClient') as mock_client:
                mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

                token, error = await github_service._get_installation_token("testowner", "testrepo")

                assert token is None
                assert "GitHub App not installed" in error
                assert "https://github.com/apps/" in error
                assert "testowner" in error

    @pytest.mark.asyncio
    async def test_installation_forbidden_returns_scope_error(self, mock_settings):
        """Test that 403 from installation endpoint returns scope URL."""
        with patch('app.services.github.jwt.encode', return_value="fake-jwt"):
            mock_response = MagicMock()
            mock_response.status_code = 403

            with patch('httpx.AsyncClient') as mock_client:
                mock_client.return_value.__aenter__.return_value.get.return_value = mock_response

                token, error = await github_service._get_installation_token("testowner", "testrepo")

                assert token is None
                assert "not included in installation scope" in error
                assert "https://github.com/settings/installations" in error

    @pytest.mark.asyncio
    async def test_successful_installation_token_creation(self, mock_settings):
        """Test successful installation token creation."""
        with patch('app.services.github.jwt.encode', return_value="fake-jwt"):
            # Mock installation lookup response
            install_response = MagicMock()
            install_response.status_code = 200
            install_response.json.return_value = {"id": 123456}

            # Mock token creation response
            token_response = MagicMock()
            token_response.status_code = 201
            token_response.json.return_value = {"token": "ghs_installation_token"}

            with patch('httpx.AsyncClient') as mock_client:
                mock_client.return_value.__aenter__.return_value.get.return_value = install_response
                mock_client.return_value.__aenter__.return_value.post.return_value = token_response

                token, error = await github_service._get_installation_token("testowner", "testrepo")

                assert token == "ghs_installation_token"
                assert error is None

    @pytest.mark.asyncio
    async def test_timeout_handling(self, mock_settings):
        """Test that timeouts are properly handled."""
        with patch('app.services.github.jwt.encode', return_value="fake-jwt"):
            with patch('httpx.AsyncClient') as mock_client:
                mock_client.return_value.__aenter__.return_value.get.side_effect = httpx.TimeoutException("Request timeout")

                token, error = await github_service._get_installation_token("testowner", "testrepo")

                assert token is None
                assert "GitHub API timeout" in error

    @pytest.mark.asyncio
    async def test_private_key_loading_error(self):
        """Test that private key loading errors are properly handled."""
        with patch('app.services.github.settings') as mock_settings:
            mock_settings.github_app_id = "12345"
            mock_settings.load_github_app_private_key.side_effect = RuntimeError("Key not found")

            with pytest.raises(ValueError, match="GitHub App private key not accessible"):
                github_service._generate_app_token()

    @pytest.mark.asyncio
    async def test_get_repository_activity_with_detailed_error(self, mock_settings):
        """Test that get_repository_activity passes through detailed error messages."""
        with patch.object(github_service, '_get_repo_access_token') as mock_get_token:
            mock_get_token.return_value = (None, "none", "GitHub App not installed on owner/repo. Install at https://github.com/apps/test-app/installations/new")

            with pytest.raises(ValueError) as exc_info:
                await github_service.get_repository_activity("owner", "repo")

            assert "GitHub App not installed on owner/repo" in str(exc_info.value)
            assert "https://github.com/apps/test-app" in str(exc_info.value)