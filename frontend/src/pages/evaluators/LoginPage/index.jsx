import React from "react";

import backgroundImage from "../../../assets/login2-bg.png";
import logo from "../../../assets/logo.png";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";
import { Stack } from "@mui/material";
import EvaluatorAdviserLoginForm from "../../../components/Login/EvaluatorAdviserLoginForm";

const EvaluatorsLoginPage = () => {
  const { handleSuccess, handleError, snackbar } = useResponseHandler();

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2}>
        <img src={logo} alt="Logo" />
        <EvaluatorAdviserLoginForm
          handleSuccess={handleSuccess}
          handleError={handleError}
          defaultRole="evaluator"
          allowedRoles={["evaluator"]}
        />
      </Stack>
      {snackbar}
    </MinimalLayout>
  );
};

export default EvaluatorsLoginPage;