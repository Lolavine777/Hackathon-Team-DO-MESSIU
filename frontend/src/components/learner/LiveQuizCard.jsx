import { useEffect, useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import QuizHeader from '../quiz/QuizHeader.jsx'
import QuizOption from '../quiz/QuizOption.jsx'
import ConfidencePicker from '../quiz/ConfidencePicker.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { CONFIDENCE_LABEL } from '../../lib/decision.js'
import { IconWaiting } from '../../lib/icons.js'

/** Checkpoint do giảng viên kích hoạt — học viên trả lời nhanh, kín đáo. */
export default function LiveQuizCard() {
  const { run, respond, confidenceLevels } = useSession()
  const toast = useToast()
  const [picked, setPicked] = useState(null)
  const [confidence, setConfidence] = useState('unsure')
  const [sending, setSending] = useState(false)

  // Checkpoint mới → xoá lựa chọn đang giữ của lượt trước.
  useEffect(() => {
    setPicked(null)
    setConfidence('unsure')
  }, [run?.id])

  if (!run) {
    return (
      <Card>
        <CardTitle eyebrow="Kiểm tra nhanh">Chưa có hoạt động</CardTitle>
        <EmptyState
          icon={IconWaiting}
          title="Đang chờ giảng viên mở checkpoint"
          hint="Câu hỏi sẽ tự bật tại đây khi giảng viên kích hoạt ở slide tương ứng."
        />
      </Card>
    )
  }

  const { question, myResponse, revealed, aggregate } = run
  const running = run.status === 'running'
  const answer = myResponse?.optionKey ?? picked
  const isCorrect = revealed && myResponse?.optionKey === question.correct

  const onSubmit = async () => {
    if (!picked) return toast('Hãy chọn một đáp án trước.')
    setSending(true)
    try {
      await respond(picked, confidence)
      toast('Đã ghi nhận câu trả lời của bạn.')
    } catch (err) {
      toast(err.message ?? 'Gửi không thành công, thử lại.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className={running ? 'ring-2 ring-primary/15' : ''}>
      <QuizHeader run={run} />

      <div className="mt-3 grid gap-2">
        {question.options.map((opt, i) => (
          <QuizOption
            key={opt.key}
            index={i}
            optionKey={opt.key}
            text={opt.text}
            selected={answer === opt.key}
            revealed={revealed}
            isCorrect={opt.key === question.correct}
            disabled={Boolean(myResponse) || !running}
            onClick={() => setPicked(opt.key)}
          />
        ))}
      </div>

      {running && !myResponse ? (
        <>
          <div className="mt-3">
            <ConfidencePicker levels={confidenceLevels} value={confidence} onChange={setConfidence} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={onSubmit} className="flex-1" disabled={sending}>
              {sending ? 'Đang gửi…' : 'Gửi câu trả lời'}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Câu trả lời không tính điểm và không hiển thị danh tính trước lớp.
          </p>
        </>
      ) : null}

      {myResponse && !revealed ? (
        <Callout tone="info" title="Đã ghi nhận." className="mt-3">
          Bạn chọn {myResponse.optionKey} · {CONFIDENCE_LABEL[myResponse.confidence]}. Đang chờ cả
          lớp — {aggregate.responded}/{aggregate.audience} người đã trả lời.
        </Callout>
      ) : null}

      {revealed ? (
        <Callout
          tone={myResponse ? (isCorrect ? 'success' : 'danger') : 'warning'}
          title={myResponse ? (isCorrect ? 'Chính xác!' : 'Chưa đúng.') : 'Bạn chưa trả lời.'}
          className="mt-3"
        >
          {Math.round(aggregate.correctRate ?? 0)}% lớp trả lời đúng. {question.explain}
        </Callout>
      ) : null}
    </Card>
  )
}
