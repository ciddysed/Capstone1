import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRoutes from "./routes";
import SystemAdminNavigation from "./components/Navigation/SystemAdminNavigation";
import CurriculumRouter from "./pages/SystemAdmin/ApplicantDetailsPage/curriculumRouter";
import ToastProvider from "./components/ToastProvider";

// Optional: Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#800000", // Maroon
    },
    secondary: {
      main: "#FFD700", // Gold
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider />
      <Router>
        <Routes>
          <Route
            path="/system-admin/curriculum/:curriculumId"
            element={
              <SystemAdminNavigation activeTab="Curriculum Management">
                <CurriculumRouter />
              </SystemAdminNavigation>
            }
          />
          <AppRoutes />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
