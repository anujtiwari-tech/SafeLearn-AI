from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
import os

from .config import settings

# Database URL from environment
DATABASE_URL = settings.DATABASE_URL

# Create engine with appropriate settings
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False  # Needed for SQLite

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,  # Set to False to stop SQL query logging in the console
    pool_pre_ping=True  # Check connection health before use
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from .base import Base

# Dependency to get DB session
def get_db():
    """
    FastAPI dependency that provides a database session.
    Automatically closes the session after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Context manager for manual DB access (scripts, tests)
@contextmanager
def get_db_context():
    """Context manager for database sessions outside of FastAPI"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

# Initialize database (create all tables)
def init_db():
    """Initialize database with all tables"""
    from . import models  # Import models to register them
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")