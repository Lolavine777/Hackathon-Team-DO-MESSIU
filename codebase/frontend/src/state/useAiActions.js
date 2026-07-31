import { useCallback } from 'react'

/**
 * Thao tác với trợ lý soạn câu hỏi.
 *
 * Tách khỏi `SessionContext` để file đó không vượt giới hạn 200 dòng, và để thấy rõ
 * ranh giới: trợ lý chỉ *soạn nháp*, còn `createCheckpoint` mới là bước giảng viên duyệt.
 */
export default function useAiActions(call, reloadConfig) {
  const generateSelfTest = useCallback(
    (page, force = false) =>
      call('/ai/self-test', { method: 'POST', body: { page, count: 5, force } }),
    [call]
  )

  const suggestCheckpoints = useCallback(
    (page, force = false) =>
      call('/ai/suggest-checkpoints', { method: 'POST', body: { page, count: 3, force } }),
    [call]
  )

  const createCheckpoint = useCallback(
    async (draft) => {
      const checkpoint = await call('/checkpoints', { method: 'POST', body: draft })
      await reloadConfig() // checkpoint mới chỉ có trong /session, không có trong snapshot SSE
      return checkpoint
    },
    [call, reloadConfig]
  )

  return { generateSelfTest, suggestCheckpoints, createCheckpoint }
}
