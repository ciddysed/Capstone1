// src/components/MinimalLayout/index.jsx
import React from "react";
import { Stack } from "@mui/material";

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
