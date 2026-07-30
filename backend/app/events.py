"""Tín hiệu thay đổi trạng thái cho luồng SSE.

Không dùng message queue: mỗi kết nối SSE chờ một asyncio.Event chung, khi có
mutation thì tất cả cùng thức dậy và đọc lại snapshot theo role của mình.
"""

import asyncio

_waiters: set[asyncio.Event] = set()


def notify() -> None:
    """Đánh thức mọi kết nối SSE đang chờ."""
    for waiter in list(_waiters):
        waiter.set()


async def wait_for_change(timeout: float) -> bool:
    """Chờ mutation kế tiếp, hoặc trả về False khi hết timeout (nhịp tick)."""
    waiter = asyncio.Event()
    _waiters.add(waiter)
    try:
        await asyncio.wait_for(waiter.wait(), timeout=timeout)
        return True
    except asyncio.TimeoutError:
        return False
    finally:
        _waiters.discard(waiter)
