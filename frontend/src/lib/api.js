/** Lớp gọi API duy nhất — mọi component đi qua SessionContext, không tự fetch. */

const BASE = '/api'

/** Gọi LLM có thể mất 5–20 giây; quá mốc này coi như gateway treo. */
const DEFAULT_TIMEOUT_MS = 90_000

export async function api(path, { method = 'GET', body, role = 'learner', timeoutMs } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT_MS)

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-VLearn-Role': role,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    throw err.name === 'AbortError' ? new Error('Máy chủ phản hồi quá lâu, thử lại nhé.') : err
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    const error = new Error(detail?.detail ?? `Lỗi ${res.status}`)
    error.status = res.status
    throw error
  }
  return res.status === 204 ? null : res.json()
}

/** Sinh id ổn định cho mỗi trình duyệt để chống gửi trùng và xem lại bài của mình. */
export function clientResponseId() {
  return `cr_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Nguồn realtime: SSE. Nếu trình duyệt/proxy chặn, tự rơi về polling 2 giây.
 * Trả về hàm huỷ đăng ký.
 */
export function subscribeState({ role, uid, onState, onError }) {
  const query = new URLSearchParams({ role, ...(uid ? { uid } : {}) })
  let source = null
  let pollTimer = null
  let stopped = false

  const startPolling = () => {
    if (pollTimer || stopped) return
    const tick = async () => {
      try {
        onState(await api(`/state?${query}`, { role }))
      } catch (err) {
        onError?.(err)
      }
    }
    tick()
    pollTimer = setInterval(tick, 2000)
  }

  try {
    source = new EventSource(`${BASE}/stream?${query}`)
    source.addEventListener('state', (event) => onState(JSON.parse(event.data)))
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) startPolling()
    }
  } catch {
    startPolling()
  }

  return () => {
    stopped = true
    source?.close()
    clearInterval(pollTimer)
  }
}
