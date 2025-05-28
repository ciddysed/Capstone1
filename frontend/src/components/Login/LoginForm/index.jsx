import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Stack,
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
          "http://localhost:8080/api/applicants/register-complete",
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
        handleError("Signup failed. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/applicants/login",
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

        const { applicantId, message } = response.data;
        console.log("GIKAN LOGIN", response.data);

        if (applicantId) {
          localStorage.setItem("applicantId", applicantId);
          localStorage.setItem("userType", "applicant");
          handleSuccess("Login successful!");

          // Check if profile is complete by fetching user data
          try {
            const userResponse = await axios.get(
              `http://localhost:8080/api/applicants/${applicantId}`
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
        console.error("Login error:", error.response?.data || error.message);
        handleError(
          error.response?.data?.message || "Login failed. Please try again."
        );
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
        `http://localhost:8080/api/preferences/applicant/${applicantId}`
      );
      const hasPreferences =
        preferencesResponse.data && preferencesResponse.data.length > 0;

      // Check for uploaded documents
      const documentsResponse = await axios.get(
        `http://localhost:8080/api/documents/applicant/${applicantId}`
      );
      const hasDocuments =
        documentsResponse.data && documentsResponse.data.length > 0;

      // Check if they have submitted an application
      const applicationResponse = await axios.get(
        `http://localhost:8080/api/applications/applicant/${applicantId}`
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
    <StyledPaper elevation={6} sx={{ maxWidth: currentFormType === "signup" ? 700 : 500 }}>
      <Typography variant="h5" textAlign="center" fontWeight="bold">
        {currentFormType === "login" ? "Login Form" : "Signup Form"}
      </Typography>

      <Stack direction="row" justifyContent="center">
        <ToggleButtonGroup
          value={currentFormType}
          exclusive
          onChange={handleToggle}
          aria-label="Login or Signup"
        >
          <StyledToggleButton value="login">Login</StyledToggleButton>
          <StyledToggleButton value="signup">Signup</StyledToggleButton>
        </ToggleButtonGroup>
      </Stack>

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
              
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" textAlign="center" fontWeight="bold">
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
                  <InputLabel sx={{ fontSize: "14px" }}>Date of Birth</InputLabel>
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
                  <InputLabel sx={{ fontSize: "14px" }}>Gender</InputLabel>
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

          <Stack direction="row" justifyContent="flex-start">
            {currentFormType === "login" && (
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/forget-password")}
                sx={{
                  color: "black",
                  textDecoration: "underline",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                Forgot password?
              </Link>
            )}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ backgroundColor: "#800000", borderRadius: "20px", mt: 2 }}
          >
            {currentFormType === "login" ? "Login" : "Signup"}
          </Button>
        </form>
      </Stack>
    </StyledPaper>
  );
};

// Styled Components
export const StyledTextField = styled(TextField)({
  marginBottom: 8,
  backgroundColor: "#D9D9D9",
  borderRadius: "12px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "12px",
  },
});

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  backgroundColor: "#f5f5f5",
  color: "black",
  "&.Mui-selected": {
    backgroundColor: "#800000",
    color: "white",
  },
  "&:hover": {
    backgroundColor: "#800000",
    color: "white",
  },
}));

export const StyledPaper = styled(Paper)({
  padding: 32,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  borderRadius: 16,
  background:
    "linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(128, 128, 128, 0.6))",
  boxShadow: "inset 0px 0px 10px rgba(255, 255, 255, 0.5)",
});

export default LoginForm;
