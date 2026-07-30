import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clientResponseId } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'
import useAiActions from './useAiActions.js'
import useLectureState from './useLectureState.js'

const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

const EMPTY = { pulse: {}, topics: [], questions: [], clarifications: [], hints: [], history: [] }
const AI_OFF = { enabled: false, model: null, reason: 'Đang kết nối tới máy chủ…' }

export function SessionProvider({ children }) {
  const { user } = useAuth()
  const role = user?.role ?? 'learner'
  const uid = user?.id ?? null

  const { config, live, error, reloadConfig } = useLectureState({ role, uid, enabled: Boolean(user) })

  // Trạng thái chỉ thuộc về người dùng này, không cần đẩy lên lớp.
  const [myPulse, setMyPulse] = useState(null)
  const [votedTopics, setVotedTopics] = useState([])
  const [askedIds, setAskedIds] = useState([])

  const call = useCallback((path, options) => api(path, { role, ...options }), [role])
  const aiActions = useAiActions(call, reloadConfig)

  const run = live?.activeRun ?? null
  const runId = run?.id ?? null

  // --- checkpoint ------------------------------------------------------

  const launchCheckpoint = useCallback(
    (checkpointId) => call(`/checkpoints/${checkpointId}/launch`, { method: 'POST' }),
    [call]
  )
  const extendRun = useCallback(
    (seconds = 10) => call(`/runs/${runId}/extend`, { method: 'POST', body: { seconds } }),
    [call, runId]
  )
  const closeRun = useCallback(() => call(`/runs/${runId}/close`, { method: 'POST' }), [call, runId])
  const cancelRun = useCallback(() => call(`/runs/${runId}/cancel`, { method: 'POST' }), [call, runId])
  const launchFollowUp = useCallback(
    () => call(`/runs/${runId}/follow-up`, { method: 'POST' }),
    [call, runId]
  )
  const runAction = useCallback(
    (actionCode) => call(`/runs/${runId}/actions`, { method: 'POST', body: { action_code: actionCode } }),
    [call, runId]
  )
  const sendFeedback = useCallback(
    (helpful) => call(`/runs/${runId}/feedback`, { method: 'POST', body: { helpful } }),
    [call, runId]
  )

  const respond = useCallback(
    (optionKey, confidence) =>
      call(`/runs/${runId}/responses`, {
        method: 'POST',
        body: {
          option_key: optionKey,
          confidence,
          user_id: uid,
          client_response_id: clientResponseId(),
        },
      }),
    [call, runId, uid]
  )

  // Trang của lớp do giảng viên quyết định; học viên vẫn được tự lật xem lại,
  // và sẽ được kéo về trang lớp mỗi khi giảng viên chuyển slide.
  const classPage = live?.page ?? 1
  const [localPage, setLocalPage] = useState(null)
  useEffect(() => setLocalPage(null), [classPage])

  const setPage = useCallback(
    (page) => {
      if (role !== 'teacher') return setLocalPage(page)
      return call(`/session/page/${page}`, { method: 'PUT' })
    },
    [call, role]
  )

  // --- pulse & hỏi đáp -------------------------------------------------

  const sendPulse = useCallback(
    (value) => {
      setMyPulse(value)
      return call('/pulse', { method: 'POST', body: { value } })
    },
    [call]
  )
  const resetPulse = useCallback(() => {
    setMyPulse(null)
    return call('/pulse/reset', { method: 'POST' })
  }, [call])

  const voteTopic = useCallback(
    (topicId) => {
      if (votedTopics.includes(topicId)) return Promise.resolve()
      setVotedTopics((v) => [...v, topicId])
      return call(`/topics/${topicId}/vote`, { method: 'POST' })
    },
    [call, votedTopics]
  )

  const askQuestion = useCallback(
    async ({ text, scope }) => {
      const item = await call('/questions', {
        method: 'POST',
        body: { text, scope, page: live?.page ?? 1 },
      })
      setAskedIds((ids) => [item.id, ...ids])
      return item
    },
    [call, live?.page]
  )

  const answerQuestion = useCallback(
    (questionId, text, share = false) =>
      call(`/questions/${questionId}/answer`, {
        method: 'POST',
        body: { text, share_with_class: share },
      }),
    [call]
  )

  const publishClarification = useCallback(
    ({ title, body }) =>
      call('/clarifications', { method: 'POST', body: { title, body, page: live?.page ?? 1 } }),
    [call, live?.page]
  )

  const questions = live?.questions ?? EMPTY.questions
  const myQuestions = useMemo(
    () => questions.filter((q) => askedIds.includes(q.id)),
    [questions, askedIds]
  )

  const checkpoints = config?.checkpoints ?? []
  const checkpointsForPage = useCallback(
    (page) => checkpoints.filter((c) => c.page === page),
    [checkpoints]
  )

  const value = {
    ready: Boolean(config && live),
    error,
    role,
    session: config?.session ?? {},
    material: config?.material ?? { name: '', url: '', pages: 1 },
    checkpoints,
    checkpointsForPage,
    confidenceLevels: config?.confidenceLevels ?? [],
    actionCatalog: config?.actionCatalog ?? {},
    thresholds: config?.thresholds ?? {},

    page: localPage ?? classPage,
    classPage,
    setPage,
    lastEvent: live?.lastEvent ?? null,
    revision: live?.revision ?? 0,

    run,
    history: live?.history ?? EMPTY.history,
    recoveries: live?.recoveries ?? {},
    hints: live?.hints ?? EMPTY.hints,
    report: live?.report ?? null,

    launchCheckpoint,
    extendRun,
    closeRun,
    cancelRun,
    launchFollowUp,
    runAction,
    sendFeedback,
    respond,

    pulse: live?.pulse ?? EMPTY.pulse,
    myPulse,
    sendPulse,
    resetPulse,
    topics: live?.topics ?? EMPTY.topics,
    votedTopics,
    voteTopic,
    questions,
    myQuestions,
    askQuestion,
    answerQuestion,
    clarifications: live?.clarifications ?? EMPTY.clarifications,
    publishClarification,

    ...aiActions,
    ai: config?.ai ?? AI_OFF,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
