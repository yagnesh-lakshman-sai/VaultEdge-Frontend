import { createContext, useState, useContext } from "react";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const showSuccess = (message) => addToast(message, "success");
  const showError = (message) => addToast(message, "error");
  const showInfo = (message) => addToast(message, "info");

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div style={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              backgroundColor:
                toast.type === "success"
                  ? "#16a34a"
                  : toast.type === "error"
                    ? "#dc2626"
                    : "#1e40af",
              animation: "slideIn 0.3s ease",
            }}
          >
            <span style={styles.toastIcon}>
              {toast.type === "success"
                ? "✅"
                : toast.type === "error"
                  ? "❌"
                  : "ℹ️"}
            </span>

            <span style={styles.toastMessage}>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              style={styles.toastClose}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be inside NotificationProvider");
  }
  return context;
};

const styles = {
  toastContainer: {
    position: "fixed",
    top: "80px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxWidth: "360px",
    width: "100%",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    color: "#ffffff",
  },
  toastIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  toastMessage: {
    fontSize: "14px",
    fontWeight: "500",
    flex: 1,
  },
  toastClose: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    cursor: "pointer",
    padding: "0 4px",
    flexShrink: 0,
  },
};
