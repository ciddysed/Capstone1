import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Stack, 
  TextField,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import backgroundImage from '../../assets/login-bg.png';
import logo from '../../assets/logo.png';
import { StyledPaper } from '../../components/Login/LoginForm';
import MinimalLayout from '../../templates/MinimalLayout';

// Styled TextField component
const StyledTextField = ({ ...props }) => (
  <TextField
    {...props}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        '& fieldset': {
          borderColor: '#ddd',
        },
        '&:hover fieldset': {
          borderColor: '#800000',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#800000',
        },
      },
      ...props.sx
    }}
  />
);

const ProgramAdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleError = (message) => {
    setError(message);
    // Clear error after 5 seconds
    setTimeout(() => setError(''), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For development/testing - you can replace this with actual API call
      if (email && password) {
        // Mock successful login
        localStorage.setItem('userType', 'program-admin');
        localStorage.setItem('programAdminId', 'admin-1');
        navigate('/program-admin/program-management');
      } else {
        throw new Error('Please fill in all fields');
      }

      /* 
      // Uncomment and modify this section for actual API integration
      const response = await fetch('/api/program-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.adminId) {
        localStorage.setItem('userType', 'program-admin');
        localStorage.setItem('programAdminId', data.adminId);
        navigate('/program-admin/program-management');
      } else {
        throw new Error('Admin ID missing in response');
      }
      */
    } catch (error) {
      console.error('Login error:', error.message);
      handleError(
        error.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <StyledPaper elevation={6} sx={{ maxWidth: 500 }}>
          <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
            Program Admin Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <Stack gap={2}>
              <StyledTextField
                type="email"
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <StyledTextField
                type={showPassword ? "text" : "password"}
                fullWidth
                placeholder="Enter your password"
                variant="outlined"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ 
                  backgroundColor: "#800000", 
                  borderRadius: "20px",
                  py: 1.5,
                  mt: 2,
                  '&:hover': {
                    backgroundColor: "#600000"
                  },
                  '&:disabled': {
                    backgroundColor: "#ccc"
                  }
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </form>
        </StyledPaper>
      </Stack>
    </MinimalLayout>
  );
};

export default ProgramAdminLoginPage;