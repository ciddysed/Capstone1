import React, { useState } from "react";
import {
  Box,
  Typography,
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
import SearchIcon from "@mui/icons-material/Search";
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Accreditations from "../../../pages/evaluators/Accreditations/Accreditations";
import AccreditedAccounts from "../../../pages/evaluators/Accreditations/AccreditedAccounts";
import NotificationCenter from "../../Notifications/NotificationCenter";
import { handleLogout } from "../../../utils/logoutUtils";

const EvaluatorNavigation = ({ children }) => {
  const sections = [
    {
      title: "Evaluation",
      items: [{ key: "ApplicantsEval", label: "Applicants for Evaluation" }],
    },
    {
      title: "Accreditation",
      items: [
        { key: "ApplicantsAccred", label: "Applicants for Accreditations" },
        { key: "Accredited", label: "Accredited Applicants" },
      ],
    },
    { title: "", items: [{ key: "Logout", label: "Logout" }] },
  ];
  const [activeButton, setActiveButton] = useState("ApplicantsEval");
  const navigate = useNavigate();

  const handleNavItemClick = (itemKey) => {
    setActiveButton(itemKey);
    if (itemKey === "Logout") handleLogout(navigate);
  };

  const renderContent = () => {
    switch (activeButton) {
      case "ApplicantsEval":
        return children;
      case "ApplicantsAccred":
        return <Accreditations />;
      case "Accredited":
        return <AccreditedAccounts />;
      default:
        return children;
    }
  };

  const getPageTitle = () => {
    switch (activeButton) {
      case "ApplicantsEval":
        return "Applicants for Evaluation";
      case "ApplicantsAccred":
        return "Applicants for Accreditations";
      case "Accredited":
        return "Accredited Applicants";
      default:
        return "Applicants for Evaluation";
    }
  };

  const shouldShowFilters = () => activeButton === "ApplicantsEval";

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
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {sections.map((section) => (
            <Box key={section.title || "misc"}>
              {section.title && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    pl: 1,
                    pb: 0.5,
                    display: "block",
                  }}
                >
                  {section.title}
                </Typography>
              )}
              <List sx={{ py: 0 }}>
                {section.items.map((item) => (
                  <ListItem key={item.key} disablePadding sx={{ my: 0.5 }}>
                    <Button
                      fullWidth
                      onClick={() => handleNavItemClick(item.key)}
                      sx={{
                        justifyContent: "flex-start",
                        color: activeButton === item.key ? "#000" : "#fff",
                        bgcolor:
                          activeButton === item.key ? "#FFD700" : "transparent",
                        "&:hover": {
                          bgcolor:
                            activeButton === item.key
                              ? "#FFD700"
                              : "rgba(255,255,255,0.1)",
                        },
                        textTransform: "none",
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                      }}
                    >
                      {item.label}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
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
            px: 1,
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