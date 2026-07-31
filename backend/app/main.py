"""VLearn — Trợ lý hỗ trợ tương tác Lecture (backend MVP)."""

import mimetypes
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import llm
from .routers import router


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await llm.aclose()


app = FastAPI(
    title="VLearn Interaction API",
    description="API cho trợ lý tương tác lecture tích hợp LMS.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.ngrok-free\.(dev|app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_error(_, exc: RequestValidationError):
    """Gộp lỗi validate thành một câu để `api.js` hiển thị thẳng cho người dùng."""
    first = exc.errors()[0] if exc.errors() else {}
    message = first.get("msg", "Dữ liệu gửi lên không hợp lệ.")
    return JSONResponse(status_code=422, content={"detail": message.removeprefix("Value error, ")})


@app.get("/health")
def health():
    return {"status": "ok"}


# --- phục vụ frontend đã build (single-origin, dùng chung 1 domain ngrok) ---

# Trên Windows, mimetypes đọc bảng MIME từ registry: `.mjs` gần như không bao giờ có ở đó
# nên rơi về text/plain. Trình duyệt chặn module worker và dynamic import có MIME không phải
# JavaScript, khiến worker của pdf.js không khởi động được -> không xem được PDF.
# Khai báo tường minh trước khi mount StaticFiles để không phụ thuộc vào máy chạy server.
for _suffix, _mime in (
    (".mjs", "text/javascript"),
    (".js", "text/javascript"),
    (".css", "text/css"),
    (".json", "application/json"),
    (".svg", "image/svg+xml"),
    (".wasm", "application/wasm"),
):
    mimetypes.add_type(_mime, _suffix)

DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"

if DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    materials = DIST / "materials"
    if materials.is_dir():
        app.mount("/materials", StaticFiles(directory=materials), name="materials")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        """Trả index.html cho mọi route client-side của react-router."""
        candidate = DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(DIST / "index.html")
