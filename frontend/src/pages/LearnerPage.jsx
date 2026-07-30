import TopBar from '../components/layout/TopBar.jsx'
import MaterialSidebar from '../components/slide/MaterialSidebar.jsx'
import SlideViewer from '../components/slide/SlideViewer.jsx'
import LearnerPanel from '../components/learner/LearnerPanel.jsx'
import Chip from '../components/ui/Chip.jsx'
import LiveDot from '../components/ui/LiveDot.jsx'
import { useSession } from '../state/SessionContext.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { IconHighlight, IconMaterial, IconNote } from '../lib/icons.js'

export default function LearnerPage() {
  const { material, session, run } = useSession()
  const toast = useToast()
  const live = run?.status === 'running'

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        icon={<IconMaterial size={18} />}
        title={material.name}
        subtitle={`${session.course} · ${session.title}`}
        badge={
          <Chip tone={live ? 'hot' : 'success'}>
            <LiveDot tone={live ? 'alert' : 'live'} />
            {live ? `Checkpoint đang mở · ${run.remainingSec}s` : `Đang trong lớp ${session.code}`}
          </Chip>
        }
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_400px] lg:overflow-hidden xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <MaterialSidebar />

        <section className="min-h-0 p-3 lg:overflow-hidden">
          <SlideViewer
            tools={[
              {
                id: 'note',
                label: (
                  <>
                    <IconNote />
                    Ghi chú
                  </>
                ),
                onClick: () => toast('Đã lưu ghi chú cho trang này.'),
              },
              {
                id: 'highlight',
                label: (
                  <>
                    <IconHighlight />
                    Highlight
                  </>
                ),
                onClick: () => toast('Bật chế độ highlight.'),
              },
            ]}
          />
        </section>

        <div className="grid min-h-0">
          <LearnerPanel />
        </div>
      </main>
    </div>
  )
}
