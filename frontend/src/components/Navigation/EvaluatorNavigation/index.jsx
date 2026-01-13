import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  Button,
  Stack,
  Paper,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";

import { useNavigate } from "react-router-dom";
import Accreditations from "../../../pages/evaluators/Accreditations/Accreditations";
import AccreditedAccounts from "../../../pages/evaluators/Accreditations/AccreditedAccounts";
import { handleLogout } from "../../../utils/logoutUtils";
import EvaluatorNotificationCenter from '../../Notifications/EvaluatorNotificationCenter';
import EvaluatorChat from './EvaluatorChat';

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
  const [evaluatorStatus, setEvaluatorStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date());
  const navigate = useNavigate();
  const evaluatorId = localStorage.getItem("evaluatorId");

  // Registration status check logic (global block)
  const checkStatus = () => {
    if (!evaluatorId) return;
    setLoadingStatus(true);
    fetch(`https://eteeap-foth.onrender.com/api/evaluators/${evaluatorId}/status`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluatorStatus(data.status || "PENDING");
      })
      .catch((err) => {
        setEvaluatorStatus("PENDING");
        console.error("Error checking status:", err);
      })
      .finally(() => {
        setLoadingStatus(false);
        setLastChecked(new Date());
      });
  };

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavItemClick = (itemKey) => {
    setActiveButton(itemKey);
    if (itemKey === "Logout") handleLogout(navigate);
  };

  const renderContent = () => {
    // Universal block: If not approved, always show Registration In Progress
    if (loadingStatus || evaluatorStatus !== "APPROVED") {
      return (
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              px: 4,
              py: 3,
              backgroundColor: "#fff8dc",
              maxWidth: 500,
              textAlign: "center",
              borderLeft: "8px solid #fdd835",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              mb={2}
            >
              <InfoIcon color="warning" fontSize="large" />
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Registration In Progress
              </Typography>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress color="warning" size={60} thickness={4} />
            </Box>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your registration has been received and is being processed by administrators.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Once approved, you will have access to the evaluation system. You will receive an email notification when your account is ready.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={loadingStatus ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={checkStatus}
                disabled={loadingStatus}
                sx={{ mb: 1 }}
              >
                {loadingStatus ? "Checking..." : "Check Status"}
              </Button>
              <Typography variant="caption" color="text.secondary">
                Last checked: {lastChecked.toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      );
    }

    // Only render actual content if approved
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
            <Toolbar sx={{ justifyContent: "space-between", py: 1, px: 2, minHeight: 48 }}>
              <Typography variant="h6" fontWeight="600" fontSize={18}>
                {getPageTitle()}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <EvaluatorNotificationCenter evaluatorId={evaluatorId} />
                <EvaluatorChat evaluatorId={evaluatorId} />
              </Box>
            </Toolbar>
          </AppBar>
        </Box>
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
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