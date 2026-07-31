"""Cấu hình LLM, đọc từ `backend/.env`.

Thiếu khoá thì toàn bộ tính năng AI tắt mềm — phần còn lại của ứng dụng không đổi.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH)


def _int_env(name: str, default: int) -> int:
    try:
        return int((os.getenv(name) or "").strip() or default)
    except ValueError:
        return default


class Settings:
    """Đọc một lần lúc import; sửa `.env` thì khởi động lại backend."""

    def __init__(self) -> None:
        self.base_url = (os.getenv("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
        self.api_key = (os.getenv("OPENAI_KEY") or "").strip()
        self.model = (os.getenv("MODEL") or "").strip()
        self.timeout_sec = _int_env("LLM_TIMEOUT_SEC", 60)

    @property
    def enabled(self) -> bool:
        return bool(self.api_key and self.model)

    @property
    def disabled_reason(self) -> str | None:
        if self.enabled:
            return None
        missing = [name for name, value in (("OPENAI_KEY", self.api_key), ("MODEL", self.model)) if not value]
        return f"Chưa cấu hình {' và '.join(missing)} trong backend/.env."

    def public(self) -> dict:
        """Phần cấu hình an toàn để gửi cho client — không bao giờ kèm khoá."""
        return {"enabled": self.enabled, "model": self.model or None, "reason": self.disabled_reason}


settings = Settings()
