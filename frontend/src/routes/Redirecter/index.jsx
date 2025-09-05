import { Navigate, useLocation } from "react-router-dom";

const Redirecter = () => {
  const location = useLocation();
  const userType = localStorage.getItem("userType");

  // Detect role from URL
  const isEvaluator = location.pathname.includes("/evaluator");
  const isAdmin = location.pathname.includes("/program-admin");
  const isApplicant = location.pathname.includes("/applicant");

  // Set role only if it's not already set
  if (!userType) {
    if (isEvaluator) localStorage.setItem("userType", "evaluator");
    else if (isAdmin) localStorage.setItem("userType", "program-admin");
    else if (isApplicant) localStorage.setItem("userType", "applicant");
  }

  const role = localStorage.getItem("userType");

  // Redirect based on role
  switch (role) {
    case "evaluator":
      return <Navigate to="/evaluator/applicants" replace />;
    case "program-admin":
      return <Navigate to="/program-admin/program-management" replace />;
    case "applicant":
      return <Navigate to="/homepage" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Redirecter;
