import React, { useEffect, useState } from "react";

import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
import EvaluatorLoginForm from "../../../components/Login/EvaluatorLoginForm";
import { useNavigate } from "react-router-dom";

const EvaluatorsLoginPage = () => {
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
          <EvaluatorLoginForm
            setView={setView}
            handleSuccess={handleSuccess}
            handleError={handleError}
          />
        )}
        {view === "signup" && (
          <EvaluatorLoginForm
            formType="signup"
            setView={setView}
            handleSuccess={handleSuccess}
            handleError={handleError}
          />
        )}
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default EvaluatorsLoginPage;
