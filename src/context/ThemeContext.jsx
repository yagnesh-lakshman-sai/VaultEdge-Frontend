import { createContext, useState, useContext, useEffect } from "react";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("smartbank_theme") === "dark";
  });

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? "#0f172a" : "#f3f4f6";
    document.body.style.color = isDark ? "#f1f5f9" : "#111827";
    localStorage.setItem("smartbank_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
