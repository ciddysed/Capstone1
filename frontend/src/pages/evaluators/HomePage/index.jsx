
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import EvaluatorNavigation from "../../../components/Navigation/EvaluatorNavigation";
import { useNavigate } from "react-router-dom";

// Reusable polling hook
function usePolling(fetchFunction, intervalMs = 10000) {
  const intervalRef = useRef();
  const startPolling = useCallback(() => {
    fetchFunction();
    intervalRef.current = setInterval(fetchFunction, intervalMs);
  }, [fetchFunction, intervalMs]);
  useEffect(() => {
    startPolling();
    return () => clearInterval(intervalRef.current);
  }, [startPolling]);
}

const EvaluatorHomePage = () => {
  const navigate = useNavigate();
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [evaluatorStatus, setEvaluatorStatus] = useState("PENDING");

  // Function to check registration status
  const checkStatus = useCallback(() => {
    setLoading(true);
    fetch(`https://eteeap-foth.onrender.com/api/evaluators/${evaluatorId}/status`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluatorStatus(data.status || "PENDING");
        // If approved, navigate directly to assigned evaluations
        if (data.status === "APPROVED") {
          navigate("/evaluator/applicants");
        }
      })
      .catch((err) => {
        console.error("Error fetching evaluator status:", err);
      })
      .finally(() => {
        setLoading(false);
        setLastChecked(new Date());
      });
  }, [evaluatorId, navigate]);

  // Poll evaluator status every 10 seconds
  usePolling(checkStatus, 10000);

  if (evaluatorStatus !== "APPROVED") {
    return (
      <EvaluatorNavigation>
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
      </EvaluatorNavigation>
    );
  }

  // If approved, the user will be redirected to /evaluator/applicants
  // This return is just a fallback that should rarely be seen
  return null;
};

export default EvaluatorHomePage;