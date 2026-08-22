import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, AdminRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TeamAttendance from "./pages/admin/TeamAttendance";
import TeamLeaves from "./pages/admin/TeamLeaves";
import TeamPayroll from "./pages/admin/TeamPayroll";
import EmployeeOverview from "./features/employees/pages/EmployeeOverview";
import EmployeeDirectory from "./features/employees/pages/EmployeeDirectory";
import AddEmployee from "./features/employees/pages/AddEmployee";
import EditEmployee from "./features/employees/pages/EditEmployee";
import EmployeeProfile from "./features/employees/pages/EmployeeProfile";

function Root() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Root />} />
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
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />

                <Route element={<AdminRoute />}>
                  <Route path="/team/employees" element={<EmployeeOverview />} />
                  <Route path="/team/employees/all" element={<EmployeeDirectory />} />
                  <Route path="/team/employees/new" element={<AddEmployee />} />
                  <Route path="/team/employees/:id" element={<EmployeeProfile />} />
                  <Route path="/team/employees/:id/edit" element={<EditEmployee />} />
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
