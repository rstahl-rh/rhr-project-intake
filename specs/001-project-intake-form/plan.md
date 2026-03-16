# Implementation Plan: Project Intake Form Application

**Branch**: `001-project-intake-form` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-intake-form/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a web application that provides a project intake form for MOC resource requests. The application displays a multi-field form with dynamic example text that appears/disappears based on user input. Form submissions are persisted to a local SQLite database. The application includes an administrative interface to view submitted requests. The application will be containerized for deployment following constitutional requirements.

## Technical Context

**Language/Version**: Python 3.12.2 (resolved via research.md)
**Primary Dependencies**: FastAPI 0.115.0, SQLAlchemy 2.0.30, Pydantic 2.8.0, Uvicorn 0.30.0 (ASGI server)
**Storage**: SQLite 3.45+ (local database file with SQLAlchemy ORM)
**Testing**: pytest 8.2.2 + pytest-cov 5.0.0 (in-memory SQLite fixtures for isolation)
**Target Platform**: Web browsers (Chrome, Firefox, Safari) + containerized Linux server (Alpine 3.19)
**Project Type**: web-service (full-stack web application with vanilla HTML/CSS/JS frontend and FastAPI backend)
**Performance Goals**: Form submission < 1 second, page load < 2 seconds, support 10+ concurrent users
**Constraints**: Containerized deployment (per Constitution II), local SQLite file (no distributed database), 10,000+ character field support, single-container architecture (FastAPI serves static frontend)
**Scale/Scope**: Small-scale deployment (1-50 concurrent users), 8 form fields, 2 views (submission form + admin list), single database file

**Frontend**: Vanilla HTML/CSS/JavaScript (no framework - resolved via frontend-research.md)
- Rationale: Zero dependencies, ~300-400 lines total code, no build step, perfect constitutional alignment
- Example text behavior: CSS placeholder + JavaScript event handlers (~20 lines)
- Testing: Jest + JSDOM for DOM testing

**Containerization**: Single-container architecture (resolved via containerization research)
- Backend serves both API and static frontend files
- Base image: python:3.12-alpine3.19 (45 MB)
- Multi-stage build: dependencies → production runtime
- SQLite via named Docker volume with WAL mode enabled
- Non-root user (UID 1000), health check at `/health`

**Security Tooling** (resolved via research.md):
- SAST: Bandit 1.7.8
- Dependency Scanning: pip-audit 2.7.3 + GitHub Dependabot
- Container Scanning: Trivy 0.52.x
- Secret Scanning: git-secrets (pre-commit hook)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Code Readability

**Status**: ✅ COMPLIANT (pending implementation)

**Requirements**:
- Functions limited to 50 lines, cyclomatic complexity ≤ 10
- Descriptive naming for all variables, functions, classes
- Self-documenting code structure
- Automated linting and formatting enforced

**Implementation Plan**:
- Configure linter (ESLint for Node.js, Pylint/Black for Python, etc.)
- Enforce in pre-commit hooks
- Include complexity checks in CI pipeline

---

### Principle II: Containerized Deployment

**Status**: ✅ COMPLIANT (design required)

**Requirements**:
- OCI-compliant container (Docker/Podman)
- Minimal base image (Alpine or distroless)
- Multi-stage build to separate build/runtime dependencies
- Externalized configuration via environment variables
- Health check endpoint defined
- Semantic versioning for container tags

**Implementation Plan**:
- Create Dockerfile with multi-stage build
- Frontend build stage + backend runtime stage
- SQLite database mounted as volume
- Environment variables for configuration (port, database path)
- Health check endpoint: `/health` returning 200 OK
- Container images tagged as `intake-form:1.0.0`, `intake-form:latest`

---

### Principle III: Unit Testing

**Status**: ✅ COMPLIANT (pending implementation)

**Requirements**:
- Minimum 80% code coverage for all new code
- Isolated unit tests (mock database, no external dependencies)
- Test naming: `test_<function>_<scenario>_<expected_result>`
- Each test verifies exactly one behavior
- Total test suite runs in < 5 seconds
- All tests must pass before merge

**Implementation Plan**:
- Unit test all business logic (form validation, data transformation)
- Unit test all models (Project Intake Submission entity)
- Unit test all service functions (database operations)
- Mock SQLite database in unit tests
- Configure coverage reporting in CI
- Enforce coverage threshold in CI pipeline

**Test Categories**:
- Form validation logic (required fields, length limits)
- Example text display/hide logic
- Data serialization/deserialization
- Database query functions (mocked)

---

### Principle IV: Security Scanning

**Status**: ✅ COMPLIANT (pending implementation)

**Requirements**:
- Automated security scans on all PRs
- Dependency scanning (Dependabot, Snyk, or equivalent)
- SAST integration in CI/CD
- Container image scanning (Trivy, Clair, or equivalent)
- Critical/high vulnerabilities remediated within 7 days
- Secret scanning to prevent credential commits

