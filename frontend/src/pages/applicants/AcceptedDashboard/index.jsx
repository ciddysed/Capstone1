'use client';

import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, Stack, Paper, Grid, Card, CardContent, 
  Button, Divider, Chip, CircularProgress, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress,
  Dialog, DialogContent, DialogTitle, IconButton,
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
  Close as CloseIcon,
  ChecklistRounded as ChecklistIcon,
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

// Styled card component with enhanced UI
const InfoCard = ({ title, icon, children, accentColor = maroon.main }) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderTop: `4px solid ${accentColor}`,
      border: `1px solid ${alpha(accentColor, 0.1)}`,
      borderRadius: 2.5,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(10px)',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 16px 40px ${alpha(accentColor, 0.15)}`,
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
        <Avatar 
          sx={{ 
            bgcolor: `linear-gradient(135deg, ${alpha(accentColor, 0.2)} 0%, ${alpha(accentColor, 0.1)} 100%)`,
            color: accentColor,
            width: 44,
            height: 44,
            fontSize: 22
          }}
        >
          {icon}
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            ml: 1.5, 
            fontWeight: 700, 
            color: accentColor,
            letterSpacing: 0.3
          }}
        >
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 2.5, bgcolor: alpha(accentColor, 0.1) }} />
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

// Success Modal Component
const EnrollmentSuccessModal = ({ open, onClose, forEnrollmentSubjects }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CelebrationIcon sx={{ fontSize: 32, color: gold.main }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: maroon.main }}>
              Curriculum Evaluation Complete!
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Success Message */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #22c55e',
              textAlign: 'center'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: '#16a34a', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#166534', fontWeight: 700, mb: 1 }}>
              All Subjects Evaluated
            </Typography>
            <Typography variant="body2" sx={{ color: '#166534' }}>
              You can now proceed to enrollment. Congrats and Good luck on your ETEEAP journey and Success.
            </Typography>
            <Typography variant="body1" sx={{ color: '#22c55e', fontWeight: 700, mt: 2, fontSize: 24 }}>
              All Hail!
            </Typography>
          </Paper>

          {/* Remaining Subjects Summary */}
          {forEnrollmentSubjects && forEnrollmentSubjects.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ChecklistIcon sx={{ color: maroon.main, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: maroon.main }}>
                  Remaining Subjects to Enroll ({forEnrollmentSubjects.length})
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {forEnrollmentSubjects.map((subject, index) => (
                  <Paper 
                    key={index}
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 1.5, 
                      bgcolor: alpha(maroon.main, 0.05),
                      border: `1px solid ${alpha(maroon.main, 0.2)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: maroon.main }}>
                        {subject.subjectCode}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {subject.descriptiveTitle}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${subject.units || 0} units`}
                      variant="outlined"
                      sx={{ 
                        bgcolor: alpha(gold.main, 0.1),
                        color: gold.dark,
                        borderColor: gold.main,
                        fontWeight: 700,
                        ml: 2
                      }}
                    />
                  </Paper>
                ))}
              </Stack>

              {/* Total Units Summary */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: `2px solid ${gold.main}`,
                  mt: 2.5,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: gold.dark, mb: 0.5 }}>
                  Total Units to Enroll
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: maroon.main,
                    fontSize: 32
                  }}
                >
                  {forEnrollmentSubjects.reduce((sum, s) => sum + (s.units || 0), 0)} Units
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Action Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onClose}
            sx={{
              background: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.light} 100%)`,
              color: maroon.contrastText,
              fontWeight: 700,
              py: 1.5,
              fontSize: 16,
              borderRadius: 2,
              '&:hover': {
                background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(106, 0, 0, 0.3)'
              }
            }}
          >
            Got It! Proceed to Enrollment
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
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
            console.log('[AcceptedDashboard] acceptanceData updated:', acceptedResponse.data);
          }
        } catch (err) {
          console.error('[AcceptedDashboard] Polling error:', err);
        }
      };
      const intervalId = setInterval(() => {
        pollAcceptance();
      }, 10000);
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [forEnrollmentSubjects, setForEnrollmentSubjects] = useState([]);

  const fetchAllSubjects = useCallback(async () => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) return [];

    try {
      const response = await axios.get(
        `https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`
      );

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
        
        const applicantResponse = await axios.get(
          `https://eteeap-foth.onrender.com/api/applicants/${applicantId}`
        );
        
        const acceptedResponse = await axios.get(
          `https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`
        );
        
        if (!acceptedResponse.data) {
          handleError("You have not been accepted yet.");
          navigate("/ApplicantHomePage");
          return;
        }
        
        const subjectRecordsResponse = await axios.get(
          `https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`
        );

        const processSemesterSubjects = (data) => {
          if (!data || typeof data !== 'object') return data;
          const processed = {};
          Object.keys(data).forEach((semester) => {
            let arr = [...data[semester]].sort((a, b) => {
              const codeA = a.subject?.subjectCode || '';
              const codeB = b.subject?.subjectCode || '';
              if (codeA && codeB) return codeA.localeCompare(codeB);
              return (a.subject?.subjectId || a.id || 0) - (b.subject?.subjectId || b.id || 0);
            });
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

        // Check if all records are APPROVED or FOR_ENROLLMENT
        const allCompleted = allRecords.length > 0 && 
          allRecords.every(r => r.status === 'APPROVED' || r.status === 'FOR_ENROLLMENT');
        
        if (allCompleted) {
          const enrollmentSubjects = allRecords
            .filter(r => r.status === 'FOR_ENROLLMENT')
            .map(r => ({
              subjectCode: r.subject?.subjectCode || 'N/A',
              descriptiveTitle: r.subject?.descriptiveTitle || 'N/A',
              units: r.subject?.units || 0,
              id: r.id
            }));
          
          setForEnrollmentSubjects(enrollmentSubjects);
          setShowSuccessModal(true);
        }

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
      
      {/* Enhanced Congratulations Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${gold.light} 0%, ${gold.main} 50%, ${alpha(gold.main, 0.9)} 100%)`,
          border: `2px solid ${gold.dark}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 12px 40px ${alpha(gold.main, 0.2)}`
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, opacity: 0.08 }}>
          <CelebrationIcon sx={{ fontSize: 240, color: maroon.main }} />
        </Box>
        <Grid container spacing={3} alignItems="center" position="relative" zIndex={1}>
          <Grid item xs={12} md={8}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: maroon.main, 
                fontWeight: 800, 
                mb: 1.5,
                letterSpacing: -0.5
              }}
            >
              Congratulations, {applicantData?.firstName}!
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: maroon.dark, 
                mb: 2,
                fontWeight: 700,
                letterSpacing: 0.2
              }}
            >
              You have been accepted to {acceptanceData?.finalCourse?.courseName}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: maroon.dark,
                lineHeight: 1.7,
                fontSize: '1.05rem'
              }}
            >
              Your application has been approved on <strong>{formatDate(acceptanceData?.acceptanceDate)}</strong>. 
              Review your curriculum evaluation below and prepare for your ETEEAP journey!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <EmojiEventsIcon sx={{ fontSize: 100, color: maroon.main, mb: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }} />
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
                  <Grid container spacing={2.5}>
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          textAlign: 'center', 
                          p: 2.5, 
                          bgcolor: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                          borderRadius: 2.5,
                          border: '1px solid #81c784',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(76, 175, 80, 0.15)'
                          }
                        }}
                      >
                        <Typography variant="h4" fontWeight={800} color="#2e7d32" sx={{ letterSpacing: -0.5 }}>
                          {curriculumSummary.approvedCount || 0}
                        </Typography>
                        <Typography variant="body2" color="#558b2f" fontWeight={600}>Approved</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          textAlign: 'center', 
                          p: 2.5, 
                          bgcolor: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                          borderRadius: 2.5,
                          border: '1px solid #ffb74d',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(255, 152, 0, 0.15)'
                          }
                        }}
                      >
                        <Typography variant="h4" fontWeight={800} color="#e65100" sx={{ letterSpacing: -0.5 }}>
                          {curriculumSummary.pendingCount || 0}
                        </Typography>
                        <Typography variant="body2" color="#bf360c" fontWeight={600}>Pending</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          textAlign: 'center', 
                          p: 2.5, 
                          bgcolor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          borderRadius: 2.5,
                          border: '1px solid #64b5f6',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(33, 150, 243, 0.15)'
                          }
                        }}
                      >
                        <Typography variant="h4" fontWeight={800} color="#01579b" sx={{ letterSpacing: -0.5 }}>
                          {curriculumSummary.forEnrollmentCount || 0}
                        </Typography>
                        <Typography variant="body2" color="#004c97" fontWeight={600}>For Enrollment</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          textAlign: 'center', 
                          p: 2.5, 
                          bgcolor: `linear-gradient(135deg, ${alpha(maroon.main, 0.15)} 0%, ${alpha(maroon.main, 0.08)} 100%)`,
                          borderRadius: 2.5,
                          border: `1px solid ${alpha(maroon.main, 0.3)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 16px ${alpha(maroon.main, 0.15)}`
                          }
                        }}
                      >
                        <Typography variant="h4" fontWeight={800} color={maroon.main} sx={{ letterSpacing: -0.5 }}>
                          {curriculumSummary.totalSubjects || 0}
                        </Typography>
                        <Typography variant="body2" color={maroon.dark} fontWeight={600}>Total Subjects</Typography>
                      </Paper>
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
                                    <TableCell>
                                      {record.subject?.descriptiveTitle || 'N/A'}
                                    </TableCell>
                                    <TableCell align="center">
                                      {record.originalGrade || 'N/A'}
                                    </TableCell>
                                    <TableCell align="center">
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                        {getStatusIcon(record.status)}
                                        <Chip
                                          label={record.status}
                                          size="small"
                                          sx={{
                                            bgcolor: alpha(getStatusColor(record.status), 0.15),
                                            color: getStatusColor(record.status),
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                          }}
                                        />
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
                  <Typography variant="body2" color="text.secondary">
                    No subject records available yet.
                  </Typography>
                )}
              </InfoCard>
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

      {/* Enrollment Success Modal */}
      <EnrollmentSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        forEnrollmentSubjects={forEnrollmentSubjects}
      />

      {snackbar}
    </MainLayout>
  );
};

export default AcceptedDashboard;
