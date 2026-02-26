'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Grid, Card, CardContent,
  Button, Divider, Chip, CircularProgress, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress,
  Dialog, DialogContent, IconButton, Fade, Tooltip,
} from "@mui/material";
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Celebration as CelebrationIcon,
  EmojiEvents as EmojiEventsIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  ChecklistRounded as ChecklistIcon,
  MenuBook as MenuBookIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";

// ──────────────────────────────────────────────────────────────
// COLOR PALETTE
// ──────────────────────────────────────────────────────────────
const maroon = {
  50:  '#fdf2f2',
  100: '#f5d0d0',
  200: '#dfa3a3',
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};
const gold = {
  50:  '#fffdf5',
  100: '#fff8e1',
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#3D2E00',
};

const statusColors = {
  APPROVED:       { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', chip: '#059669', icon: '#10b981', label: 'Approved' },
  FOR_ENROLLMENT: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', chip: '#2563eb', icon: '#3b82f6', label: 'For Enrollment' },
  PENDING:        { bg: '#fffbeb', text: '#92400e', border: '#fde68a', chip: '#d97706', icon: '#f59e0b', label: 'Pending' },
};

// ──────────────────────────────────────────────────────────────
// SHARED STYLES
// ──────────────────────────────────────────────────────────────
const cardBase = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: alpha(maroon.main, 0.08),
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
  overflow: 'hidden',
  transition: 'box-shadow 0.25s ease, transform 0.25s ease',
  '&:hover': {
    boxShadow: '0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.04)',
    transform: 'translateY(-2px)',
  },
};

// ──────────────────────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bgColor, textColor, borderColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 2.5,
      bgcolor: bgColor,
      border: `1px solid ${borderColor}`,
      transition: 'all 0.25s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 8px 20px ${alpha(textColor, 0.12)}`,
      },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" sx={{ color: alpha(textColor, 0.7), fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: textColor, mt: 0.5, letterSpacing: -0.5 }}>
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: alpha(textColor, 0.1), color: textColor, width: 44, height: 44 }}>
        {icon}
      </Avatar>
    </Stack>
  </Paper>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  bgColor: PropTypes.string.isRequired,
  textColor: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
};

// ──────────────────────────────────────────────────────────────
// STATUS CHIP
// ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const c = statusColors[status] || statusColors.PENDING;
  return (
    <Chip
      icon={
        status === 'APPROVED'
          ? <CheckCircleIcon sx={{ fontSize: 16, color: `${c.icon} !important` }} />
          : status === 'FOR_ENROLLMENT'
          ? <MenuBookIcon sx={{ fontSize: 16, color: `${c.icon} !important` }} />
          : <PendingIcon sx={{ fontSize: 16, color: `${c.icon} !important` }} />
      }
      label={c.label}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontWeight: 700,
        fontSize: '0.7rem',
        height: 26,
        '& .MuiChip-icon': { ml: '4px' },
      }}
    />
  );
};

StatusChip.propTypes = { status: PropTypes.string.isRequired };

