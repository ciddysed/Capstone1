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

const ForgotPasswordRequestForm = () => {
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

  //TODO: This is still work on progress, uncomment or use this when ready. If not pls use the other on submit as of now

  // const onSubmit = async (data) => {
  //   console.log("=== FRONTEND: ForgotPassword Form Submit START ===");
  //   console.log("Form data:", { email: data.email });
  //   console.log(
  //     "API URL:",
  //     "http://localhost:8080/api/applicants/forgot-password"
  //   );

  //   setLoading(true);

  //   try {
  //     console.log("Making axios POST request...");
  //     const response = await axios.post(
  //       "http://localhost:8080/api/applicants/forgot-password",
  //       {
  //         email: data.email,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         timeout: 10000, // 10 second timeout
  //       }
  //     );

  //     console.log("=== API RESPONSE SUCCESS ===");
  //     console.log("Status:", response.status);
  //     console.log("Headers:", response.headers);
  //     console.log("Data:", response.data);

  //     showSnackbar(
  //       response.data.message || "Reset link sent to your email.",
  //       "success"
  //     );
  //   } catch (error) {
  //     console.log("=== API RESPONSE ERROR ===");
  //     console.error("Error type:", error.constructor.name);
  //     console.error("Error message:", error.message);

  //     if (error.response) {
  //       console.error("Response status:", error.response.status);
  //       console.error("Response headers:", error.response.headers);
  //       console.error("Response data:", error.response.data);
  //     } else if (error.request) {
  //       console.error("No response received. Request:", error.request);
  //       console.error("Network error or server not responding");
  //     } else {
  //       console.error("Request setup error:", error.message);
  //     }

  //     const errorMessage =
  //       error.response?.data?.message || error.message.includes("timeout")
  //         ? "Request timed out. Please try again."
  //         : error.message.includes("Network Error")
  //         ? "Cannot connect to server. Please check if the backend is running."
  //         : "Failed to send reset link. Please try again.";
  //     showSnackbar(errorMessage, "error");
  //   } finally {
  //     setLoading(false);
  //     console.log("=== FRONTEND: ForgotPassword Form Submit END ===");
  //   }
  // };

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showSnackbar("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/applicants/reset-password",
        {
          email: data.email,
          newPassword: data.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      showSnackbar(
        response.data || "Password updated successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showSnackbar("error", error);
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
          Enter your email and new password below.
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
            type="password"
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
          />

          <StyledTextField
            label="Confirm Password"
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
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
              "Update Password"
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
