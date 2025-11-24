import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Stack, Box, styled, Modal } from "@mui/material";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";

import axios from "axios";
import { API_BASE } from '../../../config';
import useResponseHandler from "../../../utils/useResponseHandler";
import MainLayout from "../../../templates/MainLayout";

// Maroon and Gold theme colors
const maroonTheme = {
  primary: {
    main: '#800000', // Deep maroon
    light: '#A0001A', // Lighter maroon
    dark: '#600000', // Darker maroon
  },
  secondary: {
    main: '#B8860B', // Dark goldenrod
    light: '#FFD700', // Gold
    dark: '#8B6F00' // Darker gold
  }
}

// Styled components
const StartButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`,
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "12px 24px",
  fontSize: 18,
  textTransform: "none",
  width: 256,
  boxShadow: `0 4px 20px rgba(128, 0, 0, 0.3)`,
  "&:hover": {
    background: `linear-gradient(135deg, ${maroonTheme.primary.dark} 0%, ${maroonTheme.secondary.dark} 100%)`,
    boxShadow: `0 6px 25px rgba(128, 0, 0, 0.4)`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease'
}));

const ShowcaseButton = styled(Button)(({ theme }) => ({
  backgroundColor: maroonTheme.secondary.main,
  color: "#fff",
  fontWeight: "bold",
  borderRadius: "20px",
  padding: "12px 24px",
  fontSize: 16,
  textTransform: "none",
  width: 256,
  boxShadow: `0 4px 15px rgba(184, 134, 11, 0.3)`,
  "&:hover": {
    backgroundColor: maroonTheme.secondary.dark,
    boxShadow: `0 6px 20px rgba(184, 134, 11, 0.4)`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease'
}));

const SuccessModal = styled(Modal)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const SuccessModalContent = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%)`,
  borderRadius: 16,
  boxShadow: `0 12px 40px rgba(128, 0, 0, 0.15)`,
  border: `2px solid rgba(255, 215, 0, 0.3)`,
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  textAlign: "center",
}));

const TrackButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${maroonTheme.secondary.light} 0%, ${maroonTheme.secondary.main} 100%)`,
  color: maroonTheme.primary.dark,
  borderRadius: 20,
  padding: "10px 30px",
  fontSize: 16,
  fontWeight: "bold",
  textTransform: "none",
  boxShadow: `0 4px 15px rgba(255, 215, 0, 0.3)`,
  "&:hover": {
    background: `linear-gradient(135deg, ${maroonTheme.secondary.main} 0%, ${maroonTheme.secondary.dark} 100%)`,
    color: "#fff",
    boxShadow: `0 6px 20px rgba(255, 215, 0, 0.4)`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease'
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
        // Fetch applicant data
        const response = await axios.get(
          `${API_BASE}/applicants/${applicantId}`
        );
        const data = response.data;

        // Check if essential profile fields are missing
        const isProfileIncomplete =
          !data.firstName ||
          !data.lastName ||
          !data.address ||
          !data.contactNumber ||
          !data.dateOfBirth ||
          !data.gender;

        if (isProfileIncomplete) {
          handleError("Please complete your profile first");
          navigate("/login");
          return;
        }

        setUserFullName(`${data.firstName} ${data.lastName}`);
        
        // Check if applicant is accepted
        try {
          const acceptedResponse = await axios.get(
            `${API_BASE}/accepted-applicants/by-applicant/${applicantId}`
          );
          
          if (acceptedResponse.data && acceptedResponse.data.status === "ACCEPTED") {
            // Redirect to the accepted dashboard
            navigate("/accepted-dashboard");
          }
        } catch (error) {
          // Not accepted, continue with regular homepage
          console.log("Applicant not yet accepted");
        }
      } catch (error) {
        handleError("Failed to fetch user data");
        console.error("Homepage error:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate, handleError, handleSuccess]);

  const handleStartApplication = async () => {
    const applicantId = localStorage.getItem("applicantId");
    try {
      const response = await axios.get(
        `${API_BASE}/applications/applicant/${applicantId}`
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
    <MainLayout
      backgroundImage={backgroundImage}
      data={userFullName}
      userType={"applicant"}
    >
      <Stack alignItems="center" spacing={4} sx={{ position: "relative" }}>
        {/* Logo */}
        <img src={logo} alt="Logo" />

        {/* Welcome Section */}
        <Box
          sx={{
            textAlign: "center",
            background: `linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)`,
            borderRadius: 4,
            border: `2px solid rgba(128, 0, 0, 0.2)`,
            boxShadow: `0 8px 32px rgba(128, 0, 0, 0.1)`,
            p: 4,
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: maroonTheme.primary.main }}>
            Hi, {userFullName}. Your ETEEAP journey begins here!
          </Typography>

          <Stack
            direction="column"
            spacing={2}
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Typography variant="body1" sx={{ color: maroonTheme.primary.dark }}>Click here to</Typography>
            <StartButton onClick={handleStartApplication} variant="contained">
              Start your Application
            </StartButton>
          </Stack>
        </Box>

        {/* Program Showcase Section */}
        <Box
          sx={{
            textAlign: "center",
            background: `linear-gradient(135deg, rgba(184, 134, 11, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)`,
            borderRadius: 4,
            border: `2px solid rgba(184, 134, 11, 0.3)`,
            boxShadow: `0 8px 32px rgba(184, 134, 11, 0.1)`,
            p: 4,
            maxWidth: 600,
            width: "100%",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: maroonTheme.secondary.main }}>
            🎓 Explore Our Program Showcase
          </Typography>
          <Typography variant="body2" gutterBottom sx={{ color: maroonTheme.primary.dark }}>
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
          <Typography variant="h6" id="success-modal-title" sx={{ mb: 2, color: maroonTheme.primary.main, fontWeight: 600 }}>
            Hi, {userFullName.split(" ")[0]}. You already submitted an
            application.
          </Typography>
          <Typography
            variant="body2"
            id="success-modal-description"
            sx={{ mb: 3, color: maroonTheme.primary.dark }}
          >
            Click here to
          </Typography>
          <TrackButton onClick={handleTrackApplication}>
            Track your Application
          </TrackButton>
        </SuccessModalContent>
      </SuccessModal>

      {snackbar}
    </MainLayout>
  );
};

export default Homepage;
