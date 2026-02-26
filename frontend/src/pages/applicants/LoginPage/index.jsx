import { Stack, Box } from "@mui/material";
import { useState, useEffect } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/login2-bg.png";
import logo from "../../../assets/logo.png";
import LoginForm from "../../../components/Login/LoginForm";
import SetUpProfile from "../../../components/Login/SetUpProfile";
import useResponseHandler from "../../../utils/useResponseHandler";
import axios from "axios";
import { API_BASE } from '../../../config';

const LoginPage = () => {
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const navigate = useNavigate();

  // Function to check if applicant has started their application
  const checkApplicationStatus = async (applicantId) => {
    try {
      // Check for course preferences
      const preferencesResponse = await axios.get(
        `${API_BASE}/preferences/applicant/${applicantId}`
      );
      const hasPreferences =
        preferencesResponse.data && preferencesResponse.data.length > 0;

      // Check for uploaded documents
      const documentsResponse = await axios.get(
        `${API_BASE}/documents/applicant/${applicantId}`
      );
      const hasDocuments =
        documentsResponse.data && documentsResponse.data.length > 0;

      // If they have either preferences or documents, they've started their application
      if (hasPreferences || hasDocuments) {
        navigate("/ApplicationTrack");
        return true;
      }

      // Check if they have submitted an application
      const applicationResponse = await axios.get(
        `${API_BASE}/applications/applicant/${applicantId}`
      );
      if (applicationResponse.data && applicationResponse.data.length > 0) {
        navigate("/ApplicationTrack");
        return true;
      }

      return false;
    } catch (error) {
      // If any API call fails (e.g., 404), assume no application data exists
      console.log("No existing application data found, proceeding to homepage");
      return false;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const applicantId = localStorage.getItem("applicantId");
    const programAdminId = localStorage.getItem("programAdminId");

    if (userType === "applicant" && applicantId) {
      // Check if applicant has started their application
      checkApplicationStatus(applicantId).then((hasStartedApplication) => {
        if (!hasStartedApplication) {
          navigate("/homepage");
        }
      });
    } else if (userType === "evaluator") {
      navigate("/evaluator/homepage");
    } else if (userType === "program-admin" && programAdminId) {
      navigate("/program-admin/program-management");
    } else if (userType && userType.includes("admin")) {
      // Admin routing
      if (userType === "system-admin") {
        navigate("/system-admin/evaluator-management");
      } else {
        navigate("/admin");
      }
    }
  }, [navigate]);

  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      {/* Blurred, darkened background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px) brightness(0.45)",
          transform: "scale(1.06)",
          zIndex: 0,
        }}
      />

      {/* Centered content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflowY: "auto",
          py: 5,
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={2.5} sx={{ width: "100%" }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 350,
              filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.6))",
            }}
          />
          {view === "login" || view === "signup" ? (
            <LoginForm
              formType={view}
              setView={setView}
              handleSuccess={handleSuccess}
              handleError={handleError}
            />
          ) : (
            <SetUpProfile handleSuccess={handleSuccess} />
          )}
        </Stack>
      </Box>

      {snackbar}
    </Box>
  );
};

export default LoginPage;
