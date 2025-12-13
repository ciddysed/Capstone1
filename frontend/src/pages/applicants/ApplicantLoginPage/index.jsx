import React, { useState } from "react";
import {
  Stack,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  HowToReg,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LoginLayout from "../../../components/Login/LoginLayout";
import {
  StyledTextField,
  LoginButton,
  SecondaryButton,
  maroon,
} from "../../../components/Login/LoginStyles";

const ApplicantLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://eteeap-foth.onrender.com/api/applicants/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("applicantId", data.applicantId);
        localStorage.setItem("applicantToken", data.token);
        navigate("/applicant/homepage");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout
      icon={Person}
      title="Applicant Portal"
      subtitle="Sign in to track your ETEEAP application status"
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <StyledTextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: maroon.light }} />
                </InputAdornment>
              ),
            }}
          />

          <StyledTextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: maroon.light }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" textAlign="right">
            <Link href="#" sx={{ color: maroon.main, fontWeight: 500 }}>
              Forgot Password?
            </Link>
          </Typography>

          <LoginButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </LoginButton>

          <Divider sx={{ my: 1 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <SecondaryButton
            fullWidth
            variant="outlined"
            startIcon={<HowToReg />}
            onClick={() => navigate("/applicant/register")}
          >
            Create New Application
          </SecondaryButton>

          <SecondaryButton
            fullWidth
            variant="outlined"
            onClick={() => navigate("/")}
          >
            Back to Home
          </SecondaryButton>
        </Stack>
      </form>
    </LoginLayout>
  );
};

export default ApplicantLoginPage;
