import React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";

const EvaluatorHomePage = () => {
  // Simulated data state – replace with actual logic: Temporary only, pls change if there is already a backend
  const data = null;

  return (
    <MainLayout background={backgroundImage}>
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
              backgroundColor: "#fff8dc", // light yellow
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
            <Typography variant="body1" color="text.secondary">
              Your registration is being processed. Please wait for your
              assignment.
            </Typography>
          </Paper>
        </Stack>
      )}
    </MainLayout>
  );
};

export default EvaluatorHomePage;
