import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { showSuccess, showError } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      const userData = response.data.data;

      login(userData);

      showSuccess(`Welcome back, ${userData.fullName}!`);

      if (userData.role === "ADMIN" || userData.role === "MANAGER") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      showError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>VaultEdge Banking Platform</h1>

          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              style={{
                ...styles.input,
                borderColor: errors.email ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
            />

            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                ...styles.input,
                borderColor: errors.password ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
            />

            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
  },

  header: {
    textAlign: "center",
    marginBottom: "32px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e40af",
    margin: "0 0 8px 0",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  errorText: {
    fontSize: "12px",
    color: "#ef4444",
  },

  button: {
    padding: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#1e40af",
    border: "none",
    borderRadius: "8px",
    width: "100%",
    marginTop: "8px",
  },

  footer: {
    textAlign: "center",
    marginTop: "24px",
  },

  footerText: {
    fontSize: "14px",
    color: "#6b7280",
  },

  link: {
    color: "#1e40af",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default LoginPage;
