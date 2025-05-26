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
} from "@mui/material";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AccountCircle, Logout } from "@mui/icons-material"; // Import logout icon
import backgroundImage from "../../assets/login-bg.png";

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
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {/* Left: Logo */}
            <img src={logo} alt="Logo" style={{ height: 50 }} />

            {/* Right: Avatar and Popover */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* TODO: Uncomment when data is already set */}
              {/* <Typograpbhy variant="subtitle1" sx={{ fontWeight: 500 }}>
                {data}
              </Typography> */}

              <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor: "#800000", // Maroon color
                    color: "white",
                    width: 40,
                    height: 40,
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {data ? (
                    userInitial
                  ) : (
                    <AccountCircle sx={{ color: "white" }} />
                  )}
                </Avatar>
              </IconButton>

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
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {data}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userType
                      ? `${
                          userType.charAt(0).toUpperCase() + userType.slice(1)
                        } Account`
                      : "User Account"}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(128, 0, 0, 0.08)",
                    },
                  }}
                >
                  <Logout
                    fontSize="small"
                    sx={{ mr: 1.5, color: "text.secondary" }}
                  />
                  <Typography variant="body2">Sign Out</Typography>
                </MenuItem>
              </Popover>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container
        maxWidth="lg"
        sx={{ py: 4, alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </Container>
    </Stack>
  );
};

export default MainLayout;
