import { Navigate, useLocation } from "react-router-dom";

const Redirecter = () => {
  const location = useLocation();
  const userType = localStorage.getItem("userType");
  const applicantId = localStorage.getItem("applicantId");
  const evaluatorId = localStorage.getItem("evaluatorId");
  const adviserId = localStorage.getItem("adviserId");
  const programAdminId = localStorage.getItem("programAdminId");
  const systemAdminId = localStorage.getItem("systemAdminId");

  // Detect role from URL
  const isEvaluator = location.pathname.includes("/evaluator");
  const isAdviser = location.pathname.includes("/adviser");
  const isProgramAdmin = location.pathname.includes("/program-admin");
  const isSystemAdmin = location.pathname.includes("/system-admin");
  const isApplicant = location.pathname.includes("/applicant");

  // Set role only if it's not already set
  if (!userType) {
    if (isEvaluator) localStorage.setItem("userType", "evaluator");
    else if (isAdviser) localStorage.setItem("userType", "adviser");
    else if (isProgramAdmin) localStorage.setItem("userType", "program-admin");
    else if (isSystemAdmin) localStorage.setItem("userType", "system-admin");
    else if (isApplicant) localStorage.setItem("userType", "applicant");
  }

  const role = localStorage.getItem("userType");

  // Check if user is actually authenticated based on their role
  const isAuthenticated = 
    (role === "applicant" && applicantId) || 
    (role === "evaluator" && evaluatorId) || 
    (role === "adviser" && adviserId) || 
    (role === "program-admin" && programAdminId) ||
    (role === "system-admin" && systemAdminId);

  // If not authenticated, redirect to appropriate login page based on role
  if (!isAuthenticated) {
    switch (role) {
      case "evaluator":
        return <Navigate to="/evaluator/login" replace />;
      case "adviser":
        return <Navigate to="/adviser/login" replace />;
      case "program-admin":
        return <Navigate to="/program-admin/login" replace />;
      case "system-admin":
        return <Navigate to="/system-admin/login" replace />;
      case "applicant":
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If authenticated, redirect to appropriate dashboard
  switch (role) {
    case "evaluator":
      return <Navigate to="/evaluator/applicants" replace />;
    case "adviser":
      return <Navigate to="/adviser/homepage" replace />;
    case "program-admin":
      return <Navigate to="/program-admin/program-management" replace />;
    case "system-admin":
      return <Navigate to="/system-admin/evaluator-management" replace />;
    case "applicant":
      return <Navigate to="/homepage" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Redirecter;
