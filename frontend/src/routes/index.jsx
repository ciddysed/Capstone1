// src/routes/AppRoutes.jsx
import { useRoutes } from "react-router-dom";
import OrganizedCourseDialog from "../components/OrganizedCourseDialog";
import EvaluatorManagementPage from "../pages/SystemAdmin/EvaluatorManagement";
import ProgramAdminHomePage from "../pages/ProgramAdmin/HomePage";
import ProgramShowcase from "../pages/ProgramShowcase";
import AppCoursePreference from "../pages/applicants/AppCoursePreference";
import ApplicationTrack from "../pages/applicants/ApplicationTrack";
import Homepage from "../pages/applicants/HomePage";
import LoginPage from "../pages/applicants/LoginPage";
import SetUpProfilePage from "../pages/applicants/SetUpProfile";
import ForgotPasswordPage from "../pages/common/ForgotPasswordPage";
import ResetPasswordPage from "../pages/common/ResetPasswordPage";
import ApplicantsListPage from "../pages/evaluators/ApplicantsListPage";
import EvaluatorForgotPasswordPage from "../pages/evaluators/ForgotPasswordPage";
import EvaluatorHomePage from "../pages/evaluators/HomePage";
import EvaluatorsLoginPage from "../pages/evaluators/LoginPage";
import ViewApplicantPage from "../pages/evaluators/ViewApplicantPage";
import ProtectedRoute from "./ProtectedRoutes";
import Redirecter from "./Redirecter";
import ApplicantForgotPasswordPage from "../pages/applicants/ForgotPasswordPage"; 
import EvaluatorResetPasswordPage from "../pages/evaluators/ResetPasswordPage";
import ApplicantResetPasswordPage from "../pages/applicants/ApplicantResetPasswordPage";

const AppRoutes = () => {
  return useRoutes([
    {
      path: "/",
      element: <Redirecter />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/forget-password",
      element: <ForgotPasswordPage />,
    },
    //TODO: Remove this after creadting dynamic reset link for password
    {
      path: "/forget-password/reset-password",
      element: <ResetPasswordPage />,
    },
    {
      path: "/setup-profile",
      element: (
        // TODO: Uncoment all the proretced route after implementing the backend
        <ProtectedRoute>
          <SetUpProfilePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/homepage",
      element: (
        <ProtectedRoute>
          <Homepage />
        </ProtectedRoute>
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
          <AppCoursePreference />
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
      element: <EvaluatorsLoginPage />,
    },
    {
      path: "/evaluator/forget-password",
      element: <EvaluatorForgotPasswordPage />,
    },
    {
      path: "/evaluator/applicants",
      element: (
        <ProtectedRoute>
          <ApplicantsListPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/evaluator/applicants/view-applicant",
      element: (
        <ProtectedRoute>
          <ViewApplicantPage />
        </ProtectedRoute>
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
        <ProtectedRoute>
          <EvaluatorHomePage />
        </ProtectedRoute>
      ),
    },

    {
      path: "/program-admin/homepage",
      element: (
        <ProtectedRoute>
          <ProgramAdminHomePage />{" "}
        </ProtectedRoute>
      ),
    },

    {
      path: "/system-admin/evaluator-management",
      element: (
        <ProtectedRoute>
          <EvaluatorManagementPage />
        </ProtectedRoute>
      ),
    },

    {
      path: "/system-admin/program-management",
      element: (
        <ProtectedRoute>
          <ProgramAdminHomePage />
        </ProtectedRoute>
      ),
    },

     {
      path: "/system-admin/course-management",
      element: (
        <ProtectedRoute>
          <ProgramAdminHomePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "/forgot-password",
      element: <ApplicantForgotPasswordPage />,
    },
    {
      path: "/reset-password",
      element: <ResetPasswordPage />,
    },
    // Uncomment this if you have a NotFoundPage component

    {
      path: "/evaluator/reset-password",
      element: <EvaluatorResetPasswordPage />,
    },
    
    {
      path: "/applicant/reset-password",
      element: <ApplicantResetPasswordPage />,
    },

     

    //   path: "*",
    //   element: <NotFoundPage />,
    // },
  ]);
};

export default AppRoutes;
