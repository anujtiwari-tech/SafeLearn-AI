import requests
import json
from datetime import datetime, timedelta, timezone

BASE_URL = "http://localhost:8000/api"
email = "test@example.com"
password = "Password123!"

def test_settings():
    print("Testing Settings & Privacy...")
    
    # 1. Login
    resp = requests.post(f"{BASE_URL}/auth/token", data={"username": email, "password": password})
    if resp.status_code != 200:
        print("Login failed!")
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Update Preferences
    print("\nUpdating Preferences...")
    pref_data = {
        "email_alerts": False,
        "push_notifications": True,
        "weekly_reports": True
    }
    res = requests.put(f"{BASE_URL}/settings/preferences", json=pref_data, headers=headers)
    print(f"Update status: {res.status_code}")
    user = res.json()
    print(f"Preferences: email={user['email_alerts']}, push={user['push_notifications']}, weekly={user['weekly_reports']}")

    # 3. Pause Protection (1 hour)
    print("\nPausing Protection for 60 minutes...")
    res = requests.post(f"{BASE_URL}/settings/pause", json={"duration_minutes": 60}, headers=headers)
    print(f"Pause status: {res.status_code}")
    user = res.json()
    paused_until = user['protection_paused_until']
    print(f"Paused until: {paused_until}")

    # 4. Export Data
    print("\nTesting Data Export...")
    res = requests.get(f"{BASE_URL}/settings/export", headers=headers)
    print(f"Export status: {res.status_code}")
    export_data = res.json()
    print(f"Export contains: {list(export_data.keys())}")
    print(f"Profile email: {export_data['export_metadata']['user_email']}")

    # 5. Clear History
    print("\nClearing History...")
    res = requests.delete(f"{BASE_URL}/settings/history", headers=headers)
    print(f"Clear status: {res.status_code}")
    print(f"Response: {res.json()}")

    # 6. Resume Protection (0 minutes)
    print("\nResuming Protection...")
    res = requests.post(f"{BASE_URL}/settings/pause", json={"duration_minutes": 0}, headers=headers)
    print(f"Resume status: {res.status_code}")
    user = res.json()
    print(f"Paused until: {user['protection_paused_until']} (Should be None)")

if __name__ == "__main__":
    test_settings()
