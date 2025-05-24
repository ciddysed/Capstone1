import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Button,
  Stack,
  styled,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  alpha,
  createTheme,
  ThemeProvider,
  Grow,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PeopleIcon from "@mui/icons-material/People";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MainLayout from "../../../templates/MainLayout";

// Custom maroon and gold color palette
const maroon = {
  light: "#8D323C",
  main: "#6A0000",
  dark: "#450000",
  contrastText: "#FFFFFF",
};

const gold = {
  light: "#FFF0B9",
  main: "#FFC72C",
  dark: "#D4A500",
  contrastText: "#000000",
};

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

// Enhanced styled components
const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: "0 8px 40px -12px rgba(106, 0, 0, 0.2)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 45px -10px rgba(106, 0, 0, 0.25)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  padding: "12px 24px",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(106, 0, 0, 0.25)",
    transform: "translateY(-2px)",
  },
  transition: "all 0.2s ease",
}));

const WelcomeCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${maroon.main}, ${maroon.light})`,
  color: maroon.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 12px 32px rgba(106, 0, 0, 0.3)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "40%",
    height: "100%",
    background: `linear-gradient(45deg, transparent, ${alpha(gold.main, 0.2)})`,
    borderRadius: "50% 0 0 50%",
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: "all 0.3s ease",
  border: `2px solid ${alpha(maroon.main, 0.1)}`,
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(106, 0, 0, 0.15)",
    borderColor: gold.main,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  borderLeft: `4px solid ${gold.main}`,
  backgroundColor: alpha(gold.light, 0.1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(gold.light, 0.2),
    transform: "scale(1.02)",
  },
}));

const EvaluationsPage = () => {
  const navigate = useNavigate();
  const [userFullName, setUserFullName] = useState("Evaluator");
  const [evaluatorDepartment, setEvaluatorDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch evaluator information
    const evaluatorId = localStorage.getItem("evaluatorId");
    if (evaluatorId) {
      fetchEvaluatorInfo(evaluatorId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvaluatorInfo = async (evaluatorId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/evaluators/${evaluatorId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserFullName(data.name || "Evaluator");
        // Extract department name from the department object
        const departmentName = data.department?.departmentName || data.department || "";
        setEvaluatorDepartment(departmentName);
      }
    } catch (error) {
      console.error("Error fetching evaluator info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/evaluator/homepage");
  };

  const handleNavigateToApplicants = () => {
    navigate("/evaluator/applicants");
  };

  const handleNavigateToEvaluations = () => {
    navigate("/evaluator/evaluations");
  };

  if (loading) {
    return (
      <ThemeProvider theme={customTheme}>
        <MainLayout>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "50vh",
            }}
          >
            <CircularProgress sx={{ color: maroon.main }} size={60} />
          </Box>
        </MainLayout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={customTheme}>
      <MainLayout>
        <Grow in={true} timeout={500}>
          <Box sx={{ p: 2 }}>
            {/* Header with Navigation */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title="Back to Main Dashboard" arrow>
                  <IconButton
                    onClick={handleBackToHome}
                    sx={{
                      bgcolor: maroon.main,
                      color: "white",
                      width: 48,
                      height: 48,
                      "&:hover": {
                        bgcolor: maroon.dark,
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={maroon.dark}
                    sx={{
                      borderBottom: `3px solid ${gold.main}`,
                      paddingBottom: 1,
                      display: "inline-block",
                    }}
                  >
                    Evaluator Dashboard
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Welcome back! Manage your evaluations and view department
                    insights
                  </Typography>
                  {evaluatorDepartment && (
                    <Typography
                      variant="body2"
                      color={maroon.main}
                      sx={{
                        mt: 0.5,
                        fontWeight: 600,
                        fontStyle: "italic",
                      }}
                    >
                      Department: {evaluatorDepartment}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Welcome Section */}
              <Grid item xs={12}>
                <WelcomeCard>
                  <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                          <Typography variant="h5" fontWeight="bold">
                            Hello, {userFullName}! 👋
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            Ready to review applications and help students achieve
                            their educational goals through ETEEAP?
                          </Typography>
                          <Stack direction="row" spacing={2}>
                            <ActionButton
                              variant="contained"
                              startIcon={<PeopleIcon />}
                              onClick={handleNavigateToApplicants}
                              sx={{
                                backgroundColor: gold.main,
                                color: gold.contrastText,
                                "&:hover": {
                                  backgroundColor: gold.dark,
                                },
                              }}
                            >
                              View Applicants
                            </ActionButton>
                            <ActionButton
                              variant="outlined"
                              startIcon={<AssessmentIcon />}
                              onClick={handleNavigateToEvaluations}
                              sx={{
                                borderColor: "white",
                                color: "white",
                                "&:hover": {
                                  borderColor: gold.light,
                                  backgroundColor: alpha("white", 0.1),
                                },
                              }}
                            >
                              My Evaluations
                            </ActionButton>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: alpha("white", 0.2),
                            fontSize: "3rem",
                            fontWeight: "bold",
                            mx: "auto",
                            border: `3px solid ${alpha("white", 0.3)}`,
                          }}
                        >
                          {userFullName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </Avatar>
                      </Grid>
                    </Grid>
                  </CardContent>
                </WelcomeCard>
              </Grid>

              {/* Quick Stats */}
              <Grid item xs={12} md={4}>
                <StatCard>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <TrendingUpIcon
                      sx={{ fontSize: 48, color: gold.main, mb: 1 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={maroon.dark}
                    >
                      Active Evaluations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stay updated with your current workload
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StatCard>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <WorkIcon sx={{ fontSize: 48, color: maroon.main, mb: 1 }} />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={maroon.dark}
                    >
                      Department Focus
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Specialized evaluation in your field
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StatCard>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <DashboardIcon
                      sx={{ fontSize: 48, color: gold.dark, mb: 1 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={maroon.dark}
                    >
                      Evaluation Tools
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access comprehensive review features
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>

              {/* Feature Cards */}
              <Grid item xs={12} md={6}>
                <FeatureCard>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        sx={{
                          bgcolor: alpha(maroon.main, 0.1),
                          color: maroon.main,
                        }}
                      >
                        <PeopleIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Review Applications
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Evaluate student applications, review their portfolios, and
                          provide comprehensive assessments for ETEEAP eligibility.
                        </Typography>
                        <ActionButton
                          variant="outlined"
                          onClick={handleNavigateToApplicants}
                          sx={{
                            borderColor: maroon.main,
                            color: maroon.main,
                            "&:hover": {
                              borderColor: maroon.dark,
                              backgroundColor: alpha(maroon.main, 0.1),
                            },
                          }}
                        >
                          Start Reviewing
                        </ActionButton>
                      </Box>
                    </Stack>
                  </CardContent>
                </FeatureCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <FeatureCard>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        sx={{
                          bgcolor: alpha(gold.main, 0.2),
                          color: gold.dark,
                        }}
                      >
                        <AssessmentIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Track Progress
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          Monitor your evaluation history, track completion rates, and
                          manage your assessment workflow efficiently.
                        </Typography>
                        <ActionButton
                          variant="outlined"
                          onClick={handleNavigateToEvaluations}
                          sx={{
                            borderColor: gold.main,
                            color: gold.dark,
                            "&:hover": {
                              borderColor: gold.dark,
                              backgroundColor: alpha(gold.main, 0.1),
                            },
                          }}
                        >
                          View History
                        </ActionButton>
                      </Box>
                    </Stack>
                  </CardContent>
                </FeatureCard>
              </Grid>

              {/* Information Section */}
              <Grid item xs={12}>
                <AnimatedPaper
                  elevation={2}
                  sx={{ p: 3, bgcolor: alpha(gold.light, 0.1) }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    color={maroon.dark}
                  >
                    📋 Evaluation Guidelines
                  </Typography>
                  <Divider sx={{ my: 2, borderColor: gold.main }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Quality Assessment
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ensure thorough review of all submitted materials and
                        documentation
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Timely Reviews
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Complete evaluations within the designated timeframe for
                        student progress
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Fair Evaluation
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Maintain objectivity and consistency in all assessment
                        criteria
                      </Typography>
                    </Grid>
                  </Grid>
                </AnimatedPaper>
              </Grid>
            </Grid>
          </Box>
        </Grow>
      </MainLayout>
    </ThemeProvider>
  );
};

export default EvaluationsPage;