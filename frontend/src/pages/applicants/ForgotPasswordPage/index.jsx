import React from "react";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
import ForgotPasswordRequestForm from "../../../components/ForgotPassword/ForgotPasswordRequestForm";
import { useNavigate } from "react-router-dom";

const ApplicantForgotPasswordPage = () => {
  const { snackbar, handleSuccess } = useResponseHandler();
  const navigate = useNavigate();

  const handlePasswordReset = (message) => {
    handleSuccess(message);
    // Redirect to applicant login page after successful password reset
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <ForgotPasswordRequestForm onSuccess={handlePasswordReset} />
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default ApplicantForgotPasswordPage;
