import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./routes";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
        <Route
          path="/system-admin/curriculum/:curriculumId"
          element={
            <SystemAdminNavigation activeTab="Curriculum Management">
              <CurriculumRouter />
            </SystemAdminNavigation>
          }
        />
        {/* Applicant Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/ApplicantHomePage" element={<Homepage />} />
        <Route path="/ApplicationTrack" element={<ApplicationTracking />} />
        <Route path="/accepted-dashboard" element={<AcceptedDashboard />} />
        {/* Add these routes for the enrollment process */}
        <Route
          path="/EnrollmentPayment"
          element={<UnderConstruction pageName="Enrollment Payment" />}
        />
        <Route
          path="/Orientation"
          element={<UnderConstruction pageName="Orientation" />}
        />
        <Route
          path="/CourseRegistration"
          element={<UnderConstruction pageName="Course Registration" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// Simple Under Construction component for routes not yet implemented
const UnderConstruction = ({ pageName }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      p: 3,
    }}
  >
    <Typography variant="h4" sx={{ mb: 2, color: "#800000" }}>
      {pageName}
    </Typography>
    <Typography variant="h6" sx={{ mb: 4 }}>
      This page is under construction
    </Typography>
    <Button
      variant="contained"
      onClick={() => window.history.back()}
      sx={{
        bgcolor: "#800000",
        "&:hover": { bgcolor: "#600000" },
      }}
    >
      Go Back
    </Button>
  </Box>
);

export default App;
