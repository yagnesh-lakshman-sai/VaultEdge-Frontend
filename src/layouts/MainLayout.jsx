import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const MainLayout = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        ...styles.wrapper,
        backgroundColor: isDark ? "#0f172a" : "#f3f4f6",
      }}
    >
      <Navbar />
      <div style={styles.body}>
        <Sidebar />
        <main
          style={{
            ...styles.main,
            backgroundColor: isDark ? "#0f172a" : "#f3f4f6",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  body: {
    display: "flex",
    flex: 1,
  },
  main: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
};

export default MainLayout;
