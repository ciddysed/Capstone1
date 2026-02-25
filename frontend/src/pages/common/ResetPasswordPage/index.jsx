import React from "react";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import { Box, Stack } from "@mui/material";
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
        <ResetPasswordForm onSuccessCallback={handleResetSuccess} />
      </Stack>
      {snackbar}
    </Box>
  );  
};

export default ResetPasswordPage;
