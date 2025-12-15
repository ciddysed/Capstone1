import React, { useState } from "react";
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
} from "@mui/material";
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";

import { useNavigate } from "react-router-dom";
import Accreditations from "../../../pages/evaluators/Accreditations/Accreditations";
import AccreditedAccounts from "../../../pages/evaluators/Accreditations/AccreditedAccounts";
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

  // Get evaluator ID from localStorage
  // const evaluatorId = localStorage.getItem("evaluatorId");

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