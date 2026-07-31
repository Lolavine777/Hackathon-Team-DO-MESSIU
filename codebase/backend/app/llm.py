"""Client mỏng cho LLM tương thích OpenAI (`/chat/completions`, output JSON).

Không dùng SDK `openai` để chạy được với mọi gateway tương thích: mỗi gateway hỗ trợ
một tập tham số tuỳ chọn khác nhau, nên ở đây tự bớt dần tham số khi bị từ chối.
"""

import json
import re

import httpx

from .config import settings

_FENCE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)
_RETRYABLE = {400, 404, 422}  # gateway không hiểu một tham số tuỳ chọn → thử lại với payload gọn hơn

_client: httpx.AsyncClient | None = None


class LLMError(RuntimeError):
    """Lỗi phía LLM — thông điệp luôn bằng tiếng Việt để hiển thị thẳng cho người dùng."""


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(settings.timeout_sec))
    return _client


async def aclose() -> None:
    """Đóng kết nối khi tắt app (gọi từ lifespan của `main.py`)."""
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
    _client = None


def _extract_json(text: str) -> dict:
    raw = text.strip()
    fenced = _FENCE.search(raw)
    if fenced:
        raw = fenced.group(1)
    else:  # một số model vẫn kèm lời dẫn trước/sau JSON
        start, end = raw.find("{"), raw.rfind("}")
        if start != -1 and end > start:
            raw = raw[start : end + 1]

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise LLMError("LLM trả về dữ liệu không phải JSON hợp lệ.") from exc
    if not isinstance(data, dict):
        raise LLMError("LLM trả về JSON nhưng không phải một object.")
    return data


def _content(body: dict) -> str:
    try:
        return body["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, TypeError) as exc:
        raise LLMError("LLM trả về cấu trúc response không đọc được.") from exc


async def chat_json(system: str, user: str, *, max_tokens: int = 2400, temperature: float = 0.3) -> dict:
    """Gọi LLM một lượt và ép kết quả về một JSON object."""
    if not settings.enabled:
        raise LLMError(settings.disabled_reason)

    base = {
        "model": settings.model,
        "temperature": temperature,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
    }
    variants = [
        {**base, "max_tokens": max_tokens, "response_format": {"type": "json_object"}},
        {**base, "max_tokens": max_tokens},
        base,
    ]

    url = f"{settings.base_url}/chat/completions"
    headers = {"Authorization": f"Bearer {settings.api_key}", "Content-Type": "application/json"}
    last_error = "không rõ nguyên nhân"

    for payload in variants:
        try:
            response = await _get_client().post(url, headers=headers, json=payload)
        except httpx.TimeoutException as exc:
            raise LLMError(f"LLM không phản hồi trong {settings.timeout_sec} giây.") from exc
        except httpx.HTTPError as exc:
            raise LLMError(f"Không kết nối được tới LLM: {exc}") from exc

        if response.status_code == 200:
            return _extract_json(_content(response.json()))

        last_error = f"HTTP {response.status_code} · {response.text[:180]}"
        if response.status_code not in _RETRYABLE:
            break

    raise LLMError(f"LLM trả về lỗi ({last_error}).")
