"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import re


class SubmissionCreate(BaseModel):
    """Schema for creating a new submission (request body)."""

    project_name: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="Concise, descriptive project identifier",
    )
    project_overview: str = Field(
        ...,
        min_length=50,
        max_length=10000,
        description="1-2 paragraph summary of project goals",
    )
    administrative_info: str = Field(
        ..., max_length=5000, description="Requestor, funding, oversight contacts"
    )
    timeline: str = Field(
        ..., max_length=2000, description="Start date, end date, constraints"
    )
    technical_requirements: str = Field(
        ...,
        min_length=20,
        max_length=10000,
        description="Runtime, hardware, networking, storage details",
    )
    user_accounts: str = Field(
        ..., max_length=5000, description="Principal Investigator and collaborators"
    )
    notes: str | None = Field(
        None, max_length=10000, description="Additional notes, references, links"
    )
    attachments: str | None = Field(
        None, max_length=2000, description="References to supporting documents"
    )

    @field_validator("administrative_info", "user_accounts")
    @classmethod
    def must_contain_email(cls, value: str, info) -> str:
        """Validate that contact fields contain at least one email."""
        email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        if not re.search(email_pattern, value):
            field_name = info.field_name
            raise ValueError(f"{field_name} must contain at least one email address")
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
        from_attributes = True
