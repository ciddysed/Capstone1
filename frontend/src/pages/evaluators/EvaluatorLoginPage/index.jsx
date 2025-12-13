import React, { useState } from "react";
import {
  Stack,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LoginLayout from "../../../components/Login/LoginLayout";
import {
  StyledTextField,
  LoginButton,
  SecondaryButton,
  maroon,
} from "../../../components/Login/LoginStyles";

const EvaluatorLoginPage = () => {
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
      const response = await fetch("https://eteeap-foth.onrender.com/api/evaluators/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        setError(text || "Server error. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Login response:", data); // Debug log

      if (response.ok) {
        // Clear any existing IDs first
        localStorage.removeItem("applicantId");
        localStorage.removeItem("evaluatorId");
        localStorage.removeItem("adviserId");
        localStorage.removeItem("programAdminId");
        localStorage.removeItem("systemAdminId");

        // Store the evaluator ID - check different possible field names
        const evaluatorId = data.evaluatorId || data.id || data.userId || data.evaluator_id;
        if (evaluatorId) {
          localStorage.setItem("evaluatorId", evaluatorId);
        }
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem("evaluatorToken", data.token);
        }
        
        localStorage.setItem("userType", "evaluator");

        // Check if admin
        const isAdmin = data.admin || data.isAdmin || (data.role && data.role.toLowerCase() === "admin");
        
        if (isAdmin) {
          navigate("/evaluator/applicants");
        } else {
          navigate("/evaluator/homepage");
        }
      } else {
        setError(data.message || data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
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

          <SecondaryButton
            fullWidth
            variant="outlined"
            onClick={() => navigate("/")}
          >
            Back to Home
          </SecondaryButton>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Having trouble signing in?{" "}
            <Link href="#" sx={{ color: maroon.main, fontWeight: 600 }}>
              Contact Admin
            </Link>
          </Typography>
        </Stack>
      </form>
    </LoginLayout>
  );
};

export default EvaluatorLoginPage;
