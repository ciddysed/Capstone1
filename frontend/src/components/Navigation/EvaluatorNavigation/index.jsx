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
  FormControl,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Accreditations from "../../../pages/evaluators/Accreditations/Accreditations";
import AccreditedAccounts from "../../../pages/evaluators/Accreditations/AccreditedAccounts";
import GradedAccreditation from "../../../pages/evaluators/Accreditations/GradedAccreditation";
import NotificationCenter from "../../Notifications/NotificationCenter";
import { handleLogout } from "../../../utils/logoutUtils";

const EvaluatorNavigation = ({ children, initialGradedState = null }) => {
  const [activeButton, setActiveButton] = useState("Applicants");
  const [gradedAccreditationState, setGradedAccreditationState] = useState(initialGradedState);
  const navItems = ["Applicants", "Accreditations", "Accredited Applicants", "Graded", "Logout"];
  const navigate = useNavigate();

  const handleNavItemClick = (item) => {
    setActiveButton(item);

    if (item === "Logout") {
      handleLogout(navigate);
    }
  };

  // Function to handle graded accreditation navigation
  const handleGradedAccreditationNavigation = (applicantId, curriculumId) => {
    setGradedAccreditationState({ applicantId, curriculumId });
    setActiveButton("Graded");
  };

  // Function to render the appropriate content based on active button
  const renderContent = () => {
    switch (activeButton) {
      case "Applicants":
        return children;
      case "Accreditations":
        return <Accreditations onNavigateToGraded={handleGradedAccreditationNavigation} />;
      case "Accredited Applicants":
        return <AccreditedAccounts onNavigateToGraded={handleGradedAccreditationNavigation} />;
      case "Graded":
        return <GradedAccreditation 
          applicantId={gradedAccreditationState?.applicantId} 
          curriculumId={gradedAccreditationState?.curriculumId} 
        />;
      default:
        return children;
    }
  };

  // Function to get the appropriate title for the top bar
  const getPageTitle = () => {
    switch (activeButton) {
      case "Applicants":
        return "Applicants";
      case "Accreditations":
        return "Accreditations";
      case "Accredited Applicants":
        return "Accredited Applicants";
      case "Graded":
        return "Graded Accreditation";
      default:
        return "Applicants";
    }
  };

  // Function to determine if filters should be shown
  const shouldShowFilters = () => {
    return activeButton === "Applicants";
  };

  // Get evaluator ID from localStorage
  const evaluatorId = localStorage.getItem("evaluatorId");

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
        <Box sx={{ flexShrink: 0, bgcolor: "transparent", zIndex: 1100 }}>
          {/* Top Bar */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", p: 0 }}>
              <Typography variant="h6" fontWeight="bold">
                {getPageTitle()}
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
                
                {/* Replace the notification icon with the NotificationCenter component */}
                <NotificationCenter userType="evaluator" userId={evaluatorId} />
                
              </Box>
            </Toolbar>
          </AppBar>

          {/* Filters - Only show for Applicants */}
          {shouldShowFilters() && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                flexWrap: "wrap",
                px: 2,
                py: 1,
                position: "sticky",
                top: "64px",
                zIndex: 1000,
              }}
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Course</InputLabel>
                <Select label="Course" defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="BSIT">BSIT</MenuItem>
                  <MenuItem value="BSA">BSA</MenuItem>
                  <MenuItem value="BSBA">BSBA</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select label="Category" defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Scholarship">Scholarship</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Date Applied"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
                defaultValue={dayjs().format("YYYY-MM-DD")}
              />
            </Box>
          )}
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

export default EvaluatorNavigation;