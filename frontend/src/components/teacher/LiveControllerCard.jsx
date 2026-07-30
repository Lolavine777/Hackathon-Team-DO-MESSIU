import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Metric from '../ui/Metric.jsx'
import Callout from '../ui/Callout.jsx'
import CountdownRing from '../ui/CountdownRing.jsx'
import QuizHeader from '../quiz/QuizHeader.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconAdd, IconClose, IconLive, IconStop } from '../../lib/icons.js'

/** Điều khiển checkpoint đang mở: đếm ngược, số client đã nhận, gia hạn, đóng. */
export default function LiveControllerCard() {
  const { run, extendRun, closeRun, cancelRun } = useSession()
  const toast = useToast()

  if (!run || run.status !== 'running') return null

  const { aggregate, receivedCount, onlineCount } = run
  const notReached = Math.max(0, onlineCount - receivedCount)

  const guard = (fn, message) => async () => {
    try {
      await fn()
      toast(message)
    } catch (err) {
      toast(err.message ?? 'Thao tác không thành công.')
    }
  }

  return (
    <Card className="ring-2 ring-primary/15">
      <CardTitle
        eyebrow={
          <>
            <IconLive size={12} weight="fill" />
            Đang thu phản hồi
          </>
        }
      >
        Live controller
      </CardTitle>

      <QuizHeader run={run} showCountdown={false} />

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F8FAFD] p-3">
        <CountdownRing remaining={run.remainingSec} total={run.windowSec} size={72} />
        <div className="grid flex-1 grid-cols-3 gap-2">
          <Metric tone="info" value={`${receivedCount}`} label="Đã nhận đề" hint={`/${onlineCount} online`} />
          <Metric tone="good" value={`${aggregate.responded}`} label="Đã trả lời" hint={`/${aggregate.audience}`} />
          <Metric
            tone={aggregate.participation >= 75 ? 'good' : aggregate.participation >= 60 ? 'mid' : 'bad'}
            value={`${Math.round(aggregate.participation)}%`}
            label="Tham gia"
          />
        </div>
      </div>

      {notReached > 0 ? (
        <Callout tone="warning" title="Đang phát đề:" className="mt-3">
          {notReached} máy chưa xác nhận nhận được câu hỏi.
        </Callout>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={guard(() => extendRun(10), 'Đã gia hạn thêm 10 giây.')}>
          <IconAdd size={13} />
          10 giây
        </Button>
        <Button size="sm" variant="secondary" onClick={guard(closeRun, 'Đã đóng checkpoint và chốt kết quả.')}>
          <IconStop size={13} weight="fill" />
          Đóng &amp; phân tích
        </Button>
        <Button size="sm" variant="quiet" onClick={guard(cancelRun, 'Đã huỷ checkpoint.')}>
          <IconClose size={13} />
          Huỷ
        </Button>
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Kết quả chỉ hiển thị dạng tổng hợp; màn hình lớp không lộ danh tính người trả lời.
      </p>
    </Card>
  )
}
