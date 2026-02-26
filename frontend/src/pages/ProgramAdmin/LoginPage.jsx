import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Stack,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
  styled
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import backgroundImage from '../../assets/login-bg.png';
import logo from '../../assets/logo.png';

// Styled TextField — matches the modern design
const StyledTextField = ({ ...props }) => (
  <TextField
    {...props}
    sx={{
      marginBottom: '10px',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        fontSize: '0.9rem',
        '& fieldset': {
          border: '1.5px solid #e2e8f0',
          transition: 'border-color 0.18s',
        },
        '&:hover fieldset': {
          borderColor: '#94a3b8',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#800000',
          borderWidth: '2px',
        },
      },
      '& .MuiInputBase-input::placeholder': {
        color: '#94a3b8',
        opacity: 1,
      },
      ...props.sx
    }}
  />
);

// Frosted glass card
const StyledPaper = styled(Paper)({
  padding: '40px 44px',
  width: '100%',
  maxWidth: 460,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  borderRadius: 24,
  background: 'rgba(15, 15, 20, 0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(0,0,0,0.2)',
});

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
      const response = await fetch('https://eteeap-foth.onrender.com/api/program-admins/login', {
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
        localStorage.setItem('programAdminName', data.name);
        localStorage.setItem('programAdminEmail', data.email);
        navigate('/program-admin/program-management');
      } else {
        const errorMessage = typeof data === 'string' ? data : 'Invalid email or password';
        throw new Error(errorMessage);
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
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Blurred, darkened background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px) brightness(0.45)',
          transform: 'scale(1.06)',
          zIndex: 0,
        }}
      />

      {/* Centered content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto',
          py: 5,
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={2.5} sx={{ width: '100%' }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 320,
              filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))',
            }}
          />
          <StyledPaper elevation={0}>
            {/* Header */}
            <Box sx={{ mb: 0.5, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#ffffff', letterSpacing: '-0.3px' }}>
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, fontSize: '0.875rem' }}>
                Sign in to your program admin account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: '10px' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <Stack gap={0}>
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
                  type={showPassword ? 'text' : 'password'}
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
                    backgroundColor: '#800000',
                    borderRadius: '10px',
                    py: 1.35,
                    mt: 0.5,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    letterSpacing: 0.4,
                    boxShadow: '0 4px 16px rgba(128,0,0,0.32)',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#6a0000',
                      boxShadow: '0 6px 22px rgba(128,0,0,0.42)',
                    },
                    '&:disabled': { backgroundColor: '#555', boxShadow: 'none' },
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>
          </StyledPaper>
        </Stack>
      </Box>
    </Box>
  );
};

export default ProgramAdminLoginPage;