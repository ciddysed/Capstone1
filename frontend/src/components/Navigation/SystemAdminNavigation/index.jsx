import React, { useState } from "react";
import {
  Box,
  Typography,
  InputBase,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  Button,
  Stack,
  
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";
import PropTypes from 'prop-types';

// Import the content components
import EvaluatorManagementContent from "../../../pages/SystemAdmin/EvaluatorManagement/EvaluatorManagementContent";
import CurriculumManagement from "../../../pages/SystemAdmin/ApplicantDetailsPage/curriculumManagement";
import NotificationCenter from "../../Notifications/NotificationCenter";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

// Reduced imports and removed unused styled table/chip components.

// Status color mapping (kept inline where needed)

const SystemAdminNavigation = ({ children, activeTab = "Evaluator Management" }) => {
  const location = useLocation(); // Add this
  const [activeButton, setActiveButton] = useState(
    location.state?.defaultTab || activeTab
  );
  const navItems = ["Evaluator Management", "Curriculum Management", "Logout"];
  const navigate = useNavigate();

  const handleNavItemClick = (item) => {
    setActiveButton(item);

    if (item === "Logout") {
      // Clear all localStorage data
      localStorage.clear();
      
      // Redirect to program-admin login page
      navigate("/system-admin/login");
    }
  };

  // Function to render the appropriate content based on active button
  const renderContent = () => {
    switch (activeButton) {
      case "Evaluator Management":
        return <EvaluatorManagementContent />;
      case "Curriculum Management":
        return <CurriculumManagement />;
      default:
        return children;
    }
  };

  // Function to get the appropriate title for the top bar
  const getPageTitle = () => {
    return activeButton;
  };

  // Get system admin ID from localStorage
  const systemAdminId = localStorage.getItem("systemAdminId");

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
      <Box sx={{ width: 240, bgcolor: maroon.main, color: "white", p: 2 }}>
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
                    bgcolor: activeButton === item ? gold.main : "transparent",
                    "&:hover": {
                      bgcolor:
                        activeButton === item
                          ? gold.main
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
        <Box sx={{ flexShrink: 0, bgcolor: "transparent", zIndex: 1100 }}>
          {/* Top Bar */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", p: 0 }}>
              <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                {getPageTitle()}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', px: 1, py: 0.25, borderRadius: 2 }}>
                  <SearchIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.6)' }} />
                  <InputBase placeholder="Search..." sx={{ ml: 0, flex: 1 }} />
                </Box>
                
                {/* Replace the notification icon with the NotificationCenter component */}
                <NotificationCenter userType="system-admin" userId={systemAdminId} />
                
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
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

SystemAdminNavigation.propTypes = {
  children: PropTypes.node,
  activeTab: PropTypes.string,
};

export default SystemAdminNavigation;