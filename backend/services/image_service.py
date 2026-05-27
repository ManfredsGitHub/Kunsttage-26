from PIL import Image
import io
import os

MAX_WEB_SIZE = (1500, 1500)
MAX_WEB_KB = 500


def compress_image(data: bytes, filename: str) -> tuple[bytes, bytes]:
    """Returns (web_bytes, original_bytes). Web version max 1500px / 500KB."""
    original = data

    img = Image.open(io.BytesIO(data))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    img.thumbnail(MAX_WEB_SIZE, Image.LANCZOS)

    quality = 85
    while True:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        if buf.tell() <= MAX_WEB_KB * 1024 or quality <= 40:
            break
        quality -= 5

    return buf.getvalue(), original


def save_image(web_bytes: bytes, original_bytes: bytes, bild_nr: str, upload_dir: str) -> tuple[str, str]:
    web_path = os.path.join(upload_dir, "web", f"{bild_nr}.jpg")
    orig_path = os.path.join(upload_dir, "original", f"{bild_nr}_orig")

    os.makedirs(os.path.dirname(web_path), exist_ok=True)
    os.makedirs(os.path.dirname(orig_path), exist_ok=True)

    with open(web_path, "wb") as f:
        f.write(web_bytes)
    with open(orig_path, "wb") as f:
        f.write(original_bytes)

    return f"/uploads/web/{bild_nr}.jpg", f"/uploads/original/{bild_nr}_orig"
