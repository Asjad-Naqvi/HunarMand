import requests

try:
    res = requests.get("http://127.0.0.1:5000/")
    print("Port 5000 is open and responded:", res.status_code, res.text[:200])
except Exception as e:
    print("Port 5000 check failed:", str(e))
