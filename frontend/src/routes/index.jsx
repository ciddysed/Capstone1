// src/routes/AppRoutes.jsx
import { useRoutes, Navigate } from "react-router-dom";
import OrganizedCourseDialog from "../components/OrganizedCourseDialog";
import EvaluatorManagementPage from "../pages/SystemAdmin/EvaluatorManagement";
import SystemAdminLoginPage from "../pages/SystemAdmin/LoginPage";
import ProgramAdminHomePage from "../pages/ProgramAdmin/HomePage";
import ProgramAdminLoginPage from "../pages/ProgramAdmin/LoginPage";
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
import ProgramAdminProtectedRoute from "./ProgramAdminProtectedRoutes";
import SystemAdminProtectedRoute from "./SystemAdminProtectedRoutes";
import Redirecter from "./Redirecter";
import ApplicantForgotPasswordPage from "../pages/applicants/ForgotPasswordPage"; 
import EvaluatorResetPasswordPage from "../pages/evaluators/ResetPasswordPage";
import ApplicantResetPasswordPage from "../pages/applicants/ApplicantResetPasswordPage";
import CurriculumManagement from "../pages/admin/ApplicantDetailsPage/curriculumManagement";
import CurriculumRouter from "../pages/SystemAdmin/ApplicantDetailsPage/curriculumRouter";
import Accreditations from "../pages/evaluators/Accreditations/Accreditations";
import GradedAccreditation from "../pages/evaluators/Accreditations/GradedAccreditation";
import AccreditedAccounts from "../pages/evaluators/Accreditations/AccreditedAccounts";
import SystemAdminNavigation from "../components/Navigation/SystemAdminNavigation";
import AcceptedDashboard from "../pages/applicants/AcceptedDashboard";
import { Box, Typography, Button } from "@mui/material";

const UnderConstruction = ({ pageName }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center",
      p: 3,
    }}
  >
    <Typography variant="h4" sx={{ mb: 2, color: "#800000" }}>
      {pageName}
    </Typography>
    <Typography variant="h6" sx={{ mb: 4 }}>
      This page is under construction
    </Typography>
    <Button
      variant="contained"
      onClick={() => window.history.back()}
      sx={{
        bgcolor: "#800000",
        "&:hover": { bgcolor: "#600000" },
      }}
    >
      Go Back
    </Button>
  </Box>
);

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
    // Evaluator routes
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
      path: "/evaluator/accreditations",
      element: (
        <ProtectedRoute>
          <Accreditations />
        </ProtectedRoute>
      ),
    },
    {
      path: "/evaluator/graded-accreditation",
      element: (
        <ProtectedRoute>
          <GradedAccreditation />
        </ProtectedRoute>
      ),
    },
    {
      path: "/evaluator/accredited-accounts",
      element: (
        <ProtectedRoute>
          <AccreditedAccounts />
        </ProtectedRoute>
      ),
    },

    // Program Admin routes
    {
      path: "/program-admin/login",
      element: <ProgramAdminLoginPage />,
    },
    {
      path: "/program-admin/homepage",
      element: (
        <ProgramAdminProtectedRoute>
          <ProgramAdminHomePage />
        </ProgramAdminProtectedRoute>
      ),
    },

    // System Admin routes
    {
      path: "/system-admin/login",
      element: <SystemAdminLoginPage />,
    },
    {
      path: "/system-admin/homepage",
      element: (
        <SystemAdminProtectedRoute>
          <ProgramAdminHomePage />
        </SystemAdminProtectedRoute>
      ),
    },

    {
      path: "/system-admin/evaluator-management",
      element: (
        <SystemAdminProtectedRoute>
          <EvaluatorManagementPage />
        </SystemAdminProtectedRoute>
      ),
    },
    
    {
      path: "/system-admin/curriculum/:curriculumId",
      element: (
        <SystemAdminProtectedRoute>
          <SystemAdminNavigation activeTab="Curriculum Management">
            <CurriculumRouter />
          </SystemAdminNavigation>
        </SystemAdminProtectedRoute>
      ),
    },

    {
      path: "/program-admin/program-management",
      element: (
        <ProgramAdminProtectedRoute>
          <ProgramAdminHomePage />
        </ProgramAdminProtectedRoute>
      ),
    },

     {
      path: "/system-admin/course-management",
      element: (
        <SystemAdminProtectedRoute>
          <ProgramAdminHomePage />
        </SystemAdminProtectedRoute>
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
    {
      path: "/admin/curriculum-management",
      element: (
        <ProtectedRoute>
          <CurriculumManagement />
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/curriculum/:curriculumId",
      element: (
        <ProtectedRoute>
          <CurriculumRouter />
        </ProtectedRoute>
      ),
    },
    {
      path: "/accepted-dashboard",
      element: <AcceptedDashboard />,
    },
    {
      path: "/enrollment-payment",
      element: <UnderConstruction pageName="Enrollment Payment" />,
    },
    {
      path: "/orientation",
      element: <UnderConstruction pageName="Orientation" />,
    },
    {
      path: "/course-registration",
      element: <UnderConstruction pageName="Course Registration" />,
    },
    {
      path: "/system-admin/curriculum/:curriculumId",
      element: (
        <SystemAdminNavigation activeTab="Curriculum Management">
          <CurriculumRouter />
        </SystemAdminNavigation>
      ),
    },
    {
      path: "*",
      element: <Navigate to="/login" />,
    },
  ]);
};

export default AppRoutes;
