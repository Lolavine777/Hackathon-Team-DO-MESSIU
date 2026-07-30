"""Trích nội dung chữ của học liệu PDF để làm ngữ cảnh cho LLM.

Đọc bằng `pypdf` (thuần Python) đúng một lần rồi giữ trong RAM. Việc trích xuất là
blocking nên chạy trong thread riêng — không được chặn event loop vì `/api/stream`
đang tick mỗi giây cho mọi client.
"""

import asyncio
import logging
from pathlib import Path

from pypdf import PdfReader

from . import content

logging.getLogger("pypdf").setLevel(logging.ERROR)  # bỏ cảnh báo object hỏng của file gốc

ROOT = Path(__file__).resolve().parents[2]
MIN_CHARS = 40  # dưới ngưỡng này coi như slide toàn hình — không đủ chữ để sinh câu hỏi
PAGE_BUDGET = 2500  # ký tự tối đa lấy từ trang đang xem
PREV_BUDGET = 400  # ký tự tối đa lấy từ mỗi trang trước đó

# Vùng Private Use Area: ký tự của icon font (Wingdings…), chỉ gây nhiễu cho LLM.
PUA_START, PUA_END = 0xE000, 0xF8FF

_pages: list[str] | None = None
_lock = asyncio.Lock()


class SlideTextError(RuntimeError):
    """Không đọc được nội dung chữ của trang được yêu cầu."""


def _pdf_path() -> Path:
    name = content.MATERIAL["name"]
    for folder in ("frontend/public/materials", "frontend/dist/materials"):
        candidate = ROOT / folder / name
        if candidate.is_file():
            return candidate
    raise SlideTextError(f"Không tìm thấy tệp học liệu {name}.")


def _clean(text: str) -> str:
    readable = "".join(" " if PUA_START <= ord(ch) <= PUA_END else ch for ch in text)
    return " ".join(readable.split())


def _read_all() -> list[str]:
    reader = PdfReader(_pdf_path())
    return [_clean(page.extract_text() or "") for page in reader.pages]


async def pages() -> list[str]:
    global _pages
    async with _lock:
        if _pages is None:
            _pages = await asyncio.to_thread(_read_all)
    return _pages


async def page_text(page: int) -> str:
    all_pages = await pages()
    if page < 1 or page > len(all_pages):
        raise SlideTextError(f"Trang {page} nằm ngoài tài liệu ({len(all_pages)} trang).")

    text = all_pages[page - 1]
    if len(text) < MIN_CHARS:
        raise SlideTextError(f"Trang {page} gần như không có chữ, chưa sinh được câu hỏi từ trang này.")
    return text


async def context_for(page: int, budget: int = 6000) -> str:
    """Toàn bộ trang đang xem + tóm lược các trang trước, xếp theo thứ tự bài giảng.

    Ưu tiên các trang gần nhất khi ngân sách ký tự đã cạn.
    """
    current = f"[Trang {page} — đang xem]\n{(await page_text(page))[:PAGE_BUDGET]}"
    all_pages = await pages()

    earlier: list[str] = []
    left = budget - len(current)
    for number in range(page - 1, 0, -1):
        text = all_pages[number - 1][:PREV_BUDGET]
        if len(text) < MIN_CHARS:
            continue
        block = f"[Trang {number}]\n{text}"
        if len(block) > left:
            break
        earlier.append(block)
        left -= len(block)

    return "\n\n".join([*reversed(earlier), current])
