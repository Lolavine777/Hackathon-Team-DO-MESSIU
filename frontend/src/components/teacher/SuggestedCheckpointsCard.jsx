import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import Chip from '../ui/Chip.jsx'
import Spinner from '../ui/Spinner.jsx'
import CheckpointEditorModal from './CheckpointEditorModal.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconAI, IconCheck, IconNote, IconRefresh } from '../../lib/icons.js'

/** Trợ lý đề xuất câu hỏi cho trang đang dạy; giảng viên sửa rồi mới tạo thành poll. */
export default function SuggestedCheckpointsCard() {
  const { page, ai, suggestCheckpoints } = useSession()
  const [result, setResult] = useState(null) // { page, suggestions[] }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  const suggest = async (force) => {
    setLoading(true)
    setError(null)
    try {
      setResult(await suggestCheckpoints(page, force))
    } catch (err) {
      setError(err.message ?? 'Không lấy được gợi ý.')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = result?.page === page ? result.suggestions : []

  return (
    <>
      <Card tone="accent">
        <CardTitle eyebrow={<><IconAI size={12} />Trợ lý</>}>Gợi ý câu hỏi cho trang {page}</CardTitle>

        {ai.enabled ? (
          <p className="text-[12px] leading-relaxed text-muted">
            Trợ lý đọc nội dung trang này và các trang trước để soạn bản nháp. Không có gì được gửi
            cho lớp cho tới khi bạn bấm lưu.
          </p>
        ) : (
          <Callout tone="warning" title="Chưa bật trợ lý.">
            {ai.reason}
          </Callout>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" disabled={!ai.enabled || loading} onClick={() => suggest(false)}>
            {loading ? <Spinner size={13} /> : <IconAI size={13} weight="fill" />}
            {loading ? 'Đang soạn…' : 'Gợi ý câu hỏi'}
          </Button>
          {suggestions.length && !loading ? (
            <Button size="sm" variant="ghost" onClick={() => suggest(true)}>
              <IconRefresh size={13} />
              Gợi ý khác
            </Button>
          ) : null}
        </div>

        {error ? (
          <Callout tone="danger" title="Chưa soạn được." className="mt-3">
            {error}
          </Callout>
        ) : null}

        {suggestions.length ? (
          <div className="mt-3 grid gap-2.5">
            {suggestions.map((item) => (
              <div key={item.id} className="rounded-2xl border border-line bg-white p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Chip tone="default">{item.title}</Chip>
                  <Chip tone="neutral">{item.durationSec}s</Chip>
                  <Chip tone="neutral">Bản nháp</Chip>
                </div>

                <p className="text-[13px] font-bold leading-snug">{item.prompt}</p>
                <p className="mt-1 text-[11px] text-muted">{item.learningOutcome}</p>

                <ul className="mt-2 grid gap-1 text-[12px]">
                  {item.options.map((option) => (
                    <li
                      key={option.key}
                      className={
                        option.correct ? 'flex items-center gap-1 font-bold text-success' : 'text-muted'
                      }
                    >
                      <span>
                        {option.key}. {option.text}
                        {!option.correct && option.misconceptionLabel
                          ? ` — ${option.misconceptionLabel}`
                          : ''}
                      </span>
                      {option.correct ? <IconCheck size={13} /> : null}
                    </li>
                  ))}
                </ul>

                <Button size="sm" variant="ghost" className="mt-2.5" onClick={() => setEditing(item)}>
                  <IconNote size={13} />
                  Chỉnh sửa &amp; tạo poll
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <CheckpointEditorModal draft={editing} onClose={() => setEditing(null)} />
    </>
  )
}
