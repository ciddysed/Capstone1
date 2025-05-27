import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Alert,
  Avatar,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
  styled,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { StyledTextField } from "../../Login/LoginForm";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ForgotPasswordRequestForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showSnackbar("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      console.log("=== FRONTEND: Direct Password Reset START ===");
      // Use POST method instead of PUT to match the backend endpoint
      const response = await axios.post(
        "http://localhost:8080/api/applicants/reset-password",
        {
          email: data.email,
          password: data.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("=== API RESPONSE SUCCESS ===");
      console.log("Data:", response.data);

      const successMessage =
        response.data.message || "Password updated successfully.";
      showSnackbar(successMessage, "success");

      // If onSuccess callback is provided, use it
      if (onSuccess) {
        onSuccess(successMessage);
      }
    } catch (error) {
      console.error("=== API RESPONSE ERROR ===", error);

      const errorMessage =
        error.response?.data?.message ||
        (error.message.includes("timeout")
          ? "Request timed out. Please try again."
          : error.message.includes("Network Error")
          ? "Cannot connect to server. Please check if the backend is running."
          : "Failed to update password. Please try again.");

      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper elevation={6}>
      <Stack spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#800000", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          Reset Password
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          px={2}
        >
          Enter your email and set a new password below.
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 24 }}>
        <Stack spacing={2}>
          <StyledTextField
            label="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/,
                message: "Enter a valid email",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            disabled={loading}
            sx={{ backgroundColor: "#D9D9D9", borderRadius: 1 }}
          />

          <StyledTextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
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

          <StyledTextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
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
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Reset Password"
            )}
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
          severity={
            typeof snackbar.severity === "string" ? snackbar.severity : "info"
          }
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

export default ForgotPasswordRequestForm;
