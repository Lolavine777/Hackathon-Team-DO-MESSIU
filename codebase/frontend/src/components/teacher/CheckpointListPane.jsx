import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import ClarificationComposer from './ClarificationComposer.jsx'
import CheckpointEditorModal from './CheckpointEditorModal.jsx'
import SuggestedCheckpointsCard from './SuggestedCheckpointsCard.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconAI, IconCheck, IconGoToSlide, IconLaunch, IconNote } from '../../lib/icons.js'

/** Bản nháp để mở trình soạn: checkpoint đã chạy là bất biến, nên luôn lưu thành bản mới. */
const toDraft = (cp) => ({
  page: cp.page,
  title: `${cp.title} (bản sửa)`,
  prompt: cp.prompt,
  learningOutcome: cp.learningOutcome.label,
  durationSec: cp.durationSec,
  explain: '',
  options: cp.options.map((o) => ({
    text: o.text,
    correct: Boolean(o.correct),
    misconceptionLabel: o.misconceptionLabel ?? '',
    hints: [],
  })),
  followUp: null,
  example: null,
})

/** Toàn bộ checkpoint đã soạn của buổi học kèm mapping lỗi nhận thức. */
export default function CheckpointListPane() {
  const { checkpoints, page, setPage, launchCheckpoint, run, history } = useSession()
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const busy = run?.status === 'running'
  const done = new Set(history.map((h) => h.checkpointId))

  const launch = async (cp) => {
    try {
      await launchCheckpoint(cp.id)
      toast(`Đã mở checkpoint #${cp.order}.`)
    } catch (err) {
      toast(err.message ?? 'Không mở được checkpoint.')
    }
  }

  return (
    <>
      <SuggestedCheckpointsCard />

      <Card>
        <CardTitle eyebrow="Đã chuẩn bị trước">Checkpoint của buổi học</CardTitle>

        <div className="grid gap-2.5">
          {checkpoints.map((cp) => (
            <div
              key={cp.id}
              className={[
                'rounded-2xl border p-3',
                cp.page === page ? 'border-primary/30 bg-[#F6FAFE]' : 'border-line bg-white',
              ].join(' ')}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Chip tone="neutral">Checkpoint #{cp.order}</Chip>
                <Chip as="button" tone="default" onClick={() => setPage(cp.page)}>
                  Trang {cp.page}
                  <IconGoToSlide size={13} />
                </Chip>
                <Chip tone="neutral">{cp.durationSec}s</Chip>
                <Chip tone="neutral">{cp.scoringMode === 'ungraded' ? 'Không tính điểm' : 'Có điểm'}</Chip>
                {cp.source === 'ai-draft' ? (
                  <Chip tone="default">
                    <IconAI size={12} />
                    Bạn đã duyệt
                  </Chip>
                ) : null}
                {done.has(cp.id) ? <Chip tone="success">Đã chạy</Chip> : null}
              </div>

              <p className="text-[13px] font-bold leading-snug">{cp.prompt}</p>
              <p className="mt-1 text-[11px] text-muted">
                {cp.learningOutcome.id} · {cp.learningOutcome.label}
              </p>

              <ul className="mt-2 grid gap-1 text-[12px]">
                {cp.options.map((o) => (
                  <li
                    key={o.key}
                    className={
                      o.correct ? 'flex items-center gap-1 font-bold text-success' : 'text-muted'
                    }
                  >
                    <span>
                      {o.key}. {o.text}
                      {!o.correct && o.misconceptionLabel ? ` — ${o.misconceptionLabel}` : ''}
                    </span>
                    {o.correct ? <IconCheck size={13} /> : null}
                  </li>
                ))}
              </ul>

              <p className="mt-2 rounded-xl bg-subtle px-2.5 py-2 text-[12px] text-[#425268]">
                <strong>Câu kiểm tra lại:</strong> {cp.followUpPrompt}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" disabled={busy} onClick={() => launch(cp)}>
                  <IconLaunch size={13} weight="fill" />
                  Kích hoạt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(toDraft(cp))}>
                  <IconNote size={13} />
                  Sửa
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <CheckpointEditorModal draft={editing} onClose={() => setEditing(null)} />
      <ClarificationComposer />
    </>
  )
}
