# AI Portfolio Console

A lightweight web application for managing GitHub repository portfolios. Users can submit GitHub repository URLs to collect project metadata, track activity, and view contributor information.

## 🚀 Features

- **Repository Management**: Submit GitHub repository URLs to track projects
- **Activity Tracking**: Monitor last commit activity and contributors
- **Portfolio View**: Clean table interface with sorting and filtering
- **Project Details**: Detailed view with contributor information and activity
- **GitHub Integration**: Support for GitHub App and OAuth authentication
- **Real-time Updates**: Refresh project data on demand

## 🏗️ Architecture

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI (Python) with async SQLAlchemy
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: GitHub App (recommended) or OAuth
- **Containerization**: Docker Compose

## 📋 Requirements

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)
- GitHub App or OAuth credentials

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd ai-portfolio-console

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Configure Environment

Edit `backend/.env`:

```env
# Database
DATABASE_URL=sqlite:///./portfolio.db

# GitHub Integration (optional for public repos)
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
OAUTH_GITHUB_CLIENT_ID=your_oauth_client_id
OAUTH_GITHUB_CLIENT_SECRET=your_oauth_client_secret

# Security
CONTRIBUTOR_WINDOW_DAYS=90
ALLOWED_ORGS=your-org,another-org  # Optional allowlist
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GITHUB_APP_INSTALL_URL=https://github.com/apps/your-app/installations/new
```

### 3. Development Setup

#### Option A: Docker Compose (Recommended)

```bash
docker compose up -d --build
```

#### Option B: Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python init_db.py  # Initialize database
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000 (dev) or http://localhost:5173 (Vite)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### GitHub App Setup (Recommended)

1. Create a GitHub App in your organization settings
2. Set permissions:
   - Repository permissions (Read-only):
     - Metadata: Read
     - Contents: Read
     - Pull requests: Read (optional)
   - Organization permissions (optional):
     - Members: Read
3. Install the app on selected repositories
4. Add `GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` to backend `.env`

### OAuth Setup (Alternative)

1. Create a GitHub OAuth App
2. Set authorization callback URL: `http://localhost:3000/auth/callback`
3. Add client ID and secret to backend `.env`

## 📊 API Endpoints

### Core Endpoints

- `POST /projects` - Submit a new repository
- `GET /projects` - List all projects with pagination
- `GET /projects/{id}` - Get project details
- `POST /projects/{id}/refresh` - Refresh project data
- `GET /healthz` - Health check

### Example Usage

```bash
# Submit a repository
curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/owner/repo"}'

# List projects
curl http://localhost:8000/projects?limit=10&order=last_activity_at_desc

# Get project details
curl http://localhost:8000/projects/{project_id}
```

## 🗄️ Database Schema

### Projects Table
- `id` (UUID) - Primary key
- `owner` (TEXT) - Repository owner
- `name` (TEXT) - Repository name
- `html_url` (TEXT) - GitHub URL
- `default_branch` (TEXT) - Default branch name
- `visibility` (TEXT) - public/private
- `last_commit_at` (TIMESTAMP) - Last commit timestamp
- `last_actor` (TEXT) - Last commit author
- `install_status` (TEXT) - app/oauth/none
- `created_at`, `updated_at` (TIMESTAMP)

### Contributors Table
- `id` (UUID) - Primary key
- `project_id` (UUID) - Foreign key to projects
- `login` (TEXT) - GitHub username
- `commits_90d` (INT) - Commit count in rolling window
- `last_commit_at` (TIMESTAMP) - Last commit by user
- `updated_at` (TIMESTAMP)

## 🔒 Security Features

- **Rate Limiting**: 60 requests per minute per IP
- **Input Validation**: GitHub URL validation and sanitization
- **Access Control**: Organization allowlist support
- **Read-only Permissions**: No write operations to GitHub
- **Token Security**: Secure token storage and handling

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### End-to-End Test
```bash
python test_e2e.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Environment

1. **Database**: Use PostgreSQL for production
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
   ```

2. **Environment Variables**: Set all required environment variables

3. **Docker Compose**: Use production compose file
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Health Checks**: Monitor `/healthz` endpoint

### Scaling Considerations

- Use a reverse proxy (nginx) for static file serving
- Implement database connection pooling
- Add Redis for caching GitHub API responses
- Set up monitoring and logging

## 📈 Monitoring

### Health Checks
- Backend: `GET /healthz` returns `{"status": "ok"}`
- Database connectivity verification
- GitHub API rate limit monitoring

### Logging
- Structured JSON logs
- Request/response logging
- Error tracking and alerting

## 🔄 Maintenance

### Regular Tasks
- Monitor GitHub API rate limits
- Clean up old contributor data
- Update dependencies
- Backup database

### Troubleshooting
- Check logs: `docker compose logs api`
- Verify GitHub token permissions
- Test database connectivity
- Monitor disk space for SQLite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the [API documentation](http://localhost:8000/docs)
- Review logs for error details
- Verify GitHub App/OAuth configuration
- Test with public repositories first

---

**Status**: ✅ MVP Complete - Ready for deployment and testing