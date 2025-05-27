import { Navigate } from "react-router-dom";

const Redirecter = () => {
  const userType = localStorage.getItem("userType");

  if (!userType) {
    return <Navigate to="/login" />;
  } else if (userType === "applicant") {
    return <Navigate to="/homepage" />;
  } else if (userType === "evaluator") {
    return <Navigate to="/evaluator/homepage" />;
  } else if (userType.includes("admin")) {
    // Generic handling for any admin type
    // The userType string is expected to be in format like "system-admin" or "program-admin"
    if (userType === "system-admin") {
      return <Navigate to="/system-admin/evaluator-management" />;
    } else if (userType === "program-admin") {
      return <Navigate to="/program-admin/homepage" />;
    } else {
      // For any other admin type, redirect to a generic admin page
      return <Navigate to="/admin" />;
    }
  }

  // Default redirect if userType doesn't match any condition
  return <Navigate to="/login" />;
};

export default Redirecter;
