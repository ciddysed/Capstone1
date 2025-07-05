import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Stack,
  Container,
  IconButton,
  Popover,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Box,
  Paper,
} from "@mui/material";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AccountCircle, Logout, Person as UserIcon, School as GraduationCapIcon } from "@mui/icons-material"; // Import logout icon
import backgroundImage from "../../assets/login-bg.png";

// Maroon and Gold theme colors
const maroonTheme = {
  primary: {
    main: '#800000', // Deep maroon
    light: '#A0001A', // Lighter maroon
    dark: '#600000', // Darker maroon
  },
  secondary: {
    main: '#B8860B', // Dark goldenrod
    light: '#FFD700', // Gold
    dark: '#8B6F00' // Darker gold
  }
}

const MainLayout = ({ children, userType, data = "Account" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("applicantId");
    localStorage.removeItem("evaluatorId");
    localStorage.removeItem("userType");

    // Redirect AFTER a brief delay or state update
    setTimeout(() => {
      if (userType === "applicant") {
        navigate("/login", { replace: true });
      } else if (userType === "evaluator") {
        navigate("/evaluator/login", { replace: true });
      } else if (userType === "admin") {
        navigate("/admin/login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 0);
  };

  const open = Boolean(anchorEl);
  const userInitial = data?.charAt(0)?.toUpperCase() || "A";

  return (
    <Stack
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Enhanced Navbar */}
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 0, 
          bgcolor: maroonTheme.primary.main,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: `0 4px 20px rgba(128, 0, 0, 0.3)`
        }}
      >
        <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "white",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCapIcon sx={{ color: maroonTheme.primary.main, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="white">
                  ETEEAP PORTAL
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  {userType === "applicant" ? "Applicant Dashboard" : 
                   userType === "evaluator" ? "Evaluator Dashboard" : 
                   userType === "admin" ? "Admin Dashboard" : "User Portal"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight="medium" color="white">
                  {data || "Loading..."}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)">
                  {userType
                    ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`
                    : "User Account"}
                </Typography>
              </Box>
              <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserIcon sx={{ color: maroonTheme.primary.main, fontSize: 16 }} />
                </Box>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 220,
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            mt: 1.5,
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)`,
            border: `1px solid rgba(128, 0, 0, 0.2)`,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: maroonTheme.primary.main }}>
            {data}
          </Typography>
          <Typography variant="body2" sx={{ color: maroonTheme.primary.dark }}>
            {userType
              ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account`
              : "User Account"}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: `rgba(128, 0, 0, 0.2)` }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            "&:hover": {
              backgroundColor: `rgba(128, 0, 0, 0.08)`,
            },
          }}
        >
          <Logout
            fontSize="small"
            sx={{ mr: 1.5, color: maroonTheme.primary.main }}
          />
          <Typography variant="body2" sx={{ color: maroonTheme.primary.dark }}>Sign Out</Typography>
        </MenuItem>
      </Popover>

      {/* Main content */}
      <Container
        maxWidth="lg"
        sx={{ py: 4, alignItems: "center", justifyContent: "center", paddingTop: "120px" }}
      >
        {children}
      </Container>
    </Stack>
  );
};

export default MainLayout;
