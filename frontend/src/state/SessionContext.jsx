import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clientResponseId } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'
import useAiActions from './useAiActions.js'
import useHelpActions from './useHelpActions.js'
import useLectureState from './useLectureState.js'

const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

const EMPTY = {
  pulse: {},
  questions: [],
  clarifications: [],
  hints: [],
  history: [],
  clusters: [],
  pins: [],
}
const AI_OFF = { enabled: false, model: null, reason: 'Đang kết nối tới máy chủ…' }

export function SessionProvider({ children }) {
  const { user } = useAuth()
  const role = user?.role ?? 'learner'
  const uid = user?.id ?? null

  const { config, live, error, reloadConfig } = useLectureState({ role, uid, enabled: Boolean(user) })

  // Trạng thái chỉ thuộc về người dùng này, không cần đẩy lên lớp.
  const [myPulse, setMyPulse] = useState(null)

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

  // Đổi trang phải thấy ngay tại chỗ: khung slide bám theo `page`, nếu chờ server
  // trả về thì lượt kéo tiếp theo bị chính giá trị cũ kéo ngược lại.
  const setPage = useCallback(
    (page) => {
      setLocalPage(page)
      if (role !== 'teacher') return Promise.resolve()
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

  const questions = live?.questions ?? EMPTY.questions
  const helpActions = useHelpActions({ call, uid, page: live?.page ?? 1, questions })

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
    // Sĩ số thật do server đếm từ số máy học viên đang mở lớp.
    online: live?.online ?? 0,
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
    questions,
    clarifications: live?.clarifications ?? EMPTY.clarifications,
    pins: live?.pins ?? EMPTY.pins,
    helpCategories: config?.helpCategories ?? {},
    clusters: live?.clusters ?? EMPTY.clusters,
    clustersStale: Boolean(live?.clustersStale),
    ...helpActions,

    ...aiActions,
    ai: config?.ai ?? AI_OFF,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
