import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from '../../../config';
import { useNavigate } from "react-router-dom";

import {
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Stack,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  InputAdornment,
  IconButton,
  InputLabel,
  Divider,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const getValidationSchema = (formType) =>
  yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Minimum 8 characters")
      .required("Password is required"),
    ...(formType === "signup" && {
      reEnterPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Please re-enter password"),
      firstName: yup.string().required("First name is required"),
      lastName: yup.string().required("Last name is required"),
      address: yup.string().required("Address is required"),
      contactNumber: yup
        .string()
        .matches(/^09\d{9}$/, "Invalid contact number")
        .required("Contact number is required"),
      birthDate: yup.date().required("Date of birth is required"),
    }),
  });

const LoginForm = ({
  formType = "login",
  setView,
  handleSuccess,
  handleError,
}) => {
  const [currentFormType, setCurrentFormType] = useState(formType);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [gender, setGender] = useState("");
  const schema = getValidationSchema(currentFormType);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleGenderChange = (event, newGender) => {
    if (newGender !== null) {
      setGender(newGender);
    }
  };

  const onSubmit = async (data) => {
    if (currentFormType === "signup") {
      try {
        // Format date for the API
        const date = new Date(data.birthDate);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

        // Complete signup with all profile data
        const response = await axios.post(
          `${API_BASE}/applicants/register-complete`,
          {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            middleInitial: data.middleInitial || "",
            lastName: data.lastName,
            address: data.address,
            contactNumber: data.contactNumber,
            dateOfBirth: formattedDate,
            gender: gender.toUpperCase(),
            profileDetails: "Software Engineer",
          }
        );

        localStorage.setItem("applicantId", response.data.applicantId);
        localStorage.setItem("userType", "applicant");
        handleSuccess("Successfully signed up! Please log in.");
        reset();
        setCurrentFormType("login");
      } catch (error) {
        console.error("Signup error:", error);
        if (error.response) {
          console.error("Signup response status:", error.response.status);
          console.error("Signup response data:", error.response.data);
          console.error("Signup response headers:", error.response.headers);
          console.error("Signup request config:", error.config);
          handleError(error.response.data?.message || `Signup failed (${error.response.status})`);
        } else if (error.request) {
          console.error("No response received for signup:", error.request);
          handleError("No response from server. Please check your connection.");
        } else {
          console.error("Signup setup error:", error.message);
          handleError("Signup failed. Please try again.");
        }
      }
    } else {
      try {
        const response = await axios.post(
          `${API_BASE}/applicants/login`,
          {
            email: data.email,
            password: data.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { applicantId } = response.data;
        console.log("GIKAN LOGIN", response.data);

        if (applicantId) {
          localStorage.setItem("applicantId", applicantId);
          localStorage.setItem("userType", "applicant");
          handleSuccess("Login successful!");

          // Check if profile is complete by fetching user data
          try {
            const userResponse = await axios.get(
              `${API_BASE}/applicants/${applicantId}`
            );
            const userData = userResponse.data;

            // Check if essential profile fields are missing
            const isProfileIncomplete =
              !userData.firstName ||
              !userData.lastName ||
              !userData.address ||
              !userData.contactNumber ||
              !userData.dateOfBirth ||
              !userData.gender;

            if (isProfileIncomplete) {
              // Navigate to setup profile within the same page
              setView("setupProfile");
            } else {
              // Profile is complete, now check application status
              await checkApplicationStatusAndRedirect(applicantId);
            }
          } catch (userError) {
            console.error("Error fetching user data:", userError);
            // If we can't fetch user data, assume profile is incomplete
            setView("setupProfile");
          }
        } else {
          throw new Error("Applicant ID missing in response");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error.response) {
          console.error("Login response status:", error.response.status);
          console.error("Login response data:", error.response.data);
          console.error("Login response headers:", error.response.headers);
          console.error("Login request config:", error.config);
          handleError(error.response.data?.message || `Login failed (${error.response.status})`);
        } else if (error.request) {
          console.error("No response received for login:", error.request);
          handleError("No response from server. Please check your connection.");
        } else {
          console.error("Login setup error:", error.message);
          handleError("Login failed. Please try again.");
        }
      }
    }
  };

  const handleToggle = (event, newFormType) => {
    if (newFormType) {
      setCurrentFormType(newFormType);
      setGender(""); // Reset gender when switching forms
      reset();
    }
  };

  // Function to check if applicant has started their application
  const checkApplicationStatusAndRedirect = async (applicantId) => {
    try {
      // Check for course preferences
      const preferencesResponse = await axios.get(
        `${API_BASE}/preferences/applicant/${applicantId}`
      );
      const hasPreferences =
        preferencesResponse.data && preferencesResponse.data.length > 0;

      // Check for uploaded documents
      const documentsResponse = await axios.get(
        `${API_BASE}/documents/applicant/${applicantId}`
      );
      const hasDocuments =
        documentsResponse.data && documentsResponse.data.length > 0;

      // Check if they have submitted an application
      const applicationResponse = await axios.get(
        `${API_BASE}/applications/applicant/${applicantId}`
      );
      const hasSubmittedApplication =
        applicationResponse.data && applicationResponse.data.length > 0;

      // If they have any application data, redirect to tracking
      if (hasPreferences || hasDocuments || hasSubmittedApplication) {
        navigate("/ApplicationTrack");
        return;
      }

      // No application data found, go to homepage
      navigate("/homepage");
    } catch (error) {
      // If any API call fails (e.g., 404), assume no application data exists
      console.log("No existing application data found, proceeding to homepage");
      navigate("/homepage");
    }
  };

  return (
    <StyledPaper elevation={0} sx={{ maxWidth: currentFormType === "signup" ? 700 : 460 }}>
      {/* Header */}
      <Box sx={{ mb: 0.5, textAlign: "center" }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "#ffffff", letterSpacing: "-0.3px" }}
        >
          {currentFormType === "login" ? "Welcome back" : "Create account"}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5, fontSize: "0.875rem" }}>
          {currentFormType === "login"
            ? "Sign in to access your account"
            : "Fill in your details to get started"}
        </Typography>
      </Box>

      {/* Pill-style tab switcher */}
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,0.12)",
          borderRadius: "10px",
          p: "4px",
          display: "inline-flex",
          alignSelf: "center",
        }}
      >
        <ToggleButtonGroup
          value={currentFormType}
          exclusive
          onChange={handleToggle}
          aria-label="Login or Signup"
          sx={{ gap: 0 }}
        >
          <StyledToggleButton value="login">Login</StyledToggleButton>
          <StyledToggleButton value="signup">Signup</StyledToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Stack gap={2}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <StyledTextField
            type="email"
            fullWidth
            placeholder="Enter your email"
            variant="outlined"
            size="small"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <StyledTextField
            type={showPassword ? "text" : "password"}
            fullWidth
            placeholder="Enter your password"
            variant="outlined"
            size="small"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
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

          {currentFormType === "signup" && (
            <>
              <StyledTextField
                type={showRePassword ? "text" : "password"}
                placeholder="Re-enter your password"
                variant="outlined"
                size="small"
                fullWidth
                {...register("reEnterPassword")}
                error={!!errors.reEnterPassword}
                helperText={errors.reEnterPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowRePassword((prev) => !prev)}
                        edge="end"
                      >
                        {showRePassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.15)" }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 0.3, textTransform: "uppercase", fontSize: "0.75rem" }}>
                Personal Information
              </Typography>
              
              <Stack direction={"row"} gap={2}>
                <StyledTextField
                  fullWidth
                  placeholder="First Name"
                  variant="outlined"
                  size="small"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
                <StyledTextField
                  fullWidth
                  placeholder="Last Name"
                  variant="outlined"
                  size="small"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
                <StyledTextField
                  placeholder="M.I."
                  variant="outlined"
                  size="small"
                  {...register("middleInitial")}
                />
              </Stack>

              <Stack direction={"row"} gap={2} mt={2}>
                <StyledTextField
                  fullWidth
                  placeholder="Address"
                  variant="outlined"
                  size="small"
                  {...register("address")}
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
                <StyledTextField
                  placeholder="Contact Number (09*********)"
                  variant="outlined"
                  size="small"
                  {...register("contactNumber")}
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber?.message}
                />
              </Stack>

              <Stack direction={"row"} justifyContent={"center"} gap={2} mt={2}>
                <Stack gap={1}>
                  <InputLabel sx={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Date of Birth</InputLabel>
                  <StyledTextField
                    type="date"
                    variant="outlined"
                    size="small"
                    {...register("birthDate")}
                    error={!!errors.birthDate}
                    helperText={errors.birthDate?.message}
                    sx={{ maxWidth: 200 }}
                  />
                </Stack>

                <Stack direction="column" justifyContent="center" sx={{ mb: 2 }}>
                  <InputLabel sx={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Gender</InputLabel>
                  <ToggleButtonGroup
                    value={gender}
                    exclusive
                    onChange={handleGenderChange}
                    aria-label="Gender"
                  >
                    <StyledToggleButton value="male">Male</StyledToggleButton>
                    <StyledToggleButton value="female">Female</StyledToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#800000",
              borderRadius: "10px",
              mt: 1.5,
              py: 1.35,
              fontWeight: 700,
              fontSize: "0.95rem",
              letterSpacing: 0.4,
              boxShadow: "0 4px 16px rgba(128,0,0,0.32)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#6a0000",
                boxShadow: "0 6px 22px rgba(128,0,0,0.42)",
              },
              transition: "all 0.2s",
            }}
          >
            {currentFormType === "login" ? "Sign In" : "Create Account"}
          </Button>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
            {currentFormType === "login" && (
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/forget-password")}
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 500,
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  transition: "opacity 0.15s",
                  '&:hover': {
                    opacity: 0.75,
                    textDecoration: "underline",
                  },
                }}
                aria-label="Forgot password?"
              >
                Forgot password?
              </Link>
            )}
          </Stack>
        </form>
      </Stack>
    </StyledPaper>
  );
};

