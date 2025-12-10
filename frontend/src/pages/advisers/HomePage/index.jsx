import React from "react";
import { Paper, Stack, Typography } from "@mui/material";
import MainLayout from "../../../templates/MainLayout";

const AdviserHomePage = () => {
  return (
    <MainLayout userType="adviser" data="Adviser Portal">
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 960 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome, Adviser
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your dashboard will appear here. Use the navigation to review applicants once the adviser workflows are enabled.
          </Typography>
        </Paper>
      </Stack>
    </MainLayout>
  );
};

export default AdviserHomePage;
