// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/applicants/LoginPage";
import SetUpProfilePage from "../pages/applicants/SetUpProfile";
import Homepage from "../pages/applicants/HomePage";
import ProtectedRoute from "./ProtectedRoutes";
import ApplicationTrack from "../pages/ApplicationTrack";
import ApplicationForm from "../pages/AppCoursePreference";
import ProgramShowcase from "../pages/ProgramShowcase";
import EvaluatorsLoginPage from "../pages/evaluators/LoginPage";
import EvaluatorHomePage from "../pages/evaluators/HomePage";
import ApplicantsListPage from "../pages/evaluators/ApplicantsListPage";
import ViewApplicantPage from "../pages/evaluators/ViewApplicantPage";
import OrganizedCourseDialog from "../components/OrganizedCourseDialog";
import DocumentPreviewPage from "../pages/ApplicationTrack/DocumentPreviewModal";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Evaluator Routes */}
      <Route path="/evaluator/applicants" element={<ApplicantsListPage />} />
      <Route path="/evaluator/applicants/view-applicant/:applicantId" element={<ViewApplicantPage />} />
      
      {/* Add a login route */}
      <Route path="/login" element={<Navigate to="/evaluator/applicants" replace />} />
      
      {/* Redirect to main page if no route matches */}
      <Route path="/" element={<Navigate to="/evaluator/applicants" replace />} />
      <Route path="*" element={<Navigate to="/evaluator/applicants" replace />} />
    </Routes>
  );
};

export default AppRoutes;
