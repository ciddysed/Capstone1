import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./routes";
import useResponseHandler from "./utils/useResponseHandler";
import CurriculumRouter from "./pages/SystemAdmin/ApplicantDetailsPage/curriculumRouter";
import SystemAdminNavigation from "./components/SystemAdminNavigation";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<AppRoutes />} />
        <Route
          path="/system-admin/curriculum/:curriculumId"
          element={
            <SystemAdminNavigation activeTab="Curriculum Management">
              <CurriculumRouter />
            </SystemAdminNavigation>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
