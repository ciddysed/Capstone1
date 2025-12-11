import { Stack } from "@mui/material";
import { useState, useEffect } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import LoginForm from "../../../components/Login/LoginForm";
import SetUpProfile from "../../../components/Login/SetUpProfile";
import MinimalLayout from "../../../templates/MinimalLayout";
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
    const adviserId = localStorage.getItem("adviserId");

    if (userType === "applicant" && applicantId) {
      // Check if applicant has started their application
      checkApplicationStatus(applicantId).then((hasStartedApplication) => {
        if (!hasStartedApplication) {
          navigate("/homepage");
        }
      });
    } else if (userType === "evaluator") {
      navigate("/evaluator/homepage");
    } else if (userType === "adviser" && adviserId) {
      navigate("/adviser/homepage");
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
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
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
      {snackbar}
    </MinimalLayout>
  );
};

export default LoginPage;
