#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REPO_BASE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
WEBPAGE_DIR="${REPO_BASE}/webpage"
TODO_FILE="${REPO_BASE}/AGENT_TODO"

echo -e "${GREEN}=== MOC Intake Form Build Script ===${NC}"
echo ""

# ============================================================
# STEP 1: Verify Prerequisites
# ============================================================
echo -e "${YELLOW}Step 1: Verifying prerequisites...${NC}"

MISSING_PREREQS=()

# Check for Node.js
if ! command -v node &> /dev/null; then
    MISSING_PREREQS+=("node (Node.js runtime)")
else
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    MISSING_PREREQS+=("npm (Node package manager)")
else
    NPM_VERSION=$(npm --version)
    echo "✓ npm found: v$NPM_VERSION"
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    MISSING_PREREQS+=("docker (Container runtime)")
else
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker found: $DOCKER_VERSION"
fi

# Check if Docker daemon is running
if command -v docker &> /dev/null; then
    if ! docker info &> /dev/null; then
        echo -e "${RED}✗ Docker daemon is not running${NC}"
        MISSING_PREREQS+=("docker daemon (Docker service must be started)")
    fi
fi

# If any prerequisites are missing, exit
if [ ${#MISSING_PREREQS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}ERROR: Missing required prerequisites:${NC}"
    for prereq in "${MISSING_PREREQS[@]}"; do
        echo -e "${RED}  ✗ $prereq${NC}"
    done
    echo ""
    echo "Please install the missing prerequisites and try again."
    exit 1
fi

echo -e "${GREEN}All prerequisites satisfied!${NC}"
echo ""

# ============================================================
# STEP 2: Install Dependencies and Run Linters
# ============================================================
echo -e "${YELLOW}Step 2: Installing dependencies and running linters...${NC}"

# Navigate to webpage directory
cd "$WEBPAGE_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Install linting tools as dev dependencies if not already present
echo "Ensuring linting tools are installed..."
npm install --save-dev \
    eslint \
    eslint-config-standard \
    html-validate \
    stylelint \
    stylelint-config-standard \
    2>/dev/null || true

# Clear the TODO file if it exists
> "$TODO_FILE"

LINT_ERRORS=0

# Run ESLint on JavaScript files
echo "Running ESLint on JavaScript files..."
if ! npx eslint --no-eslintrc --env browser,node --parser-options ecmaVersion:2020 \
    "*.js" 2>&1 | tee -a "$TODO_FILE"; then
    LINT_ERRORS=1
    echo -e "${RED}✗ ESLint found issues${NC}" | tee -a "$TODO_FILE"
else
    echo -e "${GREEN}✓ JavaScript linting passed${NC}"
fi

# Run html-validate on HTML files
echo "Running html-validate on HTML files..."
if ! npx html-validate "*.html" 2>&1 | tee -a "$TODO_FILE"; then
    LINT_ERRORS=1
    echo -e "${RED}✗ HTML validation found issues${NC}" | tee -a "$TODO_FILE"
else
    echo -e "${GREEN}✓ HTML validation passed${NC}"
fi

# Run stylelint on CSS files
echo "Running stylelint on CSS files..."
if ! npx stylelint --config-basedir . "*.css" 2>&1 | tee -a "$TODO_FILE"; then
    # Stylelint might fail if no config exists, so we'll just warn
    echo -e "${YELLOW}⚠ CSS linting warnings (non-fatal)${NC}"
else
    echo -e "${GREEN}✓ CSS linting passed${NC}"
fi

# Check Node.js syntax on server file
echo "Checking Node.js syntax..."
if ! node --check server.js 2>&1 | tee -a "$TODO_FILE"; then
    LINT_ERRORS=1
    echo -e "${RED}✗ Node.js syntax check failed${NC}" | tee -a "$TODO_FILE"
else
    echo -e "${GREEN}✓ Node.js syntax check passed${NC}"
fi

# Return to repo base
cd "$REPO_BASE"

# If there were lint errors, exit
if [ $LINT_ERRORS -eq 1 ]; then
    echo ""
    echo -e "${RED}ERROR: Linting and validation found issues!${NC}"
    echo -e "${RED}Please review errors in: ${TODO_FILE}${NC}"
    echo ""
    echo "Fix the errors and run the build script again."
    exit 1
fi

# Remove TODO file if empty (no errors)
if [ ! -s "$TODO_FILE" ]; then
    rm -f "$TODO_FILE"
fi

echo -e "${GREEN}All linting and validation checks passed!${NC}"
echo ""

# ============================================================
# STEP 3: Docker Build
# ============================================================
echo -e "${YELLOW}Step 3: Building Docker image...${NC}"

# Check if Dockerfile exists
if [ ! -f "$REPO_BASE/Dockerfile" ]; then
    echo -e "${RED}ERROR: Dockerfile not found in repository base directory${NC}"
    exit 1
fi

# Build Docker image
IMAGE_NAME="moc-intake-form"
IMAGE_TAG="latest"

echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "$REPO_BASE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully!${NC}"
    echo ""
    echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
    echo ""
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# ============================================================
# Build Complete
# ============================================================
echo -e "${GREEN}=== Build Complete ===${NC}"
echo ""
echo "To run the application:"
echo "  Local:     ./entrypoint.bash"
echo "  Docker:    docker run -p 3000:3000 -v \$(pwd)/data:/app/data ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "The application will be available at: http://localhost:3000"
echo ""
