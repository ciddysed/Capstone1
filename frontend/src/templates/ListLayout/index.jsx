import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  Button,
  Stack,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../assets/logo.png";
import backgroundImage from "../../assets/login-bg.png";
import { useNavigate } from "react-router-dom";

const ListLayout = ({ children }) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const [activeButton, setActiveButton] = useState("Dashboard");

  const navItems = ["Applicants", "Logout"];

  const handleNotificationClick = () => {
    navigate("/login");
  };

  const handleNavItemClick = (item) => {
    setActiveButton(item);

    if (item === "Applicants") {
      navigate("/evaluator/applicants");
    } else if (item === "Logout") {
      navigate("/evaluator/login");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Left NavBar */}
      <Box sx={{ width: 240, bgcolor: "#800000", color: "white", p: 2 }}>
        {/* Logo */}
        <Stack
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            p: 1,
            mb: 2,
            alignItems: "center",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: 100 }} />
        </Stack>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
        <Stack>
          <List>
            {navItems.map((item) => (
              <ListItem key={item} disablePadding sx={{ my: 1 }}>
                <Button
                  fullWidth
                  onClick={() => handleNavItemClick(item)}
                  sx={{
                    justifyContent: "flex-start",
                    color: activeButton === item ? "#000" : "#fff",
                    bgcolor: activeButton === item ? "#FFD700" : "transparent",
                    "&:hover": {
                      bgcolor:
                        activeButton === item
                          ? "#FFD700"
                          : "rgba(255,255,255,0.1)",
                    },
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  {item}
                </Button>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>

      {/* Right Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
        }}
      >
        {" "}
        <Box sx={{ flexShrink: 0, bgcolor: "transparent", zIndex: 1100 }}>
          {/* Top Bar */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", p: 0 }}>
              <Typography variant="h6" fontWeight="bold">
                Applicants
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                    sx: { borderRadius: 5, bgcolor: "#fff" },
                  }}
                />
                <IconButton onClick={handleNotificationClick}>
                  <NotificationsIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        </Box>
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            bgcolor: "transparent",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ListLayout;
