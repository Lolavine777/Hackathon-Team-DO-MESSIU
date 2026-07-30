import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import Spinner from '../ui/Spinner.jsx'
import CheckpointEditorOption from './CheckpointEditorOption.jsx'
import { TextArea, TextField } from '../ui/Field.jsx'
import { useSession } from '../../state/SessionContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { IconAdd, IconCheck } from '../../lib/icons.js'

const MAX_OPTIONS = 6
const blank = () => ({ text: '', correct: false, misconceptionLabel: '', hints: [] })

const toPayload = (option) => ({
  text: option.text.trim(),
  correct: Boolean(option.correct),
  misconception_label: option.correct ? '' : option.misconceptionLabel.trim(),
  hints: option.hints ?? [],
})

/**
 * Trình soạn checkpoint. Bản nháp có thể đến từ trợ lý hoặc từ một checkpoint đã có;
 * lưu lại luôn tạo checkpoint MỚI — checkpoint đã chạy là bất biến trong phiên.
 */
export default function CheckpointEditorModal({ draft, onClose, onSaved }) {
  const { page, createCheckpoint } = useSession()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!draft) return setForm(null)
    setForm({
      title: draft.title ?? '',
      prompt: draft.prompt ?? '',
      learningOutcome: draft.learningOutcome ?? '',
      durationSec: draft.durationSec ?? 30,
      explain: draft.explain ?? '',
      options: (draft.options ?? []).map((option) => ({ ...blank(), ...option })),
      followUp: draft.followUp ?? null,
      example: draft.example ?? null,
    })
  }, [draft])

  if (!draft || !form) return null

  const patch = (changes) => setForm((prev) => ({ ...prev, ...changes }))
  const patchOption = (index, changes) =>
    patch({ options: form.options.map((o, i) => (i === index ? { ...o, ...changes } : o)) })

  const save = async () => {
    const options = form.options.filter((option) => option.text.trim())
    if (!form.title.trim() || !form.prompt.trim()) return toast('Cần cả tiêu đề và nội dung câu hỏi.')
    if (!form.learningOutcome.trim()) return toast('Hãy ghi learning outcome cho checkpoint này.')
    if (options.length < 2) return toast('Cần ít nhất 2 phương án có nội dung.')
    if (options.filter((option) => option.correct).length !== 1)
      return toast('Hãy đánh dấu đúng một phương án là đáp án đúng.')

    setSaving(true)
    try {
      const created = await createCheckpoint({
        page: draft.page ?? page,
        title: form.title.trim(),
        prompt: form.prompt.trim(),
        learning_outcome: form.learningOutcome.trim(),
        duration_sec: Number(form.durationSec) || 30,
        explain: form.explain.trim(),
        options: options.map(toPayload),
        follow_up: form.followUp?.prompt
          ? {
              prompt: form.followUp.prompt.trim(),
              explain: form.followUp.explain ?? '',
              options: (form.followUp.options ?? []).map(toPayload),
            }
          : null,
        example: form.example,
      })
      toast(`Đã tạo Checkpoint #${created.order}, sẵn sàng kích hoạt.`)
      onSaved?.(created)
      onClose()
    } catch (err) {
      toast(err.message ?? 'Không lưu được checkpoint.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-2xl"
      title="Soạn checkpoint"
      subtitle={`Sẽ tạo checkpoint mới cho trang ${draft.page ?? page}. Bạn có thể sửa mọi nội dung trước khi lưu.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Huỷ
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Spinner /> : <IconCheck size={15} />}
            {saving ? 'Đang lưu…' : 'Lưu checkpoint'}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <TextField
            label="Tiêu đề ngắn"
            value={form.title}
            onChange={(event) => patch({ title: event.target.value })}
          />
          <TextField
            label="Thời lượng (giây)"
            type="number"
            min={10}
            max={180}
            value={form.durationSec}
            onChange={(event) => patch({ durationSec: event.target.value })}
          />
        </div>

        <TextArea
          label="Câu hỏi"
          rows={2}
          value={form.prompt}
          onChange={(event) => patch({ prompt: event.target.value })}
        />

        <TextField
          label="Learning outcome — học viên phải làm được gì"
          value={form.learningOutcome}
          onChange={(event) => patch({ learningOutcome: event.target.value })}
        />

        <div>
          <span className="mb-1.5 block text-[11px] font-extrabold text-muted">
            Phương án · bấm ô bên trái để chọn đáp án đúng
          </span>
          <div className="grid gap-2">
            {form.options.map((option, index) => (
              <CheckpointEditorOption
                key={index}
                option={option}
                index={index}
                canDelete={form.options.length > 2}
                onChange={(changes) => patchOption(index, changes)}
                onPick={() =>
                  patch({ options: form.options.map((o, i) => ({ ...o, correct: i === index })) })
                }
                onDelete={() => patch({ options: form.options.filter((_, i) => i !== index) })}
              />
            ))}
          </div>
          {form.options.length < MAX_OPTIONS ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => patch({ options: [...form.options, blank()] })}
            >
              <IconAdd size={13} />
              Thêm phương án
            </Button>
          ) : null}
        </div>

        <TextArea
          label="Giải thích hiện sau khi công bố đáp án"
          rows={2}
          value={form.explain}
          onChange={(event) => patch({ explain: event.target.value })}
        />

        {form.followUp ? (
          <TextField
            label="Câu kiểm tra lại (dùng cho hành động “Chạy câu kiểm tra lại”)"
            value={form.followUp.prompt}
            onChange={(event) => patch({ followUp: { ...form.followUp, prompt: event.target.value } })}
          />
        ) : (
          <Callout tone="info">
            Checkpoint này chưa có câu kiểm tra lại riêng — khi chạy lại, lớp sẽ nhận đúng câu hỏi trên.
          </Callout>
        )}
      </div>
    </Modal>
  )
}
