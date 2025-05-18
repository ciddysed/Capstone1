import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this at the top

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
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useResponseHandler from "../../../utils/useResponseHandler";

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

const EvaluatorLoginForm = ({
  formType = "login",
  setView,
  handleSuccess,
  handleError,
}) => {
  const [currentFormType, setCurrentFormType] = useState(formType);
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
    try {
      if (currentFormType === "signup") {
        const response = await fetch(
          "http://localhost:8080/api/evaluators/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              // Add other fields if needed for Evaluator model
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Registration failed.");
        }

        const result = await response.json();
        handleSuccess("Signup successful! Please log in.");
        reset();
        setCurrentFormType("login");
      } else {
        const response = await fetch(
          "http://localhost:8080/api/evaluators/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          }
        );

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          result = await response.text();
        }
        console.log("Login response:", result);

        // Fix: Check for admin property (your backend returns "admin": true)
        let isAdmin = false;
        if ("admin" in result) {
          isAdmin = Boolean(result.admin);
        } else if ("isAdmin" in result) {
          isAdmin = Boolean(result.isAdmin);
        } else if ("role" in result && typeof result.role === "string") {
          isAdmin = result.role.toLowerCase() === "admin";
        }
        console.log("isAdmin (final):", isAdmin, "role:", result.role);

        if (response.status === 200 && typeof result === "object" && result !== null) {
          // Store evaluatorId in localStorage if present
          if ("evaluatorId" in result) {
            localStorage.setItem("evaluatorId", result.evaluatorId);
          } else {
            localStorage.removeItem("evaluatorId");
          }
          // Navigate based on admin (now robust)
          if (isAdmin) {
            handleSuccess("Login successful!");
            navigate("/evaluator/applicants");
          } else {
            handleSuccess(
              "Your registration is being processed. Please wait for your approval as admin."
            );
            navigate("/evaluator/homepage");
          }
        } else {
          localStorage.removeItem("evaluatorId");
          handleError(
            typeof result === "string" ? result : "Invalid email or password."
          );
        }
      }
    } catch (error) {
      handleError("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  const handleToggle = (event, newFormType) => {
    if (newFormType) {
      setCurrentFormType(newFormType);
      reset();
    }
  };

  return (
    <>
      {" "}
      <StyledPaper elevation={6}>
        <Typography variant="h5" textAlign="center" fontWeight="bold">
          {currentFormType === "login"
            ? "Evaluator Login Form"
            : "Evaluator Signup Form"}
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
          {/* Move onSubmit to the form and ensure it's not wrapped in a fragment */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
          >
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
              type="password"
              fullWidth
              placeholder="Enter your password"
              variant="outlined"
              size="small"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            {currentFormType === "signup" && (
              <StyledTextField
                type="password"
                placeholder="Re-enter your password"
                variant="outlined"
                size="small"
                fullWidth
                {...register("reEnterPassword")}
                error={!!errors.reEnterPassword}
                helperText={errors.reEnterPassword?.message}
              />
            )}

            <Stack direction="row" justifyContent="flex-start">
              {currentFormType === "login" && (
                <Link href="#" variant="body2" sx={{ color: "black" }}>
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
    </>
  );
};

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

export default EvaluatorLoginForm;
