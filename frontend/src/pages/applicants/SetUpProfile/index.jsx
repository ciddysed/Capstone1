import React from "react";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png"; // Image import
import logo from "../../../assets/logo.png"; // Image import

import { Stack } from "@mui/material";
import SetUpProfile from "../../../components/Login/SetUpProfile";

const SetUpProfilePage = () => {
  return (
    <>
      <MinimalLayout backgroundImage={backgroundImage}>
        <Stack>
          {" "}
          <img src={logo} alt="Logo" />
        </Stack>
        <SetUpProfile />
      </MinimalLayout>
    </>
  );
};

export default SetUpProfilePage;
