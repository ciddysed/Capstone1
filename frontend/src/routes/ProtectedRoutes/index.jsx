import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const applicantId = localStorage.getItem("applicantId");
  const evaluatorId = localStorage.getItem("evaluatorId");

  const isAuthenticated = !!applicantId || !!evaluatorId;

  // Redirect applicants to /login, evaluators to /evaluator/login
  if (!isAuthenticated) {
    // If no one is logged in at all, redirect to generic /login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
