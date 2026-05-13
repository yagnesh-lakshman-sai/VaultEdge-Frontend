import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { path: "/dashboard", icon: "🏠", label: "Dashboard" },
  { path: "/transfer", icon: "💸", label: "Fund Transfer" },
  { path: "/transactions", icon: "📋", label: "Transactions" },
  { path: "/loans", icon: "🏦", label: "Loans" },
  { path: "/profile", icon: "👤", label: "My Profile" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.hamburger}
        title="Toggle Menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div style={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      <aside
        style={{
          ...styles.sidebar,

          transform:
            window.innerWidth < 768
              ? isOpen
                ? "translateX(0)"
                : "translateX(-100%)"
              : "translateX(0)",

          position: window.innerWidth < 768 ? "fixed" : "sticky",
        }}
      >
        <div style={styles.sidebarHeader}>
          <span style={styles.sidebarTitle}>Menu</span>
          <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{
                  ...styles.menuItem,
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? "#1e40af" : "#374151",
                  fontWeight: isActive ? "600" : "400",
                  borderLeft: isActive
                    ? "3px solid #1e40af"
                    : "3px solid transparent",
                }}
              >
                <span style={styles.menuIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarBottom}>
          <div style={styles.helpCard}>
            <p style={styles.helpTitle}>Need Help?</p>
            <p style={styles.helpText}>support@smartbank.com</p>
          </div>
        </div>
      </aside>
    </>
  );
};

const styles = {
  hamburger: {
    display: "none",

    ...(window.innerWidth < 768
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "48px",
          height: "48px",
          backgroundColor: "#1e40af",
          color: "#ffffff",
          border: "none",
          borderRadius: "50%",
          fontSize: "20px",
          cursor: "pointer",
          zIndex: 200,
          boxShadow: "0 4px 12px rgba(30,64,175,0.4)",
        }
      : {}),
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 149,
  },
  sidebar: {
    width: "220px",
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    top: "64px",
    height: "calc(100vh - 64px)",
    overflowY: "auto",
    zIndex: 150,
    transition: "transform 0.3s ease",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #f3f4f6",
  },
  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    padding: "16px 8px",
    gap: "4px",
    flex: 1,
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
    transition: "all 0.15s",
  },
  menuIcon: {
    fontSize: "18px",
    width: "20px",
  },
  sidebarBottom: {
    padding: "16px",
  },
  helpCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #bbf7d0",
  },
  helpTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#166534",
    margin: "0 0 4px 0",
  },
  helpText: {
    fontSize: "11px",
    color: "#15803d",
    margin: "0",
  },
};

export default Sidebar;
