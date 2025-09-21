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

// Hardcoded system admin credentials (for frontend-only implementation)
const SYSTEM_ADMIN = {
  adminId: 'sysadmin-001',
  email: 'admin@system.com',
  password: 'admin123',
  name: 'System Administrator',
  role: 'System Admin'
};

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

const SystemAdminLoginPage = () => {
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check hardcoded credentials
      if (email === SYSTEM_ADMIN.email && password === SYSTEM_ADMIN.password) {
        localStorage.setItem('userType', 'system-admin');
        localStorage.setItem('systemAdminId', SYSTEM_ADMIN.adminId);
        localStorage.setItem('systemAdminName', SYSTEM_ADMIN.name);
        localStorage.setItem('systemAdminEmail', SYSTEM_ADMIN.email);
        navigate('/system-admin/evaluator-management');
      } else {
        throw new Error('Invalid email or password');
      }
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
            System Admin Login
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

export default SystemAdminLoginPage;
