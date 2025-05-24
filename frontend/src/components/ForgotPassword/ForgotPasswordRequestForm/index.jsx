import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Alert,
  Avatar,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
  styled
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async (data) => {
    try {
      // Make API call here
      console.log("Sending forgot password link to");
      showSnackbar("Reset link sent to your email.");
    } catch (error) {
      showSnackbar("Failed to send reset link.", "error");
    }
  };

  return (
    <StyledPaper elevation={6}>
      <Stack spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: "#800000", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          Forgot Password
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          px={2}
        >
          Enter the email associated with your account and we'll send you a
          reset link.
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
            sx={{ backgroundColor: "#D9D9D9", borderRadius: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#800000",
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Send Reset Link
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

export default ForgotPasswordRequestForm;
