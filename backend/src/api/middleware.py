"""Error handling and middleware."""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
import uuid
import logging

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors consistently."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle generic exceptions without exposing internals."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add unique request ID for distributed tracing."""

    async def dispatch(self, request: Request, call_next):
        """Process request and add X-Request-ID header."""
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Store request ID in request state
        request.state.request_id = request_id

        # Log request with ID
        logger.info(
            f"{request.method} {request.url.path}", extra={"request_id": request_id}
        )

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response
