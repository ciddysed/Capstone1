import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Stack, Paper, Grid, Card, CardContent, 
  Button, Divider, Chip, CircularProgress, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress, Badge
} from "@mui/material";
import { 
  School as SchoolIcon, 
  Assignment as AssignmentIcon,
  Celebration as CelebrationIcon,
  AccountBalance as AccountBalanceIcon,
  EmojiEvents as EmojiEventsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from 'prop-types';
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";
import SubjectDetailModal from "./SubjectDetailModal";
import useSubjectNotifications from "../../../hooks/useSubjectNotifications";

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

InfoCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  icon: PropTypes.node,
  children: PropTypes.node,
  accentColor: PropTypes.string,
};

const AcceptedDashboard = () => {
  const navigate = useNavigate();
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [loading, setLoading] = useState(true);
  const [applicantData, setApplicantData] = useState(null);
  const [acceptanceData, setAcceptanceData] = useState(null);
  const [subjectRecords, setSubjectRecords] = useState({});
  const [curriculumSummary, setCurriculumSummary] = useState(null);
  const [expandedSemester, setExpandedSemester] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch all subjects (flattened from organized data)
  const fetchAllSubjects = useCallback(async () => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) return [];

    try {
      // Using the actual working API endpoint
      const response = await axios.get(
        `https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`
      );

      // Flatten the organized data into a single array
      const allSubjects = [];
      for (const semesterSubjects of Object.values(response.data || {})) {
        if (Array.isArray(semesterSubjects) && semesterSubjects.length > 0) {
          allSubjects.push(...semesterSubjects);
        }
      }

      return allSubjects;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  }, []);

  // Get all subjects in a flat array for notification tracking
  const allSubjectsFlat = Object.values(subjectRecords).flat();

  // Initialize real-time notification system
  const {
    isTracking,
    notificationCount,
    summary: notificationSummary,
    checkNow,
    refreshSummary
  } = useSubjectNotifications(
    localStorage.getItem("applicantId"),
    allSubjectsFlat,
    fetchAllSubjects,
    {
      enablePolling: true,
      showToast: true,
      autoInitialize: true
    }
  );

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
          `https://eteeap-foth.onrender.com/api/applicants/${applicantId}`
        );
        
        // Fetch accepted applicant data
        const acceptedResponse = await axios.get(
          `https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`
        );
        
        if (!acceptedResponse.data) {
          // If not accepted, redirect to regular dashboard
          handleError("You have not been accepted yet.");
          navigate("/ApplicantHomePage");
          return;
        }
        
        // Fetch subject records organized by semester (using working API)
        const subjectRecordsResponse = await axios.get(
          `https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`
        );
        
        // Calculate curriculum summary from the fetched data
        const allRecords = Object.values(subjectRecordsResponse.data).flat();
        const summaryResponse = {
          data: {
            totalSubjects: allRecords.length,
            approvedCount: allRecords.filter(r => r.status === 'APPROVED').length,
            pendingCount: allRecords.filter(r => r.status === 'PENDING').length,
            rejectedCount: allRecords.filter(r => r.status === 'REJECTED').length
          }
        };
        
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
  }, [navigate, handleError, handleSuccess, fetchAllSubjects]);
  
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

  const handleSubjectClick = (record) => {
    setSelectedSubject(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubject(null);
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
            {/* Removed redundant 'View Application' button to avoid duplicate CTAs. Use the main navigation or page header to access application tracking. */}
          </Grid>
        </Grid>
      </Paper>

      {/* Real-Time Notifications Status Bar */}
      {isTracking && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha('#2196f3', 0.05),
            border: `1px solid ${alpha('#2196f3', 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge 
              badgeContent={notificationCount} 
              color="error"
              max={99}
            >
              <NotificationsIcon sx={{ color: '#2196f3', fontSize: 32 }} />
            </Badge>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#2196f3' }}>
                Real-Time Notifications Active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You'll be notified immediately when subject evaluations are completed
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {notificationSummary && (
              <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                <Chip 
                  size="small" 
                  label={`${notificationSummary.approved} Approved`}
                  sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50', fontWeight: 600 }}
                />
                <Chip 
                  size="small" 
                  label={`${notificationSummary.pending} Pending`}
                  sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800', fontWeight: 600 }}
                />
                {notificationSummary.rejected > 0 && (
                  <Chip 
                    size="small" 
                    label={`${notificationSummary.rejected} Rejected`}
                    sx={{ bgcolor: alpha('#f44336', 0.1), color: '#f44336', fontWeight: 600 }}
                  />
                )}
              </Box>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={async () => {
                await checkNow();
                refreshSummary();
              }}
              sx={{ 
                borderColor: '#2196f3',
                color: '#2196f3',
                '&:hover': {
                  borderColor: '#1976d2',
                  bgcolor: alpha('#2196f3', 0.05)
                }
              }}
            >
              Check Now
            </Button>
          </Box>
        </Paper>
      )}

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
                                <TableRow 
                                  key={record.id} 
                                  hover
                                  onClick={() => handleSubjectClick(record)}
                                  sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': {
                                      bgcolor: alpha(maroon.light, 0.08),
                                      transition: 'background-color 0.2s'
                                    }
                                  }}
                                >
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

      {/* Subject Detail Modal */}
      <SubjectDetailModal
        open={isModalOpen}
        onClose={handleCloseModal}
        subjectRecord={selectedSubject}
      />

      {snackbar}
    </MainLayout>
  );
};

export default AcceptedDashboard;
