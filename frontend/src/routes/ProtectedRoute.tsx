import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { FlowBackground } from "../components/ui/FlowBackground";
import { LogoMark } from "../components/ui/Logo";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <FlowBackground variant="subtle" />
        <div className="animate-pulse">
          <LogoMark size={44} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
