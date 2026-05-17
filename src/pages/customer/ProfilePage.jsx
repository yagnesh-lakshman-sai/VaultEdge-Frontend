import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div style={styles.container}>
      <BackButton to="/dashboard" label="Back to Dashboard" />

      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>My Profile</h1>
        <p style={styles.pageSubtitle}>Your account information</p>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 style={styles.profileName}>{user?.fullName}</h2>
          <span style={styles.roleBadge}>{user?.role}</span>
        </div>

        <div style={styles.divider} />

        <div style={styles.detailsSection}>
          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>📧</div>
            <div style={styles.detailContent}>
              <p style={styles.detailLabel}>Email Address</p>
              <p style={styles.detailValue}>{user?.email}</p>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>🎭</div>
            <div style={styles.detailContent}>
              <p style={styles.detailLabel}>Account Role</p>
              <p style={styles.detailValue}>{user?.role}</p>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>🔐</div>
            <div style={styles.detailContent}>
              <p style={styles.detailLabel}>Password</p>
              <p style={styles.detailValue}>••••••••</p>
            </div>
          </div>

          <div style={styles.detailRow}>
            <div style={styles.detailIcon}>✅</div>
            <div style={styles.detailContent}>
              <p style={styles.detailLabel}>Account Status</p>
              <p
                style={{
                  ...styles.detailValue,
                  color: "#16a34a",
                }}
              >
                Verified & Active
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.actionsCard}>
        <h3 style={styles.actionsTitle}>Quick Actions</h3>

        <div style={styles.actionButtons}>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.actionButton}
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => navigate("/transfer")}
            style={styles.actionButton}
          >
            💸 Transfer
          </button>

          <button
            onClick={() => navigate("/loans")}
            style={styles.actionButton}
          >
            🏦 Loans
          </button>

          <button
            onClick={handleLogout}
            style={{
              ...styles.actionButton,
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  pageHeader: {
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
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    marginBottom: "20px",
  },
  avatarSection: {
    textAlign: "center",
    marginBottom: "24px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
    boxShadow: "0 4px 15px rgba(30,64,175,0.3)",
  },
  profileName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 8px 0",
  },
  roleBadge: {
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "4px 16px",
    borderRadius: "20px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#f3f4f6",
    margin: "24px 0",
  },
  detailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  detailIcon: {
    fontSize: "20px",
    width: "44px",
    height: "44px",
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "0 0 2px 0",
  },
  detailValue: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#111827",
    margin: "0",
  },
  actionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
  },
  actionsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px 0",
  },
  actionButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  actionButton: {
    padding: "12px",
    backgroundColor: "#f9fafb",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
  },
};

export default ProfilePage;
