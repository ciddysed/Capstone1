// src/routes/AppRoutes.jsx
import React from "react";
import { useRoutes } from "react-router-dom";
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
  return useRoutes([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/setup-profile",
      element: (
        // TODO: Uncoment all the proretced route after implementing the backend
        // <ProtectedRoute>
        <SetUpProfilePage />
        // </ProtectedRoute>
      ),
    },
    {
      path: "/homepage",
      element: (
        // <ProtectedRoute>
        <Homepage />
        // </ProtectedRoute>
      ),
    },
    {
      path: "/program-showcase",
      element: (
        <ProtectedRoute>
          <ProgramShowcase />
        </ProtectedRoute>
      ),
    },
    {
      path: "/AppCoursePreference",
      element: (
        <ProtectedRoute>
          <ApplicationForm />
        </ProtectedRoute>
      ),
    },
    {
      path: "/ApplicationTrack",
      element: (
        <ProtectedRoute>
          <ApplicationTrack />
        </ProtectedRoute>
      ),
    },
    // Add a fallback route if needed
    // {
    {
      path: "/evaluator/login",
      element: (
        // <ProtectedRoute>
        <EvaluatorsLoginPage />
        // </ProtectedRoute>
      ),
    },
    {
      path: "/evaluator/applicants",
      element: (
        // <ProtectedRoute>
        <ApplicantsListPage />
      ),
    },
    {
      path: "/evaluator/applicants/view-applicant",
      element: (
        // <ProtectedRoute>
        <ViewApplicantPage />
      ),
    },

    {
      path: "/OrganizedCourseDialog",
      element: (
        <ProtectedRoute>
          <OrganizedCourseDialog />
        </ProtectedRoute>
      ),
    }, 

    {
      path: "/evaluator/homepage",
      element: (
        // <ProtectedRoute>
        <EvaluatorHomePage />
        // </ProtectedRoute>
      ),
    },

    {
      path: "/document-preview/:id",
      element: (
        <ProtectedRoute>
          <DocumentPreviewPage />
        </ProtectedRoute>
      ),
    },

    
    //   path: "*",
    //   element: <NotFoundPage />,
    // },
  ]);
};

export default AppRoutes;
