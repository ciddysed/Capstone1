import React from "react";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Box, Stack } from "@mui/material";
import EvaluatorForgotPasswordRequestForm from "../../../components/ForgotPassword/EvaluatorForgotPasswordRequestForm";
import { useNavigate } from "react-router-dom";

const EvaluatorForgotPasswordPage = () => {
  const { snackbar, handleSuccess } = useResponseHandler();
  const navigate = useNavigate();

  const handlePasswordReset = (message) => {
    handleSuccess(message);
    setTimeout(() => {
      navigate("/evaluator/login");
    }, 2000);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(4px) brightness(0.45)',
        transform: 'scale(1.06)',
        zIndex: 0,
      }} />
      <Stack alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1, width: '100%', py: 5, px: 2 }}>
        <img src={logo} alt="Logo" width={320} style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.55))' }} />
        <EvaluatorForgotPasswordRequestForm onSuccess={handlePasswordReset} />
      </Stack>
      {snackbar}
    </Box>
  );
};

export default EvaluatorForgotPasswordPage;
