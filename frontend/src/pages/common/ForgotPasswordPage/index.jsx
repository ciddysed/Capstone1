import React from "react";

import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
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
