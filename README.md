# MOC Project Intake Form

A web application for submitting MOC (Massachusetts Open Cloud) project intake forms with optional AI-powered feedback using Google Gemini.

## Features

- Complete web form based on the MOC_Intake_Form template
- Gray example text that appears in empty fields
- Google Gemini AI integration for intelligent feedback (optional)
- Client-side JavaScript validation
- SQLite database storage
- Docker containerization
- Automated build with linting and validation

## Quick Start

### Option 1: Automated Build (Recommended)

Run the automated build script that handles prerequisites, linting, and Docker image creation:

```bash
./build.sh
```

The build script will:
1. ✓ Verify prerequisites (Node.js, npm, Docker)
2. ✓ Run linters and syntax validation
3. ✓ Build a Docker image

### Option 2: Direct Execution

Run locally without Docker:

```bash
./entrypoint.bash
```

The entrypoint script automatically detects whether it's running in a container or on the host and adjusts paths accordingly.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Docker** (for containerized deployment)

## Installation & Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd rhr-project-intake
```

2. **(Optional)** Configure Google Gemini AI:
```bash
cd webpage
cp .env.example .env
# Edit .env and add your API key from https://makersuite.google.com/app/apikey
cd ..
```

3. Run the build script:
```bash
./build.sh
```

## Running the Application

### On Host Machine

```bash
./entrypoint.bash
```

Access at: http://localhost:3000

### In Docker Container

```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e GEMINI_API_KEY=your_key_here \
  moc-intake-form:latest
```

With environment file:
```bash
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --env-file webpage/.env \
  moc-intake-form:latest
```

### Using Docker Compose (Alternative)

Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  moc-intake:
    image: moc-intake-form:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - webpage/.env
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Build Script Details

The `build.sh` script performs the following steps:

### Step 1: Prerequisites Verification
Checks for:
- Node.js runtime
- npm package manager
- Docker and Docker daemon

If any prerequisite is missing, the script exits with a list of missing items.

### Step 2: Linting and Validation
Runs the following checks:
- **ESLint**: JavaScript code quality and syntax
- **html-validate**: HTML structure and validity
- **stylelint**: CSS formatting and best practices
- **Node.js syntax check**: Server-side code validation

If errors are found, they are written to `AGENT_TODO` in the repository base directory, and the script exits. Fix the errors and re-run the build.

### Step 3: Docker Build
Creates a multi-stage Docker image:
- Stage 1: Installs production dependencies
- Stage 2: Creates minimal runtime image with:
  - Node.js Alpine base
  - Application files
  - Non-root user for security
  - Health check endpoint

## Entrypoint Script

The `entrypoint.bash` script works in both environments:

**On Host:**
- Detects it's running locally
- Uses `webpage/` directory for app files
- Uses `data/` directory for database
- Loads `.env` file if present
- Installs npm dependencies if needed

**In Container:**
- Detects container environment
- Uses `/app` directory for app files
- Uses `/app/data` for database (mount as volume)
- Reads environment variables from Docker

## Project Structure

```
rhr-project-intake/
├── build.sh                  # Automated build script
├── entrypoint.bash           # Universal entrypoint script
├── Dockerfile                # Docker image definition
├── .dockerignore             # Docker build exclusions
├── README.md                 # This file
├── .gitignore                # Git exclusions
├── agent-reading-list/       # Example intake form
│   └── MOC_Intake_Form
├── webpage/                  # Web application
│   ├── server.js            # Express server
│   ├── index.html           # Form interface
│   ├── style.css            # Styling
│   ├── script.js            # Client-side logic
│   ├── package.json         # Dependencies
│   ├── .env.example         # Environment template
│   └── README.md            # Detailed app docs
└── data/                     # SQLite database (auto-created)
    └── intake_forms.db
```

## Development Workflow

1. Make changes to files in `webpage/`
2. Run `./build.sh` to validate changes
3. If linting errors occur, check `AGENT_TODO`
4. Fix errors and re-run build
5. Test with `./entrypoint.bash` or Docker

## Linting Tools

The following linting tools are installed as dev dependencies:

- **eslint**: JavaScript linter
- **html-validate**: HTML validator
- **stylelint**: CSS linter

To run linters manually:
```bash
cd webpage
npx eslint *.js
npx html-validate *.html
npx stylelint *.css
```

## Environment Variables

Create `webpage/.env` with:

```bash
# Google Gemini API Key (optional)
GEMINI_API_KEY=your_api_key_here

# Server Configuration (optional)
PORT=3000
NODE_ENV=production
```

## Database

- **Type**: SQLite
- **Location**: `data/intake_forms.db` (host) or `/app/data/intake_forms.db` (container)
- **Auto-created**: Yes, on first server start
- **Persistence**: Mount `data/` directory as volume in Docker

## API Endpoints

See `webpage/README.md` for detailed API documentation.

## Troubleshooting

### Build fails with missing prerequisites
Install Node.js, npm, and Docker, then re-run `./build.sh`

### Linting errors in AGENT_TODO
Review the file, fix the issues in your code, and re-run the build script

### Docker build fails
Ensure Docker daemon is running: `sudo systemctl start docker`

### Port 3000 already in use
Change the port: `PORT=3001 ./entrypoint.bash`

### Database permission errors (Docker)
Ensure data directory has correct permissions:
```bash
chmod -R 755 data/
```

### AI feedback not working
1. Check that `webpage/.env` exists with valid `GEMINI_API_KEY`
2. In Docker, pass the env var: `-e GEMINI_API_KEY=...` or `--env-file`

## Security Notes

- The Docker container runs as non-root user (nodejs:1001)
- API keys should never be committed (`.env` is in `.gitignore`)
- Database files are excluded from Docker images
- Health checks ensure container is responding

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `./build.sh` to validate
5. Submit a pull request
