import time, os, httpx, jwt
from pathlib import Path

APP_ID = int(os.environ["GITHUB_APP_ID"])
PK = Path("/run/secrets/github_app_private_key").read_text()

def app_jwt():
    now = int(time.time())
    payload = {"iat": now - 60, "exp": now + 540, "iss": APP_ID}
    return jwt.encode(payload, PK, algorithm="RS256")

async def verify(owner="assil-a", repo="ai-portfolio-console"):
    h = {"Authorization": f"Bearer {app_jwt()}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient(base_url="https://api.github.com") as c:
        r = await c.get(f"/repos/{owner}/{repo}/installation", headers=h)
        print("installation:", r.status_code, r.text)
        r.raise_for_status()
        inst_id = r.json()["id"]
        r2 = await c.post(f"/app/installations/{inst_id}/access_tokens", headers=h)
        print("token:", r2.status_code)
        r2.raise_for_status()
        token = r2.json()["token"]
    h2 = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    async with httpx.AsyncClient(base_url="https://api.github.com") as c:
        r3 = await c.get(f"/repos/{owner}/{repo}", headers=h2)
        print("repo read:", r3.status_code)

# run with: python -m app.debug.github_check
