"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
import json
from datetime import datetime

from backend.src.services.database import init_database
from backend.src.api.routes import router
from backend.src.api.middleware import RequestIDMiddleware

# Configure structured logging
APP_ENV = os.getenv("APP_ENV", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for production logging."""

    def format(self, record):
        """Format log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id

        return json.dumps(log_data)


# Configure logging based on environment
if APP_ENV == "production":
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
else:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)

logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper()), handlers=[handler])

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Project Intake Form API",
    description="MOC Project Intake Request System",
    version="1.0.0",
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request ID middleware for distributed tracing
app.add_middleware(RequestIDMiddleware)

# Include API routes
app.include_router(router)

# Initialize database
init_database()

# Serve static frontend files
try:
    app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
    app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
except RuntimeError:
    # Frontend directory doesn't exist yet during testing
    pass


@app.on_event("startup")
async def startup_event():
    """Initialize app on startup."""
    logger.info(
        "Application starting up",
        extra={"environment": APP_ENV, "log_level": LOG_LEVEL},
    )


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Application shutting down")
