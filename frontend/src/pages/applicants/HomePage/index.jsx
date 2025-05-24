import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Stack, Box, styled, Modal } from "@mui/material";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";

import axios from "axios";
import MinimalLayout from "../../../templates/MinimalLayout";
import useResponseHandler from "../../../utils/useResponseHandler";

// Styled components
const StartButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFD700",
  color: "#000",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "12px 24px",
  fontSize: 18,
  textTransform: "none",
  width: 256,
  "&:hover": {
    backgroundColor: "#F0C800",
  },
}));

const ShowcaseButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#1976D2",
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "12px 24px",
  fontSize: 16,
  textTransform: "none",
  width: 256,
  "&:hover": {
    backgroundColor: "#115293",
  },
}));

const SuccessModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const SuccessModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 16,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  textAlign: "center",
}));

const TrackButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffde00",
  color: "black",
  borderRadius: 20,
  padding: "10px 30px",
  fontSize: 16,
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#e6c800",
  },
}));

const Homepage = () => {
  const navigate = useNavigate();
  const [userFullName, setUserFullName] = useState("User");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const { handleSuccess, handleError, snackbar } = useResponseHandler();

  useEffect(() => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId || applicantId === "undefined") {
      handleError("Please login to continue");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/applicants/${applicantId}`
        );
        const data = response.data;
        setUserFullName(`${data.firstName} ${data.lastName}`);
      } catch (error) {
        handleError("Failed to fetch user data");
        console.error("Homepage error:", error);
      }
    };

    fetchUserData();
  }, [navigate, handleError]);

  const handleStartApplication = async () => {
    const applicantId = localStorage.getItem("applicantId");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/applications/applicant/${applicantId}`
      );
      if (response.data && response.data.length > 0) {
        // Trigger SuccessModal if an application already exists
        setSuccessModalOpen(true);
        return;
      }

      // Navigate to AppCoursePreference if no application exists
      navigate("/AppCoursePreference");
      handleSuccess("Navigated to course preference page!");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No application exists, proceed to AppCoursePreference
        navigate("/AppCoursePreference");
        handleSuccess("Navigated to course preference page!");
      } else {
        console.error("Error checking application:", error);
        handleError("Failed to check application. Please try again.");
      }
    }
  };

  const handleTrackApplication = () => {
    setSuccessModalOpen(false);
    navigate("/ApplicationTrack");
  };

  const handleProgramShowcase = () => {
    navigate("/program-showcase");
    handleSuccess("Viewing program showcase!");
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={4} sx={{ position: "relative" }}>
        {/* Logo */}
        <img src={logo} alt="Logo" />

        {/* Welcome Section */}
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 4,
            p: 4,
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Hi, {userFullName}. Your ETEEAP journey begins here!
          </Typography>

          <Stack
            direction="column"
            spacing={2}
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Typography variant="body1">Click here to</Typography>
            <StartButton onClick={handleStartApplication} variant="contained">
              Start your Application
            </StartButton>
          </Stack>
        </Box>

        {/* Program Showcase Section */}
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "rgba(25, 118, 210, 0.2)",
            borderRadius: 4,
            p: 4,
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom color="black">
            🎓 Explore Our Program Showcase
          </Typography>
          <Typography variant="body2" gutterBottom>
            Learn more about ETEEAP and how it helps working professionals earn
            a degree through competency-based education.
          </Typography>
          <ShowcaseButton onClick={handleProgramShowcase} variant="contained">
            View Program Showcase
          </ShowcaseButton>
        </Box>
      </Stack>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <SuccessModalContent>
          <img src={logo} alt="Logo" style={{ height: 40, marginBottom: 16 }} />
          <Typography variant="h6" id="success-modal-title" sx={{ mb: 2 }}>
            Hi, {userFullName.split(" ")[0]}. You already submitted an
            application.
          </Typography>
          <Typography
            variant="body2"
            id="success-modal-description"
            sx={{ mb: 3 }}
          >
            Click here to
          </Typography>
          <TrackButton onClick={handleTrackApplication}>
            Track your Application
          </TrackButton>
        </SuccessModalContent>
      </SuccessModal>

      {snackbar}
    </MinimalLayout>
  );
};

export default Homepage;
