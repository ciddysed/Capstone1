// src/components/MinimalLayout/index.jsx
import React from "react";
import { Stack, Box } from "@mui/material";
import DashboardLink from "../../components/DashboardLink";

const MinimalLayout = ({ children, backgroundImage, backgroundVideo }) => {
  return (
    <Stack
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Dashboard link at top right */}
      <Box sx={{ position: "absolute", top: 16, right: 32, zIndex: 10 }}>
        <DashboardLink />
      </Box>
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
          <source src={backgroundVideo} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
      )}
      {!backgroundVideo && backgroundImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>{children}</div>
    </Stack>
  );
};

export default MinimalLayout;
