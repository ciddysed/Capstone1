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

  const onSubmit = async (data) => {
    if (currentFormType === "signup") {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/applicants/register",
          {
            email: data.email,
            password: data.password,
          }
        );
        localStorage.setItem("applicantId", response.data.applicantId);
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
          handleSuccess("Login successful!");
          navigate("/setup-profile", {
            state: {
              applicantId,
            },
          });
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
      reset();
    }
  };

  return (
    <StyledPaper elevation={6}>
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
            sx={{ backgroundColor: "#800000", borderRadius: "20px" }}
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
  maxWidth: 500,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  borderRadius: 16,
  background:
    "linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(128, 128, 128, 0.6))",
  boxShadow: "inset 0px 0px 10px rgba(255, 255, 255, 0.5)",
});

export default LoginForm;
