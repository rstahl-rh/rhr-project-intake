# Data Model: Project Intake Form Application

**Feature**: 001-project-intake-form
**Date**: 2026-03-13
**Status**: Complete

## Overview

This document defines the data entities for the Project Intake Form application. The primary entity is the **Submission** which captures all information from the MOC project intake request form.

---

## Entity: Submission

**Purpose**: Represents a complete project resource request submitted through the intake form.

**Storage**: SQLite database table `submissions`

### Fields

| Field Name | Type | Constraints | Description | Source |
|------------|------|-------------|-------------|---------|
| `id` | Integer | PRIMARY KEY, AUTO INCREMENT | Unique submission identifier | System-generated |
| `project_name` | String(200) | NOT NULL | Concise, descriptive project identifier | FR-001, template field "Project Name" |
| `project_overview` | Text | NOT NULL | 1-2 paragraph summary of project goals | FR-001, template field "Project Overview" |
| `administrative_info` | Text | NOT NULL | Requestor contact, funding source, oversight contacts | FR-001, template field "Project Administrative Information" |
| `timeline` | Text | NOT NULL | Start date, end date, constraints | FR-001, template field "Project Timeline" |
| `technical_requirements` | Text | NOT NULL | Runtime, hardware, networking, storage, externalities | FR-001, template field "Technical Requirements" |
| `user_accounts` | Text | NOT NULL | Principal Investigator and collaborator contacts | FR-001, template field "User Accounts" |
| `notes` | Text | NULL | Additional notes, references, links | FR-001, template field "Additional Notes/Reading" |
| `attachments` | Text | NULL | References to supporting diagrams or documents | FR-001, template field "Attachments" |
| `created_at` | DateTime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Submission timestamp | FR-009, system requirement |
| `updated_at` | DateTime | NULL | Last modification timestamp | Future extensibility |

### Validation Rules

**Field-Level Validation** (enforced at API layer via Pydantic):

- **project_name**:
  - Min length: 3 characters
  - Max length: 200 characters
  - Pattern: Alphanumeric + spaces, hyphens, underscores
  - Required: Yes

- **project_overview**:
  - Min length: 50 characters (equivalent to ~1 paragraph)
  - Max length: 10,000 characters (per SC-005)
  - Required: Yes

- **administrative_info**:
  - Must contain at least one email address (basic validation)
  - Max length: 5,000 characters
  - Required: Yes

- **timeline**:
  - Free-form text (date parsing not enforced - template provides guidance)
  - Max length: 2,000 characters
  - Required: Yes

- **technical_requirements**:
  - Min length: 20 characters (basic detail requirement)
  - Max length: 10,000 characters (per SC-005)
  - Required: Yes

- **user_accounts**:
  - Must contain at least one email address
  - Max length: 5,000 characters
  - Required: Yes

- **notes**:
  - Max length: 10,000 characters
  - Required: No (optional field)

- **attachments**:
  - Max length: 2,000 characters (URL/filename references)
  - Required: No (optional field)

**Business Rules**:

1. **Uniqueness**: No database-level uniqueness constraint (allow resubmissions with same project name)
2. **Immutability**: Submissions are write-once (no update API endpoint in MVP)
3. **Soft Delete**: No deletion capability in MVP (administrative deletion via direct database access if needed)
4. **Audit Trail**: `created_at` timestamp provides submission ordering

### Example Data

```json
{
  "id": 1,
  "project_name": "PseudoLavaLamp Diffusion Model Study",
  "project_overview": "Multiple diffusion models will be used to generate video of lava lamps. This video will be compared with video of actual lava lamps. The same analysis stack and methodology will be applied to both data sets (generated, physical). This work will determine if virtual lava lamps are a reasonable source of entropy when compared with actual lava lamps.",
  "administrative_info": "Requestor: Robby Stahl - rstahl@redhat.com\nFunding: \"867 - Five Three Oh Nine Investigations\"\nOversight: Robby Stahl (Red Hat), Orran Krieger (Red Hat)",
  "timeline": "This project has a planned duration of one week. The start date must be on or before 2026-03-30.",
  "technical_requirements": "This investigation has two core task sets...\n[Full technical details from template]",
  "user_accounts": "Robby Stahl - rstahl@redhat.com - Principal Investigator\nBob Wehadababyitsahominid - foomatic@redhat.com - User",
  "notes": "https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/",
  "attachments": "None",
  "created_at": "2026-03-13T15:30:00Z",
  "updated_at": null
}
```

---

## Database Schema (SQLite DDL)

```sql
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL CHECK(length(project_name) >= 3 AND length(project_name) <= 200),
    project_overview TEXT NOT NULL CHECK(length(project_overview) >= 50),
    administrative_info TEXT NOT NULL,
    timeline TEXT NOT NULL,
    technical_requirements TEXT NOT NULL CHECK(length(technical_requirements) >= 20),
    user_accounts TEXT NOT NULL,
    notes TEXT,
    attachments TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- Index for admin list view (order by most recent)
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Enable WAL mode for better concurrency (set at connection level)
PRAGMA journal_mode=WAL;
```

---

## SQLAlchemy ORM Model

```python
# backend/src/models/submission.py
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Submission(Base):
    """Project intake submission entity."""

    __tablename__ = 'submissions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_name = Column(String(200), nullable=False)
    project_overview = Column(Text, nullable=False)
    administrative_info = Column(Text, nullable=False)
    timeline = Column(Text, nullable=False)
    technical_requirements = Column(Text, nullable=False)
    user_accounts = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    attachments = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Submission(id={self.id}, project_name='{self.project_name}')>"
```

