import { useState, useEffect } from "react";
import { getAllLoansAdmin, getLoansByStatus } from "../../api/adminApi";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { LOAN_STATUS } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";

const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [allLoans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAllLoans();
  }, []);

  const loadAllLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllLoansAdmin();

      setAllLoans(response.data.data || []);
    } catch (err) {
      setError("Failed to load loans.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: allLoans.length,
    pending: allLoans.filter((l) => l.status === LOAN_STATUS.PENDING).length,
    underReview: allLoans.filter((l) => l.status === LOAN_STATUS.UNDER_REVIEW)
      .length,
    approved: allLoans.filter(
      (l) =>
        l.status === LOAN_STATUS.APPROVED ||
        l.status === LOAN_STATUS.DISBURSED ||
        l.status === LOAN_STATUS.ACTIVE,
    ).length,
    rejected: allLoans.filter((l) => l.status === LOAN_STATUS.REJECTED).length,
    totalAmount: allLoans.reduce((sum, l) => sum + (l.amount || 0), 0),
  };

  const getStatusStyle = (status) => {
    const map = {
      [LOAN_STATUS.PENDING]: { bg: "#fef3c7", color: "#92400e" },
      [LOAN_STATUS.UNDER_REVIEW]: { bg: "#dbeafe", color: "#1e40af" },
      [LOAN_STATUS.APPROVED]: { bg: "#dcfce7", color: "#166534" },
      [LOAN_STATUS.DISBURSED]: { bg: "#d1fae5", color: "#065f46" },
      [LOAN_STATUS.ACTIVE]: { bg: "#dcfce7", color: "#166534" },
      [LOAN_STATUS.PAID]: { bg: "#f3f4f6", color: "#374151" },
      [LOAN_STATUS.REJECTED]: { bg: "#fee2e2", color: "#991b1b" },
      [LOAN_STATUS.DEFAULTED]: { bg: "#fee2e2", color: "#991b1b" },
    };
    return map[status] || { bg: "#f3f4f6", color: "#374151" };
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Admin Dashboard</h1>
        <p style={styles.pageSubtitle}>
          Welcome, {user?.fullName} — Manage loan applications
        </p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.statsGrid}>
        <div
          style={{
            ...styles.statCard,
            borderTop: "4px solid #1e40af",
          }}
        >
          <p style={styles.statLabel}>Total Loans</p>
          <p style={styles.statValue}>{stats.total}</p>
          <p style={styles.statSub}>
            {formatCurrency(stats.totalAmount)} total value
          </p>
        </div>

        <div
          style={{
            ...styles.statCard,
            borderTop: "4px solid #f59e0b",
          }}
        >
          <p style={styles.statLabel}>Pending Review</p>
          <p
            style={{
              ...styles.statValue,
              color: "#d97706",
            }}
          >
            {stats.pending}
          </p>
          <p style={styles.statSub}>Awaiting action</p>
        </div>

        <div
          style={{
            ...styles.statCard,
            borderTop: "4px solid #3b82f6",
          }}
        >
          <p style={styles.statLabel}>Under Review</p>
          <p
            style={{
              ...styles.statValue,
              color: "#1e40af",
            }}
          >
            {stats.underReview}
          </p>
          <p style={styles.statSub}>Being processed</p>
        </div>

        <div
          style={{
            ...styles.statCard,
            borderTop: "4px solid #16a34a",
          }}
        >
          <p style={styles.statLabel}>Approved</p>
          <p
            style={{
              ...styles.statValue,
              color: "#16a34a",
            }}
          >
            {stats.approved}
          </p>
          <p style={styles.statSub}>Successfully approved</p>
        </div>

        <div
          style={{
            ...styles.statCard,
            borderTop: "4px solid #dc2626",
          }}
        >
          <p style={styles.statLabel}>Rejected</p>
          <p
            style={{
              ...styles.statValue,
              color: "#dc2626",
            }}
          >
            {stats.rejected}
          </p>
          <p style={styles.statSub}>Applications rejected</p>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableTitle}>
          <h2 style={styles.sectionTitle}>All Loan Applications</h2>
          <button onClick={loadAllLoans} style={styles.refreshButton}>
            ↻ Refresh
          </button>
        </div>

        {allLoans.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No loan applications found.</p>
          </div>
        ) : (
          <div>
            <div style={styles.tableHeader}>
              <span style={{ flex: 2 }}>Loan Number</span>
              <span style={{ flex: 2 }}>Customer</span>
              <span style={{ flex: 1 }}>Amount</span>
              <span style={{ flex: 1 }}>Tenure</span>
              <span style={{ flex: 1 }}>Applied On</span>
              <span style={{ flex: 1 }}>Status</span>
            </div>

            {allLoans.map((loan, index) => {
              const statusStyle = getStatusStyle(loan.status);
              return (
                <div
                  key={loan.id}
                  style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  }}
                >
                  <span
                    style={{
                      flex: 2,
                      fontFamily: "monospace",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {loan.loanNumber || `LOAN-${loan.id}`}
                  </span>

                  <span style={{ flex: 2, fontSize: "14px" }}>
                    {loan.customerName || "N/A"}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {formatCurrency(loan.amount)}
                  </span>

                  <span style={{ flex: 1, fontSize: "14px" }}>
                    {loan.tenureMonths} mo
                  </span>

                  <span
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(loan.appliedDate || loan.createdAt)}
                  </span>

                  <span style={{ flex: 1 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {loan.status}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  pageHeader: {
    marginBottom: "28px",
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
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 8px 0",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 4px 0",
  },
  statSub: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },
  tableTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  refreshButton: {
    padding: "6px 16px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 24px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: {
    display: "flex",
    padding: "14px 24px",
    alignItems: "center",
    borderBottom: "1px solid #f3f4f6",
  },
  emptyState: {
    padding: "48px",
    textAlign: "center",
    color: "#6b7280",
  },
};

export default AdminDashboardPage;
