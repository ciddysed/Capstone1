import React, { useState, useEffect } from "react";
import {
  Paper,
  Stack,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";

const EvaluatorHomePage = () => {
  const navigate = useNavigate();
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  // New state for dashboard stats
  const [dashboardData, setDashboardData] = useState({
    pendingEvaluations: 0,
    totalEvaluations: 0,
    recentForwarded: [],
    evaluationsByStatus: { APPROVED: 0, REJECTED: 0, PENDING: 0 },
  });
  const [evaluatorStatus, setEvaluatorStatus] = useState("PENDING");

  // Function to check registration status and dashboard data
  const checkStatus = () => {
    setLoading(true);

    // First check evaluator status
    fetch(`http://localhost:8080/api/evaluators/${evaluatorId}/status`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluatorStatus(data.status || "PENDING");

        // If approved, fetch dashboard data
        if (data.status === "APPROVED") {
          return fetchDashboardData();
        }
      })
      .catch((err) => {
        console.error("Error fetching evaluator status:", err);
      })
      .finally(() => {
        setLoading(false);
        setLastChecked(new Date());
      });
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch pending applications forwarded by admin
      const pendingRes = await fetch(
        `http://localhost:8080/api/applicants/forwarded/${evaluatorId}`
      );
      const pendingData = await pendingRes.json();

      // Fetch all evaluations done by this evaluator
      const evalRes = await fetch(
        `http://localhost:8080/api/evaluations/evaluator/${evaluatorId}/stats`
      );
      const evalData = await evalRes.json();

      // Fetch recently forwarded applications
      const recentRes = await fetch(
        `http://localhost:8080/api/applicants/forwarded/${evaluatorId}/recent`
      );
      const recentData = await recentRes.json();

      setDashboardData({
        pendingEvaluations: Array.isArray(pendingData) ? pendingData.length : 0,
        totalEvaluations: evalData.total || 0,
        evaluationsByStatus: evalData.byStatus || {
          APPROVED: 0,
          REJECTED: 0,
          PENDING: 0,
        },
        recentForwarded: Array.isArray(recentData) ? recentData : [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    // Initial check on component mount
    checkStatus();

    // Optional: Set up periodic checks
    const interval = setInterval(checkStatus, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (evaluatorStatus !== "APPROVED") {
    return (
      <MainLayout background={backgroundImage}>
        <Stack height="60vh" alignItems="center" justifyContent="center">
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 2,
              }}
            >
              <CircularProgress color="warning" size={60} thickness={4} />
            </Box>

            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your registration has been received and is being processed by
              administrators.
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Once approved, you will have access to the evaluation system. You
              will receive an email notification when your account is ready.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                color="warning"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                onClick={checkStatus}
                disabled={loading}
                sx={{ mb: 1 }}
              >
                {loading ? "Checking..." : "Check Status"}
              </Button>
              <Typography variant="caption" color="text.secondary">
                Last checked: {lastChecked.toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </MainLayout>
    );
  }

  // If approved, show the dashboard
  return (
    <MainLayout>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Evaluator Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#e3f2fd", borderLeft: "4px solid #1976d2" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Pending Evaluations
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 2, fontWeight: 600, color: "#1976d2" }}
              >
                {dashboardData.pendingEvaluations}
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigate("/evaluator/applicants")}
              >
                View Applications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#f0f4c3", borderLeft: "4px solid #7cb342" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Approved Applications
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 2, fontWeight: 600, color: "#7cb342" }}
              >
                {dashboardData.evaluationsByStatus.APPROVED || 0}
              </Typography>
              <Chip
                size="small"
                label={`${
                  Math.round(
                    (dashboardData.evaluationsByStatus.APPROVED /
                      (dashboardData.totalEvaluations || 1)) *
                      100
                  ) || 0
                }% of total`}
                sx={{
                  mt: 1,
                  bgcolor: "rgba(124, 179, 66, 0.2)",
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: "#ffebee", borderLeft: "4px solid #e57373" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Rejected Applications
              </Typography>
              <Typography
                variant="h4"
                sx={{ mt: 2, fontWeight: 600, color: "#e57373" }}
              >
                {dashboardData.evaluationsByStatus.REJECTED || 0}
              </Typography>
              <Chip
                size="small"
                label={`${
                  Math.round(
                    (dashboardData.evaluationsByStatus.REJECTED /
                      (dashboardData.totalEvaluations || 1)) *
                      100
                  ) || 0
                }% of total`}
                sx={{
                  mt: 1,
                  bgcolor: "rgba(229, 115, 115, 0.2)",
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Forwarded Applications */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Recently Forwarded Applications</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/evaluator/applicants")}
                endIcon={<AssignmentIcon />}
              >
                View All
              </Button>
            </Box>

            {dashboardData.recentForwarded.length > 0 ? (
              <List>
                {dashboardData.recentForwarded.slice(0, 5).map((app, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate("/evaluator/applicants/view-applicant", {
                            state: { applicantId: app.applicantId },
                          })
                        }
                      >
                        Evaluate
                      </Button>
                    }
                    divider={index < dashboardData.recentForwarded.length - 1}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "#ffb74d" }}>
                        <PendingActionsIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${app.firstName} ${app.lastName}`}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {app.coursePreference || "Course preference pending"}
                          </Typography>
                          <br />
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            Forwarded:{" "}
                            {new Date(app.forwardedAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <AccessTimeIcon
                  sx={{ fontSize: 60, color: "#bdbdbd", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No applications have been forwarded to you yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Administrators will forward applications for your evaluation
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default EvaluatorHomePage;
