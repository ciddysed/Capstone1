import { Navigate } from "react-router-dom";

const ApplicantProtectedRoute = ({ children }) => {
  const applicantId = localStorage.getItem("applicantId");
  const userType = localStorage.getItem("userType");

  return applicantId && userType === "applicant" ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ApplicantProtectedRoute;
