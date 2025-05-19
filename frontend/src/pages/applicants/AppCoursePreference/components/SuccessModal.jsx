import React from 'react';
import { Box, Typography, Modal, alpha } from '@mui/material';
import { maroon, TrackButton } from '../styles';
import logo from "../../../../assets/logo.png";

// Styled Modal Content
const SuccessModalContent = ({ children, ...props }) => (
  <Box
    {...props}
    sx={{
      backgroundColor: "white",
      borderRadius: 16,
      boxShadow: theme => theme.shadows[10],
      padding: theme => theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: 400,
      textAlign: "center",
      border: `2px solid ${maroon.main}`,
      animation: 'fadeIn 0.3s ease-in-out',
      '@keyframes fadeIn': {
        '0%': {
          opacity: 0,
          transform: 'scale(0.9)',
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)',
        },
      },
    }}
  >
    {children}
  </Box>
);

const SuccessModal = ({ open, userData, handleTrackApplication }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SuccessModalContent>
        <Box sx={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          bgcolor: alpha(maroon.main, 0.1),
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2
        }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </Box>
        <Typography variant="h6" id="success-modal-title" sx={{ 
          mb: 2, 
          fontWeight: 600,
          color: maroon.main
        }}>
          Hi, {userData.name.split(' ')[0]}!
        </Typography>
        <Typography variant="body1" id="success-modal-description" sx={{ mb: 3 }}>
          You already have a submitted application in our system.
        </Typography>
        <TrackButton onClick={handleTrackApplication}>
          Track your Application
        </TrackButton>
      </SuccessModalContent>
    </Modal>
  );
};

export default SuccessModal;
