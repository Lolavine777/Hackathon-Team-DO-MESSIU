import Card, { CardTitle } from '../ui/Card.jsx'
import Chip from '../ui/Chip.jsx'
import Metric from '../ui/Metric.jsx'
import Callout from '../ui/Callout.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { STATUS_CHIP } from '../../lib/decision.js'
import { IconNext, IconNoReport } from '../../lib/icons.js'

/** Báo cáo buổi học: timeline checkpoint, can thiệp và kết quả phục hồi. */
export default function SessionReportPane() {
  const { report, session } = useSession()

  if (!report || !report.timeline.length) {
    return (
      <Card>
        <CardTitle eyebrow="Sau buổi học">Báo cáo phiên giảng</CardTitle>
        <EmptyState
          icon={IconNoReport}
          title="Chưa có dữ liệu"
          hint="Báo cáo được dựng từ các checkpoint đã chạy trong phiên này."
        />
      </Card>
    )
  }

  return (
    <>
      <Card tone="accent">
        <CardTitle eyebrow={`${session.course}`}>Báo cáo phiên · {report.sessionMinutes} phút</CardTitle>

        <div className="grid grid-cols-2 gap-2">
          <Metric tone="info" value={report.checkpointCount} label="Checkpoint đã chạy" />
          <Metric
            tone={report.avgParticipation >= 70 ? 'good' : 'mid'}
            value={`${Math.round(report.avgParticipation)}%`}
            label="Tham gia trung bình"
          />
          <Metric tone="info" value={report.interventionCount} label="Lượt can thiệp" />
          <Metric
            tone={report.conceptRecoveryRate >= 60 ? 'good' : report.conceptRecoveryRate == null ? 'info' : 'mid'}
            value={report.conceptRecoveryRate == null ? '—' : `${Math.round(report.conceptRecoveryRate)}%`}
            label="Concept Recovery Rate"
            hint={`${report.followUpCount} lượt kiểm tra lại`}
          />
        </div>

        <Callout tone="info" className="mt-3">
          Báo cáo chỉ hiển thị số liệu tổng hợp của lớp — không xếp hạng và không nêu tên sinh viên.
        </Callout>
      </Card>

      <Card>
        <CardTitle eyebrow="Timeline">Diễn biến theo checkpoint</CardTitle>

        <div className="grid gap-2.5">
          {report.timeline.map((item) => (
            <div key={item.runId} className="rounded-2xl border border-line p-3">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Chip tone="neutral">#{item.order}</Chip>
                <Chip tone="default">Trang {item.page}</Chip>
                <Chip tone={STATUS_CHIP[item.decisionStatus] ?? 'neutral'}>
                  {Math.round(item.correctRate)}% đúng
                </Chip>
                {item.recovery ? (
                  <Chip tone={item.recovery.status === 'RECOVERED' ? 'success' : 'warning'}>
                    {item.recovery.label} ({item.recovery.delta >= 0 ? '+' : ''}
                    {item.recovery.delta})
                  </Chip>
                ) : null}
              </div>

              <p className="text-[13px] font-bold leading-snug">{item.title}</p>
              <p className="mt-1 text-[11px] text-muted">{item.learningOutcome}</p>

              <div className="mt-2 grid gap-1 text-[12px] text-[#425268]">
                <span>
                  Tham gia {Math.round(item.participation)}% · không chắc{' '}
                  {Math.round(item.lowConfidenceRate)}%
                </span>
                {item.topMisconception ? (
                  <span>
                    Lỗi phổ biến: {item.topMisconception.label} ({Math.round(item.topMisconception.ratio)}%)
                  </span>
                ) : null}
                <span className="flex flex-wrap items-center gap-1">
                  Can thiệp:
                  {item.actions.length
                    ? item.actions.map((a, i) => (
                        <span key={a.code ?? a.label} className="flex items-center gap-1">
                          {i > 0 ? <IconNext className="text-muted" size={11} /> : null}
                          {a.label}
                        </span>
                      ))
                    : 'chưa có'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
