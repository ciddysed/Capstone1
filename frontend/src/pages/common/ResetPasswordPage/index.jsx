import React from "react";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import { Stack } from "@mui/material";
import ResetPasswordForm from "../../../components/ForgotPassword/ResetPasswordForm";

const ResetPasswordPage = () => {
  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <ResetPasswordForm />
      </Stack>
    </MinimalLayout>
  );  
};

export default ResetPasswordPage;