**Implementation Plan**:
- Configure Dependabot or Snyk for dependency scanning
- Integrate SAST tool (Semgrep, CodeQL, or equivalent)
- Add Trivy container scanning to CI pipeline
- Configure git-secrets or detect-secrets pre-commit hook
- Document vulnerability remediation SLA in CONTRIBUTING.md

**Risk Areas**:
- SQL injection (mitigated by parameterized queries)
- XSS in form display (mitigated by input sanitization)
- Dependency vulnerabilities (mitigated by automated scanning)
- Secrets in code (mitigated by secret scanning)

---

### Gate Status Summary

**Pre-Phase 0**: ✅ PASS
- All principles have clear implementation plans
- No constitutional violations identified
- Containerization mandatory (Principle II) - design TBD in Phase 1
- Testing mandatory (Principle III) - coverage targets established
- Security scanning mandatory (Principle IV) - tooling TBD in Phase 0

**Post-Phase 1**: ✅ RE-EVALUATION COMPLETE

All constitutional principles remain compliant after Phase 1 design:

**Principle I: Code Readability** ✅
- data-model.md: SQLAlchemy model = 25 lines, Pydantic schemas = 32 lines per entity
- API routes (contracts/api-endpoints.md): 10-20 lines per endpoint
- Frontend: Vanilla JS = ~20 lines for example text logic
- All within 50-line function limit

**Principle II: Containerized Deployment** ✅
- Dockerfile strategy defined: Multi-stage build with python:3.12-alpine3.19 base
- Health check endpoint specified: `/health` with database connectivity test
- Volume configuration: Named volume for SQLite persistence
- Environment variables: APP_PORT, DATABASE_PATH, LOG_LEVEL externalized

**Principle III: Unit Testing** ✅
- Testing strategy documented in data-model.md
- In-memory SQLite fixtures for unit test isolation
- Contract tests defined in contracts/api-endpoints.md
- Coverage target achievable: 15-20 test cases for 80% coverage
- Performance target met: pytest with in-memory DB runs in 1-3 seconds

**Principle IV: Security Scanning** ✅
- SAST: Bandit configuration documented
- Dependency scanning: pip-audit + Dependabot
- Container scanning: Trivy integration planned
- Secret scanning: git-secrets pre-commit hook
- Input validation: Pydantic prevents injection attacks
- Error handling: Generic 500 responses (no stack trace exposure)

**No new violations identified. Design approved for implementation.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── submission.{ext}        # Project Intake Submission entity
│   ├── services/
│   │   ├── database.{ext}          # SQLite connection and queries
│   │   └── validation.{ext}        # Form field validation logic
│   ├── api/
│   │   ├── routes.{ext}            # API endpoints (submit, list)
│   │   └── middleware.{ext}        # Error handling, logging
│   └── app.{ext}                    # Application entry point
├── tests/
│   ├── unit/
│   │   ├── test_models.{ext}
│   │   ├── test_services.{ext}
│   │   └── test_validation.{ext}
│   └── integration/
│       └── test_api.{ext}
├── Dockerfile                       # Multi-stage container build
└── requirements.txt / package.json  # Dependencies

frontend/
├── src/
│   ├── components/
│   │   ├── IntakeForm.{ext}        # Main form component
│   │   ├── FormField.{ext}         # Reusable field with example text
│   │   └── SubmissionList.{ext}    # Admin view component
│   ├── services/
│   │   └── api.{ext}               # Backend API client
│   ├── styles/
│   │   └── main.css                # Form styling (gray examples, etc.)
│   └── index.{ext}                  # Application entry point
├── tests/
│   └── unit/
│       ├── test_form.{ext}
│       └── test_field.{ext}
└── public/
    └── index.html                   # HTML template

data/
└── intake.db                        # SQLite database (volume-mounted)

.github/
└── workflows/
    ├── ci.yml                       # Automated testing and linting
    └── security.yml                 # Security scanning (Trivy, SAST)

docker-compose.yml                   # Local development orchestration
```

**Structure Decision**: Web application architecture (Option 2) selected.

**Rationale**:
- Feature requires both frontend (web form UI) and backend (API + database)
- Frontend handles form rendering, example text display/hide logic, user interactions
- Backend handles data persistence, validation, business logic
- Clear separation enables independent testing of UI logic and business logic
- Supports containerized deployment (backend container serves both API and static frontend)

**File Extension Placeholder**: `{ext}` will be resolved in Phase 0 research based on language selection (`.js` for Node.js, `.py` for Python, etc.)

## Complexity Tracking

**Status**: ✅ NO VIOLATIONS

All constitutional principles have clear compliance paths. No complexity justifications required.
