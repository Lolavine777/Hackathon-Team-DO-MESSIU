import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Callout from './Callout.jsx'

/** Hỏi lại trước một thao tác mà cả lớp sẽ nhìn thấy. */
export default function ConfirmDialog({
  open,
  title,
  warning,
  confirmLabel = 'Đồng ý',
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="secondary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {warning ? (
        <Callout tone="warning" className="mt-3">
          {warning}
        </Callout>
      ) : null}
    </Modal>
  )
}
