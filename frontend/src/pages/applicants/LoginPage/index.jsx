import React, { useEffect, useState } from "react";
import MinimalLayout from "../../../templates/MinimalLayout";
import LoginForm from "../../../components/Login/LoginForm";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import { Stack } from "@mui/material";
import SetUpProfile from "../../../components/Login/SetUpProfile";
import useResponseHandler from "../../../utils/useResponseHandler";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");

    if (userType === "applicant") {
      navigate("/homepage"); // or "/applicant/home"
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
