# Multi-stage Dockerfile for Project Intake Form Application
# Constitutional Principle II: Containerized Deployment

# Stage 1: Dependencies
FROM python:3.12-alpine3.19 AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy requirements and install
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production Runtime
FROM python:3.12-alpine3.19

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache sqlite

# Create non-root user (UID 1000) for security
RUN adduser -D -u 1000 appuser

# Copy installed packages from builder
COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local

# Set PATH to include user packages
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy application code
COPY --chown=appuser:appuser backend/ /app/backend/
COPY --chown=appuser:appuser frontend/ /app/frontend/

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown appuser:appuser /app/data

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

# Run application
CMD ["uvicorn", "backend.src.app:app", "--host", "0.0.0.0", "--port", "8000"]
