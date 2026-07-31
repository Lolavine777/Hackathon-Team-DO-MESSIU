import { useState } from 'react'
import Card, { CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import Spinner from '../ui/Spinner.jsx'
import QuestionClusterItem from './QuestionClusterItem.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { IconAI, IconCluster } from '../../lib/icons.js'

/**
 * Gom câu hỏi mở thành từng nhóm cùng vấn đề. Trợ lý chỉ *gợi ý cách gom* —
 * mọi câu trả lời gửi đi vẫn do trợ giảng viết và bấm gửi.
 */
export default function QuestionClustersCard({ onAnswer, onBroadcast }) {
  const { clusters, clustersStale, groupQuestions, questions, ai } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const openCount = questions.filter((q) => !['answered', 'resolved'].includes(q.status)).length
  const grouped = clusters.filter((c) => c.count > 1).length

  const run = (force) => {
    setLoading(true)
    setError(null)
    groupQuestions(force)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <Card>
      <CardTitle eyebrow="Trợ lý">
        <span className="inline-flex items-center gap-2">
          <IconCluster size={17} weight="fill" />
          Gom câu hỏi tương tự
        </span>
      </CardTitle>

      <p className="mb-3 text-[13px] leading-relaxed text-[#56677C]">
        {clusters.length
          ? `${clusters.length} nhóm từ ${openCount} câu đang mở${grouped ? ` · ${grouped} nhóm có nhiều bạn cùng hỏi` : ''}.`
          : 'Nhóm những câu đang hỏi cùng một chuyện lại để trả lời một lần cho cả nhóm.'}
      </p>

      {!ai.enabled ? (
        <Callout tone="warning" title="Chưa bật trợ lý." className="mt-2">
          {ai.reason}
        </Callout>
      ) : null}
      {error ? (
        <Callout tone="danger" title="Không gom được câu hỏi." className="mt-2">
          {error}
        </Callout>
      ) : null}
      {clustersStale && !loading ? (
        <Callout tone="info" title="Có câu hỏi mới sau lần gom gần nhất." className="mt-2">
          Bấm gom lại để cập nhật các nhóm.
        </Callout>
      ) : null}

      <Button
        className="mt-3 w-full"
        variant={clusters.length ? 'outline' : 'primary'}
        disabled={loading || !ai.enabled || !openCount}
        onClick={() => run(clusters.length > 0)}
      >
        {loading ? <Spinner size={16} /> : <IconAI size={16} weight="fill" />}
        {loading ? 'Đang gom câu hỏi…' : clusters.length ? 'Gom lại' : 'Gom câu hỏi tương tự'}
      </Button>

      {!openCount ? (
        <p className="mt-2 text-center text-[11px] text-muted">Không còn câu hỏi nào đang mở.</p>
      ) : null}

      {clusters.map((cluster) => (
        <QuestionClusterItem
          key={cluster.id}
          cluster={cluster}
          onAnswer={onAnswer}
          onBroadcast={onBroadcast}
        />
      ))}
    </Card>
  )
}
