import { Navigate, Outlet } from "react-router-dom";
import path from "@/constants/path";

import { useAuthStore } from "@/store/useAuthStore";
export default function ProtectedMentorRoute() {
  const { user } = useAuthStore();
  if (user?.role !== "Mentor") {
    return <Navigate to={path.LOGIN} replace />;
  }
  return <Outlet />;
}
