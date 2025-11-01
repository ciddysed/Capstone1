import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Stack, Paper, Grid, Card, CardContent, 
  Button, Divider, Chip, CircularProgress, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress
} from "@mui/material";
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon,
  Celebration as CelebrationIcon,
  AccountBalance as AccountBalanceIcon,
  EmojiEvents as EmojiEventsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";

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
  const [subjectRecords, setSubjectRecords] = useState({});
  const [curriculumSummary, setCurriculumSummary] = useState(null);
  const [expandedSemester, setExpandedSemester] = useState(false);

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
          `http://localhost:8080/api/accepted-applicants/applicant/${applicantId}`
        );
        
        if (!acceptedResponse.data) {
          // If not accepted, redirect to regular dashboard
          handleError("You have not been accepted yet.");
          navigate("/ApplicantHomePage");
          return;
        }
        
        // Fetch subject records organized by semester
        const subjectRecordsResponse = await axios.get(
          `http://localhost:8080/api/applicant-subject-records/applicant/${applicantId}/organized`
        );
        
        // Fetch curriculum summary
        const summaryResponse = await axios.get(
          `http://localhost:8080/api/applicant-subject-records/applicant/${applicantId}/summary`
        );
        
        setApplicantData(applicantResponse.data);
        setAcceptanceData(acceptedResponse.data);
        setSubjectRecords(subjectRecordsResponse.data);
        setCurriculumSummary(summaryResponse.data);
        
        handleSuccess("Welcome to your acceptance dashboard!");
        
      } catch (error) {
        console.error("Error fetching accepted dashboard data:", error);
        handleError("Error loading your acceptance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, handleError, handleSuccess]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'REJECTED':
        return <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      case 'PENDING':
      default:
        return <PendingIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#4caf50';
      case 'REJECTED':
        return '#f44336';
      case 'PENDING':
      default:
        return '#ff9800';
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSemester(isExpanded ? panel : false);
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
              You have been accepted to {acceptanceData?.finalCourse?.courseName}
            </Typography>
            <Typography variant="body1" sx={{ color: maroon.dark }}>
              Your application has been approved on {formatDate(acceptanceData?.acceptanceDate)}. 
              Review your curriculum evaluation below.
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
        {/* Left column - Subject Records */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Curriculum Progress Summary */}
            <InfoCard 
              title="Curriculum Progress Summary" 
              icon={<AssignmentIcon />}
              accentColor={maroon.main}
            >
              {curriculumSummary ? (
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#4caf50', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="#4caf50">
                        {curriculumSummary.approvedCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Approved</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#ff9800', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="#ff9800">
                        {curriculumSummary.pendingCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f44336', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="#f44336">
                        {curriculumSummary.rejectedCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Rejected</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(maroon.main, 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color={maroon.main}>
                        {curriculumSummary.totalSubjects || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total Subjects</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Progress: {curriculumSummary.approvedCount || 0} / {curriculumSummary.totalSubjects || 0}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={curriculumSummary.totalSubjects > 0 
                          ? (curriculumSummary.approvedCount / curriculumSummary.totalSubjects) * 100 
                          : 0
                        }
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: alpha(maroon.light, 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50',
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No curriculum data available yet.
                </Typography>
              )}
            </InfoCard>

            {/* Subject Records by Semester */}
            <InfoCard 
              title="Subject Records by Semester" 
              icon={<SchoolIcon />}
              accentColor={gold.dark}
            >
              {Object.keys(subjectRecords).length > 0 ? (
                <Box>
                  {Object.entries(subjectRecords).map(([semesterLabel, records]) => (
                    <Accordion 
                      key={semesterLabel}
                      expanded={expandedSemester === semesterLabel}
                      onChange={handleAccordionChange(semesterLabel)}
                      sx={{ 
                        mb: 1,
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        border: `1px solid ${alpha(maroon.main, 0.2)}`,
                        borderRadius: '8px !important',
                        overflow: 'hidden'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ bgcolor: alpha(maroon.light, 0.05) }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {semesterLabel}
                          </Typography>
                          <Chip 
                            label={`${records.length} subject${records.length !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ bgcolor: alpha(gold.main, 0.2), color: gold.dark }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Subject Code</strong></TableCell>
                                <TableCell><strong>Description</strong></TableCell>
                                <TableCell align="center"><strong>Grade</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {records.map((record) => (
                                <TableRow key={record.id} hover>
                                  <TableCell>{record.subject?.subjectCode || 'N/A'}</TableCell>
                                  <TableCell>{record.subject?.descriptiveTitle || 'N/A'}</TableCell>
                                  <TableCell align="center">
                                    <Chip 
                                      label={record.grade || 'N/A'}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                      {getStatusIcon(record.status)}
                                      <Typography variant="caption" sx={{ color: getStatusColor(record.status), fontWeight: 600 }}>
                                        {record.status}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <WarningIcon sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No subject records available yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your curriculum evaluation is still in progress.
                  </Typography>
                </Box>
              )}
            </InfoCard>
          </Stack>
        </Grid>
        
        {/* Right column - Acceptance Details */}
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
                    {formatDate(acceptanceData?.acceptanceDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Program</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {acceptanceData?.finalCourse?.courseName || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Course Code</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {acceptanceData?.finalCourse?.courseCode || 'N/A'}
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

            {/* Pending Subjects Alert */}
            {curriculumSummary && curriculumSummary.pendingCount > 0 && (
              <InfoCard 
                title="Action Required" 
                icon={<WarningIcon />}
                accentColor="#ff9800"
              >
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 1, 
                  bgcolor: alpha('#ff9800', 0.1), 
                  border: `1px solid ${alpha('#ff9800', 0.3)}`
                }}>
                  <Typography variant="body2" fontWeight={600} color="#ff9800" gutterBottom>
                    You have {curriculumSummary.pendingCount} subject{curriculumSummary.pendingCount !== 1 ? 's' : ''} pending evaluation
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Please wait for the evaluators to review your subject credentials. You will be notified once the evaluation is complete.
                  </Typography>
                </Box>
              </InfoCard>
            )}

            {/* Rejected Subjects Alert */}
            {curriculumSummary && curriculumSummary.rejectedCount > 0 && (
              <InfoCard 
                title="Attention Needed" 
                icon={<CancelIcon />}
                accentColor="#f44336"
              >
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 1, 
                  bgcolor: alpha('#f44336', 0.1), 
                  border: `1px solid ${alpha('#f44336', 0.3)}`
                }}>
                  <Typography variant="body2" fontWeight={600} color="#f44336" gutterBottom>
                    {curriculumSummary.rejectedCount} subject{curriculumSummary.rejectedCount !== 1 ? 's were' : ' was'} not accredited
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                    You may need to take {curriculumSummary.rejectedCount === 1 ? 'this subject' : 'these subjects'} as part of your curriculum. Please contact your program evaluator for more information.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    fullWidth
                    sx={{ 
                      mt: 1,
                      borderColor: '#f44336', 
                      color: '#f44336',
                      '&:hover': { 
                        bgcolor: alpha('#f44336', 0.1),
                        borderColor: '#f44336' 
                      }
                    }}
                  >
                    View Rejected Subjects
                  </Button>
                </Box>
              </InfoCard>
            )}
          </Stack>
        </Grid>
      </Grid>
      {snackbar}
    </MainLayout>
  );
};

export default AcceptedDashboard;
