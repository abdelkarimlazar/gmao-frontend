import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((toastId) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== toastId)
    );
  }, []);

  const pushToast = useCallback(
    ({
      title,
      message,
      tone = 'info',
      duration = DEFAULT_DURATION,
    }) => {
      const id = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      const nextToast = {
        id,
        title,
        message,
        tone,
      };

      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        dismissToast(id);
      }, duration);

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
    }),
    [pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="toast-stack"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
          >
            <div>
              <p className="toast__title">
                {toast.title}
              </p>

              {toast.message ? (
                <p className="toast__message">
                  {toast.message}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
            >
              Fermer
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast doit être utilisé dans ToastProvider.');
  }

  return context;
};