// ──────────────────────────────────────────────────────────────
// SUBJECT DETAIL MODAL
// ──────────────────────────────────────────────────────────────
const SubjectDetailModal = ({ open, onClose, subjectRecord }) => {
  if (!subjectRecord) return null;
  const subject = subjectRecord.subject || {};

  const DetailRow = ({ label, children }) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: maroon[50], border: `1px solid ${alpha(maroon.main, 0.06)}` }}>
      <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.5), fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>{label}</Typography>
      <Box sx={{ mt: 0.5 }}>{children}</Box>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ bgcolor: maroon.main, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <MenuBookIcon sx={{ color: gold.main, fontSize: 22 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Subject Details</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.1) } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <DetailRow label="Subject Code">
            <Typography variant="h6" sx={{ fontWeight: 800, color: maroon.main }}>{subject.subjectCode || 'N/A'}</Typography>
          </DetailRow>
          <DetailRow label="Descriptive Title">
            <Typography variant="body1" sx={{ fontWeight: 600, color: maroon.dark }}>{subject.descriptiveTitle || 'N/A'}</Typography>
          </DetailRow>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <DetailRow label="Units">
                <Typography variant="h6" sx={{ fontWeight: 800, color: maroon.main }}>{subject.units || 'N/A'}</Typography>
              </DetailRow>
            </Box>
            <Box sx={{ flex: 1 }}>
              <DetailRow label="Grade">
                <Typography variant="h6" sx={{ fontWeight: 800, color: maroon.main }}>{subjectRecord.originalGrade || 'N/A'}</Typography>
              </DetailRow>
            </Box>
          </Stack>
          <DetailRow label="Status">
            <Box sx={{ mt: 0.5 }}>
              <StatusChip status={subjectRecord.status} />
            </Box>
          </DetailRow>
          {subjectRecord.remarks && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <WarningIcon sx={{ fontSize: 18, color: '#d97706', mt: 0.3 }} />
                <Box>
                  <Typography variant="overline" sx={{ color: '#92400e', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>Remarks</Typography>
                  <Typography variant="body2" sx={{ color: '#78350f', mt: 0.5 }}>{subjectRecord.remarks}</Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

SubjectDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  subjectRecord: PropTypes.object,
};

// ──────────────────────────────────────────────────────────────
// ENROLLMENT SUCCESS MODAL
// ──────────────────────────────────────────────────────────────
const EnrollmentSuccessModal = ({ open, onClose, forEnrollmentSubjects }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
    <Box sx={{ bgcolor: maroon.main, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CelebrationIcon sx={{ color: gold.main, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>Curriculum Evaluation Complete!</Typography>
      </Stack>
      <IconButton onClick={onClose} size="small" sx={{ color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.1) } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <DialogContent sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: '#ecfdf5', border: '2px solid #34d399', textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: '#059669', mb: 1 }} />
          <Typography variant="h6" sx={{ color: '#065f46', fontWeight: 800, mb: 0.5 }}>All Subjects Evaluated</Typography>
          <Typography variant="body2" sx={{ color: '#047857' }}>
            You can now proceed to enrollment. Congratulations and good luck on your ETEEAP journey!
          </Typography>
          <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 800, mt: 2 }}>All Hail!</Typography>
        </Paper>

        {forEnrollmentSubjects && forEnrollmentSubjects.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <ChecklistIcon sx={{ color: maroon.main, fontSize: 22 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: maroon.main }}>
                Remaining Subjects to Enroll ({forEnrollmentSubjects.length})
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {forEnrollmentSubjects.map((subject, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(maroon.main, 0.03), border: `1px solid ${alpha(maroon.main, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: maroon.main }}>{subject.subjectCode}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subject.descriptiveTitle}</Typography>
                  </Box>
                  <Chip label={`${subject.units || 0} units`} size="small" variant="outlined" sx={{ bgcolor: alpha(gold.main, 0.1), color: gold.dark, borderColor: gold.main, fontWeight: 700 }} />
                </Paper>
              ))}
            </Stack>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: alpha(gold.main, 0.1), border: `2px solid ${gold.main}`, mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: gold.dark }}>Total Units to Enroll</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: maroon.main }}>
                {forEnrollmentSubjects.reduce((sum, s) => sum + (s.units || 0), 0)} Units
              </Typography>
            </Paper>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onClose}
          sx={{
            bgcolor: maroon.main,
            fontWeight: 700,
            py: 1.5,
            borderRadius: 2,
            fontSize: '0.95rem',
            textTransform: 'none',
            '&:hover': { bgcolor: maroon.dark, transform: 'translateY(-1px)', boxShadow: `0 6px 16px ${alpha(maroon.main, 0.3)}` },
          }}
        >
          Got It! Proceed to Enrollment
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);

EnrollmentSuccessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  forEnrollmentSubjects: PropTypes.array,
};

// ──────────────────────────────────────────────────────────────
// SECTION CARD WRAPPER
// ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, accentColor = maroon.main, children }) => (
  <Card elevation={0} sx={{ ...cardBase, borderTop: `3px solid ${accentColor}`, mb: 3 }}>
    <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
        <Avatar sx={{ bgcolor: alpha(accentColor, 0.08), color: accentColor, width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, color: accentColor, letterSpacing: 0.2 }}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2.5, bgcolor: alpha(accentColor, 0.08) }} />
      {children}
    </CardContent>
  </Card>
);

SectionCard.propTypes = {
  title: PropTypes.node.isRequired,
  icon: PropTypes.node,
  accentColor: PropTypes.string,
  children: PropTypes.node,
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [forEnrollmentSubjects, setForEnrollmentSubjects] = useState([]);

  // ── Polling for real-time acceptance status ──
  useEffect(() => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) return;
    let isMounted = true;
    const pollAcceptance = async () => {
      try {
        const resp = await axios.get(`https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`);
        if (isMounted && resp.data) setAcceptanceData(resp.data);
      } catch (err) {
        console.error('[AcceptedDashboard] Polling error:', err);
      }
    };
    const intervalId = setInterval(pollAcceptance, 10000);
    pollAcceptance();
    return () => { isMounted = false; clearInterval(intervalId); };
  }, []);

  const fetchAllSubjects = useCallback(async () => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) return [];
    try {
      const resp = await axios.get(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`);
      const all = [];
      for (const subs of Object.values(resp.data || {})) {
        if (Array.isArray(subs) && subs.length > 0) all.push(...subs);
      }
      return all;
    } catch (err) {
      console.error("Error fetching subjects:", err);
      return [];
    }
  }, []);

  // ── Initial data fetch ──
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
        const [applicantResp, acceptedResp, subjectsResp] = await Promise.all([
          axios.get(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`),
          axios.get(`https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${applicantId}`),
          axios.get(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${applicantId}/organized-clean`),
        ]);

        // Test the has-submitted endpoint
        try {
          const hasSubmittedResp = await axios.get(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}/has-submitted`);
          console.log('=== HAS-SUBMITTED ENDPOINT TEST ===');
          console.log('applicantData.applicantId:', applicantResp.data.applicantId || applicantId);
          console.log('applicantData.hasSubmitted:', hasSubmittedResp.data.hasSubmitted);
          console.log('Full has-submitted response:', hasSubmittedResp.data);
          console.log('====================================');
          
          // Add hasSubmitted to applicantData
          setApplicantData({...applicantResp.data, hasSubmitted: hasSubmittedResp.data.hasSubmitted});
        } catch (hasSubmittedError) {
          console.error('Error testing has-submitted endpoint:', hasSubmittedError);
          // Set applicantData without hasSubmitted if the endpoint fails
          setApplicantData(applicantResp.data);
        }

        if (!acceptedResp.data) {
          handleError("You have not been accepted yet.");
          navigate("/ApplicantHomePage");
          return;
        }

        // De-duplicate and sort
        const processSemester = (data) => {
          if (!data || typeof data !== 'object') return data;
          const out = {};
          Object.keys(data).forEach((sem) => {
            let arr = [...data[sem]].sort((a, b) => {
              const cA = a.subject?.subjectCode || '';
              const cB = b.subject?.subjectCode || '';
              return cA && cB ? cA.localeCompare(cB) : (a.subject?.subjectId || a.id || 0) - (b.subject?.subjectId || b.id || 0);
            });
            const seen = new Set();
            arr = arr.filter((item) => {
              const key = item.subject?.subjectId || item.subject?.subjectCode || item.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            out[sem] = arr;
          });
          return out;
        };

        const processed = processSemester(subjectsResp.data);
        const allRecords = Object.values(processed).flat();
        const summary = {
          totalSubjects: allRecords.length,
          approvedCount: allRecords.filter(r => r.status === 'APPROVED' || r.status === 'FOR_ENROLLMENT').length,
          pendingCount: allRecords.filter(r => r.status === 'PENDING').length,
          forEnrollmentCount: allRecords.filter(r => r.status === 'FOR_ENROLLMENT').length,
        };

        // setApplicantData is now handled in the has-submitted endpoint section above
        setAcceptanceData(acceptedResp.data);
        setSubjectRecords(processed);
        setCurriculumSummary(summary);

        const allCompleted = allRecords.length > 0 && allRecords.every(r => r.status === 'APPROVED' || r.status === 'FOR_ENROLLMENT');
        if (allCompleted) {
          const enrollSubs = allRecords.filter(r => r.status === 'FOR_ENROLLMENT').map(r => ({
            subjectCode: r.subject?.subjectCode || 'N/A',
            descriptiveTitle: r.subject?.descriptiveTitle || 'N/A',
            units: r.subject?.units || 0,
            id: r.id,
          }));
          setForEnrollmentSubjects(enrollSubs);
          setShowSuccessModal(true);
        }

        handleSuccess("Welcome to your acceptance dashboard!");
      } catch (err) {
        console.error("Error fetching accepted dashboard data:", err);
        handleError("Error loading your acceptance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, handleError, handleSuccess, fetchAllSubjects]);

  // ── Helpers ──
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const progressPercent = curriculumSummary && curriculumSummary.totalSubjects > 0
    ? Math.round((curriculumSummary.approvedCount / curriculumSummary.totalSubjects) * 100)
    : 0;

  const handleAccordionChange = (panel) => (_e, isExpanded) => {
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

  // ── Loading State ──
  if (loading) {
    return (
      <MainLayout
        backgroundImage={backgroundImage}
        userType="applicant"
        data={applicantData?.firstName ? `${applicantData.firstName} ${applicantData.lastName}` : "Applicant"}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column" }}>
          <CircularProgress size={48} sx={{ color: maroon.main }} />
          <Typography variant="subtitle1" sx={{ mt: 2.5, color: maroon.main, fontWeight: 600 }}>
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
      {/* ── Navigation Bar ── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: gold[50],
          border: `1px solid ${alpha(gold.main, 0.3)}`,
        }}
      >
        <Button
          component={RouterLink}
          to="/accepted-dashboard"
          startIcon={<DashboardIcon />}
          sx={{
            fontWeight: 600,
            color: maroon.main,
            textTransform: 'none',
            '&.Mui-disabled': { color: maroon.main, opacity: 0.7 },
          }}
          disabled
        >
          Accepted Dashboard
        </Button>
      </Paper>

      {/* ── Congratulations Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${gold.light} 0%, ${gold.main} 100%)`,
          border: `2px solid ${gold.dark}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 12px 40px ${alpha(gold.main, 0.2)}`,
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -30, opacity: 0.06 }}>
          <CelebrationIcon sx={{ fontSize: 280, color: maroon.main }} />
        </Box>
        <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Chip
              icon={<EmojiEventsIcon sx={{ fontSize: 18, color: `${maroon.main} !important` }} />}
              label="ACCEPTED"
              sx={{
                bgcolor: alpha('#fff', 0.6),
                color: maroon.main,
                fontWeight: 800,
                letterSpacing: 1,
                fontSize: '0.7rem',
                height: 28,
                mb: 2,
                backdropFilter: 'blur(4px)',
              }}
            />
            <Typography variant="h3" sx={{ color: maroon.main, fontWeight: 800, mb: 1, letterSpacing: -0.5, lineHeight: 1.2 }}>
              Congratulations, {applicantData?.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ color: maroon.dark, mb: 2, fontWeight: 700 }}>
              You have been accepted to {acceptanceData?.finalCourse?.courseName}
            </Typography>
            <Typography variant="body1" sx={{ color: maroon.dark, lineHeight: 1.7, maxWidth: 600 }}>
              Your application was approved on <strong>{formatDate(acceptanceData?.acceptanceDate)}</strong>.
              Review your curriculum evaluation below and prepare for your ETEEAP journey!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#fff', 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', border: `4px solid ${alpha('#fff', 0.4)}` }}>
              <EmojiEventsIcon sx={{ fontSize: 64, color: maroon.main, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Remarks (if any) ── */}
      {acceptanceData?.remarks && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2.5,
            bgcolor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <InfoIcon sx={{ color: '#2563eb', fontSize: 22, mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af', mb: 0.5 }}>Remarks</Typography>
            <Typography variant="body2" sx={{ color: '#1e3a8a', lineHeight: 1.6 }}>{acceptanceData.remarks}</Typography>
          </Box>
        </Paper>
      )}

      {/* ── Curriculum Progress Summary ── */}
      <SectionCard title="Curriculum Progress Summary" icon={<AssignmentIcon />} accentColor={maroon.main}>
        {curriculumSummary ? (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <StatCard label="Approved" value={curriculumSummary.approvedCount || 0} icon={<CheckCircleIcon />} bgColor="#ecfdf5" textColor="#059669" borderColor="#a7f3d0" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Pending" value={curriculumSummary.pendingCount || 0} icon={<PendingIcon />} bgColor="#fffbeb" textColor="#d97706" borderColor="#fde68a" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="For Enrollment" value={curriculumSummary.forEnrollmentCount || 0} icon={<MenuBookIcon />} bgColor="#eff6ff" textColor="#2563eb" borderColor="#bfdbfe" />
              </Grid>
              <Grid item xs={6} md={3}>
                <StatCard label="Total Subjects" value={curriculumSummary.totalSubjects || 0} icon={<SchoolIcon />} bgColor={maroon[50]} textColor={maroon.main} borderColor={alpha(maroon.main, 0.15)} />
              </Grid>
            </Grid>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Overall Progress</Typography>
                {!applicantData?.hasSubmitted && (
                  <Tooltip 
                  title={
                    <Stack spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                        Hey {applicantData?.firstName || 'there'}, congrats on your acceptance. Please complete your self evaluation for your next step in the acceptance phase
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/evaluation-form')}
                        sx={{
                          bgcolor: gold.main,
                          color: maroon.main,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          borderRadius: 1.5,
                          px: 2,
                          py: 0.5,
                          '&:hover': {
                            bgcolor: gold.light,
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        Start Self Evaluation
                      </Button>
                    </Stack>
                  }
                  open={true}
                  arrow
                  placement="left"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: maroon.main,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        maxWidth: 320,
                        p: 2,
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${alpha(maroon.main, 0.3)}`,
                      }
                    },
                    arrow: { sx: { color: maroon.main } }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: maroon.main }}>
                    {curriculumSummary?.approvedCount || 0} / {curriculumSummary?.totalSubjects || 0} subjects Evaluated ({progressPercent}%)
                  </Typography>
                </Tooltip>
                )}
                {applicantData?.hasSubmitted && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: maroon.main }}>
                    {curriculumSummary?.approvedCount || 0} / {curriculumSummary?.totalSubjects || 0} subjects Evaluated ({progressPercent}%)
                  </Typography>
                )}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(maroon.main, 0.08),
                  '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 5 },
                }}
              />
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No curriculum data available yet.</Typography>
        )}
      </SectionCard>

      {/* ── Subject Records by Semester ── */}
      <SectionCard title="Subject Records by Semester" icon={<SchoolIcon />} accentColor={gold.dark}>
        {Object.keys(subjectRecords).length > 0 ? (
          <Stack spacing={1.5}>
            {Object.entries(subjectRecords).map(([semesterLabel, records]) => {
              const approvedCount = records.filter(r => r.status === 'APPROVED').length;
              return (
                <Accordion
                  key={semesterLabel}
                  expanded={expandedSemester === semesterLabel}
                  onChange={handleAccordionChange(semesterLabel)}
                  elevation={0}
                  sx={{
                    '&:before': { display: 'none' },
                    border: `1px solid ${alpha(maroon.main, 0.1)}`,
                    borderRadius: '10px !important',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s',
                    '&.Mui-expanded': { borderColor: alpha(maroon.main, 0.25) },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}
                    sx={{
                      bgcolor: alpha(maroon.main, 0.02),
                      '&:hover': { bgcolor: alpha(maroon.main, 0.04) },
                      '&.Mui-expanded': { bgcolor: alpha(maroon.main, 0.04) },
                      minHeight: 56,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: maroon.dark }}>{semesterLabel}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`${approvedCount}/${records.length} approved`} size="small" sx={{ bgcolor: alpha('#059669', 0.08), color: '#059669', fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                        <Chip label={`${records.length} subject${records.length !== 1 ? 's' : ''}`} size="small" sx={{ bgcolor: alpha(gold.main, 0.15), color: gold.dark, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: alpha(maroon.main, 0.03) }}>
                            <TableCell sx={{ fontWeight: 700, color: maroon.main, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Code</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: maroon.main, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: maroon.main, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Units</TableCell>
                            
                            <TableCell align="center" sx={{ fontWeight: 700, color: maroon.main, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {records.map((record) => (
                            <Tooltip key={record.id} title="Click to view details" placement="left" arrow>
                              <TableRow
                                hover
                                onClick={() => handleSubjectClick(record)}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s',
                                  '&:hover': { bgcolor: alpha(maroon.main, 0.04) },
                                  '&:last-child td': { borderBottom: 0 },
                                }}
                              >
                                <TableCell sx={{ fontWeight: 700, color: maroon.main, fontSize: '0.85rem' }}>{record.subject?.subjectCode || 'N/A'}</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontSize: '0.85rem' }}>{record.subject?.descriptiveTitle || 'N/A'}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{record.subject?.units || 'N/A'}</TableCell>
                              
                                <TableCell align="center"><StatusChip status={record.status} /></TableCell>
                              </TableRow>
                            </Tooltip>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No subject records available yet.</Typography>
        )}
      </SectionCard>

      {/* ── Modals ── */}
      <SubjectDetailModal open={isModalOpen} onClose={handleCloseModal} subjectRecord={selectedSubject} />
      <EnrollmentSuccessModal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} forEnrollmentSubjects={forEnrollmentSubjects} />
      {snackbar}
    </MainLayout>
  );
};

export default AcceptedDashboard;
