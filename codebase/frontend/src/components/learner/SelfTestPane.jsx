import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import Chip from '../ui/Chip.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Spinner from '../ui/Spinner.jsx'
import SelfTestQuestion from './SelfTestQuestion.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconAI, IconRefresh } from '../../lib/icons.js'

/** Bộ câu hỏi tự kiểm tra do trợ lý soạn từ nội dung trang đang xem. Riêng tư, không tính điểm. */
export default function SelfTestPane() {
  const { page, ai, generateSelfTest } = useSession()
  const [set, setSet] = useState(null) // { page, questions[] }
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = async (force) => {
    setLoading(true)
    setError(null)
    try {
      setSet(await generateSelfTest(page, force))
      setAnswers({})
    } catch (err) {
      setError(err.message ?? 'Không tạo được câu hỏi, thử lại nhé.')
    } finally {
      setLoading(false)
    }
  }

  const stale = set && set.page !== page
  const done = set ? set.questions.filter((q) => answers[q.id]).length : 0
  const right = set
    ? set.questions.filter((q) => q.options.find((o) => o.key === answers[q.id])?.correct).length
    : 0

  return (
    <>
      <Card tone="accent">
        <CardTitle eyebrow={<><IconAI size={12} />Trợ lý</>}>Tự kiểm tra trang {page}</CardTitle>

        {ai.enabled ? (
          <p className="text-[12px] leading-relaxed text-muted">
            Trợ lý đọc nội dung trang này cùng các trang trước để soạn câu hỏi cho riêng bạn. Kết quả
            không gửi cho giảng viên và không tính điểm.
          </p>
        ) : (
          <Callout tone="warning" title="Chưa bật trợ lý.">
            {ai.reason}
          </Callout>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={!ai.enabled || loading} onClick={() => generate(false)}>
            {loading ? <Spinner /> : <IconAI size={14} weight="fill" />}
            {loading ? 'Đang soạn câu hỏi…' : set ? `Soạn cho trang ${page}` : 'Tạo câu hỏi cho trang này'}
          </Button>
          {set && !loading ? (
            <Button variant="ghost" onClick={() => generate(true)}>
              <IconRefresh size={14} />
              Bộ câu khác
            </Button>
          ) : null}
        </div>

        {error ? (
          <Callout tone="danger" title="Chưa soạn được." className="mt-3">
            {error}
          </Callout>
        ) : null}
      </Card>

      {set ? (
        <>
          {stale ? (
            <Callout tone="warning" title={`Bộ câu này của trang ${set.page}.`} className="mb-3">
              Bạn đang xem trang {page} — bấm “Soạn cho trang {page}” để làm bộ mới.
            </Callout>
          ) : null}

          <div className="mb-3 flex items-center gap-2">
            <Chip tone="neutral">
              Đã trả lời {done}/{set.questions.length}
            </Chip>
            {done ? <Chip tone={right === done ? 'success' : 'default'}>Đúng {right}/{done}</Chip> : null}
          </div>

          {set.questions.map((question, index) => (
            <SelfTestQuestion
              key={question.id}
              index={index}
              question={question}
              answer={answers[question.id]}
              onAnswer={(key) => setAnswers((prev) => ({ ...prev, [question.id]: key }))}
            />
          ))}
        </>
      ) : (
        !loading && (
          <EmptyState
            icon={IconAI}
            title="Chưa có câu hỏi nào"
            hint="Bấm nút phía trên để trợ lý soạn 5 câu trắc nghiệm từ nội dung trang bạn đang xem."
          />
        )
      )}
    </>
  )
}
