import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./routes";
import useResponseHandler from "./utils/useResponseHandler";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
