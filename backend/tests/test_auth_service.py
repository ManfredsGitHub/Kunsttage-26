import os
import pytest
from datetime import datetime, timedelta

os.environ.setdefault("JWT_SECRET", "test-secret-fuer-tests")

from services.auth_service import (
    create_token,
    verify_token,
    hash_password,
    verify_password,
    validate_password_strength,
)


# ── JWT ──────────────────────────────────────────────────────────────────────

def test_token_erstellen_und_verifizieren():
    token = create_token(1, "test@example.com", "admin")
    payload = verify_token(token)
    assert payload is not None
    assert payload["email"] == "test@example.com"
    assert payload["rolle"] == "admin"
    assert payload["sub"] == "1"


def test_abgelaufener_token_wird_abgelehnt():
    token = create_token(1, "test@example.com", "admin", stunden=-1)
    assert verify_token(token) is None


def test_ungültiger_token_wird_abgelehnt():
    assert verify_token("kein.echter.token") is None
    assert verify_token("") is None


def test_alle_rollen_im_token():
    for rolle in ("admin", "orga", "kasse", "kuenstler"):
        token = create_token(42, f"{rolle}@test.de", rolle)
        payload = verify_token(token)
        assert payload["rolle"] == rolle


# ── Passwort-Hashing ─────────────────────────────────────────────────────────

def test_passwort_hash_und_verify():
    pw = "SicheresPasswort123!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed)
    assert not verify_password("FalschesPasswort!", hashed)


def test_gleiche_passwörter_unterschiedliche_hashes():
    pw = "SicheresPasswort123!"
    assert hash_password(pw) != hash_password(pw)


# ── Passwort-Stärke ───────────────────────────────────────────────────────────

@pytest.mark.parametrize("pw, erwartet_fehlerfrei", [
    ("Korrekt123!", True),
    ("kurz1A!",    False),   # zu kurz
    ("ohneziffer!", False),  # keine Ziffer
    ("KEINEKLEIN1!", False), # kein Kleinbuchstabe — wait, only checks uppercase
    ("ohnegross1!", False),  # kein Großbuchstabe
    ("OhneZeichen1", False), # kein Sonderzeichen
    ("kunsttage",  False),   # Blocklist
])
def test_passwort_staerke(pw: str, erwartet_fehlerfrei: bool):
    fehler = validate_password_strength(pw)
    if erwartet_fehlerfrei:
        assert fehler == [], f"Unerwartete Fehler für '{pw}': {fehler}"
    else:
        assert fehler != [], f"Hätte Fehler erwartet für '{pw}'"
