import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Stack, Paper, Grid, Card, CardContent, 
  Button, Divider, Chip, CircularProgress, Stepper, 
  Step, StepLabel, StepContent, Avatar, alpha 
} from "@mui/material";
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Celebration as CelebrationIcon,
  AccountBalance as AccountBalanceIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon 
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../../templates/MainLayout";
import EnrollmentTracker from "./EnrollmentTracker";
import CourseInformation from "./CourseInformation";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";
import { notifyEnrollmentStep } from "../../../utils/notificationManager";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

// Styled card component
const InfoCard = ({ title, icon, children, accentColor = maroon.main }) => (
  <Card 
    elevation={1} 
    sx={{ 
      height: '100%',
      transition: 'transform 0.3s, box-shadow 0.3s',
      borderTop: `3px solid ${accentColor}`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.2)',
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: alpha(accentColor, 0.15), color: accentColor }}>
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, color: accentColor }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </CardContent>
  </Card>
);

const AcceptedDashboard = () => {
  const navigate = useNavigate();
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [loading, setLoading] = useState(true);
  const [applicantData, setApplicantData] = useState(null);
  const [acceptanceData, setAcceptanceData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) {
      handleError("Please login to continue");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applicant profile
        const applicantResponse = await axios.get(
          `http://localhost:8080/api/applicants/${applicantId}`
        );
        
        // Fetch accepted applicant data
        const acceptedResponse = await axios.get(
          `http://localhost:8080/api/accepted-applicants/by-applicant/${applicantId}`
        );
        
        if (!acceptedResponse.data) {
          // If not accepted, redirect to regular dashboard
          navigate("/ApplicantHomePage");
          return;
        }
        
        // Fetch upcoming events (orientation, enrollment deadlines, etc.)
        const eventsResponse = await axios.get(
          `http://localhost:8080/api/academic-calendar/upcoming`
        ).catch(() => ({ data: getMockEvents() })); // Fallback to mock data
        
        setApplicantData(applicantResponse.data);
        setAcceptanceData(acceptedResponse.data);
        setUpcomingEvents(eventsResponse.data);
        
        // Create an enrollment notification when this page is first viewed
        notifyEnrollmentStep(
          applicantId, 
          "Acceptance Confirmed", 
          `Congratulations! You've been accepted to the ${acceptedResponse.data.course?.courseName || "program"}!`,
          "success"
        );
        
      } catch (error) {
        console.error("Error fetching accepted dashboard data:", error);
        
        // If we have mock data for development, use it
        if (process.env.NODE_ENV === 'development') {
          const mockAcceptance = getMockAcceptanceData();
          setApplicantData({
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@example.com"
          });
          setAcceptanceData(mockAcceptance);
          setUpcomingEvents(getMockEvents());
        } else {
          handleError("Error loading your acceptance data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, handleError, handleSuccess]);
  
  const getMockAcceptanceData = () => ({
    id: 1,
    acceptedDate: new Date().toISOString(),
    status: "ACCEPTED",
    remarks: "Congratulations on your acceptance!",
    enrollmentStep: "DOCUMENTS_SUBMISSION",
    course: {
      courseId: 1,
      courseName: "Bachelor of Science in Information Technology",
      courseCode: "BSIT",
      department: {
        departmentId: 1,
        departmentName: "College of Computer Studies"
      }
    }
  });
  
  const getMockEvents = () => [
    {
      id: 1,
      title: "Orientation Day",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      location: "Main Auditorium",
      description: "Welcome orientation for new students"
    },
    {
      id: 2,
      title: "Enrollment Deadline",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      description: "Last day to complete enrollment requirements"
    },
    {
      id: 3,
      title: "Start of Classes",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      description: "First day of classes for the new semester"
    }
  ];
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <MainLayout
        backgroundImage={backgroundImage}
        userType="applicant"
        data={applicantData?.firstName ? `${applicantData.firstName} ${applicantData.lastName}` : "Applicant"}
      >
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          height: "60vh",
          flexDirection: "column"
        }}>
          <CircularProgress size={50} sx={{ color: maroon.main }} />
          <Typography variant="h6" sx={{ mt: 2, color: maroon.main }}>
            Loading your acceptance information...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      backgroundImage={backgroundImage}
      userType="applicant"
      data={applicantData?.firstName ? `${applicantData.firstName} ${applicantData.lastName}` : "Applicant"}
    >
      {/* Congratulations Banner */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(gold.light, 0.9)} 0%, ${alpha(gold.main, 0.8)} 100%)`,
          border: `1px solid ${gold.main}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.15 }}>
          <CelebrationIcon sx={{ fontSize: 180, color: maroon.main }} />
        </Box>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ color: maroon.main, fontWeight: 700, mb: 1 }}>
              Congratulations, {applicantData?.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ color: maroon.dark, mb: 2 }}>
              You have been accepted to {acceptanceData?.course?.courseName}
            </Typography>
            <Typography variant="body1" sx={{ color: maroon.dark }}>
              Your application has been approved on {formatDate(acceptanceData?.acceptedDate)}. 
              Please complete the enrollment process to secure your slot.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 80, color: maroon.main, mb: 1 }} />
            <Button 
              variant="contained" 
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/ApplicationTrack")}
              sx={{ 
                bgcolor: maroon.main, 
                '&:hover': { bgcolor: maroon.dark },
                borderRadius: 5,
                px: 3,
                py: 1.5,
                fontSize: 16,
                fontWeight: 600
              }}
            >
              View Application
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Enrollment Progress */}
            <InfoCard 
              title="Enrollment Progress" 
              icon={<AssignmentIcon />}
              accentColor={maroon.main}
            >
              <EnrollmentTracker 
                currentStep={acceptanceData?.enrollmentStep || "DOCUMENTS_SUBMISSION"} 
                course={acceptanceData?.course}
              />
            </InfoCard>
            
            {/* Course Information */}
            <InfoCard 
              title="Program Information" 
              icon={<SchoolIcon />}
              accentColor={gold.dark}
            >
              <CourseInformation course={acceptanceData?.course} />
            </InfoCard>
          </Stack>
        </Grid>
        
        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Acceptance Details */}
            <InfoCard 
              title="Acceptance Details" 
              icon={<AccountBalanceIcon />}
              accentColor="#2e7d32"
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={acceptanceData?.status || "ACCEPTED"} 
                    color="success" 
                    variant="outlined" 
                    sx={{ fontWeight: 600, mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Acceptance Date</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(acceptanceData?.acceptedDate)}
                  </Typography>
                </Box>
                {acceptanceData?.remarks && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1, bgcolor: alpha('#f5f5f5', 0.7), borderRadius: 1 }}>
                      {acceptanceData.remarks}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </InfoCard>
            
            {/* Upcoming Events */}
            <InfoCard 
              title="Important Dates" 
              icon={<CalendarIcon />}
              accentColor="#0288d1"
            >
              <Stack spacing={2}>
                {upcomingEvents.slice(0, 3).map(event => (
                  <Box key={event.id} sx={{ 
                    p: 1.5, 
                    borderRadius: 1, 
                    bgcolor: alpha('#e3f2fd', 0.5), 
                    border: `1px solid ${alpha('#0288d1', 0.2)}`
                  }}>
                    <Typography variant="subtitle2" fontWeight={600} color="#0288d1">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {formatDate(event.date)}
                    </Typography>
                    {event.location && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Location: {event.location}
                      </Typography>
                    )}
                    {event.description && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                ))}
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ 
                    alignSelf: 'center', 
                    borderColor: '#0288d1', 
                    color: '#0288d1',
                    '&:hover': { 
                      bgcolor: alpha('#0288d1', 0.1),
                      borderColor: '#0288d1' 
                    }
                  }}
                >
                  View Academic Calendar
                </Button>
              </Stack>
            </InfoCard>
          </Stack>
        </Grid>
      </Grid>
      {snackbar}
    </MainLayout>
  );
};

export default AcceptedDashboard;
