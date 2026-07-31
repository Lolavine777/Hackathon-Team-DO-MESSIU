import TopBar from '../components/layout/TopBar.jsx'
import SlideViewer from '../components/slide/SlideViewer.jsx'
import InteractionConsole from '../components/teacher/InteractionConsole.jsx'
import Chip from '../components/ui/Chip.jsx'
import LiveDot from '../components/ui/LiveDot.jsx'
import IconButton from '../components/ui/IconButton.jsx'
import { useSession } from '../state/SessionContext.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { IconLaunch, IconLive, IconSettings, IconStop } from '../lib/icons.js'

export default function TeacherPage() {
  const { session, page, run, online, checkpointsForPage, launchCheckpoint, closeRun, resetPulse } =
    useSession()
  const toast = useToast()
  const running = run?.status === 'running'
  const next = checkpointsForPage(page)[0]

  const guard = (fn, message) => async () => {
    try {
      await fn()
      toast(message)
    } catch (err) {
      toast(err.message ?? 'Thao tác không thành công.')
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        title={`${session.course} · ${session.title}`}
        subtitle="Instructor Live · Checkpoint gắn sẵn theo slide"
        badge={
          <Chip tone={running ? 'hot' : 'success'}>
            <LiveDot tone={running ? 'alert' : 'live'} />
            {running
              ? `Đang thu ${run.aggregate.responded}/${run.aggregate.audience} phản hồi · còn ${run.remainingSec}s`
              : `Đang dạy trực tiếp · ${online} học viên trong lớp`}
          </Chip>
        }
        actions={
          <IconButton size="sm" title="Cài đặt" onClick={() => toast('Cài đặt phiên học.')}>
            <IconSettings size={18} />
          </IconButton>
        }
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 p-3.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(400px,.9fr)]">
        <SlideViewer
          tools={
            running
              ? [
                  {
                    id: 'close',
                    label: (
                      <>
                        <IconStop weight="fill" />
                        Đóng &amp; phân tích ({run.remainingSec}s)
                      </>
                    ),
                    variant: 'secondary',
                    onClick: guard(closeRun, 'Đã đóng checkpoint và chốt kết quả.'),
                  },
                ]
              : [
                  {
                    id: 'launch',
                    label: next ? (
                      <>
                        <IconLaunch weight="fill" />
                        Kích hoạt Checkpoint #{next.order}
                      </>
                    ) : (
                      'Trang này chưa có checkpoint'
                    ),
                    variant: 'primary',
                    disabled: !next,
                    onClick: guard(
                      () => launchCheckpoint(next.id),
                      `Đã mở checkpoint cho ${online} học viên đang trong lớp.`
                    ),
                  },
                  {
                    id: 'pulse',
                    label: (
                      <>
                        <IconLive />
                        Gửi Learning Pulse
                      </>
                    ),
                    onClick: guard(resetPulse, `Đã gửi Learning Pulse tới ${online} học viên.`),
                  },
                ]
          }
        />

        <InteractionConsole />
      </main>
    </div>
  )
}
