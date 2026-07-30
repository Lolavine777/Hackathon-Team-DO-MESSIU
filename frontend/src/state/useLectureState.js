import { useCallback, useEffect, useState } from 'react'
import { api, subscribeState } from '../lib/api.js'

/**
 * Kết nối tới backend: một lần lấy cấu hình tĩnh (phiên, checkpoint đã soạn),
 * sau đó nhận snapshot realtime qua SSE.
 */
export default function useLectureState({ role, uid, enabled = true }) {
  const [config, setConfig] = useState(null)
  const [live, setLive] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    api('/session', { role })
      .then((data) => alive && setConfig(data))
      .catch((err) => alive && setError(err))
    return () => {
      alive = false
    }
  }, [role, enabled])

  useEffect(() => {
    if (!enabled) return undefined
    return subscribeState({ role, uid, onState: setLive, onError: setError })
  }, [role, uid, enabled])

  // Checkpoint mới soạn nằm trong `/session` chứ không trong snapshot SSE,
  // nên sau khi tạo phải tải lại cấu hình thì danh sách mới thấy nó.
  const reloadConfig = useCallback(
    () => api('/session', { role }).then(setConfig),
    [role]
  )

  return { config, live, error, reloadConfig, ready: Boolean(config && live) }
}
