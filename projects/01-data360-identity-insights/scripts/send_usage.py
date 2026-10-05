# send_usage.py  (set TENANT_URL and DC_TOKEN env vars first)
import os, uuid, random, datetime as dt, requests
URL = f"{os.environ['TENANT_URL']}/api/v1/ingest/sources/Nimbus_Usage/usage_event"
H = {"Authorization": f"Bearer {os.environ['DC_TOKEN']}", "Content-Type": "application/json"}

def ev(user, etype, ts, q=1):
    return {"event_id": str(uuid.uuid4()), "app_user_id": user,
            "device_id": f"TRK-{random.randint(500, 560)}", "event_type": etype,
            "quantity": q, "event_ts": ts.isoformat(timespec="milliseconds").replace("+00:00", "Z")}

def baseline(n=2000):
    now = dt.datetime.now(dt.timezone.utc)
    rows = [ev(f"APP-{10000 + random.randint(0, 199)}",
               random.choices(["gps_ping", "api_call", "alert_error"], [80, 18, 2])[0],
               now - dt.timedelta(minutes=random.randint(0, 30 * 24 * 60)),
               random.randint(1, 20)) for _ in range(n)]
    for i in range(0, n, 200):
        r = requests.post(URL, headers=H, json={"data": rows[i:i + 200]})
        print(i, r.status_code)

def burst(user="APP-10060", k=6):
    now = dt.datetime.now(dt.timezone.utc)
    r = requests.post(URL, headers=H, json={"data": [ev(user, "alert_error", now) for _ in range(k)]})
    print("burst", user, k, r.status_code)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "burst":
        user = sys.argv[2] if len(sys.argv) > 2 else "APP-10060"
        k = int(sys.argv[3]) if len(sys.argv) > 3 else 6
        burst(user, k)
    else:
        baseline()
