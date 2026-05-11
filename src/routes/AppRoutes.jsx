import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import ProfilePage from "../pages/customer/ProfilePage";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyOtpPage from "../pages/auth/VerifyOtpPage";

import DashboardPage from "../pages/customer/DashboardPage";
import TransferPage from "../pages/customer/TransferPage";
import TransactionsPage from "../pages/customer/TransactionsPage";
import LoansPage from "../pages/customer/LoansPage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import PendingLoansPage from "../pages/admin/PendingLoansPage";

import UnauthorizedPage from "../pages/error/UnauthorizedPage";
import NotFoundPage from "../pages/error/NotFoundPage";

import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

const AppRoutes = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? (
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfer"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout>
              <TransferPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout>
              <TransactionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout>
              <LoansPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/loans"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AdminLayout>
              <PendingLoansPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
