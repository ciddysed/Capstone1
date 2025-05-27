import { Stack } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import LoginForm from "../../../components/Login/LoginForm";
import SetUpProfile from "../../../components/Login/SetUpProfile";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import axios from "axios";

const LoginPage = () => {
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const navigate = useNavigate();

  // Function to check if applicant has started their application
  const checkApplicationStatus = async (applicantId) => {
    try {
      // Check for course preferences
      const preferencesResponse = await axios.get(
        `http://localhost:8080/api/preferences/applicant/${applicantId}`
      );
      const hasPreferences =
        preferencesResponse.data && preferencesResponse.data.length > 0;

      // Check for uploaded documents
      const documentsResponse = await axios.get(
        `http://localhost:8080/api/documents/applicant/${applicantId}`
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
        `http://localhost:8080/api/applications/applicant/${applicantId}`
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

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const applicantId = localStorage.getItem("applicantId");

    if (userType === "applicant" && applicantId) {
      // Check if applicant has started their application
      checkApplicationStatus(applicantId).then((hasStartedApplication) => {
        if (!hasStartedApplication) {
          navigate("/homepage");
        }
      });
    } else if (userType === "evaluator") {
      navigate("/evaluator/homepage");
    }

    //TODO: Uncomment this once admin routing is established

    // else if (userType === "admin") {
    //   navigate("/admin/dashboard");
    // }

    console.log(userType);
  }, []);

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        {view === "login" && (
          <LoginForm
            setView={setView}
            handleSuccess={handleSuccess}
            handleError={handleError}
          />
        )}
        {view === "signup" && (
          <LoginForm
            formType="signup"
            setView={setView}
            handleSuccess={handleSuccess}
            handleError={handleError}
          />
        )}
        {view === "setupProfile" && (
          <SetUpProfile handleSuccess={handleSuccess} />
        )}
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default LoginPage;
