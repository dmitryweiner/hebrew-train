// Диалог подтверждения внутри приложения (без системного confirm)

interface ConfirmDialogProps {
  title: string;
  text?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ title, text, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) => (
  <div className="dialog-backdrop" onClick={onCancel}>
    <div className="dialog-card" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
      <h2 className="h4 mb-2">{title}</h2>
      {text && <p className="text-muted mb-4">{text}</p>}
      <div className="d-flex flex-column gap-2">
        <button className="btn btn-success btn-lg" onClick={onCancel} autoFocus>
          {cancelLabel}
        </button>
        <button className="btn btn-outline-danger btn-lg" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
