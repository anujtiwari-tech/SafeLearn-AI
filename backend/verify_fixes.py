import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_auth():
    print("Testing Registration and Login...")
    email = "test@example.com"
    password = "Password123!"
    
    # 1. Register
    register_data = {
        "email": email,
        "password": password,
        "full_name": "Test User"
    }
    resp = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Register status: {resp.status_code}")
    
    # 2. Login
    login_data = {
        "username": email,
        "password": password
    }
    resp = requests.post(f"{BASE_URL}/api/auth/token", data=login_data)
    print(f"Login status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return None
    
    token = resp.json()["access_token"]
    print("Token obtained successfully.")
    return token

def test_scan(token):
    print("\nTesting File Scan...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a dummy malicious-looking file
    content = b"MZ\x00\x00eval(powershell) phishing login"
    files = {"file": ("test_malicious.exe", content, "application/x-msdownload")}
    
    resp = requests.post(f"{BASE_URL}/api/scan/file", headers=headers, files=files)
    print(f"Scan status: {resp.status_code}")
    if resp.status_code == 200:
        result = resp.json()
        print(f"Score: {result['security_score']}")
        print(f"Is Threat: {result['is_threat']}")
        print(f"Threat Type: {result['threat_type']}")
        
        scan_id = result['scan_id']
        
        # Test Get Details (the one I fixed)
        print(f"\nTesting Get Scan Details for ID {scan_id}...")
        resp_details = requests.get(f"{BASE_URL}/api/scan/{scan_id}", headers=headers)
        print(f"Get Details status: {resp_details.status_code}")
        if resp_details.status_code == 200:
            print("Successfully retrieved and parsed scan details!")
        else:
            print(f"Error in Get Details: {resp_details.text}")
    else:
        print(f"Scan failed: {resp.text}")

def test_learning(token):
    print("\nTesting Learning Hub...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get modules
    res = requests.get(f"{BASE_URL}/api/learning/modules", headers=headers)
    print(f"Fetch modules status: {res.status_code}")
    modules = res.json()
    if not modules:
        print("No modules found!")
        return
        
    module_id = modules[0]['id']
    print(f"Attempting to complete module: {module_id}")
    
    # 2. Complete module
    res = requests.post(f"{BASE_URL}/api/learning/modules/{module_id}/complete", headers=headers)
    print(f"Complete module status: {res.status_code}")
    print(f"Response: {res.json()}")
    
    # 3. Check progress
    res = requests.get(f"{BASE_URL}/api/learning/progress", headers=headers)
    print(f"Fetch progress status: {res.status_code}")
    print(f"Progress: {res.json()}")

if __name__ == "__main__":
    # Note: Requires the server to be running.
    # This is a manual test aid.
    print("Verification script running...")
    token = test_auth()
    if token:
        test_scan(token)
        test_learning(token)
