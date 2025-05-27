import React from "react";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
import EvaluatorForgotPasswordRequestForm from "../../../components/ForgotPassword/EvaluatorForgotPasswordRequestForm";
import { useNavigate } from "react-router-dom";

const EvaluatorForgotPasswordPage = () => {
  const { snackbar, handleSuccess } = useResponseHandler();
  const navigate = useNavigate();

  const handlePasswordReset = (message) => {
    handleSuccess(message);
    // Redirect to evaluator login page after successful password reset
    setTimeout(() => {
      navigate("/evaluator/login");
    }, 2000);
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <EvaluatorForgotPasswordRequestForm onSuccess={handlePasswordReset} />
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default EvaluatorForgotPasswordPage;
