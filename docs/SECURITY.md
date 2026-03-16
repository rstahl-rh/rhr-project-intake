# Security Scanning Guide

This document describes the security scanning tools configured for this project and how to use them.

## Overview

The project implements multiple layers of security scanning in accordance with Constitutional Principle IV:

1. **Gitleaks** - Secret detection (pre-commit + CI/CD)
2. **Bandit** - Python SAST (Static Application Security Testing)
3. **pip-audit** - Dependency vulnerability scanning
4. **Trivy** - Container image scanning

## Local Development

### Pre-commit Hooks

Install pre-commit hooks to catch issues before committing:

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the git hooks
pre-commit install

# Test the hooks manually
pre-commit run --all-files
```

The pre-commit configuration (`.pre-commit-config.yaml`) runs:
- **Gitleaks**: Scans for secrets and credentials
- **Black**: Python code formatting
- **Ruff**: Python linting with auto-fix
- **Bandit**: Security vulnerability detection
- **Standard checks**: Trailing whitespace, large files, merge conflicts, private keys

### Running Security Scans Locally

#### 1. Secret Scanning (Gitleaks)

```bash
# Scan entire repository
docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest detect --source="/path" -v

# Scan with custom config
docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest detect --source="/path" --config="/path/.gitleaks.toml" -v

# Scan uncommitted changes only
docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest protect --source="/path" -v
```

#### 2. Python SAST (Bandit)

```bash
# Scan backend code
bandit -r backend/src/ -f txt

# Generate JSON report
bandit -r backend/src/ -f json -o bandit-report.json

# Use project configuration
bandit -r backend/src/ -c .bandit
```

#### 3. Dependency Scanning (pip-audit)

```bash
# Scan requirements.txt
pip-audit -r requirements.txt

# Generate JSON report
pip-audit -r requirements.txt --format json --output pip-audit-report.json

# Fix vulnerabilities automatically (if possible)
pip-audit -r requirements.txt --fix
```

#### 4. Container Scanning (Trivy)

```bash
# Build the image first
docker build -t intake-form:test .

# Scan the image for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image intake-form:test

# Scan with specific severity levels
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image --severity CRITICAL,HIGH intake-form:test

# Generate SARIF output for GitHub
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/output \
  aquasec/trivy:latest image --format sarif --output /output/trivy-results.sarif intake-form:test
```

## CI/CD Pipeline

Security scans run automatically on:
- **Every push** to `main` or `feature/*` branches
- **Every pull request** to `main`
- **Weekly schedule** (Sundays at 2 AM UTC)

### GitHub Actions Workflow

The `.github/workflows/security.yml` file defines 4 parallel jobs:

1. **bandit-sast**: Python code security analysis
2. **pip-audit**: Dependency vulnerability check
3. **trivy-container**: Docker image vulnerability scan
4. **secret-scan**: Secret detection across entire repository history

### Viewing Results

- **GitHub Security Tab**: SARIF results are uploaded automatically
- **Workflow Artifacts**: JSON reports are available for download
- **Workflow Logs**: Console output shows detailed findings

## Configuration Files

- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `.gitleaks.toml` - Gitleaks secret detection rules and allowlist
- `.bandit` - Bandit SAST configuration and exclusions
- `.github/workflows/security.yml` - CI/CD security scanning workflow

## Handling False Positives

### Gitleaks

Edit `.gitleaks.toml` to add allowlist entries:

```toml
[allowlist]
paths = [
    '''path/to/ignore/''',
]
regexes = [
    '''pattern_to_ignore''',
]
```

### Bandit

Edit `.bandit` to skip specific tests:

```ini
[bandit]
skips = ['B101', 'B601']  # Add test IDs to skip
```

Or use inline comments in code:

```python
# nosec B101
password = "example"  # This is just an example
```

## Security Requirements

Per Constitutional Principle IV, all code must:

1. Pass pre-commit security checks before committing
2. Pass CI/CD security scans before merging
3. Have no CRITICAL or HIGH severity vulnerabilities
4. Document any accepted risks with justification

## Incident Response

If secrets are detected:

1. **Immediately revoke** the exposed credential
2. **Remove from git history** using git-filter-repo or BFG
3. **Update** `.gitleaks.toml` to prevent similar issues
4. **Notify** relevant stakeholders if production credentials were exposed

## Additional Resources

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [Bandit Documentation](https://bandit.readthedocs.io/)
- [pip-audit Documentation](https://pypi.org/project/pip-audit/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
