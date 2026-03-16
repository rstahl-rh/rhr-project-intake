# Contributing to RHR Project Intake Form

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Constitutional Requirements](#constitutional-requirements)
- [Testing Requirements](#testing-requirements)
- [Security Requirements](#security-requirements)
- [Code Quality Standards](#code-quality-standards)
- [Pull Request Process](#pull-request-process)
- [Vulnerability Remediation](#vulnerability-remediation)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize security and quality
- Follow the project constitution

## Getting Started

### Prerequisites

- Python 3.12 or higher
- Docker and Docker Compose
- Git
- A code editor (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/rhr-project-intake.git
cd rhr-project-intake

# Install dependencies
pip install -r requirements.txt

# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Verify setup
pytest --cov=backend/src
docker-compose up --build
```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Implement Changes (TDD Approach)

Follow Test-Driven Development as required by Constitutional Principle III:

1. **Write failing tests first**
   ```bash
   # Create test file
   touch backend/tests/unit/test_your_feature.py

   # Write tests that should fail
   pytest backend/tests/unit/test_your_feature.py
   ```

2. **Implement the feature**
   ```bash
   # Write minimal code to make tests pass
   # Verify tests pass
   pytest backend/tests/unit/test_your_feature.py
   ```

3. **Refactor**
   ```bash
   # Clean up code while keeping tests green
   # Run full test suite
   pytest --cov=backend/src
   ```

### 3. Verify Quality Standards

Before committing, ensure all quality gates pass:

```bash
# Run tests with coverage (≥80% required)
pytest --cov=backend/src --cov-report=term --cov-fail-under=80

# Check test performance (<5s required)
time pytest --quiet --tb=no

# Run linter
ruff check backend/src/

# Run formatter
black backend/src/

# Check complexity (≤10 required)
radon cc backend/src/ -a -s
radon cc backend/src/ -n C  # Should return no results

# Run security scans
pip-audit -r requirements.txt
bandit -r backend/src/ -c .bandit
```

### 4. Commit Changes

```bash
# Stage files
git add <files>

# Commit (pre-commit hooks run automatically)
git commit -m "feat: add feature description

Detailed explanation of changes.

Closes #123"
```

**Commit Message Format:**

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting changes
- `refactor:` Code restructuring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

### 5. Push and Create Pull Request

```bash
# Push to remote
git push origin feature/your-feature-name

# Create PR via GitHub UI or CLI
gh pr create --title "Feature: Your feature name" --body "Description"
```

## Constitutional Requirements

All code must comply with the [Project Constitution](.specify/memory/constitution.md).

### Principle I: Code Readability

**Requirements:**
- Functions ≤50 lines
- Cyclomatic complexity ≤10
- Pass Ruff linting
- Pass Black formatting

**Verification:**
```bash
radon cc backend/src/ -a -s
ruff check backend/src/
black --check backend/src/
```

### Principle II: Containerized Deployment

**Requirements:**
- Changes must not break Docker build
- Health check must pass
- Environment variables externalized

**Verification:**
```bash
docker build -t intake-form:test .
docker run -d --name test -p 8000:8000 intake-form:test
sleep 10
docker exec test wget --spider http://localhost:8000/api/health
docker stop test && docker rm test
```

### Principle III: Unit Testing

**Requirements:**
- Test coverage ≥80%
- Tests run in <5 seconds
- All tests pass
- Use TDD approach

**Verification:**
```bash
pytest --cov=backend/src --cov-fail-under=80
time pytest --quiet --tb=no
```

### Principle IV: Security Scanning

**Requirements:**
- No critical/high vulnerabilities
- Pass all security scans
- No secrets in commits

**Verification:**
```bash
bandit -r backend/src/ -c .bandit
pip-audit -r requirements.txt
```

## Testing Requirements

### Unit Tests (MANDATORY)

- **Coverage**: Minimum 80% code coverage
- **Isolation**: Use in-memory SQLite database
- **Performance**: Complete in <5 seconds total
- **Location**: `backend/tests/unit/`

**Example:**

```python
import pytest
from backend.src.models.submission import Submission

def test_submission_creation(db_session):
    """Test creating a submission with valid data."""
    submission = Submission(
        project_name="Test Project",
        project_overview="Test overview",
        # ... other required fields
    )
    db_session.add(submission)
    db_session.commit()

    assert submission.id is not None
    assert submission.project_name == "Test Project"
```

### Integration Tests (RECOMMENDED)

- **Scope**: Full API endpoint testing
- **Location**: `backend/tests/integration/`
- **Framework**: FastAPI TestClient

**Example:**

```python
from fastapi.testclient import TestClient
from backend.src.app import app

client = TestClient(app)

def test_submit_intake_request():
    """Test POST /api/submissions endpoint."""
    response = client.post("/api/submissions", json={
        "project_name": "Test",
        # ... other fields
    })
    assert response.status_code == 201
```

### Test Organization

```
backend/tests/
├── conftest.py           # Shared fixtures
├── unit/
│   ├── test_models.py    # Model tests
│   ├── test_schemas.py   # Schema validation tests
│   └── test_database.py  # Database function tests
└── integration/
    └── test_api.py       # API endpoint tests
```

## Security Requirements

### Pre-commit Scanning

Pre-commit hooks automatically scan for:
- Secrets (Gitleaks)
- Security vulnerabilities (Bandit)
- Code quality issues (Ruff, Black)

### CI/CD Scanning

GitHub Actions runs:
- **Bandit**: Python SAST scan
- **pip-audit**: Dependency vulnerability scan
- **Trivy**: Container image scan
- **Gitleaks**: Secret detection in commit history

### Handling Security Findings

#### False Positives

For Bandit false positives:

```python
# nosec B101
password = get_password_from_env()  # Not hardcoded
```

For Gitleaks false positives, update `.gitleaks.toml`:

```toml
[allowlist]
regexes = [
    '''example_pattern_to_ignore''',
]
```

#### Real Vulnerabilities

**DO NOT:**
- Ignore real vulnerabilities
- Commit workarounds without approval
- Disable security tools

**DO:**
- Report in GitHub Issues immediately
- Follow remediation SLA (see below)
- Update dependencies to patched versions
- Add tests for security fixes

## Code Quality Standards

### Python Style Guide

- **PEP 8** compliance (enforced by Ruff)
- **Black** formatting (line length: 100)
- **Type hints** for function signatures
- **Docstrings** for public APIs

### File Organization

```python
"""Module-level docstring."""

# Standard library imports
import os
from datetime import datetime

# Third-party imports
from fastapi import FastAPI
from sqlalchemy import Column

# Local imports
from backend.src.models import Base

# Constants
MAX_LENGTH = 200

# Functions/Classes
def function_name():
    """Function docstring."""
    pass
```

### Error Handling

```python
# Good: Specific exception handling
try:
    submission = get_submission(id)
except ValueError as e:
    raise HTTPException(status_code=404, detail=str(e))

# Bad: Generic exception handling
try:
    submission = get_submission(id)
except Exception:
    pass
```

## Pull Request Process

### PR Checklist

Before submitting a PR, verify:

- [ ] All tests pass locally
- [ ] Test coverage ≥80%
- [ ] Test suite runs in <5 seconds
- [ ] Code passes linting (Ruff)
- [ ] Code passes formatting (Black)
- [ ] Complexity ≤10 for all functions
- [ ] Security scans pass (Bandit, pip-audit)
- [ ] Docker builds successfully
- [ ] No secrets in commits
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG updated (if applicable)

### PR Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Constitutional Compliance
- [ ] Code Readability (Principle I)
- [ ] Containerized Deployment (Principle II)
- [ ] Unit Testing (Principle III)
- [ ] Security Scanning (Principle IV)

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD must pass
2. **Code Review**: At least one approval required
3. **Security Review**: For security-sensitive changes
4. **Constitutional Review**: Verify all principles met
5. **Merge**: Squash and merge to main

## Vulnerability Remediation

### Response SLA

| Severity | Remediation Time | Actions Required |
|----------|------------------|------------------|
| Critical | 24 hours | Immediate hotfix, emergency deployment |
| High | 7 days | Prioritize in next sprint, update dependencies |
| Medium | 30 days | Include in regular maintenance |
| Low | Best effort | Document, address when convenient |

### Remediation Process

1. **Identification**: Security scan alerts or researcher report
2. **Verification**: Confirm vulnerability is real and exploitable
3. **Assessment**: Determine severity and impact
4. **Remediation**: Apply patch/update/workaround
5. **Testing**: Verify fix doesn't break functionality
6. **Deployment**: Follow standard deployment process
7. **Documentation**: Update CHANGELOG and security advisories

### Dependency Updates

```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade <package>

# Verify compatibility
pytest --cov=backend/src
docker-compose up --build

# Update requirements.txt
pip freeze > requirements.txt.new
# Review and merge changes into requirements.txt

# Re-run security scans
pip-audit -r requirements.txt
```

## Questions?

- Open a GitHub Discussion
- Review existing issues and PRs
- Check the [documentation](docs/)
- Consult the [Project Constitution](.specify/memory/constitution.md)

Thank you for contributing!
