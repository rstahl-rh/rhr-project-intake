# Quickstart Guide: Project Intake Form Application

**Feature**: 001-project-intake-form
**Date**: 2026-03-13
**Target Audience**: Developers setting up local development environment

## Prerequisites

### Required Software

- **Docker** 24.0+ and **Docker Compose** 2.20+ (for containerized deployment)
- **OR** Local development stack:
  - Python 3.12+
  - pip 24.0+
  - SQLite 3.45+ (usually bundled with Python)
- **Git** 2.40+ (for version control)
- **Modern web browser** (Chrome 120+, Firefox 120+, Safari 17+)

### Optional Tools

- **curl** or **HTTPie** (API testing)
- **make** (simplified command execution)
- **pytest** (local test execution)

---

## Quick Start (Docker - Recommended)

**Get running in 2 minutes:**

```bash
# 1. Clone repository
git clone <repository-url>
cd rhr-project-intake

# 2. Checkout feature branch
git checkout 001-project-intake-form

# 3. Build and run container
docker compose up --build

# 4. Open browser
open http://localhost:8000
```

The application is now running:
- **Frontend**: http://localhost:8000 (intake form)
- **Admin view**: http://localhost:8000/admin.html (submissions list)
- **API docs**: http://localhost:8000/docs (Swagger UI)
- **Health check**: http://localhost:8000/api/health

---

## Local Development Setup (Without Docker)

### 1. Set Up Python Environment

```bash
# Create virtual environment
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
# Database will be created automatically on first run
# Location: data/intake.db (configured in .env)

# To manually create database:
python -c "from backend.src.services.database import init_database; init_database()"
```

### 3. Run Development Server

```bash
# Start FastAPI server with auto-reload
uvicorn backend.src.app:app --reload --host 0.0.0.0 --port 8000

# Server output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Application startup complete.
```

### 4. Verify Installation

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"2026-03-13T15:30:00Z"}

# View API documentation
open http://localhost:8000/docs
```

---

## Project Structure

```
rhr-project-intake/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── submission.py       # SQLAlchemy ORM model
│   │   │   └── schemas.py          # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── database.py         # Database connection and queries
│   │   │   └── validation.py       # Business logic validation
│   │   ├── api/
│   │   │   ├── routes.py           # API endpoints
│   │   │   └── middleware.py       # Error handling, logging
│   │   └── app.py                   # FastAPI application entry point
│   ├── tests/
│   │   ├── unit/                    # Isolated unit tests
│   │   └── integration/             # API contract tests
│   ├── Dockerfile                   # Multi-stage container build
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── index.html                   # Main intake form page
│   ├── admin.html                   # Submissions list page
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css          # Form styling (gray examples, etc.)
│   │   └── js/
│   │       ├── form.js             # Example text show/hide logic
│   │       └── admin.js            # Admin list view logic
│   └── tests/                       # Frontend unit tests (Jest)
├── data/
│   └── intake.db                    # SQLite database (gitignored)
├── docker-compose.yml               # Local development orchestration
├── .env.example                     # Environment variable template
└── README.md                        # Project documentation
```

---

## Configuration

### Environment Variables

Create `.env` file in project root (copy from `.env.example`):

```bash
# Application Settings
APP_ENV=development
APP_PORT=8000
APP_HOST=0.0.0.0

# Database
DATABASE_PATH=./data/intake.db

# Security (development only - change for production)
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000

# Logging
LOG_LEVEL=INFO
```

### Docker Environment

Edit `docker-compose.yml` to customize:

```yaml
environment:
  - DATABASE_PATH=/app/data/intake.db
  - APP_PORT=8000
  - LOG_LEVEL=INFO

ports:
  - "8000:8000"  # Change first port to expose different port

volumes:
  - intake-data:/app/data  # Persistent database storage
```

---

## Development Workflow

### Running Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=backend/src --cov-report=term --cov-report=html

# Run specific test file
pytest tests/unit/test_models.py

# Run tests with verbose output
pytest -v

# Open coverage report
open htmlcov/index.html
```

**Expected Output (Constitutional Requirement: 80% coverage, <5s runtime)**:
```
============================= test session starts ==============================
collected 42 items

tests/unit/test_models.py ..................                            [ 42%]
tests/unit/test_schemas.py ..............                               [ 76%]
tests/unit/test_database.py .........                                   [100%]

---------- coverage: platform linux, python 3.12.2-final-0 -----------
Name                                  Stmts   Miss  Cover
---------------------------------------------------------
backend/src/models/submission.py         18      2    89%
backend/src/models/schemas.py            32      3    91%
backend/src/services/database.py         25      2    92%
backend/src/services/validation.py       15      1    93%
backend/src/api/routes.py                45      5    89%
backend/src/app.py                       12      1    92%
---------------------------------------------------------
TOTAL                                   147     14    90%

========================== 42 passed in 2.34s ===============================
```

### Code Quality Checks

```bash
# Run linter (Ruff - modern Python linter)
ruff check backend/src/

# Auto-fix linting issues
ruff check --fix backend/src/

# Run formatter (Black)
black backend/src/

# Type checking (mypy)
mypy backend/src/

# Security scanning (Bandit)
bandit -r backend/src/

# Dependency vulnerability scan
pip-audit
```

### Database Management

```bash
# View database contents (SQLite CLI)
sqlite3 data/intake.db

# List tables
.tables

# View submissions
SELECT * FROM submissions;

# Clear all data (development only)
DELETE FROM submissions;

# Backup database
cp data/intake.db data/intake.db.backup

# Restore database
cp data/intake.db.backup data/intake.db
```