---

## Pydantic Validation Schema

```python
# backend/src/models/schemas.py
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re

class SubmissionCreate(BaseModel):
    """Schema for creating a new submission (request body)."""

    project_name: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Concise, descriptive project identifier"
    )
    project_overview: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="1-2 paragraph summary of project goals"
    )
    administrative_info: str = Field(
        ...,
        max_length=5000,
        description="Requestor, funding, oversight contacts"
    )
    timeline: str = Field(
        ...,
        max_length=2000,
        description="Start date, end date, constraints"
    )
    technical_requirements: str = Field(
        ...,
        min_length=20,
        max_length=10000,
        description="Runtime, hardware, networking, storage details"
    )
    user_accounts: str = Field(
        ...,
        max_length=5000,
        description="Principal Investigator and collaborators"
    )
    notes: str | None = Field(
        None,
        max_length=10000,
        description="Additional notes, references, links"
    )
    attachments: str | None = Field(
        None,
        max_length=2000,
        description="References to supporting documents"
    )

    @field_validator('administrative_info', 'user_accounts')
    @classmethod
    def must_contain_email(cls, value: str, info) -> str:
        """Validate that contact fields contain at least one email."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        if not re.search(email_pattern, value):
            raise ValueError(f'{info.field_name} must contain at least one email address')
        return value


class SubmissionResponse(BaseModel):
    """Schema for submission response (includes system fields)."""

    id: int
    project_name: str
    project_overview: str
    administrative_info: str
    timeline: str
    technical_requirements: str
    user_accounts: str
    notes: str | None
    attachments: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)
```

---

## Data Access Patterns

### Create Submission
```python
# Pattern: Insert new submission
def create_submission(db: Session, submission_data: SubmissionCreate) -> Submission:
    """Create a new project intake submission."""
    submission = Submission(**submission_data.model_dump())
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission
```

### List Submissions (Admin View)
```python
# Pattern: Retrieve all submissions ordered by most recent
def list_submissions(db: Session, limit: int = 100, offset: int = 0) -> list[Submission]:
    """List submissions with pagination, ordered by most recent first."""
    return (
        db.query(Submission)
        .order_by(Submission.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
```

### Get Submission by ID
```python
# Pattern: Retrieve single submission by primary key
def get_submission(db: Session, submission_id: int) -> Submission | None:
    """Get a specific submission by ID."""
    return db.query(Submission).filter(Submission.id == submission_id).first()
```

---

## Migration Strategy

**MVP Approach**: Schema embedded in application code, created on first run.

```python
# backend/src/services/database.py
def init_database(engine):
    """Initialize database schema if not exists."""
    Base.metadata.create_all(bind=engine)
```

**Future Extension**: Use Alembic for schema migrations if requirements evolve.

---

## Testing Strategy

**Unit Tests** (Constitutional Requirement: 80% coverage):

1. **Model Tests** (`tests/unit/test_models.py`):
   - Test Submission creation with valid data
   - Test field constraints (min/max length)
   - Test default values (created_at timestamp)
   - Test __repr__ method

2. **Schema Validation Tests** (`tests/unit/test_schemas.py`):
   - Test SubmissionCreate with valid data
   - Test validation errors (too short, too long, missing email)
   - Test optional fields (notes, attachments can be None)
   - Test email regex validation

3. **Data Access Tests** (`tests/unit/test_database.py`):
   - Test create_submission (in-memory SQLite)
   - Test list_submissions with pagination
   - Test get_submission by ID
   - Test ordering (most recent first)

**Test Fixtures**:
```python
# tests/conftest.py
@pytest.fixture
def db_session():
    """In-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture
def sample_submission_data():
    """Valid submission data for testing."""
    return {
        "project_name": "Test Project",
        "project_overview": "A" * 100,  # 100 chars (>= 50 minimum)
        "administrative_info": "test@example.com",
        "timeline": "One week",
        "technical_requirements": "Basic requirements here",
        "user_accounts": "pi@example.com - PI",
    }
```

---

## Constitutional Compliance

**Principle I: Code Readability** ✅
- Model definition: 25 lines (well under 50-line limit)
- Schema definitions: Clear field descriptions, self-documenting
- Validation logic: Declarative Pydantic validators

**Principle III: Unit Testing** ✅
- All model methods tested with in-memory SQLite
- All validation rules tested via Pydantic schema tests
- Data access patterns tested with fixtures
- Target: 80% coverage (easily achievable with 15-20 test cases)

**Principle IV: Security** ✅
- SQL injection: Prevented by SQLAlchemy parameterized queries
- Input validation: Pydantic enforces length limits, pattern matching
- Email validation: Regex prevents obviously invalid formats
- No sensitive data stored (passwords, API keys) - just form submissions

---

## Future Extensions (Out of MVP Scope)

1. **Edit Submissions**: Add `updated_at` tracking and PUT endpoint
2. **Submission Status**: Add `status` field (pending/approved/rejected)
3. **File Uploads**: Binary attachment storage (current: references only)
4. **Search**: Full-text search on project_name, overview, requirements
5. **User Authentication**: Link submissions to authenticated users
6. **Approval Workflow**: Multi-stage approval process with comments
