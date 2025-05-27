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

const EvaluatorResetPasswordForm = ({ onSuccessCallback }) => {
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
      console.log("EvaluatorResetPasswordForm: Starting token validation", { token });
      
      if (!token) {
        console.error("EvaluatorResetPasswordForm: No token found in URL parameters");
        showSnackbar("Invalid reset link. Please request a new one.", "error");
        setTimeout(() => navigate("/evaluators/forget-password"), 2000);
        return;
      }

      try {
        console.log("EvaluatorResetPasswordForm: Sending token validation request");
        const baseUrl = "http://localhost:8080/api/evaluators";
        
        const response = await axios.get(`${baseUrl}/validate-reset-token/${token}`);
        
        console.log("EvaluatorResetPasswordForm: Token validation response", response.data);
        setTokenValid(response.data.valid);
        
        if (!response.data.valid) {
          console.warn("EvaluatorResetPasswordForm: Token validation failed - token is invalid or expired");
          showSnackbar("Reset link has expired. Please request a new one.", "error");
          setTimeout(() => navigate("/evaluators/forget-password"), 2000);
        } else {
          console.log("EvaluatorResetPasswordForm: Token validation successful");
        }
      } catch (error) {
        console.error("EvaluatorResetPasswordForm: Token validation request failed", {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        showSnackbar("Invalid reset link. Please request a new one.", "error");
        setTimeout(() => navigate("/evaluators/forget-password"), 2000);
      }
    };

    validateToken();
  }, [token, navigate]);

  const onSubmit = async (data) => {
    console.log("EvaluatorResetPasswordForm: Starting password reset submission");
    
    if (data.password !== data.confirmPassword) {
      console.warn("EvaluatorResetPasswordForm: Password confirmation mismatch");
      showSnackbar("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("EvaluatorResetPasswordForm: Sending password reset request", { token });
      const baseUrl = "http://localhost:8080/api/evaluators";
      
      const response = await axios.post(`${baseUrl}/reset-password`, {
        token: token,
        password: data.password
      });

      console.log("EvaluatorResetPasswordForm: Password reset response", response.data);
      const successMessage = response.data.message || "Password reset successfully";
      showSnackbar(successMessage, "success");
      
      // Call the callback if provided, otherwise handle redirection here
      if (onSuccessCallback) {
        onSuccessCallback(successMessage);
      } else {
        // Redirect automatically after showing success message
        setTimeout(() => {
          console.log("EvaluatorResetPasswordForm: Redirecting to login page");
          navigate("/evaluators/login");
        }, 1500);
      }
    } catch (error) {
      console.error("EvaluatorResetPasswordForm: Password reset request failed", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || "Failed to reset password. Please try again.";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
      console.log("EvaluatorResetPasswordForm: Password reset submission completed");
    }
  };

  if (tokenValid === false) {
    return (
      <StyledPaper elevation={6}>
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#800000", width: 56, height: 56 }}>
            <LockIcon />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="error">
            Invalid Reset Link
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center" px={2}>
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
          <CircularProgress />
          <Typography variant="body2">Validating reset link...</Typography>
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
        <Typography variant="h5" fontWeight="bold">
          Evaluator Reset Password
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          px={2}
        >
          Enter and confirm your new password below to complete your reset.
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
        <Stack spacing={2}>
          <TextField
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
            sx={{ backgroundColor: "#D9D9D9", borderRadius: 1 }}
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

          <TextField
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            fullWidth
            disabled={loading}
            sx={{ backgroundColor: "#D9D9D9", borderRadius: 1 }}
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
            sx={{
              backgroundColor: "#800000",
              borderRadius: 2,
              textTransform: "none",
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
  padding: 32,
  width: "100%",
  maxWidth: 420,
  borderRadius: 16,
});

export default EvaluatorResetPasswordForm;
