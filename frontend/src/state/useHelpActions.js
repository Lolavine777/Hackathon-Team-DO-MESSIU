import { useCallback, useMemo, useState } from 'react'

/**
 * Vòng đời một yêu cầu hỗ trợ: học viên gửi → trợ giảng nhận → trả lời →
 * học viên chốt "đã hiểu" hoặc "vẫn kẹt" (vẫn kẹt thì chuyển lên giảng viên).
 *
 * Tách khỏi `SessionContext` để file đó không vượt giới hạn 200 dòng.
 */
export default function useHelpActions({ call, uid, page, questions }) {
  // Chỉ máy này biết mình đã gửi câu nào — server không gắn danh tính vào câu hỏi ẩn danh.
  const [askedIds, setAskedIds] = useState([])

  const askQuestion = useCallback(
    async ({ text, scope, category }) => {
      const item = await call('/questions', {
        method: 'POST',
        body: { text, scope, category, page, user_id: uid },
      })
      setAskedIds((ids) => [item.id, ...ids])
      return item
    },
    [call, page, uid]
  )

  const answerQuestion = useCallback(
    (questionId, text, share = false) =>
      call(`/questions/${questionId}/answer`, {
        method: 'POST',
        body: { text, share_with_class: share },
      }),
    [call]
  )

  const claimQuestion = useCallback(
    (questionId) => call(`/questions/${questionId}/claim`, { method: 'POST' }),
    [call]
  )

  const resolveQuestion = useCallback(
    (questionId, understood) =>
      call(`/questions/${questionId}/resolve`, {
        method: 'POST',
        body: { understood, user_id: uid },
      }),
    [call, uid]
  )

  const groupQuestions = useCallback(
    (force = false) => call('/ai/group-questions', { method: 'POST', body: { force } }),
    [call]
  )

  const broadcastCluster = useCallback(
    (clusterId, { title, body }) =>
      call(`/clusters/${clusterId}/broadcast`, { method: 'POST', body: { title, body, page } }),
    [call, page]
  )

  // --- ghim lên slide ---------------------------------------------------

  const pinQuestion = useCallback(
    (questionId) => call(`/questions/${questionId}/pin`, { method: 'POST' }),
    [call]
  )

  const unpinNote = useCallback((pinId) => call(`/pins/${pinId}`, { method: 'DELETE' }), [call])

  const echoQuestion = useCallback(
    (questionId) => call(`/questions/${questionId}/echo`, { method: 'POST', body: { user_id: uid } }),
    [call, uid]
  )

  const publishClarification = useCallback(
    ({ title, body }) => call('/clarifications', { method: 'POST', body: { title, body, page } }),
    [call, page]
  )

  const myQuestions = useMemo(
    () => questions.filter((q) => askedIds.includes(q.id)),
    [questions, askedIds]
  )

  return {
    askQuestion,
    answerQuestion,
    claimQuestion,
    resolveQuestion,
    groupQuestions,
    broadcastCluster,
    pinQuestion,
    unpinNote,
    echoQuestion,
    publishClarification,
    myQuestions,
  }
}
