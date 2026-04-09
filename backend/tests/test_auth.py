import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.config import settings
from app import models, security

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_safelearn.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_teardown():
    """Create tables before each test, drop after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    """Create a test user"""
    db = TestingSessionLocal()
    user = models.User(
        email="test@student.edu",
        hashed_password=security.get_password_hash("TestPass123"),
        full_name="Test Student",
        role=models.UserRole.STUDENT,
        security_score=50
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()

def test_register_user():
    """Test user registration"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@student.edu",
            "password": "NewPass123",
            "full_name": "New User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@student.edu"
    assert "hashed_password" not in data  # Security: don't return password

def test_register_duplicate_email():
    """Test registration with existing email"""
    # First registration
    client.post("/api/auth/register", json={
        "email": "duplicate@student.edu",
        "password": "Pass123",
        "full_name": "First"
    })
    
    # Second registration with same email
    response = client.post("/api/auth/register", json={
        "email": "duplicate@student.edu",
        "password": "Pass456",
        "full_name": "Second"
    })
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success(test_user):
    """Test successful login"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "test@student.edu",  # OAuth2 uses 'username' for email
            "password": "TestPass123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Verify token can be decoded
    payload = security.verify_token(data["access_token"], token_type="access")
    assert payload is not None
    assert payload["sub"] == str(test_user.id)

def test_login_wrong_password(test_user):
    """Test login with incorrect password"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "test@student.edu",
            "password": "WrongPass123"
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]

def test_get_current_user(test_user):
    """Test accessing protected endpoint with valid token"""
    # Login first
    login_response = client.post("/api/auth/token", data={
        "username": "test@student.edu",
        "password": "TestPass123"
    })
    token = login_response.json()["access_token"]
    
    # Access protected endpoint
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email

def test_access_without_token():
    """Test accessing protected endpoint without token"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_password_change(test_user):
    """Test changing password"""
    # Login first
    login_response = client.post("/api/auth/token", data={
        "username": "test@student.edu",
        "password": "TestPass123"
    })
    token = login_response.json()["access_token"]
    
    # Change password
    response = client.post(
        "/api/auth/me/password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": "TestPass123",
            "new_password": "NewPass456"
        }
    )
    
    assert response.status_code == 200
    
    # Verify old password no longer works
    response = client.post("/api/auth/token", data={
        "username": "test@student.edu",
        "password": "TestPass123"
    })
    assert response.status_code == 401
    
    # Verify new password works
    response = client.post("/api/auth/token", data={
        "username": "test@student.edu",
        "password": "NewPass456"
    })
    assert response.status_code == 200