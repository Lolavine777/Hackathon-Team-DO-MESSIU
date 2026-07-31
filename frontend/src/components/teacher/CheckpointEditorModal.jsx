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

// Trợ lý chỉ gắn nhãn hiểu nhầm và hint cho phương án sai của câu chính, còn phương án
// của câu kiểm tra lại thì không có hai khoá đó — mọi phương án phải qua đây trước khi
// vào form, nếu không lúc lưu sẽ đọc `.trim()` trên `undefined`.
const toOption = (option) => ({ ...blank(), ...option })

// Bản nháp do LLM sinh ra nên không khoá nào là chắc chắn có: đọc thẳng `.trim()` là hỏng cả
// lượt lưu, mà giảng viên thì không sửa lại được gì từ thông báo đó.
const text = (value) => (typeof value === 'string' ? value.trim() : '')

const toPayload = (option) => ({
  text: text(option.text),
  correct: Boolean(option.correct),
  misconception_label: option.correct ? '' : text(option.misconceptionLabel),
  hints: option.hints ?? [],
})

const usable = (options) =>
  options.length >= 2 && options.filter((option) => option.correct).length === 1

/** Câu kiểm tra lại là tuỳ chọn: nháp hỏng thì bỏ đi để server hỏi lại chính câu chính. */
const toFollowUp = (followUp) => {
  if (!text(followUp?.prompt)) return null
  const options = (followUp.options ?? []).map(toPayload).filter((option) => option.text)
  if (!usable(options)) return null
  return { prompt: text(followUp.prompt), explain: text(followUp.explain), options }
}

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
      options: (draft.options ?? []).map(toOption),
      followUp: draft.followUp
        ? {
            prompt: draft.followUp.prompt ?? '',
            explain: draft.followUp.explain ?? '',
            options: (draft.followUp.options ?? []).map(toOption),
          }
        : null,
      example: draft.example ?? null,
    })
  }, [draft])

  if (!draft || !form) return null

  const patch = (changes) => setForm((prev) => ({ ...prev, ...changes }))
  const patchOption = (index, changes) =>
    patch({ options: form.options.map((o, i) => (i === index ? { ...o, ...changes } : o)) })

  const save = async () => {
    const options = form.options.map(toPayload).filter((option) => option.text)
    if (!text(form.title) || !text(form.prompt)) return toast('Cần cả tiêu đề và nội dung câu hỏi.')
    if (!text(form.learningOutcome)) return toast('Hãy ghi learning outcome cho checkpoint này.')
    if (options.length < 2) return toast('Cần ít nhất 2 phương án có nội dung.')
    if (options.filter((option) => option.correct).length !== 1)
      return toast('Hãy đánh dấu đúng một phương án là đáp án đúng.')

    setSaving(true)
    try {
      const created = await createCheckpoint({
        page: draft.page ?? page,
        title: text(form.title),
        prompt: text(form.prompt),
        learning_outcome: text(form.learningOutcome),
        duration_sec: Number(form.durationSec) || 30,
        explain: text(form.explain),
        options,
        follow_up: toFollowUp(form.followUp),
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
