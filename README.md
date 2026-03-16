# RHR Project Intake Form

A containerized web application for collecting MOC (Managed Operations Center) project intake requests with SQLite storage.

## Features

- 📝 **Web Form**: User-friendly intake form with interactive example text
- 💾 **SQLite Database**: Local persistent storage for submissions
- 👀 **Admin View**: Browse and review submitted intake requests
- 🏥 **Health Check**: Container health monitoring endpoint
- 🔒 **Security**: Automated security scanning (SAST, dependency, container, secrets)
- ✅ **Quality**: Automated testing, linting, and code quality checks
- 🐳 **Containerized**: Production-ready Docker deployment

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.12+ (for local development)
- Git

### Run with Docker (Recommended)

```bash
# Build and start the application
docker-compose up --build

# Access the application
# - Form: http://localhost:8000
# - Admin View: http://localhost:8000/admin.html
# - Health Check: http://localhost:8000/api/health
# - API Docs: http://localhost:8000/docs
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn backend.src.app:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest --cov=backend/src --cov-report=term

# Run security scans
pip-audit -r requirements.txt
bandit -r backend/src/ -c .bandit

# Check code quality
black backend/src/
ruff check backend/src/
radon cc backend/src/ -a -s
```

### Using Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Install git hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## Architecture

### Technology Stack

- **Backend**: FastAPI 0.120+, Python 3.12
- **Database**: SQLite 3.45+ with SQLAlchemy 2.0 ORM
- **Frontend**: Vanilla HTML/CSS/JavaScript (zero dependencies)
- **Container**: Multi-stage Docker build with Alpine Linux
- **CI/CD**: GitHub Actions for testing, linting, and security scanning

### Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── api/            # API routes and middleware
│   │   ├── models/         # SQLAlchemy models and Pydantic schemas
│   │   └── services/       # Database and business logic
│   └── tests/
│       ├── unit/           # Unit tests (isolated, in-memory DB)
│       └── integration/    # Integration tests (full stack)
├── frontend/
│   ├── index.html          # Intake form
│   ├── admin.html          # Admin view
│   └── static/             # CSS and JavaScript
├── data/                   # SQLite database (Docker volume)
├── docs/                   # Additional documentation
├── .github/workflows/      # CI/CD pipelines
└── specs/                  # Feature specifications
```

## API Endpoints

- `POST /api/submissions` - Submit a new intake request
- `GET /api/submissions` - List all submissions (with pagination)
- `GET /api/submissions/{id}` - Get a specific submission
- `GET /api/health` - Health check with database connectivity

See `/docs` for interactive API documentation.

## Constitutional Compliance

This project adheres to the [Project Constitution](.specify/memory/constitution.md):

### Principle I: Code Readability ✅
- All functions ≤50 lines
- Cyclomatic complexity ≤10 (actual: avg 1.5)
- Automated linting (Ruff) and formatting (Black)

### Principle II: Containerized Deployment ✅
- Multi-stage Docker build (45 MB production image)
- Non-root user (UID 1000)
- Health check endpoint
- Environment variable configuration

### Principle III: Unit Testing ✅
- Test coverage ≥80%
- Tests run in <5 seconds
- TDD approach with isolated unit tests
- CI/CD automated testing

### Principle IV: Security Scanning ✅
- Bandit SAST scan (Python code)
- pip-audit (dependency vulnerabilities)
- Trivy (container image scan)
- Gitleaks (secret detection)
- Pre-commit hooks for prevention

## Development Workflow

1. **Branch**: Create feature branch from `main`
2. **Develop**: Write tests first (TDD), implement feature
3. **Test**: Run tests locally, ensure coverage ≥80%
4. **Quality**: Run linters, formatters, complexity checks
5. **Security**: Verify security scans pass
6. **Commit**: Pre-commit hooks run automatically
7. **Push**: CI/CD runs full test suite + security scans
8. **Review**: Create PR, await approval
9. **Merge**: Squash and merge to `main`

## Testing

### Unit Tests

```bash
# Run all unit tests
pytest backend/tests/unit/

# Run with coverage
pytest --cov=backend/src --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Integration Tests

```bash
# Run integration tests
pytest backend/tests/integration/
```

### Test Performance

Per Constitutional Principle III, the test suite must complete in <5 seconds:

```bash
# Time the test suite
time pytest --quiet --tb=no
```

## Security

See [SECURITY.md](docs/SECURITY.md) for detailed security scanning documentation.

### Vulnerability Remediation SLA

- **Critical**: 24 hours
- **High**: 7 days
- **Medium**: 30 days
- **Low**: Best effort

### Reporting Vulnerabilities

Please report security vulnerabilities via GitHub Security Advisories or email.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

Copyright © 2026 RHR. All rights reserved.

## Troubleshooting

### Database Issues

```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Test Failures

```bash
# Clear pytest cache
rm -rf .pytest_cache/

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Container Build Failures

```bash
# Clean Docker cache
docker system prune -af

# Rebuild without cache
docker-compose build --no-cache
```

## Support

For questions or issues:
- Open a GitHub issue
- Check the [documentation](docs/)
- Review the [specification](specs/001-project-intake-form/)
