// src/components/MinimalLayout/index.jsx
import React from "react";
import { Stack } from "@mui/material";

const MinimalLayout = ({ children, backgroundImage }) => {
  return (
    <Stack
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Stack>
  );
};

export default MinimalLayout;
