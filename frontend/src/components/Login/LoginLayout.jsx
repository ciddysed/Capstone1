import React from "react";
import {
  LoginContainer,
  LoginCard,
  GoldAccent,
} from "./LoginStyles";

const LoginLayout = ({ children }) => {
  return (
    <LoginContainer>
      <LoginCard>
        <GoldAccent />
        {children}
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginLayout;
