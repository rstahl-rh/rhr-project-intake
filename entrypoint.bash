#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== MOC Intake Form Application ===${NC}"
echo ""

# Determine if we're running in a container or on host
RUNNING_IN_CONTAINER=false
if [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null; then
    RUNNING_IN_CONTAINER=true
fi

# Set paths based on environment
if [ "$RUNNING_IN_CONTAINER" = true ]; then
    echo -e "${GREEN}Running in Docker container${NC}"
    APP_DIR="/app"
    DATA_DIR="/app/data"
else
    echo -e "${GREEN}Running on host machine${NC}"
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    APP_DIR="${SCRIPT_DIR}/webpage"
    DATA_DIR="${SCRIPT_DIR}/data"
fi

# Create data directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
    echo -e "${YELLOW}Creating data directory: ${DATA_DIR}${NC}"
    mkdir -p "$DATA_DIR"
fi

# Check for .env file
if [ -f "${APP_DIR}/.env" ]; then
    echo -e "${GREEN}Found .env file - AI features may be enabled${NC}"
    # Export environment variables from .env if running on host
    if [ "$RUNNING_IN_CONTAINER" = false ]; then
        set -a
        source "${APP_DIR}/.env"
        set +a
    fi
else
    echo -e "${YELLOW}No .env file found - AI features will be disabled${NC}"
    echo -e "${YELLOW}To enable AI feedback, create webpage/.env with your GEMINI_API_KEY${NC}"
fi

# Navigate to app directory
cd "$APP_DIR"

# Check if node_modules exists (only needed on host)
if [ "$RUNNING_IN_CONTAINER" = false ] && [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  App Directory:  ${APP_DIR}"
echo "  Data Directory: ${DATA_DIR}"
echo "  Port:           ${PORT:-3000}"
echo "  Environment:    ${NODE_ENV:-development}"
echo ""

# Start the application
echo -e "${GREEN}Starting MOC Intake Form server...${NC}"
echo -e "${GREEN}Access the application at: http://localhost:${PORT:-3000}${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the Node.js server
exec node server.js
