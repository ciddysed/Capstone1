import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppRoutes from "./routes";

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
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
