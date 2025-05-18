import React, { useState, useEffect } from "react";
import {
  Paper,
  Stack,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import RefreshIcon from "@mui/icons-material/Refresh";
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";

const EvaluatorHomePage = () => {
  // Retrieve evaluatorId from localStorage (or another auth context if you use one)
  const evaluatorId = localStorage.getItem("evaluatorId");
  // Simulated data state – replace with actual logic: Temporary only, pls change if there is already a backend
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  // Function to check registration status
  const checkStatus = () => {
    setLoading(true);
    // Simulated API call - replace with actual API call
    setTimeout(() => {
      setLoading(false);
      setLastChecked(new Date());
      // Update data if necessary
    }, 1500);
  };

  useEffect(() => {
    // Initial check on component mount
    checkStatus();

    // Optional: Set up periodic checks
    const interval = setInterval(checkStatus, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout background={backgroundImage}>
      {/* Show evaluatorId for demonstration */}
      {evaluatorId && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 2 }}
        >
         
        </Typography>
      )}
      {data ? (
        <Box>
          {/* Placeholder when there's data */}
          <Typography variant="h6">Data Placeholder Here</Typography>
        </Box>
      ) : (
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
      )}
    </MainLayout>
  );
};

export default EvaluatorHomePage;
