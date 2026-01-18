import requests
import sys

BASE_URL = "http://localhost:5002"

def test_health():
    try:
        resp = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_register():
    url = f"{BASE_URL}/register"
    files = {'file': open('../tests/text/testing1.txt', 'rb')}
    data = {'id': 'server_test_01'}
    try:
        resp = requests.post(url, files=files, data=data)
        print(f"Register: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Register Failed: {e}")

def test_check():
    url = f"{BASE_URL}/check"
    files = {'file': open('../tests/text/testing2.txt', 'rb')}
    try:
        resp = requests.post(url, files=files)
        print(f"Check: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Check Failed: {e}")

if __name__ == "__main__":
    print(f"Testing Server at {BASE_URL}...")
    test_health()
    test_register()
    test_check()
