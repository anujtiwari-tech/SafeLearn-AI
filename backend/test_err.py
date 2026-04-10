import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models

client = TestClient(app)

def test():
    # Generate a hardcoded valid user token for student #1
    # Actually just overriding the dependency is easier
    from app.dependencies import get_current_active_user
    from app.security import require_role
    
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.role == 'student').first()
    if not user:
        print("No student user found!")
        return
        
    app.dependency_overrides[require_role('student')] = lambda: user
    
    response = client.post("/api/student/blocked-sites", json={
        "url": "testsite.com",
        "reason": "Test"
    })
    print(response.status_code)
    print(response.text)

if __name__ == "__main__":
    test()
