---

description: "Task list for Project Intake Form Application implementation"
---

# Tasks: Project Intake Form Application

**Input**: Design documents from `/specs/001-project-intake-form/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api-endpoints.md

**Tests**: Unit tests are MANDATORY per Constitution Principle III. Integration tests are OPTIONAL.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/`, `frontend/static/`
- **Root**: `data/`, `.github/workflows/`, `Dockerfile`, `docker-compose.yml`, `requirements.txt`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure: backend/src/{models,services,api}, backend/tests/{unit,integration}
- [x] T002 Create frontend directory structure: frontend/, frontend/static/{css,js}
- [x] T003 [P] Create data directory for SQLite database: data/
- [x] T004 [P] Create requirements.txt with dependencies: FastAPI==0.115.0, SQLAlchemy==2.0.30, Pydantic==2.8.0, Uvicorn==0.30.0, pytest==8.2.2, pytest-cov==5.0.0
- [x] T005 [P] Create .env.example with environment variable template: APP_ENV, APP_PORT, DATABASE_PATH, ALLOWED_ORIGINS, LOG_LEVEL
- [x] T006 [P] Create .gitignore to exclude data/*.db, venv/, __pycache__/, .env, htmlcov/
- [x] T007 [P] Load example form template from agent-reading-list/MOC_Intake_Form for frontend placeholder text

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create SQLAlchemy Base declarative model in backend/src/models/__init__.py
- [x] T009 Create Submission ORM model in backend/src/models/submission.py (10 fields per data-model.md)
- [x] T010 Create Pydantic schemas in backend/src/models/schemas.py: SubmissionCreate and SubmissionResponse with field validation
- [x] T011 [P] Create database connection and initialization in backend/src/services/database.py: engine, session, init_database()
- [x] T012 [P] Create pytest configuration in backend/pytest.ini with coverage settings (fail_under=80)
- [x] T013 [P] Create pytest fixtures in backend/tests/conftest.py: db_session (in-memory SQLite), sample_submission_data
- [x] T014 [P] Create FastAPI application entry point in backend/src/app.py with CORS middleware
- [x] T015 [P] Create error handling middleware in backend/src/api/middleware.py for consistent error responses

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Submit Project Intake Request (Priority: P1) 🎯 MVP

**Goal**: Users can submit project intake requests via web form, data is persisted to SQLite database

**Independent Test**: Fill form, submit, verify data persisted and confirmation shown

### Unit Tests for User Story 1 (MANDATORY per Constitution III) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T016 [P] [US1] Unit test Submission model creation with valid data in backend/tests/unit/test_models.py
- [x] T017 [P] [US1] Unit test Submission model field constraints (min/max length) in backend/tests/unit/test_models.py
- [x] T018 [P] [US1] Unit test SubmissionCreate schema validation with valid data in backend/tests/unit/test_schemas.py
- [x] T019 [P] [US1] Unit test SubmissionCreate schema validation errors (too short, missing email) in backend/tests/unit/test_schemas.py
- [x] T020 [P] [US1] Unit test email validator for administrative_info field in backend/tests/unit/test_schemas.py
- [x] T021 [P] [US1] Unit test email validator for user_accounts field in backend/tests/unit/test_schemas.py
- [x] T022 [P] [US1] Unit test create_submission function with in-memory database in backend/tests/unit/test_database.py

### Implementation for User Story 1

- [x] T023 [US1] Implement create_submission database function in backend/src/services/database.py
- [x] T024 [US1] Create POST /api/submissions endpoint in backend/src/api/routes.py using SubmissionCreate schema
- [x] T025 [US1] Add validation error handling to POST /api/submissions (return 422 for validation failures)
- [x] T026 [P] [US1] Create frontend HTML form structure in frontend/index.html with 8 form fields matching template
- [x] T027 [P] [US1] Create CSS styling for form layout in frontend/static/css/styles.css
- [x] T028 [US1] Create JavaScript form submission handler in frontend/static/js/form.js to call POST /api/submissions
- [x] T029 [US1] Add form validation in JavaScript to check required fields before submission in frontend/static/js/form.js
- [x] T030 [US1] Add success/error message display after submission in frontend/static/js/form.js
- [x] T031 [US1] Configure FastAPI to serve static frontend files: app.mount("/static") and app.mount("/")
- [x] T032 [P] [US1] Integration test POST /api/submissions with valid data returns 201 in backend/tests/integration/test_api.py
- [x] T033 [P] [US1] Integration test POST /api/submissions with missing fields returns 422 in backend/tests/integration/test_api.py

**Checkpoint**: ✅ User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Interactive Example Guidance (Priority: P2)

**Goal**: Form fields display example text that disappears when user types and reappears when field is cleared

**Independent Test**: Type in field to see example disappear, clear field to see example reappear

### Unit Tests for User Story 2 (MANDATORY per Constitution III) ⚠️

- [ ] T034 [P] [US2] Unit test example text display logic in frontend/tests/unit/test_form_field.js using Jest + JSDOM
- [ ] T035 [P] [US2] Unit test example text hide on input event in frontend/tests/unit/test_form_field.js
- [ ] T036 [P] [US2] Unit test example text show on clear event in frontend/tests/unit/test_form_field.js

### Implementation for User Story 2

- [ ] T037 [P] [US2] Create CSS for example text styling (gray color, distinct from user input) in frontend/static/css/styles.css
- [ ] T038 [US2] Implement FormField class in frontend/static/js/form_field.js with example text show/hide logic
- [ ] T039 [US2] Add event listeners for input/change events to toggle example text in frontend/static/js/form_field.js
- [ ] T040 [US2] Initialize FormField instances for all 8 form fields in frontend/static/js/form.js
- [ ] T041 [US2] Load example text from template data and populate placeholders in frontend/static/js/form.js

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Submitted Requests (Priority: P3)

**Goal**: Administrators can view list of all submissions and detailed view of individual submissions

**Independent Test**: Submit test data, access admin view, verify submissions displayed with accurate information

### Unit Tests for User Story 3 (MANDATORY per Constitution III) ⚠️

- [ ] T042 [P] [US3] Unit test list_submissions function with pagination in backend/tests/unit/test_database.py
- [ ] T043 [P] [US3] Unit test list_submissions ordering (most recent first) in backend/tests/unit/test_database.py
- [ ] T044 [P] [US3] Unit test get_submission function by ID in backend/tests/unit/test_database.py
- [ ] T045 [P] [US3] Unit test get_submission returns None for nonexistent ID in backend/tests/unit/test_database.py

### Implementation for User Story 3

- [ ] T046 [US3] Implement list_submissions database function in backend/src/services/database.py with pagination and ordering
- [ ] T047 [US3] Implement get_submission database function by ID in backend/src/services/database.py
- [ ] T048 [US3] Create GET /api/submissions endpoint with pagination parameters in backend/src/api/routes.py
- [ ] T049 [US3] Create GET /api/submissions/{id} endpoint in backend/src/api/routes.py
- [ ] T050 [US3] Add 404 error handling for GET /api/submissions/{id} when ID not found
- [ ] T051 [P] [US3] Create admin.html page structure in frontend/admin.html
- [ ] T052 [P] [US3] Create JavaScript to fetch and display submissions list in frontend/static/js/admin.js
- [ ] T053 [US3] Add submission detail view functionality (click to expand details) in frontend/static/js/admin.js
- [ ] T054 [US3] Add "no submissions" message when list is empty in frontend/static/js/admin.js
- [ ] T055 [P] [US3] Integration test GET /api/submissions returns 200 with array in backend/tests/integration/test_api.py
- [ ] T056 [P] [US3] Integration test GET /api/submissions/{id} returns 404 for nonexistent ID in backend/tests/integration/test_api.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Containerization & Deployment (Constitutional Requirement II)

**Purpose**: Package application as container per constitutional requirements

- [ ] T057 Create multi-stage Dockerfile: Stage 1 (dependencies), Stage 2 (production runtime) with python:3.12-alpine3.19 base
- [ ] T058 Configure non-root user (UID 1000) in Dockerfile for security
- [ ] T059 Add HEALTHCHECK directive in Dockerfile calling GET /health endpoint
- [ ] T060 Create docker-compose.yml for local development with volume mount for data/intake.db
- [ ] T061 Add environment variable configuration in docker-compose.yml: DATABASE_PATH, APP_PORT, LOG_LEVEL
- [ ] T062 Create .dockerignore to exclude .git/, venv/, __pycache__/, *.pyc, data/*.db
- [ ] T063 Test container build: `docker build -t intake-form:1.0.0 .`
- [ ] T064 Test container run with volume persistence: `docker compose up`

---

## Phase 7: Health Check & Monitoring (Constitutional Requirement II)

**Purpose**: Implement health check endpoint for container orchestration

### Unit Tests (MANDATORY per Constitution III) ⚠️

- [ ] T065 [P] Unit test health check returns 200 when database connected in backend/tests/unit/test_health.py
- [ ] T066 [P] Unit test health check returns 503 when database disconnected in backend/tests/unit/test_health.py

### Implementation

- [ ] T067 Create GET /health endpoint in backend/src/api/routes.py with database connectivity check
- [ ] T068 Add timestamp to health check response
- [ ] T069 [P] Integration test GET /health returns healthy status in backend/tests/integration/test_api.py

---

## Phase 8: Security Scanning (Constitutional Requirement IV)

**Purpose**: Implement automated security scanning per constitutional requirements

- [X] T070 [P] Create GitHub Actions workflow in .github/workflows/security.yml for security scans
- [X] T071 [P] Add Bandit (SAST) step to security workflow scanning backend/src/
- [X] T072 [P] Add pip-audit (dependency scanning) step to security workflow
- [X] T073 [P] Add Trivy (container scanning) step to security workflow scanning built image
- [X] T074 [P] Configure git-secrets pre-commit hook to prevent secret commits
- [X] T075 [P] Create .bandit configuration file to exclude tests/ directory
- [X] T076 Test security scans locally: `bandit -r backend/src/`, `pip-audit`, `trivy image intake-form:1.0.0`

---

## Phase 9: Code Quality & Testing (Constitutional Requirements I & III)

**Purpose**: Enforce code quality and testing standards

- [X] T077 [P] Create GitHub Actions workflow in .github/workflows/ci.yml for automated testing
- [X] T078 [P] Add pytest step to CI workflow with coverage reporting (--cov-fail-under=80)
- [X] T079 [P] Add linting step to CI workflow: ruff check backend/src/
- [X] T080 [P] Add formatting check to CI workflow: black --check backend/src/
- [X] T081 [P] Add complexity check to CI workflow: radon cc backend/src/ -a -s (fail if any function >10)
- [X] T082 [P] Create .pre-commit-config.yaml with hooks: black, ruff, pytest
- [X] T083 Verify all tests pass and coverage ≥80%: `pytest --cov=backend/src --cov-report=term`
- [X] T084 Verify test suite runs in <5 seconds per constitutional requirement

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T085 [P] Add README.md with project overview, quickstart instructions, and constitutional compliance notes
- [X] T086 [P] Add CONTRIBUTING.md with development workflow, testing requirements, and vulnerability remediation SLA
- [X] T087 [P] Create database migration strategy documentation in backend/src/services/database.py docstring
- [X] T088 [P] Add logging configuration in backend/src/app.py using structured logging (JSON format for production)
- [X] T089 [P] Add request ID middleware for distributed tracing in backend/src/api/middleware.py
- [X] T090 Verify unit test coverage meets 80% minimum (Constitution Principle III)
- [X] T091 Verify all security scans pass with no critical/high vulnerabilities (Constitution Principle IV)
- [X] T092 Verify container builds successfully and health check passes
- [X] T093 Run quickstart.md validation: Follow all steps in quickstart.md to ensure accuracy
- [X] T094 Performance test: Verify form submission completes in <1 second, page load in <2 seconds
- [X] T095 Concurrency test: Verify system handles 10+ concurrent form submissions without data corruption

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Containerization (Phase 6)**: Can start after any user story is complete (recommend after US1 MVP)
- **Health Check (Phase 7)**: Depends on Foundational phase
- **Security Scanning (Phase 8)**: Can start after project structure exists (Phase 1)
- **Code Quality (Phase 9)**: Can start after any implementation begins (Phase 2)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Can work without US1/US2 (submit test data via API)

### Within Each User Story

- Unit tests MUST be written and FAIL before implementation (TDD)
- Models/schemas before services
- Services before API endpoints
- API endpoints before frontend
- Frontend logic before integration tests
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005, T006, T007)
- All Foundational tasks marked [P] can run in parallel (T011, T012, T013, T014, T015)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All unit tests for a user story marked [P] can run in parallel
- Frontend and backend work within a story can run in parallel (after models/schemas complete)
- All Security Scanning tasks (T070-T076) can run in parallel
- All Code Quality tasks (T077-T082) can run in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
# Unit tests (MANDATORY):
Task T016: "Unit test Submission model creation with valid data in backend/tests/unit/test_models.py"
Task T017: "Unit test Submission model field constraints in backend/tests/unit/test_models.py"
Task T018: "Unit test SubmissionCreate schema validation with valid data in backend/tests/unit/test_schemas.py"
Task T019: "Unit test SubmissionCreate schema validation errors in backend/tests/unit/test_schemas.py"
Task T020: "Unit test email validator for administrative_info in backend/tests/unit/test_schemas.py"
Task T021: "Unit test email validator for user_accounts in backend/tests/unit/test_schemas.py"
Task T022: "Unit test create_submission function in backend/tests/unit/test_database.py"

# Launch frontend tasks after backend API is ready:
Task T026: "Create frontend HTML form structure in frontend/index.html"
Task T027: "Create CSS styling for form layout in frontend/static/css/styles.css"

# Launch integration tests after implementation:
Task T032: "Integration test POST /api/submissions with valid data returns 201"
Task T033: "Integration test POST /api/submissions with missing fields returns 422"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Complete Phase 6: Containerization
6. Complete Phase 7: Health Check
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Containerization + Health Check → Production-ready
6. Add Security Scanning + Code Quality → Constitutional compliance complete
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1 - highest priority MVP)
   - Developer B: User Story 2 (P2 - can work in parallel)
   - Developer C: Containerization + Health Check (enables deployment)
3. After US1 complete:
   - Developer A: User Story 3 (P3)
   - Developer B continues US2
   - Developer C: Security Scanning setup
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Unit tests are MANDATORY** (Constitution Principle III) - write tests first, verify they fail before implementing
- Integration tests are optional but recommended for API contract validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Constitutional Compliance Checklist

Before merge, verify all requirements:

**Principle I: Code Readability** ✅
- [ ] All functions ≤50 lines
- [ ] Cyclomatic complexity ≤10
- [ ] Linting passes (ruff)
- [ ] Formatting passes (black)

**Principle II: Containerized Deployment** ✅
- [ ] Dockerfile exists with multi-stage build
- [ ] Container builds successfully
- [ ] Health check endpoint implemented and tested
- [ ] Environment variables externalized

**Principle III: Unit Testing** ✅
- [ ] Test coverage ≥80%
- [ ] All tests pass
- [ ] Test suite runs in <5 seconds
- [ ] Unit tests are isolated (in-memory DB)

**Principle IV: Security Scanning** ✅
- [ ] Bandit (SAST) passes
- [ ] pip-audit (dependencies) passes
- [ ] Trivy (container) shows no critical/high vulnerabilities
- [ ] git-secrets pre-commit hook installed
