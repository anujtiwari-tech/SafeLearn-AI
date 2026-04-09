import requests
BASE_URL = "http://localhost:8000/api"
email = "test@example.com"
password = "Password123!"

# Login
resp = requests.post(f"{BASE_URL}/auth/token", data={"username": email, "password": password})
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get Modules
res = requests.get(f"{BASE_URL}/learning/modules", headers=headers)
print(f"Modules: {res.status_code}")
modules = res.json()
print(f"First Module: {modules[0]['title']}")

# Complete
mid = modules[0]['id']
res = requests.post(f"{BASE_URL}/learning/modules/{mid}/complete", headers=headers)
print(f"Complete: {res.status_code}")
print(res.json())

# Progress
res = requests.get(f"{BASE_URL}/learning/progress", headers=headers)
print(f"Progress: {res.status_code}")
print(res.json())
