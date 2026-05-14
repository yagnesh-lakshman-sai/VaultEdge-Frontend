import { useState, useEffect } from "react";
import {
  getPendingLoans,
  approveLoan,
  markLoanUnderReview,
  getLoanByIdAdmin,
} from "../../api/adminApi";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LOAN_STATUS } from "../../utils/constants";

const PendingLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [actionLoading, setActionLoading] = useState({});

  const [showRemarks, setShowRemarks] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [approving, setApproving] = useState(true);

  useEffect(() => {
    loadPendingLoans();
  }, []);

  const loadPendingLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingLoans();

      setLoans(response.data.data || []);
    } catch (err) {
      setError("Failed to load pending loans.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReview = async (loanId) => {
    setActionLoading((prev) => ({ ...prev, [loanId]: "review" }));
    setError("");
    setSuccess("");

    try {
      await markLoanUnderReview(loanId);

      setSuccess(`Loan marked as Under Review`);
      loadPendingLoans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update loan status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [loanId]: null }));
    }
  };

  const openRemarksModal = (loan, isApproving) => {
    setSelectedLoan(loan);
    setApproving(isApproving);
    setRemarks("");
    setShowRemarks(true);
  };

  const handleApproveReject = async () => {
    if (!remarks.trim()) {
      setError("Please enter remarks before proceeding.");
      return;
    }

    setActionLoading((prev) => ({
      ...prev,
      [selectedLoan.id]: approving ? "approve" : "reject",
    }));
    setShowRemarks(false);
    setError("");
    setSuccess("");

    try {
      await approveLoan(selectedLoan.id, {
        approved: approving,
        remarks: remarks,
      });

      setSuccess(
        approving
          ? `Loan approved successfully!`
          : `Loan rejected successfully!`,
      );

      loadPendingLoans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Action failed. Please try again.",
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [selectedLoan.id]: null,
      }));
      setRemarks("");
      setSelectedLoan(null);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      [LOAN_STATUS.PENDING]: { bg: "#fef3c7", color: "#92400e" },
      [LOAN_STATUS.UNDER_REVIEW]: { bg: "#dbeafe", color: "#1e40af" },
      [LOAN_STATUS.APPROVED]: { bg: "#dcfce7", color: "#166534" },
      [LOAN_STATUS.REJECTED]: { bg: "#fee2e2", color: "#991b1b" },
    };
    return map[status] || { bg: "#f3f4f6", color: "#374151" };
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading pending loans...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Pending Loan Applications</h1>
          <p style={styles.pageSubtitle}>
            Review and process loan applications
          </p>
        </div>
        <button onClick={loadPendingLoans} style={styles.refreshButton}>
          ↻ Refresh
        </button>
      </div>

      {success && <div style={styles.successBox}>✅ {success}</div>}
      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {loans.length === 0 ? (
        <div style={styles.emptyCard}>
          <p style={styles.emptyTitle}>No pending loan applications</p>
          <p style={styles.emptySubtitle}>
            All applications have been processed
          </p>
        </div>
      ) : (
        <div style={styles.loansList}>
          {loans.map((loan) => {
            const statusStyle = getStatusStyle(loan.status);
            const isActioning = actionLoading[loan.id];

            return (
              <div key={loan.id} style={styles.loanCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.loanNumber}>
                      {loan.loanNumber || `LOAN-${loan.id}`}
                    </p>
                    <p style={styles.customerName}>
                      👤{" "}
                      {loan.customerName || loan.user?.fullName || "Customer"}
                    </p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                    }}
                  >
                    {loan.status}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Loan Amount</span>
                    <span style={styles.infoValue}>
                      {formatCurrency(loan.amount)}
                    </span>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tenure</span>
                    <span style={styles.infoValue}>
                      {loan.tenureMonths} months
                    </span>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Applied On</span>
                    <span style={styles.infoValue}>
                      {formatDate(loan.appliedDate || loan.createdAt)}
                    </span>
                  </div>

                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Purpose</span>
                    <span style={styles.infoValue}>{loan.purpose}</span>
                  </div>
                </div>

                <div style={styles.actionRow}>
                  {loan.status === LOAN_STATUS.PENDING && (
                    <button
                      onClick={() => handleMarkReview(loan.id)}
                      style={{
                        ...styles.reviewButton,
                        opacity: isActioning ? 0.7 : 1,
                        cursor: isActioning ? "not-allowed" : "pointer",
                      }}
                      disabled={!!isActioning}
                    >
                      {isActioning === "review"
                        ? "Processing..."
                        : "🔍 Mark Under Review"}
                    </button>
                  )}

                  {(loan.status === LOAN_STATUS.PENDING ||
                    loan.status === LOAN_STATUS.UNDER_REVIEW) && (
                    <button
                      onClick={() => openRemarksModal(loan, true)}
                      style={{
                        ...styles.approveButton,
                        opacity: isActioning ? 0.7 : 1,
                        cursor: isActioning ? "not-allowed" : "pointer",
                      }}
                      disabled={!!isActioning}
                    >
                      {isActioning === "approve"
                        ? "Approving..."
                        : "✅ Approve"}
                    </button>
                  )}

                  {(loan.status === LOAN_STATUS.PENDING ||
                    loan.status === LOAN_STATUS.UNDER_REVIEW) && (
                    <button
                      onClick={() => openRemarksModal(loan, false)}
                      style={{
                        ...styles.rejectButton,
                        opacity: isActioning ? 0.7 : 1,
                        cursor: isActioning ? "not-allowed" : "pointer",
                      }}
                      disabled={!!isActioning}
                    >
                      {isActioning === "reject" ? "Rejecting..." : "❌ Reject"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRemarks && selectedLoan && (
        <div style={styles.modalOverlay} onClick={() => setShowRemarks(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {approving ? "✅ Approve Loan" : "❌ Reject Loan"}
              </h2>
              <button
                onClick={() => setShowRemarks(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.loanSummary}>
                <p style={styles.summaryItem}>
                  <strong>Loan:</strong>{" "}
                  {selectedLoan.loanNumber || `LOAN-${selectedLoan.id}`}
                </p>
                <p style={styles.summaryItem}>
                  <strong>Amount:</strong> {formatCurrency(selectedLoan.amount)}
                </p>
                <p style={styles.summaryItem}>
                  <strong>Customer:</strong>{" "}
                  {selectedLoan.customerName ||
                    selectedLoan.user?.fullName ||
                    "N/A"}
                </p>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Remarks <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    approving
                      ? "e.g. Approved based on credit score and income verification"
                      : "e.g. Rejected due to insufficient credit score"
                  }
                  rows={4}
                  style={styles.textarea}
                />
                <span style={styles.hintText}>
                  These remarks will be visible to the customer
                </span>
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowRemarks(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveReject}
                  style={{
                    ...styles.confirmButton,
                    backgroundColor: approving ? "#16a34a" : "#dc2626",
                  }}
                >
                  {approving ? "Confirm Approve" : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
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
  refreshButton: {
    padding: "8px 20px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
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
  cardHeader: {
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
  customerName: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  reviewButton: {
    padding: "8px 16px",
    backgroundColor: "#eff6ff",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  approveButton: {
    padding: "8px 20px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  rejectButton: {
    padding: "8px 20px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
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
    maxWidth: "480px",
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
  loanSummary: {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },
  summaryItem: {
    fontSize: "14px",
    color: "#374151",
    margin: "0 0 6px 0",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  textarea: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  hintText: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  confirmButton: {
    padding: "10px 24px",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default PendingLoansPage;
