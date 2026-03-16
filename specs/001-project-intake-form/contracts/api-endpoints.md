# API Contracts: Project Intake Form Application

**Feature**: 001-project-intake-form
**Date**: 2026-03-13
**Protocol**: REST API (JSON)
**Base URL**: `http://localhost:8000` (development), configurable via environment

## Overview

This document defines the HTTP API contracts for the Project Intake Form application. The API follows REST principles with JSON request/response bodies.

**Contract Stability**: These contracts are public interfaces. Changes must maintain backward compatibility or follow semantic versioning with deprecation notices.

---

## Endpoint 1: Create Submission

**User Story**: P1 - Submit Project Intake Request

### Request

```
POST /api/submissions
Content-Type: application/json
```

**Request Body**:
```json
{
  "project_name": "string (3-200 chars, required)",
  "project_overview": "string (50-10000 chars, required)",
  "administrative_info": "string (must contain email, required)",
  "timeline": "string (max 2000 chars, required)",
  "technical_requirements": "string (20-10000 chars, required)",
  "user_accounts": "string (must contain email, required)",
  "notes": "string (max 10000 chars, optional)",
  "attachments": "string (max 2000 chars, optional)"
}
```

**Validation Rules**:
- All required fields must be present and non-empty
- `project_name`: 3-200 characters, alphanumeric + spaces/hyphens/underscores
- `project_overview`: minimum 50 characters (enforces "1-2 paragraphs")
- `administrative_info` and `user_accounts`: must contain at least one valid email format
- `technical_requirements`: minimum 20 characters (enforces basic detail)
- Optional fields (`notes`, `attachments`) can be omitted or null

### Response

**Success (201 Created)**:
```json
{
  "id": 1,
  "project_name": "PseudoLavaLamp Diffusion Model Study",
  "project_overview": "Multiple diffusion models will be used...",
  "administrative_info": "Requestor: Robby Stahl - rstahl@redhat.com...",
  "timeline": "This project has a planned duration of one week...",
  "technical_requirements": "This investigation has two core task sets...",
  "user_accounts": "Robby Stahl - rstahl@redhat.com - Principal Investigator...",
  "notes": "https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/",
  "attachments": "None",
  "created_at": "2026-03-13T15:30:00Z",
  "updated_at": null
}
```

**Error Responses**:

**400 Bad Request** (validation failure):
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "project_overview"],
      "msg": "String should have at least 50 characters",
      "input": "Too short",
      "ctx": {"min_length": 50}
    }
  ]
}
```

**422 Unprocessable Entity** (Pydantic validation error):
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "administrative_info"],
      "msg": "administrative_info must contain at least one email address",
      "input": "No email here"
    }
  ]
}
```

**500 Internal Server Error** (database error):
```json
{
  "detail": "Internal server error"
}
```

### Acceptance Criteria

From **spec.md User Story 1, Acceptance Scenario 2**:
- ✅ Valid submission with all required fields → 201 Created response
- ✅ Response includes system-generated `id` and `created_at` timestamp
- ✅ User receives confirmation (HTTP 201 status indicates success)

From **spec.md User Story 1, Acceptance Scenario 3**:
- ✅ Missing required fields → 422 Unprocessable Entity with field-level errors
- ✅ Invalid formats (e.g., missing email) → 422 with validation message

---

## Endpoint 2: List Submissions

**User Story**: P3 - View Submitted Requests

### Request

```
GET /api/submissions?limit=50&offset=0
```

**Query Parameters**:
- `limit` (optional, default: 100): Maximum number of submissions to return (1-500)
- `offset` (optional, default: 0): Number of submissions to skip (for pagination)

### Response

**Success (200 OK)**:
```json
{
  "submissions": [
    {
      "id": 3,
      "project_name": "Latest Project",
      "project_overview": "Most recent submission...",
      "administrative_info": "...",
      "timeline": "...",
      "technical_requirements": "...",
      "user_accounts": "...",
      "notes": null,
      "attachments": null,
      "created_at": "2026-03-13T16:00:00Z",
      "updated_at": null
    },
    {
      "id": 2,
      "project_name": "Middle Project",
      "created_at": "2026-03-13T15:45:00Z",
      ...
    },
    {
      "id": 1,
      "project_name": "Oldest Project",
      "created_at": "2026-03-13T15:30:00Z",
      ...
    }
  ],
  "total": 3,
  "limit": 100,
  "offset": 0
}
```

**Empty Result (200 OK)**:
```json
{
  "submissions": [],
  "total": 0,
  "limit": 100,
  "offset": 0
}
```

**Error Responses**:

**400 Bad Request** (invalid pagination parameters):
```json
{
  "detail": "limit must be between 1 and 500"
}
```

### Acceptance Criteria

From **spec.md User Story 3, Acceptance Scenario 1**:
- ✅ Multiple submissions exist → List returned ordered by most recent first (`created_at DESC`)
- ✅ Response includes key identifying information (id, project_name, created_at)

From **spec.md User Story 3, Acceptance Scenario 4**:
- ✅ No submissions exist → Empty array with 200 OK (handled by frontend for "no data" message)

---

## Endpoint 3: Get Submission by ID

**User Story**: P3 - View Submitted Requests (detail view)

### Request

```
GET /api/submissions/{id}
```

**Path Parameters**:
- `id` (integer, required): Submission ID

### Response

**Success (200 OK)**:
```json
{
  "id": 1,
  "project_name": "PseudoLavaLamp Diffusion Model Study",
  "project_overview": "Multiple diffusion models will be used...",
  "administrative_info": "Requestor: Robby Stahl - rstahl@redhat.com...",
  "timeline": "This project has a planned duration of one week...",
  "technical_requirements": "This investigation has two core task sets...",
  "user_accounts": "Robby Stahl - rstahl@redhat.com - Principal Investigator...",
  "notes": "https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/",
  "attachments": "None",
  "created_at": "2026-03-13T15:30:00Z",
  "updated_at": null
}
```

