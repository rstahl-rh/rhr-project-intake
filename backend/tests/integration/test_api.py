"""Integration tests for API endpoints."""

from fastapi.testclient import TestClient
from backend.src.app import app

client = TestClient(app)


def test_post_submissions_with_valid_data_returns_201():
    """Test POST /api/submissions with valid data returns 201."""
    data = {
        "project_name": "Test Project",
        "project_overview": "A" * 100,
        "administrative_info": "test@example.com - Test Requestor",
        "timeline": "One week starting 2026-03-20",
        "technical_requirements": "Containerized deployment requirements here",
        "user_accounts": "pi@example.com - Principal Investigator",
        "notes": "Test submission",
        "attachments": "None",
    }

    response = client.post("/api/submissions", json=data)

    assert response.status_code == 201
    result = response.json()
    assert "id" in result
    assert result["project_name"] == "Test Project"
    assert "created_at" in result


def test_post_submissions_with_missing_fields_returns_422():
    """Test POST /api/submissions with missing fields returns 422."""
    data = {
        "project_name": "Test Project"
        # Missing other required fields
    }

    response = client.post("/api/submissions", json=data)

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, list)
    assert any("project_overview" in str(error["loc"]) for error in detail)


def test_get_submissions_returns_200_with_array():
    """Test GET /api/submissions returns 200 with submissions array."""
    response = client.get("/api/submissions")

    assert response.status_code == 200
    data = response.json()
    assert "submissions" in data
    assert isinstance(data["submissions"], list)
    assert "total" in data


def test_get_submission_by_id_returns_404_for_nonexistent():
    """Test GET /api/submissions/{id} returns 404 for nonexistent ID."""
    response = client.get("/api/submissions/99999")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_health_check_returns_200():
    """Test GET /health returns 200 when database is accessible."""
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data


def test_get_submissions_with_pagination():
    """Test GET /api/submissions respects pagination parameters."""
    # Create some test submissions first
    for i in range(5):
        data = {
            "project_name": f"Test Project {i}",
            "project_overview": "A" * 100,
            "administrative_info": f"test{i}@example.com - Requestor",
            "timeline": "One week",
            "technical_requirements": "Requirements here",
            "user_accounts": f"pi{i}@example.com - PI",
        }
        client.post("/api/submissions", json=data)

    # Test with limit
    response = client.get("/api/submissions?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["submissions"]) <= 3
    assert data["limit"] == 3


def test_get_submission_by_id_returns_submission():
    """Test GET /api/submissions/{id} returns the correct submission."""
    # Create a submission
    submission_data = {
        "project_name": "Specific Test Project",
        "project_overview": "A" * 100,
        "administrative_info": "test@example.com - Requestor",
        "timeline": "One week",
        "technical_requirements": "Requirements here",
        "user_accounts": "pi@example.com - PI",
    }
    create_response = client.post("/api/submissions", json=submission_data)
    assert create_response.status_code == 201
    submission_id = create_response.json()["id"]

    # Get the submission by ID
    get_response = client.get(f"/api/submissions/{submission_id}")
    assert get_response.status_code == 200
    result = get_response.json()
    assert result["id"] == submission_id
    assert result["project_name"] == "Specific Test Project"
