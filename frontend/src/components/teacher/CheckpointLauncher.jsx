import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Chip from '../ui/Chip.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconLaunch, IconNoCheckpoint } from '../../lib/icons.js'

/** Checkpoint đã soạn sẵn cho trang đang chiếu — một click để mở cho cả lớp. */
export default function CheckpointLauncher() {
  const { checkpointsForPage, page, run, launchCheckpoint, session, history } = useSession()
  const toast = useToast()
  const list = checkpointsForPage(page)
  const busy = run?.status === 'running'
  const done = new Set(history.map((h) => h.checkpointId))

  const launch = async (checkpoint) => {
    try {
      await launchCheckpoint(checkpoint.id)
      toast(`Đã mở checkpoint #${checkpoint.order} cho ${session.enrolled} học viên.`)
    } catch (err) {
      toast(err.message ?? 'Không mở được checkpoint.')
    }
  }

  return (
    <Card tone="accent">
      <CardTitle eyebrow="Đã gắn với slide">Checkpoint · Trang {page}</CardTitle>

      {!list.length ? (
        <EmptyState
          icon={IconNoCheckpoint}
          title="Trang này chưa có checkpoint"
          hint="Chuyển sang trang 1–3 để dùng các checkpoint đã soạn sẵn."
        />
      ) : (
        <div className="grid gap-2.5">
          {list.map((cp) => (
            <div key={cp.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Chip tone="neutral">Checkpoint #{cp.order}</Chip>
                <Chip tone="default">{cp.durationSec}s</Chip>
                <Chip tone="neutral">{cp.learningOutcome.id}</Chip>
                {done.has(cp.id) ? <Chip tone="success">Đã chạy</Chip> : null}
              </div>

              <p className="text-[13px] font-bold leading-snug">{cp.prompt}</p>
              <p className="mt-1 text-[11px] text-muted">{cp.learningOutcome.label}</p>

              <Button size="sm" className="mt-3" disabled={busy} onClick={() => launch(cp)}>
                {busy ? (
                  'Đang có checkpoint mở'
                ) : (
                  <>
                    <IconLaunch weight="fill" />
                    Kích hoạt cho cả lớp
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
