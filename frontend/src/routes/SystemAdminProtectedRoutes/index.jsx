import { Navigate } from "react-router-dom";

const SystemAdminProtectedRoute = ({ children }) => {
  const systemAdminId = localStorage.getItem("systemAdminId");
  const userType = localStorage.getItem("userType");

  return systemAdminId && userType === "system-admin" ? (
    children
  ) : (
    <Navigate to="/system-admin/login" replace />
  );
};

export default SystemAdminProtectedRoute;