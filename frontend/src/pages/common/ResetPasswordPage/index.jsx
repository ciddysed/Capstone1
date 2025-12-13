import React from "react";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import { Stack } from "@mui/material";
import ResetPasswordForm from "../../../components/ForgotPassword/ResetPasswordForm";
import { useNavigate } from "react-router-dom";
import useResponseHandler from "../../../utils/useResponseHandler";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { handleSuccess, snackbar } = useResponseHandler();
  
  const handleResetSuccess = (message) => {
    handleSuccess(message);
    // Automatically redirect to the applicant login page after successful reset
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <ResetPasswordForm onSuccessCallback={handleResetSuccess} />
      </Stack>
      {snackbar}
    </MinimalLayout>
  );  
};

export default ResetPasswordPage;
