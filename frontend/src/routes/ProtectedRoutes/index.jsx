import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const applicantId = localStorage.getItem("applicantId");
  const evaluatorId = localStorage.getItem("evaluatorId");
  const adviserId = localStorage.getItem("adviserId");
  const programAdminId = localStorage.getItem("programAdminId");
  const systemAdminId = localStorage.getItem("systemAdminId");
  const userType = localStorage.getItem("userType");

  const isAuthenticated =
    !!applicantId ||
    !!evaluatorId ||
    !!adviserId ||
    !!programAdminId ||
    !!systemAdminId;

  // Redirect to appropriate login page based on user type
  if (!isAuthenticated) {
    // Check if there's a userType stored (indicates recent logout)
    if (userType === "evaluator") {
      return <Navigate to="/evaluator/login" replace />;
    } else if (userType === "adviser") {
      return <Navigate to="/adviser/login" replace />;
    } else if (userType === "program-admin") {
      return <Navigate to="/program-admin/login" replace />;
    } else if (userType === "system-admin") {
      return <Navigate to="/system-admin/login" replace />;
    } else {
      // Default to applicant login
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