---

## Using the Application

### Submit a New Intake Request

**Via Web Form**:
1. Navigate to http://localhost:8000
2. Fill in all 8 required fields (examples shown in gray)
3. Click "Submit Request"
4. Receive confirmation message with submission ID

**Via API** (for testing):
```bash
curl -X POST http://localhost:8000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "project_overview": "This is a test submission for development purposes. It contains enough text to meet the 50-character minimum requirement.",
    "administrative_info": "Requestor: Developer <dev@example.com>\nFunding: Test Budget",
    "timeline": "One week starting 2026-03-20",
    "technical_requirements": "Containerized deployment on Linux server",
    "user_accounts": "Developer <dev@example.com> - Principal Investigator",
    "notes": "Test submission",
    "attachments": "None"
  }'
```

**Expected Response**:
```json
{
  "id": 1,
  "project_name": "Test Project",
  ...
  "created_at": "2026-03-13T15:30:00Z"
}
```

### View Submissions (Admin)

**Via Web UI**:
1. Navigate to http://localhost:8000/admin.html
2. See list of all submissions ordered by most recent
3. Click on a submission to view full details

**Via API**:
```bash
# List all submissions
curl http://localhost:8000/api/submissions

# Get specific submission
curl http://localhost:8000/api/submissions/1
```

---

## Troubleshooting

### Common Issues

**1. Port 8000 already in use**

```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in docker-compose.yml or .env
APP_PORT=8001
```

**2. Database permission errors**

```bash
# Ensure data directory exists and is writable
mkdir -p data
chmod 755 data

# In Docker, ensure volume has correct permissions
docker compose down -v  # Remove volumes
docker compose up  # Recreate with correct permissions
```

**3. Tests failing with "database locked"**

```bash
# SQLite concurrent write issue - ensure tests use in-memory DB
# Check conftest.py fixture:
engine = create_engine("sqlite:///:memory:")  # Not sqlite:///file.db
```

**4. Frontend not loading (404 errors)**

```bash
# Ensure static files are being served
# Check backend/src/app.py contains:
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

# Verify frontend files exist
ls -la frontend/
```

**5. Import errors (ModuleNotFoundError)**

```bash
# Ensure you're in the project root directory
pwd  # Should show /path/to/rhr-project-intake

# Ensure PYTHONPATH includes project root
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or run via module:
python -m backend.src.app
```

### Logs and Debugging

**View application logs**:
```bash
# Docker logs
docker compose logs -f intake-form

# Local development logs (stdout)
# Uvicorn logs appear in terminal

# Enable debug logging
LOG_LEVEL=DEBUG uvicorn backend.src.app:app --reload
```

**Interactive debugging**:
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use VS Code debugger with launch.json:
{
  "type": "python",
  "request": "launch",
  "module": "uvicorn",
  "args": ["backend.src.app:app", "--reload"]
}
```

---

## Production Deployment

### Building Production Container

```bash
# Build production image
docker build -t intake-form:1.0.0 .

# Tag for registry
docker tag intake-form:1.0.0 registry.example.com/intake-form:1.0.0

# Push to registry
docker push registry.example.com/intake-form:1.0.0

# Run production container
docker run -d \
  -p 8000:8000 \
  -v intake-data:/app/data \
  -e DATABASE_PATH=/app/data/intake.db \
  -e APP_ENV=production \
  -e LOG_LEVEL=WARNING \
  --name intake-form \
  intake-form:1.0.0
```

### Production Checklist

- [ ] Change `ALLOWED_ORIGINS` to production domain
- [ ] Set `APP_ENV=production`
- [ ] Configure `LOG_LEVEL=WARNING` or `ERROR`
- [ ] Set up database backups (volume snapshots)
- [ ] Configure reverse proxy (nginx/Caddy) with HTTPS
- [ ] Enable security headers (HSTS, CSP, X-Frame-Options)
- [ ] Set up monitoring (health check endpoint)
- [ ] Configure log aggregation (if needed)
- [ ] Review and update security scan configuration
- [ ] Document incident response procedures

---

## Next Steps

After completing quickstart:

1. **Read [data-model.md](./data-model.md)** - Understand database schema and validation rules
2. **Read [contracts/api-endpoints.md](./contracts/api-endpoints.md)** - Learn API contract specifications
3. **Review [research.md](./research.md)** - Understand technology choices and rationale
4. **Check [plan.md](./plan.md)** - See full implementation plan and constitutional compliance

---

## Support and Contributing

**Questions**: Check [README.md](../../README.md) for project overview

**Issues**: Report bugs via GitHub Issues

**Contributing**: Follow [CONTRIBUTING.md](../../CONTRIBUTING.md) guidelines

**Testing**: All PRs require 80% test coverage (run `pytest --cov`)

**Code Review**: All changes require constitutional compliance verification

---

## Constitutional Compliance Verification

Before submitting changes, verify compliance:

```bash
# Principle I: Code Readability
ruff check backend/src/  # Linting
black --check backend/src/  # Formatting
radon cc backend/src/ -a  # Complexity (must be ≤ 10)

# Principle II: Containerization
docker build -t intake-form:test .  # Must build successfully
trivy image intake-form:test  # Container scan

# Principle III: Unit Testing
pytest --cov=backend/src --cov-fail-under=80  # Must pass with ≥80% coverage
pytest --durations=0  # Must complete in <5 seconds

# Principle IV: Security Scanning
bandit -r backend/src/  # SAST
pip-audit  # Dependency vulnerabilities
git-secrets --scan  # Secret scanning
```

All checks must pass before merge.