// Styled Components
export const StyledTextField = styled(TextField)({
  marginBottom: 10,
  backgroundColor: "#f8fafc",
  borderRadius: "10px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.9rem",
    "& fieldset": {
      border: "1.5px solid #e2e8f0",
      transition: "border-color 0.18s",
    },
    "&:hover fieldset": {
      borderColor: "#94a3b8",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#800000",
      borderWidth: "2px",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#94a3b8",
    opacity: 1,
  },
});

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "rgba(255,255,255,0.65)",
  fontWeight: 600,
  fontSize: "0.875rem",
  border: "none !important",
  borderRadius: "7px !important",
  padding: "5px 22px",
  textTransform: "none",
  transition: "all 0.18s",
  "&.Mui-selected": {
    backgroundColor: "#800000",
    color: "white",
    boxShadow: "0 2px 8px rgba(128,0,0,0.4)",
  },
  "&.Mui-selected:hover": {
    backgroundColor: "#6a0000",
  },
  "&:hover:not(.Mui-selected)": {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#ffffff",
  },
}));

export const StyledPaper = styled(Paper)({
  padding: "40px 44px",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  borderRadius: 24,
  background: "rgba(15, 15, 20, 0.55)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45), 0 4px 16px rgba(0,0,0,0.2)",
});

export default LoginForm;
