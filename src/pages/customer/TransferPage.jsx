import { useState, useEffect } from "react";
import { getAllAccounts } from "../../api/accountApi";
import { transferFunds } from "../../api/transferApi";
import { formatCurrency } from "../../utils/formatters";
import { isValidAmount, isRequired } from "../../utils/validators";
import { ACCOUNT_STATUS } from "../../utils/constants";
import BackButton from "../../components/BackButton";

const TransferPage = () => {
  const [accounts, setAccounts] = useState([]);

  const [formData, setFormData] = useState({
    fromAccountNumber: "",
    toAccountNumber: "",
    amount: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setFetching(true);
    try {
      const response = await getAllAccounts();
      const data = response.data.data || [];

      const activeAccounts = data.filter(
        (acc) => acc.status === ACCOUNT_STATUS.ACTIVE,
      );
      setAccounts(activeAccounts);

      if (activeAccounts.length > 0) {
        setFormData((prev) => ({
          ...prev,
          fromAccountNumber: activeAccounts[0].accountNumber,
        }));
      }
    } catch (err) {
      setApiError("Failed to load accounts.");
      console.error("Load accounts error:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setSuccess("");
    setApiError("");
  };

  const selectedAccount = accounts.find(
    (acc) => acc.accountNumber === formData.fromAccountNumber,
  );

  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.fromAccountNumber)) {
      newErrors.fromAccountNumber = "Please select source account";
    }

    if (!isRequired(formData.toAccountNumber)) {
      newErrors.toAccountNumber = "Destination account number is required";
    } else if (formData.toAccountNumber === formData.fromAccountNumber) {
      newErrors.toAccountNumber = "Cannot transfer to same account";
    }

    if (!isRequired(formData.amount)) {
      newErrors.amount = "Amount is required";
    } else if (!isValidAmount(formData.amount)) {
      newErrors.amount = "Amount must be greater than 0";
    } else if (
      selectedAccount &&
      Number(formData.amount) > selectedAccount.balance
    ) {
      newErrors.amount = "Insufficient balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess("");
    setApiError("");

    try {
      const response = await transferFunds({
        fromAccountNumber: formData.fromAccountNumber,
        toAccountNumber: formData.toAccountNumber,
        amount: Number(formData.amount),
        description: formData.description || "Fund Transfer",
      });

      const message = response.data?.message || "Transfer successful!";

      setSuccess(message);

      setFormData((prev) => ({
        fromAccountNumber: prev.fromAccountNumber,
        toAccountNumber: "",
        amount: "",
        description: "",
      }));

      loadAccounts();
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Transfer failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fromAccountNumber: accounts[0]?.accountNumber || "",
      toAccountNumber: "",
      amount: "",
      description: "",
    });
    setErrors({});
    setSuccess("");
    setApiError("");
  };

  if (fetching) {
    return (
      <div style={styles.centered}>
        <p style={styles.loadingText}>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <BackButton to="/dashboard" label="Back to Dashboard" />

      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Fund Transfer</h1>
        <p style={styles.pageSubtitle}>
          Transfer money between accounts securely
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.formCard}>
          {success && <div style={styles.successBox}>✅ {success}</div>}

          {apiError && <div style={styles.errorBox}>❌ {apiError}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>From Account</label>

              {accounts.length === 0 ? (
                <div style={styles.noAccountMsg}>
                  No active accounts found. Please create an account first.
                </div>
              ) : (
                <select
                  name="fromAccountNumber"
                  value={formData.fromAccountNumber}
                  onChange={handleChange}
                  style={{
                    ...styles.select,
                    borderColor: errors.fromAccountNumber
                      ? "#ef4444"
                      : "#d1d5db",
                  }}
                  disabled={loading}
                >
                  {accounts.map((acc) => (
                    <option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountType || acc.type} — ••••{" "}
                      {acc.accountNumber?.slice(-4)} —
                      {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              )}

              {errors.fromAccountNumber && (
                <span style={styles.errorText}>{errors.fromAccountNumber}</span>
              )}
            </div>

            {selectedAccount && (
              <div style={styles.balanceInfo}>
                <span style={styles.balanceLabel}>Available Balance:</span>
                <span style={styles.balanceAmount}>
                  {formatCurrency(selectedAccount.balance)}
                </span>
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>To Account Number</label>
              <input
                type="text"
                name="toAccountNumber"
                value={formData.toAccountNumber}
                onChange={handleChange}
                placeholder="Enter destination account number"
                style={{
                  ...styles.input,
                  borderColor: errors.toAccountNumber ? "#ef4444" : "#d1d5db",
                }}
                disabled={loading}
              />
              {errors.toAccountNumber && (
                <span style={styles.errorText}>{errors.toAccountNumber}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                style={{
                  ...styles.input,
                  borderColor: errors.amount ? "#ef4444" : "#d1d5db",
                }}
                disabled={loading}
              />
              {errors.amount && (
                <span style={styles.errorText}>{errors.amount}</span>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Description <span style={styles.optional}>(Optional)</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Rent payment, groceries..."
                style={styles.input}
                disabled={loading}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleReset}
                style={styles.resetButton}
                disabled={loading}
              >
                Reset
              </button>

              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  opacity: loading || accounts.length === 0 ? 0.7 : 1,
                  cursor:
                    loading || accounts.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={loading || accounts.length === 0}
              >
                {loading ? "Processing..." : "Transfer Now"}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>Transfer Information</h3>

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>⚡</span>
            <div>
              <p style={styles.infoLabel}>Instant Transfer</p>
              <p style={styles.infoDesc}>Transfers are processed immediately</p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>🔒</span>
            <div>
              <p style={styles.infoLabel}>Secure & Safe</p>
              <p style={styles.infoDesc}>Protected by JWT authentication</p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📋</span>
            <div>
              <p style={styles.infoLabel}>Transaction Record</p>
              <p style={styles.infoDesc}>
                All transfers are recorded and visible in transaction history
              </p>
            </div>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>⚠️</span>
            <div>
              <p style={styles.infoLabel}>Important</p>
              <p style={styles.infoDesc}>
                Verify account number before transfer. Transfers cannot be
                reversed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1fr 300px",
    gap: "24px",
    alignItems: "start",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "500",
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
  optional: {
    fontSize: "12px",
    fontWeight: "400",
    color: "#9ca3af",
  },
  select: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    backgroundColor: "#ffffff",
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
  balanceInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
  },
  balanceLabel: {
    fontSize: "13px",
    color: "#1e40af",
  },
  balanceAmount: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e40af",
  },
  noAccountMsg: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  resetButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    flex: "1",
  },
  submitButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#1e40af",
    border: "none",
    borderRadius: "8px",
    flex: "2",
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid #e5e7eb",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "20px",
    margin: "0 0 20px 0",
  },
  infoItem: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: "20px",
  },
  infoLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 2px 0",
  },
  infoDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0",
  },
};

export default TransferPage;
