import { Navigate } from "react-router-dom";

const Redirecter = () => {
  const userType = localStorage.getItem("userType");

  if (!userType) {
    return <Navigate to="/login" />;
  } else if (userType === "applicant") {
    return <Navigate to="/homepage" />;
  } else if (userType === "evaluator") {
    return <Navigate to="/evaluator/homepage" />;
  }

  // Default redirect if userType doesn't match any condition
  return <Navigate to="/login" />;
};

export default Redirecter;