**Error Responses**:

**404 Not Found** (ID does not exist):
```json
{
  "detail": "Submission not found"
}
```

**400 Bad Request** (invalid ID format):
```json
{
  "detail": "Invalid submission ID"
}
```

### Acceptance Criteria

From **spec.md User Story 3, Acceptance Scenario 2**:
- ✅ Selecting specific submission → Full details returned matching form structure

---

## Endpoint 4: Health Check

**Purpose**: Container health monitoring (Constitutional Principle II requirement)

### Request

```
GET /health
```

### Response

**Success (200 OK)**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-03-13T15:30:00Z"
}
```

**Failure (503 Service Unavailable)**:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Unable to connect to database",
  "timestamp": "2026-03-13T15:30:00Z"
}
```

### Health Check Logic

```python
async def health_check():
    """Check database connectivity."""
    try:
        db.execute("SELECT 1")  # Simple query to verify connection
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )
```

---

## Static File Serving

**Frontend files served by FastAPI**:

```
GET /
```
Returns `frontend/index.html` (main form page)

```
GET /admin
```
Returns `frontend/admin.html` (admin list view) - or same index.html with routing

```
GET /static/{filename}
```
Returns CSS, JavaScript, or other static assets from `frontend/static/` directory

**Configuration**:
```python
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
```

---

## CORS Configuration

**Development**: Allow all origins
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Production**: Restrict to specific origins via environment variable
```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000").split(",")
```

---

## Error Handling Standards

**All endpoints follow consistent error format**:

```json
{
  "detail": "Human-readable error message",
  "type": "error_type_identifier",  // Optional
  "loc": ["field", "path"],          // Optional, for validation errors
  "ctx": {"additional": "context"}   // Optional
}
```

**HTTP Status Codes**:
- `200 OK`: Successful GET request
- `201 Created`: Successful POST creating resource
- `400 Bad Request`: Client error (invalid parameters)
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error (Pydantic)
- `500 Internal Server Error`: Server error (logged, not exposed)
- `503 Service Unavailable`: Health check failure

---

## OpenAPI Documentation

FastAPI auto-generates OpenAPI documentation:

```
GET /docs
```
Returns Swagger UI for interactive API testing

```
GET /redoc
```
Returns ReDoc documentation

```
GET /openapi.json
```
Returns OpenAPI 3.0 schema (machine-readable)

**Documentation is automatically generated from**:
- Pydantic models (request/response schemas)
- Type hints on route functions
- Docstrings on endpoint functions
- Example values in Field() definitions

---

## Contract Testing

**Contract tests verify API behavior** (`tests/integration/test_api_contracts.py`):

```python
def test_create_submission_returns_201_with_valid_data(client, valid_submission):
    """Contract: POST /api/submissions with valid data returns 201."""
    response = client.post("/api/submissions", json=valid_submission)

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["project_name"] == valid_submission["project_name"]
    assert "created_at" in data


def test_create_submission_returns_422_with_missing_required_field(client):
    """Contract: POST /api/submissions without required field returns 422."""
    invalid_data = {"project_name": "Test"}  # Missing other required fields

    response = client.post("/api/submissions", json=invalid_data)

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any("project_overview" in str(error["loc"]) for error in detail)


def test_list_submissions_returns_200_with_array(client):
    """Contract: GET /api/submissions returns 200 with submissions array."""
    response = client.get("/api/submissions")

    assert response.status_code == 200
    data = response.json()
    assert "submissions" in data
    assert isinstance(data["submissions"], list)
    assert "total" in data


def test_get_submission_returns_404_for_nonexistent_id(client):
    """Contract: GET /api/submissions/{id} returns 404 if ID not found."""
    response = client.get("/api/submissions/99999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_health_check_returns_200_when_healthy(client):
    """Contract: GET /health returns 200 when database is accessible."""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
```

---

## Security Considerations

**Input Validation** (Pydantic):
- All inputs validated before database interaction
- SQL injection prevented by SQLAlchemy parameterized queries
- XSS prevention: Output encoding handled by frontend (not API responsibility)

**Rate Limiting** (Future):
- Not implemented in MVP
- Future: 100 requests/minute per IP

**Authentication** (Future):
- MVP: No authentication required (internal deployment)
- Future: OAuth2/JWT for multi-user environments

**Data Exposure**:
- No sensitive data in submissions (just form data)
- Error messages do not expose internal implementation details
- Database errors return generic 500 without stack traces

---

## Constitutional Compliance

**Principle I: Code Readability** ✅
- Endpoint functions: 10-20 lines each
- Clear route decorators: `@app.post("/api/submissions")`
- Pydantic models self-document request/response formats
- OpenAPI docs auto-generated from code

**Principle III: Unit Testing** ✅
- Contract tests verify all endpoints (5 tests above = core coverage)
- Integration tests with TestClient (in-memory FastAPI app)
- Tests run in <5 seconds (no real database I/O)

**Principle IV: Security** ✅
- Input validation prevents injection attacks
- No secrets exposed in API responses
- Error handling prevents information leakage
- CORS configured appropriately for deployment environment

---

## Versioning Strategy

**MVP**: No API versioning (v1 implicit)
**Future**: URL-based versioning if breaking changes needed
```
POST /api/v2/submissions  # Future version
POST /api/submissions     # Legacy (v1)
```

**Deprecation Process**:
1. Announce deprecation 3 months in advance
2. Add `X-API-Deprecation` header to responses
3. Maintain backward compatibility during transition
4. Remove deprecated endpoint after migration period
