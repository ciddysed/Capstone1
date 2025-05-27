import React, { useState, useEffect } from "react";
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
  MenuItem,
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
      name: yup.string().required("Full name is required"),
      contactNumber: yup
        .string()
        .matches(/^[0-9+\-\s()]+$/, "Invalid contact number")
        .required("Contact number is required"),
      role: yup.string().required("Role is required"),
      department: yup.string().required("Department is required"),
    }),
  });

const EvaluatorLoginForm = ({
  formType = "login",
  setView,
  handleSuccess,
  handleError,
}) => {
  const [currentFormType, setCurrentFormType] = useState(formType);
  const [departments, setDepartments] = useState([]);
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

  // Fetch departments when component mounts or form type changes to signup
  useEffect(() => {
    if (currentFormType === "signup") {
      fetchDepartments();
    }
  }, [currentFormType]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/evaluators/departments"
      );
      if (response.ok) {
        const departmentData = await response.json();
        setDepartments(departmentData);
      } else {
        console.error("Failed to fetch departments");
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (currentFormType === "signup") {
        console.log("Registration data being sent:", data); // Debug log

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
              name: data.name,
              contactNumber: data.contactNumber,
              role: data.role,
              department: data.department,
            }),
          }
        );

        // Get the response text/json for better error handling
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          result = await response.text();
        }

        console.log("Registration response:", result); // Debug log

        if (!response.ok) {
          // Show the actual server error message
          const errorMessage =
            typeof result === "string"
              ? result
              : result.message || "Registration failed.";
          handleError(errorMessage);
          return;
        }

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

        if (
          response.status === 200 &&
          typeof result === "object" &&
          result !== null
        ) {
          // Store evaluatorId in localStorage if present
          if ("evaluatorId" in result) {
            localStorage.setItem("evaluatorId", result.evaluatorId);
            localStorage.setItem("userType", "evaluator");
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
      console.error("Registration error:", error); // Debug log
      handleError("Something went wrong. Please try again.");
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {currentFormType === "signup" && (
            <StyledTextField
              type="text"
              fullWidth
              placeholder="Enter your full name"
              variant="outlined"
              size="small"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}

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

          {currentFormType === "signup" && (
            <>
              <StyledTextField
                type="tel"
                fullWidth
                placeholder="Enter your contact number"
                variant="outlined"
                size="small"
                {...register("contactNumber")}
                error={!!errors.contactNumber}
                helperText={errors.contactNumber?.message}
              />

              <StyledTextField
                type="text"
                fullWidth
                placeholder="Enter your role"
                variant="outlined"
                size="small"
                {...register("role")}
                error={!!errors.role}
                helperText={errors.role?.message}
              />

              <StyledTextField
                select
                fullWidth
                placeholder="Select your department"
                variant="outlined"
                size="small"
                {...register("department")}
                error={!!errors.department}
                helperText={errors.department?.message}
              >
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <MenuItem
                      key={dept.departmentId}
                      value={dept.departmentName}
                    >
                      {dept.departmentName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    Loading departments...
                  </MenuItem>
                )}
              </StyledTextField>
            </>
          )}

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
          {currentFormType === "login" && (
            <Stack direction="row" justifyContent="flex-start">
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/evaluator/forget-password")}
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
            </Stack>
          )}

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
