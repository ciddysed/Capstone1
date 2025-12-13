import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRoutes from "./routes";
<<<<<<< HEAD
import ToastProvider from "./components/ToastProvider";
import AdviserLoginPage from "./pages/advisers/AdviserLoginPage";
import EvaluatorLoginPage from "./pages/evaluators/EvaluatorLoginPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#800000",
    },
    secondary: {
      main: "#FFD700",
=======
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
>>>>>>> 19ce17063712c10e533caa43e44952503871c35f
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
<<<<<<< HEAD
          <Route path="/adviser/login" element={<AdviserLoginPage />} />
          <Route path="/evaluator/login" element={<EvaluatorLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/*" element={<AppRoutes />} />
=======
          <Route
            path="/system-admin/curriculum/:curriculumId"
            element={
              <SystemAdminNavigation activeTab="Curriculum Management">
                <CurriculumRouter />
              </SystemAdminNavigation>
            }
          />
          <AppRoutes />
>>>>>>> 19ce17063712c10e533caa43e44952503871c35f
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
