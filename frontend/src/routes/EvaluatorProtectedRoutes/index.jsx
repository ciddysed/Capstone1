import { Navigate } from "react-router-dom";

const EvaluatorProtectedRoute = ({ children }) => {
  const evaluatorId = localStorage.getItem("evaluatorId");
  const userType = localStorage.getItem("userType");

  return evaluatorId && userType === "evaluator" ? (
    children
  ) : (
    <Navigate to="/evaluator/login" replace />
  );
};

export default EvaluatorProtectedRoute;
