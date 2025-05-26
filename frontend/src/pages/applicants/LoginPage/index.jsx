import { Stack } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import LoginForm from "../../../components/Login/LoginForm";
import SetUpProfile from "../../../components/Login/SetUpProfile";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";

const LoginPage = () => {
  const [view, setView] = useState("login"); // login | signup | setupProfile
  const { handleSuccess, handleError, snackbar } = useResponseHandler();

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
