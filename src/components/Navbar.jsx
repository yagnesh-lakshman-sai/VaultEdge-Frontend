import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav
      style={{
        ...styles.navbar,
        backgroundColor: isDark ? "#1e293b" : "#1e40af",
      }}
    >
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🏦</span>
        <span style={styles.brandName}>VaultEdge Banking Platform</span>
      </div>

      <div style={styles.right}>
        <button
          onClick={toggleTheme}
          style={styles.themeToggle}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.fullName}</span>
            <span style={styles.userRole}>{user?.role}</span>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: "64px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: { fontSize: "24px" },
  brandName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ffffff",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  themeToggle: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "18px",
    cursor: "pointer",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
  userRole: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.7)",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Navbar;
