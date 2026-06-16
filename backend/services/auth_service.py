import os
from jose import jwt, JWTError
from datetime import datetime, timedelta

SECRET = os.getenv("JWT_SECRET", "dev-secret-bitte-aendern")
ALGORITHM = "HS256"

ADMIN_PW = os.getenv("ADMIN_PASSWORT", "")
ORGA_PW = os.getenv("ORGA_PASSWORT", "")


def create_token(rolle: str, stunden: int = 12) -> str:
    payload = {
        "rolle": rolle,
        "exp": datetime.utcnow() + timedelta(hours=stunden),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


def check_passwort(rolle: str, passwort: str) -> bool:
    if rolle == "admin":
        return bool(ADMIN_PW) and passwort == ADMIN_PW
    if rolle == "orga":
        return bool(ORGA_PW) and passwort == ORGA_PW
    return False
