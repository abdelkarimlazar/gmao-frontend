import Modal from './Modal';

function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  confirmTone = 'danger',
  loading = false,
}) {
  const confirmButtonClass =
    confirmTone === 'danger'
      ? 'danger-button'
      : 'primary-button';

  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            className="ghost-button"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>

          <button
            type="button"
            className={confirmButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? 'Traitement...'
              : confirmLabel}
          </button>
        </>
      }
    >
      <p className="modal__description modal__description--spaced">
        Cette action est irréversible. Vérifiez avant de continuer.
      </p>
    </Modal>
  );
}

export default ConfirmDialog;