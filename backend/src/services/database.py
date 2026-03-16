"""Database connection and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os

DATABASE_PATH = os.getenv("DATABASE_PATH", "./data/intake.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_database():
    """Initialize database schema if not exists.

    Database Migration Strategy
    ---------------------------

    Current Approach (MVP):
    - Simple SQLAlchemy `create_all()` for schema creation
    - Suitable for initial development and small deployments
    - SQLite file persisted in Docker volume

    Production Migration Strategy:

    Option 1: Alembic (Recommended for Growth)
    ------------------------------------------
    When the application scales or requires complex migrations:

    1. Install Alembic:
       pip install alembic

    2. Initialize Alembic:
       alembic init alembic

    3. Configure alembic.ini:
       sqlalchemy.url = sqlite:///./data/intake.db

    4. Generate initial migration:
       alembic revision --autogenerate -m "Initial schema"

    5. Apply migrations:
       alembic upgrade head

    6. For schema changes:
       - Update SQLAlchemy models
       - Generate migration: alembic revision --autogenerate -m "description"
       - Review migration file (alembic/versions/*.py)
       - Test in development: alembic upgrade head
       - Apply in production: alembic upgrade head

    7. Rollback if needed:
       alembic downgrade -1  # Rollback one version
       alembic downgrade <revision>  # Rollback to specific version

    Option 2: Manual SQL Migrations
    --------------------------------
    For simple, one-off schema changes:

    1. Create SQL migration file: migrations/001_add_column.sql
    2. Document up/down scripts
    3. Apply manually via sqlite3 CLI
    4. Version control migration files

    Backup Strategy:
    ---------------
    Before any schema migration:

    1. SQLite file backup:
       cp data/intake.db data/intake.db.backup-$(date +%Y%m%d-%H%M%S)

    2. For Docker volume:
       docker cp rhr-intake-form:/app/data/intake.db ./backup/

    3. Automated backups (recommended):
       - Cron job to copy SQLite file
       - Or use Docker volume backup tools

    Zero-Downtime Deployment:
    -------------------------
    1. Blue-Green Deployment:
       - Deploy new container alongside old
       - Run migrations on new database copy
       - Switch traffic to new container
       - Rollback to old if issues

    2. Maintenance Window:
       - Schedule brief downtime for migrations
       - Stop container, backup DB, migrate, restart
       - Typically <1 minute for SQLite

    Testing Migrations:
    ------------------
    1. Test on copy of production data
    2. Verify migration scripts (up and down)
    3. Check data integrity after migration
    4. Performance test with production-like data volume

    Migration Checklist:
    -------------------
    - [ ] Backup current database
    - [ ] Test migration on copy
    - [ ] Document rollback procedure
    - [ ] Notify stakeholders of maintenance window
    - [ ] Apply migration
    - [ ] Verify application functionality
    - [ ] Monitor for errors
    - [ ] Keep backup for 30 days
    """
    from backend.src.models import Base

    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_submission(db: Session, submission_data):
    """Create a new project intake submission."""
    from backend.src.models.submission import Submission

    submission = Submission(**submission_data.model_dump())
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


def list_submissions(db: Session, limit: int = 100, offset: int = 0):
    """List submissions with pagination, ordered by most recent first."""
    from backend.src.models.submission import Submission

    return (
        db.query(Submission)
        .order_by(Submission.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )


def get_submission(db: Session, submission_id: int):
    """Get a specific submission by ID."""
    from backend.src.models.submission import Submission

    return db.query(Submission).filter(Submission.id == submission_id).first()
