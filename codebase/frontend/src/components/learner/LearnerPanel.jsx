import { useState } from 'react'
import Tabs from '../ui/Tabs.jsx'
import IconButton from '../ui/IconButton.jsx'
import LiveDot from '../ui/LiveDot.jsx'
import LiveQuizCard from './LiveQuizCard.jsx'
import HintCard from './HintCard.jsx'
import PulseCard from './PulseCard.jsx'
import ClarificationCard from './ClarificationCard.jsx'
import AskAssistantCard from './AskAssistantCard.jsx'
import MyQuestionsPane from './MyQuestionsPane.jsx'
import SelfTestPane from './SelfTestPane.jsx'
import AskQuestionModal from './AskQuestionModal.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconRefresh } from '../../lib/icons.js'

/** Panel tương tác bên phải của học viên. */
export default function LearnerPanel() {
  const { material, page, setPage, clarifications, myQuestions, run, hints } = useSession()
  const toast = useToast()
  const [tab, setTab] = useState('class')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <aside className="grid min-h-0 grid-rows-[auto_auto_1fr] border-l border-line bg-white">
      <div className="border-b border-line px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[17px] font-extrabold">
            <LiveDot />
            Tương tác bài học
          </div>
          <IconButton size="sm" title="Làm mới" onClick={() => toast('Đã đồng bộ với lớp.')}>
            <IconRefresh size={17} />
          </IconButton>
        </div>
        <div className="mt-2 text-[12px] text-muted">
          {material.name} · Trang {page} ·{' '}
          {run?.status === 'running' ? 'Checkpoint đang mở' : 'Chưa có hoạt động'}
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'class', label: 'Tương tác lớp' },
          { id: 'mine', label: 'Yêu cầu hỗ trợ', badge: myQuestions.length || null },
          { id: 'selftest', label: 'Tự kiểm tra' },
        ]}
      />

      <div className="panel-scroll bg-[#F8FAFD] p-3.5">
        {tab === 'class' ? (
          <>
            <LiveQuizCard />
            {hints.map((hint) => (
              <HintCard key={hint.id} hint={hint} />
            ))}
            <PulseCard />
            {clarifications.map((c) => (
              <ClarificationCard key={c.id} item={c} onGoToSlide={setPage} />
            ))}
            <AskAssistantCard onOpen={() => setModalOpen(true)} />
          </>
        ) : null}

        {tab === 'mine' ? <MyQuestionsPane /> : null}
        {tab === 'selftest' ? <SelfTestPane /> : null}
      </div>

      <AskQuestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSent={() => setTab('mine')}
      />
    </aside>
  )
}
