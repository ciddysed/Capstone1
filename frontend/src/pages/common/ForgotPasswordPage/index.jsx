import React, { useState } from "react";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import { Stack } from "@mui/material";
import useResponseHandler from "../../../utils/useResponseHandler";
import ForgotPasswordRequestForm from "../../../components/ForgotPassword/ForgotPasswordRequestForm";

const ForgotPasswordPage = () => {
  const { snackbar } = useResponseHandler();

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <ForgotPasswordRequestForm />
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default ForgotPasswordPage;
