import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack, Link, Typography } from "@mui/material";
import EvaluatorLoginForm from "../../../components/Login/EvaluatorLoginForm";

const EvaluatorsLoginPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        {view === "login" && (
          <>
            <EvaluatorLoginForm
              setView={setView}
              handleSuccess={handleSuccess}
              handleError={handleError}
            />
            <Typography variant="body2">
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/evaluator/forget-password")}
                sx={{
                  color: "white",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </Link>
            </Typography>
          </>
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
