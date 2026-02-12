import React, { useState, useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "error", duration = 3000, onExited }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const exitTimer = setTimeout(() => {
        if (onExited) onExited();
      }, 300); // Wait for fade-out animation
      return () => clearTimeout(exitTimer);
    }
  }, [visible, onExited]);

  return (
    <div
      className={`toast-container ${visible ? "visible" : "hidden"} ${type}`}
    >
      <div className="toast-content">
        <span className="toast-icon">
          {type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <div
        className="toast-progress-bar"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = React.useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toasts-wrapper">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onExited={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const ToastContext = React.createContext({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export default Toast;
