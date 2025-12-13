import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRoutes from "./routes";
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
          <Route path="/adviser/login" element={<AdviserLoginPage />} />
          <Route path="/evaluator/login" element={<EvaluatorLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
