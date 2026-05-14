import { createContext, useState, useEffect } from "react";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearStorage,
} from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    const userInfo = {
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      userId: userData.userId,
    };

    saveToken(userData.token);
    saveUser(userInfo);

    setToken(userData.token);
    setUser(userInfo);
  };

  const logout = () => {
    clearStorage();

    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;

  const isCustomer = user?.role === "CUSTOMER";
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  const value = {
    user,
    token,
    isLoggedIn,
    isCustomer,
    isAdmin,
    isManager,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
