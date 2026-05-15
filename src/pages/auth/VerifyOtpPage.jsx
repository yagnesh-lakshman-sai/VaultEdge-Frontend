import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../../api/authApi";
import { isValidOtp } from "../../utils/validators";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validateOtp = () => {
    const newErrors = {};
    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (!isValidOtp(otp)) {
      newErrors.otp = "OTP must be exactly 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setLoading(true);
    setApiError("");

    try {
      await verifyOtp({ email, otp });
      setSuccess("Email verified successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setApiError("");

    try {
      await resendOtp({ email });
      setSuccess("New OTP sent to your email!");
      setTimer(30);
      setCanResend(false);
      setOtp("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      if (errors.otp) setErrors({});
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Smart Bank</h1>
          <p style={styles.subtitle}>Verify Your Email</p>
          <p style={styles.emailText}>
            OTP sent to <strong>{email}</strong>
          </p>
          <p style={styles.hintText}>Check your Spring Boot console for OTP</p>
        </div>

        {apiError && <div style={styles.apiError}>{apiError}</div>}

        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleVerify} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Enter 6-digit OTP</label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              maxLength={6}
              style={{
                ...styles.otpInput,
                borderColor: errors.otp ? "#ef4444" : "#d1d5db",
              }}
              disabled={loading}
              autoComplete="one-time-code"
            />
            {errors.otp && <span style={styles.errorText}>{errors.otp}</span>}
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
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div style={styles.resendSection}>
          {canResend ? (
            <button onClick={handleResend} style={styles.resendButton}>
              Resend OTP
            </button>
          ) : (
            <p style={styles.timerText}>
              Resend OTP in{" "}
              <strong style={{ color: "#1e40af" }}>{timer}s</strong>
            </p>
          )}
        </div>

        <div style={styles.footer}>
          <Link to="/register" style={styles.link}>
            ← Back to Register
          </Link>
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
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e40af",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  emailText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 8px 0",
  },
  hintText: {
    fontSize: "12px",
    color: "#f59e0b",
    backgroundColor: "#fef3c7",
    padding: "6px 12px",
    borderRadius: "6px",
    marginTop: "8px",
    display: "inline-block",
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
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    textAlign: "center",
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
  otpInput: {
    padding: "14px",
    fontSize: "24px",
    fontWeight: "700",
    borderRadius: "8px",
    border: "2px solid #d1d5db",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    letterSpacing: "8px",
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
  },
  resendSection: {
    textAlign: "center",
    marginTop: "20px",
  },
  timerText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  resendButton: {
    background: "none",
    border: "none",
    color: "#1e40af",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
  },
  link: {
    color: "#6b7280",
    fontSize: "14px",
    textDecoration: "none",
  },
};

export default VerifyOtpPage;
