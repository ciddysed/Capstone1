import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { maroon } from '../styles';
import logo from "../../../../assets/logo.png";

const ApplicationHeader = ({ userData }) => {
  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between", 
      width: "100%", 
      maxWidth: 800,
      backgroundColor: alpha(maroon.main, 0.9),
      borderRadius: '0 0 16px 16px', 
      padding: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="white" sx={{ mr: 1 }}>
          {userData.email}
        </Typography>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: "50%", 
          bgcolor: "#FFFFFF",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: maroon.main,
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}>
          {userData.name ? userData.name.charAt(0).toUpperCase() : 'A'}
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicationHeader;
