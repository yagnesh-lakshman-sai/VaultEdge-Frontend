import { useState, useEffect } from "react";
import { getAllLoans, applyLoan, getLoanById } from "../../api/loanApi";
import {
  formatCurrency,
  formatDate,
  calculateEMI,
} from "../../utils/formatters";
import {
  isValidLoanAmount,
  isValidTenure,
  isRequired,
  isValidPurpose,
} from "../../utils/validators";
import { LOAN_STATUS } from "../../utils/constants";
import BackButton from "../../components/BackButton";

const LoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    tenureMonths: "",
    purpose: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [emiPreview, setEmiPreview] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllLoans();

      setLoans(response.data.data || []);
    } catch (err) {
      setError("Failed to load loans.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const amount = Number(updated.amount);
    const tenure = Number(updated.tenureMonths);

    if (amount > 0 && tenure > 0) {
      const emi = calculateEMI(amount, 10, tenure);

      setEmiPreview(emi);
    } else {
      setEmiPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.amount)) {
      newErrors.amount = "Loan amount is required";
    } else if (!isValidLoanAmount(formData.amount)) {
      newErrors.amount = "Amount must be between ₹10,000 and ₹1,00,00,000";
    }

    if (!isRequired(formData.tenureMonths)) {
      newErrors.tenureMonths = "Tenure is required";
    } else if (!isValidTenure(formData.tenureMonths)) {
      newErrors.tenureMonths = "Tenure must be between 1 and 360 months";
    }

    if (!isRequired(formData.purpose)) {
      newErrors.purpose = "Purpose is required";
    } else if (!isValidPurpose(formData.purpose)) {
      newErrors.purpose = "Purpose must be at least 10 characters";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setApplying(true);
    setError("");
    setSuccess("");

    try {
      await applyLoan({
        amount: Number(formData.amount),
        tenureMonths: Number(formData.tenureMonths),
        purpose: formData.purpose,
      });

      setSuccess("Loan application submitted successfully!");

      setFormData({ amount: "", tenureMonths: "", purpose: "" });
      setEmiPreview(null);
      setShowForm(false);

      loadLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply for loan.");
    } finally {
      setApplying(false);
    }
  };

  const handleViewDetail = async (loanId) => {
    setLoadingDetail(true);
    try {
      const response = await getLoanById(loanId);

      setSelectedLoan(response.data.data);
    } catch (err) {
      console.error("Loan detail error:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      [LOAN_STATUS.PENDING]: { bg: "#fef3c7", color: "#92400e" },
      [LOAN_STATUS.UNDER_REVIEW]: { bg: "#dbeafe", color: "#1e40af" },
      [LOAN_STATUS.APPROVED]: { bg: "#dcfce7", color: "#166534" },
      [LOAN_STATUS.DISBURSED]: { bg: "#d1fae5", color: "#065f46" },
      [LOAN_STATUS.ACTIVE]: { bg: "#dcfce7", color: "#166534" },
      [LOAN_STATUS.PAID]: { bg: "#f3f4f6", color: "#374151" },
      [LOAN_STATUS.REJECTED]: { bg: "#fee2e2", color: "#991b1b" },
      [LOAN_STATUS.DEFAULTED]: { bg: "#fee2e2", color: "#991b1b" },
    };
    return styles[status] || { bg: "#f3f4f6", color: "#374151" };
  };

  if (loading) {
    return (
      <div style={pageStyles.centered}>
        <p>Loading loans...</p>
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <BackButton to="/dashboard" label="Back to Dashboard" />

      <div style={pageStyles.pageHeader}>
        <div>
          <h1 style={pageStyles.pageTitle}>My Loans</h1>
          <p style={pageStyles.pageSubtitle}>Manage your loan applications</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          style={pageStyles.applyButton}
        >
          {showForm ? "Cancel" : "+ Apply for Loan"}
        </button>
      </div>

      {success && <div style={pageStyles.successBox}>✅ {success}</div>}
      {error && <div style={pageStyles.errorBox}>❌ {error}</div>}

      {showForm && (
        <div style={pageStyles.formCard}>
          <h2 style={pageStyles.formTitle}>Apply for Loan</h2>

          <form onSubmit={handleApply} style={pageStyles.form}>
            <div style={pageStyles.formGrid}>
              <div style={pageStyles.fieldGroup}>
                <label style={pageStyles.label}>Loan Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Min ₹10,000 — Max ₹1,00,00,000"
                  min="10000"
                  max="10000000"
                  style={{
                    ...pageStyles.input,
                    borderColor: formErrors.amount ? "#ef4444" : "#d1d5db",
                  }}
                  disabled={applying}
                />
                {formErrors.amount && (
                  <span style={pageStyles.errorText}>{formErrors.amount}</span>
                )}
              </div>

              <div style={pageStyles.fieldGroup}>
                <label style={pageStyles.label}>Tenure (Months)</label>
                <input
                  type="number"
                  name="tenureMonths"
                  value={formData.tenureMonths}
                  onChange={handleChange}
                  placeholder="e.g. 12, 24, 36, 60"
                  min="1"
                  max="360"
                  style={{
                    ...pageStyles.input,
                    borderColor: formErrors.tenureMonths
                      ? "#ef4444"
                      : "#d1d5db",
                  }}
                  disabled={applying}
                />
                {formErrors.tenureMonths && (
                  <span style={pageStyles.errorText}>
                    {formErrors.tenureMonths}
                  </span>
                )}
              </div>
            </div>

            <div style={pageStyles.fieldGroup}>
              <label style={pageStyles.label}>Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Home renovation, Education, Medical..."
                style={{
                  ...pageStyles.input,
                  borderColor: formErrors.purpose ? "#ef4444" : "#d1d5db",
                }}
                disabled={applying}
              />
              {formErrors.purpose && (
                <span style={pageStyles.errorText}>{formErrors.purpose}</span>
              )}
            </div>

            {emiPreview && (
              <div style={pageStyles.emiPreview}>
                <div style={pageStyles.emiItem}>
                  <span style={pageStyles.emiLabel}>Loan Amount</span>
                  <span style={pageStyles.emiValue}>
                    {formatCurrency(Number(formData.amount))}
                  </span>
                </div>
                <div style={pageStyles.emiItem}>
                  <span style={pageStyles.emiLabel}>Tenure</span>
                  <span style={pageStyles.emiValue}>
                    {formData.tenureMonths} months
                  </span>
                </div>
                <div style={pageStyles.emiItem}>
                  <span style={pageStyles.emiLabel}>Interest Rate</span>
                  <span style={pageStyles.emiValue}>10% per annum</span>
                </div>
                <div
                  style={{
                    ...pageStyles.emiItem,
                    borderTop: "1px solid #bfdbfe",
                    paddingTop: "12px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      ...pageStyles.emiLabel,
                      fontWeight: "700",
                      color: "#1e40af",
                      fontSize: "15px",
                    }}
                  >
                    Monthly EMI
                  </span>
                  <span
                    style={{
                      ...pageStyles.emiValue,
                      fontWeight: "700",
                      color: "#1e40af",
                      fontSize: "20px",
                    }}
                  >
                    {formatCurrency(emiPreview)}
                  </span>
                </div>
                <p style={pageStyles.emiFormula}>
                  Formula: [P × R × (1+R)^N] / [(1+R)^N - 1]
                </p>
              </div>
            )}

            <button
              type="submit"
              style={{
                ...pageStyles.submitButton,
                opacity: applying ? 0.7 : 1,
                cursor: applying ? "not-allowed" : "pointer",
              }}
              disabled={applying}
            >
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}

      {loans.length === 0 ? (
        <div style={pageStyles.emptyCard}>
          <p style={pageStyles.emptyTitle}>No loans found</p>
          <p style={pageStyles.emptySubtitle}>
            Click "Apply for Loan" to get started
          </p>
        </div>
      ) : (
        <div style={pageStyles.loansList}>
          {loans.map((loan) => {
            const statusStyle = getStatusStyle(loan.status);
            const emi =
              loan.emiAmount ||
              calculateEMI(loan.amount, 10, loan.tenureMonths);

            return (
              <div key={loan.id} style={pageStyles.loanCard}>
                <div style={pageStyles.loanHeader}>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <p style={pageStyles.loanNumber}>
                        {loan.loanNumber || `LOAN-${loan.id}`}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            loan.loanNumber || `LOAN-${loan.id}`,
                          );
                          alert("Loan number copied!");
                        }}
                        style={pageStyles.copyButton}
                        title="Copy loan number"
                      >
                        📋
                      </button>
                    </div>
                    <p style={pageStyles.loanPurpose}>{loan.purpose}</p>
                  </div>
                  <span
                    style={{
                      ...pageStyles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {loan.status}
                  </span>
                </div>

                <div style={pageStyles.loanDetails}>
                  <div style={pageStyles.detailItem}>
                    <span style={pageStyles.detailLabel}>Loan Amount</span>
                    <span style={pageStyles.detailValue}>
                      {formatCurrency(loan.amount)}
                    </span>
                  </div>

                  <div style={pageStyles.detailItem}>
                    <span style={pageStyles.detailLabel}>Monthly EMI</span>
                    <span
                      style={{
                        ...pageStyles.detailValue,
                        color: "#1e40af",
                      }}
                    >
                      {formatCurrency(emi)}
                    </span>
                  </div>

                  <div style={pageStyles.detailItem}>
                    <span style={pageStyles.detailLabel}>Tenure</span>
                    <span style={pageStyles.detailValue}>
                      {loan.tenureMonths} months
                    </span>
                  </div>

                  <div style={pageStyles.detailItem}>
                    <span style={pageStyles.detailLabel}>Applied On</span>
                    <span style={pageStyles.detailValue}>
                      {formatDate(loan.appliedDate || loan.createdAt)}
                    </span>
                  </div>
                </div>

                {loan.remarks && (
                  <div style={pageStyles.remarksBox}>
                    <span style={pageStyles.remarksLabel}>Admin Remarks:</span>
                    <span style={pageStyles.remarksText}>{loan.remarks}</span>
                  </div>
                )}

                <button
                  onClick={() => handleViewDetail(loan.id)}
                  style={pageStyles.viewButton}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedLoan && (
        <div
          style={pageStyles.modalOverlay}
          onClick={() => setSelectedLoan(null)}
        >
          <div style={pageStyles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={pageStyles.modalHeader}>
              <h2 style={pageStyles.modalTitle}>Loan Details</h2>
              <button
                onClick={() => setSelectedLoan(null)}
                style={pageStyles.closeButton}
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <p style={{ textAlign: "center", padding: "24px" }}>Loading...</p>
            ) : (
              <div style={pageStyles.modalBody}>
                <div style={pageStyles.modalGrid}>
                  <DetailRow
                    label="Loan Number"
                    value={selectedLoan.loanNumber}
                  />
                  <DetailRow label="Status" value={selectedLoan.status} />
                  <DetailRow
                    label="Amount"
                    value={formatCurrency(selectedLoan.amount)}
                  />
                  <DetailRow
                    label="Tenure"
                    value={`${selectedLoan.tenureMonths} months`}
                  />
                  <DetailRow
                    label="Monthly EMI"
                    value={formatCurrency(
                      selectedLoan.emiAmount ||
                        calculateEMI(
                          selectedLoan.amount,
                          10,
                          selectedLoan.tenureMonths,
                        ),
                    )}
                  />
                  <DetailRow label="Purpose" value={selectedLoan.purpose} />
                  <DetailRow
                    label="Applied On"
                    value={formatDate(
                      selectedLoan.appliedDate || selectedLoan.createdAt,
                    )}
                  />
                  {selectedLoan.approvedDate && (
                    <DetailRow
                      label="Approved On"
                      value={formatDate(selectedLoan.approvedDate)}
                    />
                  )}
                  {selectedLoan.remarks && (
                    <DetailRow label="Remarks" value={selectedLoan.remarks} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div style={pageStyles.detailRow}>
    <span style={pageStyles.detailRowLabel}>{label}</span>
    <span style={pageStyles.detailRowValue}>{value}</span>
  </div>
);

const pageStyles = {
  container: {
    padding: "24px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
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
  applyButton: {
    padding: "10px 20px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  copyButton: {
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    padding: "2px 6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 24px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
  emiPreview: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "20px",
  },
  emiItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  emiLabel: {
    fontSize: "14px",
    color: "#374151",
  },
  emiValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  emiFormula: {
    fontSize: "11px",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "8px",
    fontFamily: "monospace",
  },
  submitButton: {
    padding: "12px",
    backgroundColor: "#1e40af",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    width: "100%",
  },
  emptyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "48px",
    textAlign: "center",
    border: "1px dashed #d1d5db",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 8px 0",
  },
  emptySubtitle: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: "0",
  },
  loansList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  loanCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  loanHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  loanNumber: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px 0",
    fontFamily: "monospace",
  },
  loanPurpose: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  loanDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  detailLabel: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  detailValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
  },
  remarksBox: {
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  remarksLabel: {
    fontWeight: "600",
    color: "#92400e",
    marginRight: "8px",
  },
  remarksText: {
    color: "#78350f",
  },
  viewButton: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
    margin: "0",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  modalBody: {
    padding: "24px",
  },
  modalGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
  detailRowLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  detailRowValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
};

export default LoansPage;
