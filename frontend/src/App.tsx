import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Employees from "./pages/admin/Employees";
import TeamAttendance from "./pages/admin/TeamAttendance";
import TeamLeaves from "./pages/admin/TeamLeaves";
import TeamPayroll from "./pages/admin/TeamPayroll";

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<Leave />} />
                <Route path="/payroll" element={<Payroll />} />

                <Route element={<AdminRoute />}>
                  <Route path="/team/employees" element={<Employees />} />
                  <Route path="/team/attendance" element={<TeamAttendance />} />
                  <Route path="/team/leaves" element={<TeamLeaves />} />
                  <Route path="/team/payroll" element={<TeamPayroll />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
