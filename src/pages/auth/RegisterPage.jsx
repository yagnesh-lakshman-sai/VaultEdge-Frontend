import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isRequired,
} from "../../utils/validators";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.fullName)) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!isRequired(formData.email)) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!isRequired(formData.phone)) {
      newErrors.phone = "Phone number is required";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits starting with 6-9";
    }

    if (!isRequired(formData.password)) {
      newErrors.password = "Password is required";
    } else if (!isValidPassword(formData.password)) {
      newErrors.password =
        "Password must be 8+ characters with special character (!@#$%^&*)";
    }

    if (!isRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      navigate("/verify-otp", {
        state: { email: formData.email },
      });
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>VaultEdge Banking Platform</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>

        {apiError && <div style={styles.apiError}>{apiError}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter Your Name"
              style={{
                ...styles.input,
                borderColor: errors.fullName ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
            />
            {errors.fullName && (
              <span style={styles.errorText}>{errors.fullName}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Mobile Number"
              maxLength={10}
              style={{
                ...styles.input,
                borderColor: errors.phone ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
            />
            {errors.phone && (
              <span style={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars with special character"
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

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              style={{
                ...styles.input,
                borderColor: errors.confirmPassword ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span style={styles.errorText}>{errors.confirmPassword}</span>
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Sign in here
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
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "460px",
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
  apiError: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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

export default RegisterPage;
