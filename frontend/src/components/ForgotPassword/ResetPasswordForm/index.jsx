import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Paper,
  Stack,
  Typography,
  styled,
  IconButton,
  InputAdornment,
  Avatar,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordForm = ({ onSuccessCallback }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  useEffect(() => {
    const validateToken = async () => {
      console.log("ResetPasswordForm: Starting token validation", { token });
      
      if (!token) {
        console.error("ResetPasswordForm: No token found in URL parameters");
        showSnackbar("Invalid reset link. Please request a new one.", "error");
        setTimeout(() => navigate("/forget-password"), 2000);
        return;
      }

      try {
        console.log("ResetPasswordForm: Sending token validation request");
        const baseUrl = "https://eteeap-foth.onrender.com/api/applicants";
        
        const response = await axios.get(`${baseUrl}/validate-reset-token/${token}`);
        
        console.log("ResetPasswordForm: Token validation response", response.data);
        setTokenValid(response.data.valid);
        
        if (!response.data.valid) {
          console.warn("ResetPasswordForm: Token validation failed - token is invalid or expired");
          showSnackbar("Reset link has expired. Please request a new one.", "error");
          setTimeout(() => navigate("/forget-password"), 2000);
        } else {
          console.log("ResetPasswordForm: Token validation successful");
        }
      } catch (error) {
        console.error("ResetPasswordForm: Token validation request failed", {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        showSnackbar("Invalid reset link. Please request a new one.", "error");
        setTimeout(() => navigate("/forget-password"), 2000);
      }
    };

    validateToken();
  }, [token, navigate]);

  const onSubmit = async (data) => {
    console.log("ResetPasswordForm: Starting password reset submission");
    
    if (data.password !== data.confirmPassword) {
      console.warn("ResetPasswordForm: Password confirmation mismatch");
      showSnackbar("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("ResetPasswordForm: Sending password reset request", { token });
      const baseUrl = "https://eteeap-foth.onrender.com/api/applicants";
      
      const response = await axios.post(`${baseUrl}/reset-password`, {
        token: token,
        password: data.password
      });

      console.log("ResetPasswordForm: Password reset response", response.data);
      const successMessage = response.data.message || "Password reset successfully";
      showSnackbar(successMessage, "success");
      
      // Call the callback if provided, otherwise handle redirection here
      if (onSuccessCallback) {
        onSuccessCallback(successMessage);
      } else {
        // Redirect automatically after showing success message
        setTimeout(() => {
          console.log("ResetPasswordForm: Redirecting to login page");
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("ResetPasswordForm: Password reset request failed", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
      console.log("ResetPasswordForm: Password reset submission completed");
    }
  };

  if (tokenValid === false) {
    return (
      <StyledPaper elevation={6}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#800000", width: 56, height: 56 }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" sx={{ color: '#ff6b6b' }}>
            Invalid Reset Link
          </Typography>
          <Typography variant="body2" textAlign="center" px={2} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            This reset link is invalid or has expired. Please request a new one.
          </Typography>
        </Stack>
      </StyledPaper>
    );
  }

  if (tokenValid === null) {
    return (
      <StyledPaper elevation={6}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Validating reset link...</Typography>
        </Stack>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper elevation={6}>
      <Stack spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#800000", width: 56, height: 56 }}>
          <LockIcon />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#fff' }}>
          Applicant Reset Password
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          px={2}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Enter and confirm your new password below to complete your reset.
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
        <Stack spacing={2}>
          <GlassTextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <GlassTextField
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirm((prev) => !prev)}
                    edge="end"
                    disabled={loading}
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              backgroundColor: '#800000',
              borderRadius: '10px',
              py: 1.35,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(128,0,0,0.4)',
              '&:hover': { backgroundColor: '#6a0000' },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

const StyledPaper = styled(Paper)({
  padding: '40px 44px',
  width: '100%',
  maxWidth: 440,
  borderRadius: 24,
  background: 'rgba(15,15,20,0.55)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
});

const GlassTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#800000' },
    '&.Mui-focused fieldset': { borderColor: '#800000', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { color: '#64748b' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#800000' },
  marginBottom: 0,
});

export default ResetPasswordForm;
