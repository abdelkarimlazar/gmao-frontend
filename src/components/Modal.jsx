import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Fenêtre modale'}
      >
        <div className="modal__header">
          <div>
            <h3 className="modal__title">
              {title}
            </h3>

            {description ? (
              <p className="modal__description">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className="modal__close"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <div className="modal__body">
          {children}
        </div>

        {footer ? (
          <div className="modal__footer">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

export default Modal;