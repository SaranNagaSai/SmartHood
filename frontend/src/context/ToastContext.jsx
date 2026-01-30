import React, { createContext, useCallback, useMemo, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

export const ToastContext = createContext(null);

const iconForType = (type) => {
  switch (type) {
    case "success":
      return <FaCheckCircle className="toast-icon" aria-hidden="true" />;
    case "error":
      return <FaExclamationTriangle className="toast-icon" aria-hidden="true" />;
    case "warning":
      return <FaExclamationTriangle className="toast-icon" aria-hidden="true" />;
    default:
      return <FaInfoCircle className="toast-icon" aria-hidden="true" />;
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, options = {}) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const type = options.type || "info";
    const duration = typeof options.duration === "number" ? options.duration : 3000;

    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
            {iconForType(toast.type)}
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
