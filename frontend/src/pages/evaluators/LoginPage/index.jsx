import React, { useState } from "react";
import logo from "../../../assets/logo.png";

import backgroundImage from "../../../assets/login-bg.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
import EvaluatorLoginForm from "../../../components/Login/EvaluatorLoginForm";

const EvaluatorsLoginPage = () => {
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();

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
