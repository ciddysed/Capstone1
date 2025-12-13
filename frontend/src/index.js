import React from "react";
import ReactDOM from "react-dom/client"; // Update import to use 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // Use createRoot
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
