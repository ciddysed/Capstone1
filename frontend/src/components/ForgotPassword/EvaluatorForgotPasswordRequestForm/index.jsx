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
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { StyledTextField } from "../../Login/LoginForm";

const EvaluatorForgotPasswordRequestForm = ({ onSuccess }) => {
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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      console.log("=== FRONTEND: Evaluator Forgot Password Request START ===");
      const response = await axios.post(
        "http://localhost:8080/api/evaluators/forgot-password",
        {
          email: data.email,
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
        response.data.message || "If your email exists, a reset link has been sent.";
      showSnackbar(successMessage, "success");

      // If onSuccess callback is provided, use it
      if (onSuccess) {
        onSuccess(successMessage);
      }
    } catch (error) {
      console.error("=== API RESPONSE ERROR ===", error);

      // Always show a generic message for security reasons
      const errorMessage = "If your email exists, a reset link has been sent.";
      showSnackbar(errorMessage, "info");
      
      // For development purposes, log the actual error
      console.error("Actual error:", error.response?.data?.message || error.message);
      
      // Still trigger success callback with the generic message
      if (onSuccess) {
        onSuccess(errorMessage);
      }
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
          Enter your email address below. We will send you a link to reset your password.
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
              "Send Reset Link"
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

export default EvaluatorForgotPasswordRequestForm;
