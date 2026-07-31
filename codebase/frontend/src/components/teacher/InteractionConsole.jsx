import { useState } from 'react'
import Tabs from '../ui/Tabs.jsx'
import LiveDot from '../ui/LiveDot.jsx'
import CheckpointLauncher from './CheckpointLauncher.jsx'
import LiveControllerCard from './LiveControllerCard.jsx'
import LiveResultsCard from './LiveResultsCard.jsx'
import ClassPulseCard from './ClassPulseCard.jsx'
import MisconceptionCard from './MisconceptionCard.jsx'
import RecoveryCard from './RecoveryCard.jsx'
import UnderstandingCard from './UnderstandingCard.jsx'
import ConfusionClusterCard from './ConfusionClusterCard.jsx'
import WeakQuestionsCard from './WeakQuestionsCard.jsx'
import QuestionQueuePane from './QuestionQueuePane.jsx'
import CheckpointListPane from './CheckpointListPane.jsx'
import SessionReportPane from './SessionReportPane.jsx'
import AnswerModal from './AnswerModal.jsx'
import { useSession } from '../../state/SessionContext.jsx'

/** Bảng điều khiển tương tác của giảng viên. */
export default function InteractionConsole() {
  const { session, questions, page, run } = useSession()
  const [tab, setTab] = useState('live')
  const [answering, setAnswering] = useState(null)

  const pending = questions.filter((q) => !['answered', 'resolved'].includes(q.status)).length

  return (
    <aside className="grid min-h-0 grid-rows-[auto_auto_1fr] overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
      <div className="border-b border-line px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[18px] font-extrabold">
            <LiveDot tone={run?.status === 'running' ? 'alert' : 'live'} />
            Interaction Console
          </div>
          <span className="rounded-xl border border-[#D2E1EE] bg-[#EEF4FA] px-2.5 py-2 text-[11px] font-extrabold text-primary">
            Mã lớp: {session.code}
          </span>
        </div>
        <div className="mt-2 text-[12px] text-muted">
          Checkpoint, pulse và câu hỏi đều gắn với <strong>Trang {page}</strong> của tài liệu.
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'live', label: 'Trực tiếp' },
          { id: 'questions', label: 'Hỗ trợ', badge: pending || null },
          { id: 'bank', label: 'Checkpoint' },
          { id: 'report', label: 'Báo cáo' },
        ]}
      />

      <div className="panel-scroll bg-[#F7FAFD] p-3">
        {tab === 'live' ? (
          <>
            <LiveControllerCard />
            <CheckpointLauncher />
            <LiveResultsCard />
            <ClassPulseCard />
            <MisconceptionCard />
            <RecoveryCard />
            <WeakQuestionsCard />
            <UnderstandingCard />
            <ConfusionClusterCard />
          </>
        ) : null}

        {tab === 'questions' ? <QuestionQueuePane onAnswer={setAnswering} /> : null}
        {tab === 'bank' ? <CheckpointListPane /> : null}
        {tab === 'report' ? <SessionReportPane /> : null}
      </div>

      <AnswerModal question={answering} onClose={() => setAnswering(null)} />
    </aside>
  )
}
