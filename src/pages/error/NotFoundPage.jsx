import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.title}>Page Not Found</p>
      <p style={styles.subtitle}>
        The page you are looking for does not exist.
      </p>
      <button onClick={() => navigate("/")} style={styles.button}>
        Go to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    gap: "16px",
  },
  code: {
    fontSize: "96px",
    fontWeight: "700",
    color: "#1e40af",
    margin: "0",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  button: {
    padding: "10px 24px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
};

export default NotFoundPage;
