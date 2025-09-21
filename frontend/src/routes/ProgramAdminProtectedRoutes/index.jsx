import { Navigate } from "react-router-dom";

const ProgramAdminProtectedRoute = ({ children }) => {
  const programAdminId = localStorage.getItem("programAdminId");
  const userType = localStorage.getItem("userType");

  return programAdminId && userType === "program-admin" ? (
    children
  ) : (
    <Navigate to="/program-admin/login" replace />
  );
};

export default ProgramAdminProtectedRoute;