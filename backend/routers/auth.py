from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.auth_service import create_token, check_passwort

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    rolle: str   # "admin" | "orga"
    passwort: str


@router.post("/login")
def login(req: LoginRequest):
    if req.rolle not in ("admin", "orga"):
        raise HTTPException(status_code=400, detail="Unbekannte Rolle")
    if not check_passwort(req.rolle, req.passwort):
        raise HTTPException(status_code=401, detail="Falsches Passwort")
    stunden = 24 if req.rolle == "admin" else 12
    token = create_token(req.rolle, stunden=stunden)
    return {"token": token, "rolle": req.rolle, "stunden": stunden}
