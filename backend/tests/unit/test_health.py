"""Unit tests for health check endpoint."""

from unittest.mock import patch, MagicMock


def test_health_check_returns_healthy_when_database_connected():
    """Test health check returns 200 when database is connected."""
    from fastapi.testclient import TestClient
    from backend.src.app import app

    client = TestClient(app)
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data


def test_health_check_returns_unhealthy_when_database_fails():
    """Test health check returns 503 when database connection fails."""
    from fastapi.testclient import TestClient
    from backend.src.app import app

    client = TestClient(app)

    # Mock database failure by patching the get_db dependency
    with patch("backend.src.api.routes.get_db") as mock_db:
        mock_session = MagicMock()
        mock_session.execute.side_effect = Exception("Database connection failed")
        mock_db.return_value = iter([mock_session])

        response = client.get("/api/health")

        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        detail = data["detail"]
        assert detail["status"] == "unhealthy"
        assert detail["database"] == "disconnected"
        assert "error" in detail
