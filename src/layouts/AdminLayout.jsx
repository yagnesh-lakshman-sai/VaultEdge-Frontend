import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const adminMenu = [
  {
    path: "/admin/dashboard",
    icon: "📊",
    label: "Dashboard",
  },
  {
    path: "/admin/loans",
    icon: "📝",
    label: "Pending Loans",
  },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.navbar}>
        <div style={styles.brand}>
          <span>🏦</span>
          <span style={styles.brandName}>Smart Bank — Admin</span>
        </div>

        <div style={styles.navRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p style={styles.userName}>{user?.fullName}</p>
              <p style={styles.userRole}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <nav style={styles.sidebarNav}>
            {adminMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: isActive ? "#fef3c7" : "transparent",
                    color: isActive ? "#92400e" : "#374151",
                    fontWeight: isActive ? "600" : "400",
                    borderLeft: isActive
                      ? "3px solid #d97706"
                      : "3px solid transparent",
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={styles.adminBadge}>
            <p style={styles.badgeTitle}>🔐 Admin Panel</p>
            <p style={styles.badgeText}>Full system access</p>
          </div>
        </aside>

        <main style={styles.main}>{children}</main>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: "64px",
    backgroundColor: "#92400e",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "20px",
  },
  brandName: {
    fontWeight: "700",
    color: "#ffffff",
    fontSize: "18px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
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
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    margin: "0",
  },
  userRole: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.7)",
    margin: "0",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  sidebar: {
    width: "220px",
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: "64px",
    height: "calc(100vh - 64px)",
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    padding: "16px 8px",
    gap: "4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    fontSize: "14px",
  },
  adminBadge: {
    margin: "16px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #fde68a",
  },
  badgeTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#92400e",
    margin: "0 0 4px 0",
  },
  badgeText: {
    fontSize: "11px",
    color: "#b45309",
    margin: "0",
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};

export default AdminLayout;
