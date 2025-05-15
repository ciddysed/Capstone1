import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Stack,
  Container,
} from "@mui/material";
import logo from "../../assets/logo.png"; // Image import

const MainLayout = ({ children, background }) => {
  return (
    <Stack
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${
          background || "https://via.placeholder.com/1920x1080"
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AppBar
        position="static"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.2)", // 20% opacity white
          backdropFilter: "blur(10px)", // Optional: adds a blur effect
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {/* Left side: Logo */}
            <Stack>
              <img src={logo} alt="Logo" style={{ height: 50 }} />
            </Stack>

            {/* Right side: Avatar and username */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar alt="User Avatar" />
              <Typography variant="body1" fontWeight="bold" color="#800000">
                Username
              </Typography>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children || <Typography>Page content goes here...</Typography>}
      </Container>
    </Stack>
  );
};

export default MainLayout;
