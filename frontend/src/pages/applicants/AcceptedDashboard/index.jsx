'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Stack, Paper, Grid, Card, CardContent, 
  Button, Divider, Chip, CircularProgress, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress,
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

} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Home as HomeIcon, ListAlt as TrackIcon, School as CourseIcon, Dashboard as DashboardIcon } from "@mui/icons-material";
import axios from "axios";
import PropTypes from 'prop-types';
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";
import SubjectDetailModal from "./SubjectDetailModal";

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
    // Polling for real-time acceptance status and remarks
    useEffect(() => {
      const applicantId = localStorage.getItem("applicantId");
      if (!applicantId) return;
      let isMounted = true;
      const pollAcceptance = async () => {
        try {
          const acceptedResponse = await axios.get(
            `https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`
          );
          if (isMounted && acceptedResponse.data) {
            setAcceptanceData(acceptedResponse.data);
            // Debug log
            console.log('[AcceptedDashboard] acceptanceData updated:', acceptedResponse.data);
          }
        } catch (err) {
          // Prevent uncaught errors from crashing the app
          console.error('[AcceptedDashboard] Polling error:', err);
        }
      };
      const intervalId = setInterval(() => {
        pollAcceptance();
      }, 10000); // Poll every 10 seconds
      // Initial fetch
      pollAcceptance();
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }, []);
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

        // Sort and deduplicate subjects in each semester
        const processSemesterSubjects = (data) => {
          if (!data || typeof data !== 'object') return data;
          const processed = {};
          Object.keys(data).forEach((semester) => {
            // Sort by subjectCode (or subjectId as fallback)
            let arr = [...data[semester]].sort((a, b) => {
              const codeA = a.subject?.subjectCode || '';
              const codeB = b.subject?.subjectCode || '';
              if (codeA && codeB) return codeA.localeCompare(codeB);
              return (a.subject?.subjectId || a.id || 0) - (b.subject?.subjectId || b.id || 0);
            });
            // Deduplicate by subjectId (or subjectCode as fallback)
            const seen = new Set();
            arr = arr.filter((item) => {
              const key = item.subject?.subjectId || item.subject?.subjectCode || item.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            processed[semester] = arr;
          });
          return processed;
        };

        const processedSubjectRecords = processSemesterSubjects(subjectRecordsResponse.data);

        // Calculate curriculum summary from the processed data
        const allRecords = Object.values(processedSubjectRecords).flat();
        const summaryResponse = {
          data: {
            totalSubjects: allRecords.length,
            approvedCount: allRecords.filter(r => r.status === 'APPROVED').length,
            pendingCount: allRecords.filter(r => r.status === 'PENDING').length,
            forEnrollmentCount: allRecords.filter(r => r.status === 'FOR_ENROLLMENT').length
          }
        };

        setApplicantData(applicantResponse.data);
        setAcceptanceData(acceptedResponse.data);
        setSubjectRecords(processedSubjectRecords);
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
      case 'FOR_ENROLLMENT':
        return <CheckCircleIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
      case 'PENDING':
      default:
        return <PendingIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#4caf50';
      case 'FOR_ENROLLMENT':
        return '#2196f3';
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
      {/* Seamless Applicant Navigation Bar */}
      <Paper elevation={2} sx={{ mb: 3, p: 1.5, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg, #fffbe6 0%, #fff 100%)`, border: '1px solid #ffe082' }}>
       
        <Button
          component={RouterLink}
          to="/accepted-dashboard"
          startIcon={<DashboardIcon />}
          sx={{ fontWeight: 600 }}
          disabled
        >
          Accepted Dashboard
        </Button>
      </Paper>
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
            {/* Removed redundant 'View Application' and Go to Dashboard button as per new requirements. Use the main navigation or page header to access application tracking. */}
          </Grid>
        </Grid>
      </Paper>


      <Grid container spacing={3}>
        <Grid item xs={12} md={10}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
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
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#2196f3', 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="#2196f3">
                          {curriculumSummary.forEnrollmentCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">For Enrollment</Typography>
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
            </Box>
            <Box sx={{ minWidth: 320, maxWidth: 340, ml: 2 }}>
              {/* Acceptance Details - Improved UI, no course code */}
              <InfoCard 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
                    <span>Acceptance Details</span>
                  </Box>
                }
                accentColor="#2e7d32"
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(120deg, #e8f5e9 0%, #f1f8e9 100%)',
                    boxShadow: '0 2px 8px rgba(46,125,50,0.07)',
                    mb: 1,
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={acceptanceData?.status || "ACCEPTED"} 
                        color="success" 
                        variant="filled" 
                        sx={{ fontWeight: 700, fontSize: 16, px: 2, py: 1, letterSpacing: 1, textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Acceptance Date</Typography>
                      <Typography variant="body1" fontWeight={600} color="#2e7d32">
                        {formatDate(acceptanceData?.acceptanceDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Program</Typography>
                      <Typography variant="h6" fontWeight={700} color="#388e3c" sx={{ letterSpacing: 0.5 }}>
                        {acceptanceData?.finalCourse?.courseName || 'N/A'}
                      </Typography>
                    </Box>
                    {acceptanceData?.remarks && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                        <Paper elevation={0} sx={{ mt: 0.5, p: 2, bgcolor: alpha('#c8e6c9', 0.5), borderLeft: '4px solid #2e7d32', borderRadius: 2 }}>
                          <Typography variant="body2" color="#2e7d32">
                            {acceptanceData.remarks}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                </Paper>
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
            </Box>
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
