import { Navigate, Outlet } from "react-router-dom";
import path from "@/constants/path";

import { useAuthStore } from "@/store/useAuthStore";
export default function ProtectedMenteeRoute() {
  const { user } = useAuthStore();
  if (user?.role !== "Mentee") {
    return <Navigate to={path.LOGIN} replace />;
  }
  return <Outlet />;
}
