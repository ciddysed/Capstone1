import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography, Paper } from '@mui/material';

const SystemAdminLoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Set userType in localStorage
    localStorage.setItem('userType', 'system-admin');
    // Redirect to system admin homepage
    navigate('/system-admin/homepage');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Admin Login
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Click the button below to access the System Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLogin}
            sx={{ mt: 2, py: 1.5, px: 4 }}
          >
            Login as System Admin
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default SystemAdminLoginPage;
