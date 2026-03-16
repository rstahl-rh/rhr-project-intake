"""Unit tests for ORM models."""

from backend.src.models.submission import Submission


def test_submission_creation_with_valid_data(db_session):
    """Test creating a submission with all valid fields."""
    submission = Submission(
        project_name="Test Project",
        project_overview="A" * 100,
        administrative_info="test@example.com - Test Person",
        timeline="One week",
        technical_requirements="Basic requirements here with enough text",
        user_accounts="pi@example.com - PI",
        notes="Some notes",
        attachments="None",
    )
    db_session.add(submission)
    db_session.commit()

    assert submission.id is not None
    assert submission.project_name == "Test Project"
    assert submission.created_at is not None


def test_submission_repr(db_session):
    """Test Submission __repr__ method."""
    submission = Submission(
        project_name="Test Project",
        project_overview="A" * 100,
        administrative_info="test@example.com",
        timeline="One week",
        technical_requirements="Requirements text here",
        user_accounts="pi@example.com - PI",
    )
    db_session.add(submission)
    db_session.commit()

    assert "Test Project" in repr(submission)
    assert str(submission.id) in repr(submission)
