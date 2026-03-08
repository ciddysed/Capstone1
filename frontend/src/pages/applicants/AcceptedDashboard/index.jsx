'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Stack, Paper, Grid, Card, CardContent,
  Button, Chip, CircularProgress, Avatar, alpha,
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
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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
  borderRadius: 3.5,
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.1)',
    transform: 'translateY(-3px)',
    borderColor: 'rgba(255,255,255,0.8)',
  },
};

// ──────────────────────────────────────────────────────────────
// STAT CARD
// ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bgColor, textColor, borderColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      bgcolor: bgColor,
      border: `2px solid ${borderColor}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${textColor}, ${alpha(textColor, 0.5)})`,
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 28px ${alpha(textColor, 0.15)}`,
        borderColor: textColor,
      },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography variant="body2" sx={{ color: alpha(textColor, 0.65), fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {label}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, color: textColor, mt: 1, letterSpacing: -0.8 }}>
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: alpha(textColor, 0.12), color: textColor, width: 52, height: 52, boxShadow: `0 4px 12px ${alpha(textColor, 0.2)}` }}>
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
          ? <CheckCircleIcon sx={{ fontSize: 17, color: `${c.icon} !important` }} />
          : status === 'FOR_ENROLLMENT'
          ? <MenuBookIcon sx={{ fontSize: 17, color: `${c.icon} !important` }} />
          : <PendingIcon sx={{ fontSize: 17, color: `${c.icon} !important` }} />
      }
      label={c.label}
      size="small"
      sx={{
        bgcolor: c.bg,
        color: c.text,
        border: `1.5px solid ${c.border}`,
        fontWeight: 800,
        fontSize: '0.72rem',
        height: 28,
        letterSpacing: 0.4,
        transition: 'all 0.25s ease',
        '& .MuiChip-icon': { ml: '6px', mr: '2px' },
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(c.chip, 0.2)}`,
          transform: 'scale(1.05)',
        },
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
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: maroon[50], border: `1.5px solid ${alpha(maroon.main, 0.1)}`, transition: 'all 0.25s ease' }}>
      <Typography variant="overline" sx={{ color: alpha(maroon.main, 0.6), fontWeight: 800, fontSize: '0.65rem', letterSpacing: 1.2 }}>{label}</Typography>
      <Box sx={{ mt: 0.8 }}>{children}</Box>
    </Paper>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}>
      <Box sx={{ bgImage: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.dark} 100%)`, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 4px 16px ${alpha(maroon.main, 0.3)}` }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: gold.main, color: maroon.main, width: 40, height: 40 }}>
            <MenuBookIcon sx={{ fontSize: 22 }} />
          </Avatar>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: 0.3 }}>Subject Details</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: gold.main, '&:hover': { bgcolor: alpha(gold.main, 0.15) }, transition: 'all 0.25s ease' }}>
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
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}>
    <Box sx={{ bgImage: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.dark} 100%)`, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 4px 16px ${alpha(maroon.main, 0.3)}` }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: gold.main, color: maroon.main, width: 44, height: 44 }}>
          <CelebrationIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: 0.3 }}>Curriculum Evaluation Complete!</Typography>
      </Stack>
      <IconButton onClick={onClose} size="small" sx={{ color: gold.main, '&:hover': { bgcolor: alpha(gold.main, 0.15) }, transition: 'all 0.25s ease' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <DialogContent sx={{ p: 4 }}>
      <Stack spacing={3.5}>
        <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, bgImage: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '2px solid #34d399', textAlign: 'center', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}>
          <Avatar sx={{ bgcolor: '#10b981', color: '#fff', width: 60, height: 60, margin: '0 auto', mb: 2, boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)' }}>
            <CheckCircleIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography variant="h6" sx={{ color: '#065f46', fontWeight: 900, mb: 1, fontSize: '1.15rem' }}>All Subjects Evaluated</Typography>
          <Typography variant="body2" sx={{ color: '#047857', lineHeight: 1.6 }}>
            You can now proceed to enrollment. Congratulations and good luck on your ETEEAP journey!
          </Typography>
          <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 900, mt: 2.5 }}>✨ All Hail! ✨</Typography>
        </Paper>

        {forEnrollmentSubjects && forEnrollmentSubjects.length > 0 && (
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
              <Avatar sx={{ bgcolor: maroon.main, color: '#fff', width: 36, height: 36 }}>
                <ChecklistIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: maroon.main, fontSize: '0.95rem', letterSpacing: 0.3 }}>
                Remaining Subjects to Enroll ({forEnrollmentSubjects.length})
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {forEnrollmentSubjects.map((subject, idx) => (
                <Paper key={idx} elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: alpha(maroon.main, 0.04), border: `1.5px solid ${alpha(maroon.main, 0.12)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.25s ease', '&:hover': { bgcolor: alpha(maroon.main, 0.06), borderColor: alpha(maroon.main, 0.25), transform: 'translateX(2px)' } }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: maroon.main, letterSpacing: 0.2 }}>{subject.subjectCode}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.4 }}>{subject.descriptiveTitle}</Typography>
                  </Box>
                  <Chip label={`${subject.units || 0} units`} size="small" variant="outlined" sx={{ bgcolor: alpha(gold.main, 0.12), color: gold.dark, borderColor: gold.main, fontWeight: 800, fontSize: '0.75rem' }} />
                </Paper>
              ))}
            </Stack>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgImage: `linear-gradient(135deg, ${alpha(gold.main, 0.12)} 0%, ${alpha(gold.main, 0.06)} 100%)`, border: `2.5px solid ${gold.main}`, mt: 3, textAlign: 'center', boxShadow: `0 4px 12px ${alpha(gold.main, 0.15)}` }}>
              <Typography variant="caption" sx={{ color: gold.dark, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.8, textTransform: 'uppercase' }}>Total Units to Enroll</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: maroon.main, mt: 0.8, letterSpacing: -1 }}>
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
            bgImage: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.dark} 100%)`,
            color: '#fff',
            fontWeight: 900,
            py: 1.75,
            px: 2,
            borderRadius: 2.5,
            fontSize: '0.95rem',
            textTransform: 'none',
            letterSpacing: 0.3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 16px ${alpha(maroon.main, 0.25)}`,
            '&:hover': { 
              bgImage: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 100%)`,
              transform: 'translateY(-2px)', 
              boxShadow: `0 8px 24px ${alpha(maroon.main, 0.4)}` 
            },
            '&:active': { transform: 'translateY(0)' },
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
  <Card elevation={0} sx={{ 
    ...cardBase, 
    borderTop: `5px solid ${accentColor}`,
    borderRadius: 4,
    mb: 4,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      ...cardBase['&:hover'],
      borderTopColor: accentColor,
    }
  }}>
    <Box sx={{
      px: { xs: 3, md: 4.5 },
      py: 3,
      background: `linear-gradient(135deg, ${alpha(accentColor, 0.12)} 0%, ${alpha(accentColor, 0.05)} 100%)`,
      borderBottom: `1.5px solid ${alpha(accentColor, 0.1)}`,
    }}>
      <Stack direction="row" alignItems="center" spacing={2.5}>
        <Avatar sx={{
          bgcolor: accentColor,
          color: '#fff',
          width: 48,
          height: 48,
          boxShadow: `0 6px 16px ${alpha(accentColor, 0.35)}`,
          fontSize: '1.3rem',
        }}>
          {icon}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 900, color: accentColor, letterSpacing: 0.5, fontSize: '1.15rem' }}>
          {title}
        </Typography>
      </Stack>
    </Box>
    <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
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
  const [documents, setDocuments] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    fetchDocuments();
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

  // ── Document Upload Functions ──
  const fetchDocuments = async () => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId) return;
    try {
      const response = await axios.get(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`);
      // Filter for OTHER_DOCUMENT type only to prevent duplicates
      const otherDocuments = (response.data || []).filter(doc => doc.documentType === 'OTHER_DOCUMENT');
      setDocuments(otherDocuments);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleFileUpload = async (files) => {
    const applicantId = localStorage.getItem("applicantId");
    if (!applicantId || !files.length) return;

    // Check if OTHER_DOCUMENT already exists to prevent duplicates
    if (documents.length > 0) {
      handleError('E-Portfolio document already uploaded. Please delete the existing one first.');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 15MB limit`);
        }
        formData.append('files', file);
      });
      formData.append('applicantId', applicantId);
      formData.append('documentType', 'OTHER_DOCUMENT');

      await axios.post('https://eteeap-foth.onrender.com/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleSuccess('E-Portfolio document uploaded successfully!');
      fetchDocuments();
    } catch (err) {
      const errorMsg = err.response?.data || err.message || 'Upload failed';
      handleError(errorMsg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`https://eteeap-foth.onrender.com/api/documents/${documentId}`);
      handleSuccess('Document deleted successfully!');
      fetchDocuments();
    } catch (err) {
      handleError('Failed to delete document');
    }
  };

  const handlePreviewDocument = (documentId) => {
    window.open(`https://eteeap-foth.onrender.com/api/documents/preview/${documentId}`, '_blank');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <MainLayout
        backgroundImage={backgroundImage}
        blurBackground
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
      blurBackground
      userType="applicant"
      data={applicantData?.firstName ? `${applicantData.firstName} ${applicantData.lastName}` : "Applicant"}
    >
      {/* ── Congratulations Banner ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          mb: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 50%, ${maroon.light} 100%)`,
          backgroundAttachment: 'fixed',
          border: `2px solid ${alpha('#fff', 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 20px 60px ${alpha(maroon.main, 0.4)}, inset 0 1px 0 ${alpha('#fff', 0.1)}`,
        }}
      >
        {/* Background pattern */}
        <Box sx={{ position: 'absolute', top: -60, right: -40, opacity: 0.08 }}>
          <CelebrationIcon sx={{ fontSize: 320, color: '#fff' }} />
        </Box>
        <Box sx={{ position: 'absolute', bottom: -80, left: -60, opacity: 0.04 }}>
          <EmojiEventsIcon sx={{ fontSize: 400, color: '#fff' }} />
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Left Section: Message & Badge */}
          <Box sx={{ flex: { xs: 1, md: 1.2 } }}>
            <Chip
              icon={<EmojiEventsIcon sx={{ fontSize: 18, color: `${gold.main} !important` }} />}
              label="ACCEPTED"
              sx={{
                bgcolor: alpha('#fff', 0.18),
                color: gold.main,
                fontWeight: 900,
                letterSpacing: 1.2,
                fontSize: '0.7rem',
                height: 32,
                mb: 2.5,
                backdropFilter: 'blur(8px)',
                border: `1.5px solid ${gold.main}`,
                boxShadow: `0 4px 12px ${alpha(gold.main, 0.25)}`,
              }}
            />
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900, mb: 1.5, letterSpacing: -1, lineHeight: 1.1, textShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
              Congratulations,<br />{applicantData?.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.95), mb: 2.5, fontWeight: 700, fontSize: '1.05rem', letterSpacing: 0.2 }}>
              You have been accepted to
            </Typography>
            <Typography variant="h5" sx={{ color: gold.main, mb: 2.5, fontWeight: 900, letterSpacing: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {acceptanceData?.finalCourse?.courseName}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), lineHeight: 1.8, fontSize: '0.95rem', maxWidth: 500 }}>
              Your application was approved on <strong style={{ color: gold.main, fontSize: '1.05em' }}>{formatDate(acceptanceData?.acceptanceDate)}</strong>. 
              Review your curriculum evaluation below and prepare for your ETEEAP journey!
            </Typography>
          </Box>

          {/* Center Section: Trophy Achievement */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', flex: 0.8 }}>
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                bgcolor: alpha('#fff', 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `3px solid ${gold.main}`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 0 40px ${alpha(gold.main, 0.4)}, inset 0 0 20px ${alpha(gold.main, 0.1)}`,
                position: 'relative',
                animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: `0 0 40px ${alpha(gold.main, 0.4)}, inset 0 0 20px ${alpha(gold.main, 0.1)}` },
                  '50%': { boxShadow: `0 0 60px ${alpha(gold.main, 0.6)}, inset 0 0 30px ${alpha(gold.main, 0.2)}` },
                },
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 80, color: gold.main, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))', animation: 'bounce 2s ease-in-out infinite', '@keyframes bounce': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } } }} />
            </Box>
          </Box>

          {/* Right Section: E-Portfolio Card */}
          <Box sx={{ flex: { xs: 1, md: 1.2 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: alpha('#fff', 0.12),
                border: `2px solid ${alpha('#fff', 0.25)}`,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 8px 24px ${alpha(maroon.main, 0.2)}, inset 0 1px 0 ${alpha('#fff', 0.15)}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: gold.main, color: maroon.main, width: 36, height: 36 }}>
                  <AttachFileIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.85rem', letterSpacing: 0.3 }}>
                  E-PORTFOLIO
                </Typography>
              </Stack>

              {/* Show existing document if found */}
              {documents.length > 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: alpha('#fff', 0.1),
                    border: `1.5px solid ${alpha(gold.main, 0.4)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.25s ease',
                    '&:hover': { bgcolor: alpha('#fff', 0.15), borderColor: gold.main },
                  }}
                >
                  <Avatar sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', width: 32, height: 32 }}>
                    <CheckCircleIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.3,
                      }}
                    >
                      {documents[0].fileName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.65), fontSize: '0.65rem', fontWeight: 600 }}>
                      {new Date(documents[0].uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewDocument(documents[0].documentId)}
                      sx={{
                        color: alpha('#fff', 0.8),
                        p: 0.3,
                        '&:hover': { color: gold.main, bgcolor: alpha(gold.main, 0.1) },
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDocument(documents[0].documentId)}
                      sx={{
                        color: alpha('#fff', 0.8),
                        p: 0.3,
                        '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                </Paper>
              ) : (
                /* Upload Area - only show if no document exists */
                <Box
                  component="label"
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{
                    display: 'block',
                    p: 2,
                    borderRadius: 2.5,
                    border: `2px dashed ${isDragging ? gold.main : alpha('#fff', 0.35)}`,
                    bgcolor: isDragging ? alpha(gold.main, 0.15) : alpha('#fff', 0.06),
                    cursor: uploadLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: gold.main,
                      bgcolor: alpha(gold.main, 0.1),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                    disabled={uploadLoading}
                  />
                  {uploadLoading ? (
                    <Stack alignItems="center" spacing={1}>
                      <CircularProgress size={24} sx={{ color: gold.main }} />
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontSize: '0.7rem', fontWeight: 600 }}>
                        Uploading...
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ fontSize: 24, color: gold.main, mb: 1 }} />
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.85), display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>
                        Click or drag file here
                      </Typography>
                      <Typography variant="caption" sx={{ color: alpha('#fff', 0.6), fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                        PDF, DOC, JPG, PNG (Max 15MB)
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </Paper>

      {/* ── Remarks (if any) ── */}
      {acceptanceData?.remarks && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
            border: '2px solid #bfdbfe',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            boxShadow: `0 4px 12px ${alpha('#2563eb', 0.1)}`,
            transition: 'all 0.25s ease',
            '&:hover': {
              boxShadow: `0 8px 24px ${alpha('#2563eb', 0.15)}`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Avatar sx={{ bgcolor: '#3b82f6', color: '#fff', width: 40, height: 40 }}>
            <InfoIcon sx={{ fontSize: 22 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 1, fontSize: '0.95rem', letterSpacing: 0.3 }}>Important Remarks</Typography>
            <Typography variant="body2" sx={{ color: '#1e3a8a', lineHeight: 1.7, fontSize: '0.9rem' }}>{acceptanceData.remarks}</Typography>
          </Box>
        </Paper>
      )}

      {/* ── Curriculum Progress Summary ── */}
      <SectionCard 
        title="Curriculum Progress Summary"
        icon={<AssignmentIcon />} 
        accentColor={maroon.main}
      >
        {curriculumSummary ? (
          <Stack spacing={3}>
            {/* Accreditation Status - Top Right */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" sx={{ color: alpha(maroon.main, 0.7), fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Accreditation Status
                </Typography>
                <Chip
                  label={applicantData?.accreditationStatus || 'PENDING'}
                  size="small"
                  sx={{
                    bgcolor: applicantData?.accreditationStatus === 'APPROVED' ? '#ecfdf5' : 
                             applicantData?.accreditationStatus === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                    color: applicantData?.accreditationStatus === 'APPROVED' ? '#065f46' : 
                           applicantData?.accreditationStatus === 'REJECTED' ? '#991b1b' : '#92400e',
                    border: `1.5px solid ${applicantData?.accreditationStatus === 'APPROVED' ? '#a7f3d0' : 
                                          applicantData?.accreditationStatus === 'REJECTED' ? '#fecaca' : '#fde68a'}`,
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    height: 24,
                    letterSpacing: 0.3,
                    '& .MuiChip-label': { px: 1.5 },
                  }}
                  icon={applicantData?.accreditationStatus === 'APPROVED' ? 
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981 !important' }} /> : 
                        applicantData?.accreditationStatus === 'REJECTED' ? 
                        <CloseIcon sx={{ fontSize: 14, color: '#dc2626 !important' }} /> :
                        <PendingIcon sx={{ fontSize: 14, color: '#d97706 !important' }} />}
                />
              </Stack>
            </Box>

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

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha(maroon.main, 0.05), border: `1.5px solid ${alpha(maroon.main, 0.1)}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ color: maroon.main, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 0.3, textTransform: 'uppercase' }}>Overall Progress</Typography>
                {!applicantData?.hasSubmitted && (
                  <Tooltip 
                  title={
                    <Stack spacing={1.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
                        Hey {applicantData?.firstName || 'there'}, complete your self evaluation to proceed!
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate('/evaluation-form')}
                        sx={{
                          bgcolor: gold.main,
                          color: maroon.main,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          borderRadius: 1.5,
                          px: 2.5,
                          py: 0.75,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: gold.light,
                            transform: 'scale(1.08)',
                            boxShadow: `0 4px 12px ${alpha(gold.main, 0.3)}`,
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
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        maxWidth: 300,
                        p: 2.5,
                        borderRadius: 2,
                        boxShadow: `0 8px 24px ${alpha(maroon.main, 0.4)}`,
                      }
                    },
                    arrow: { sx: { color: maroon.main } }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, color: maroon.main, fontSize: '0.9rem' }}>
                    {curriculumSummary?.approvedCount || 0} / {curriculumSummary?.totalSubjects || 0} subjects ({progressPercent}%)
                  </Typography>
                </Tooltip>
                )}
                {applicantData?.hasSubmitted && (
                  <Typography variant="body2" sx={{ fontWeight: 800, color: maroon.main, fontSize: '0.9rem' }}>
                    {curriculumSummary?.approvedCount || 0} / {curriculumSummary?.totalSubjects || 0} subjects ({progressPercent}%)
                  </Typography>
                )}
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: alpha(maroon.main, 0.12),
                  '& .MuiLinearProgress-bar': { 
                    background: `linear-gradient(90deg, #10b981 0%, #059669 100%)`,
                    borderRadius: 6,
                    boxShadow: `0 0 8px ${alpha('#10b981', 0.4)}`,
                  },
                }}
              />
            </Paper>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No curriculum data available yet.</Typography>
        )}
      </SectionCard>

      {/* ── Subject Records by Semester ── */}
      <SectionCard title="Subject Records by Semester" icon={<SchoolIcon />} accentColor={gold.dark}>
        {Object.keys(subjectRecords).length > 0 ? (
          <Stack spacing={2}>
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
                    border: `2px solid ${expandedSemester === semesterLabel ? gold.main : alpha(maroon.main, 0.12)}`,
                    borderRadius: '3px !important',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&.Mui-expanded': { 
                      borderColor: gold.main,
                      boxShadow: `0 4px 12px ${alpha(gold.main, 0.15)}`,
                    },
                    '&:hover': {
                      borderColor: alpha(gold.main, 0.5),
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: gold.dark, transition: 'all 0.3s ease' }} />}
                    sx={{
                      bgcolor: expandedSemester === semesterLabel ? alpha(gold.main, 0.08) : alpha(maroon.main, 0.02),
                      '&:hover': { bgcolor: alpha(gold.main, 0.06) },
                      '&.Mui-expanded': { bgcolor: alpha(gold.main, 0.08) },
                      minHeight: 64,
                      px: 3,
                      py: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: gold.dark, fontSize: '1rem', letterSpacing: 0.3 }}>{semesterLabel}</Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip 
                          label={`${approvedCount}/${records.length} approved`} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha('#10b981', 0.12), 
                            color: '#059669', 
                            fontWeight: 800, 
                            fontSize: '0.7rem', 
                            height: 28,
                            border: `1px solid ${alpha('#10b981', 0.3)}`,
                          }} 
                        />
                        <Chip 
                          label={`${records.length} subject${records.length !== 1 ? 's' : ''}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: alpha(gold.main, 0.15), 
                            color: gold.dark, 
                            fontWeight: 800, 
                            fontSize: '0.7rem', 
                            height: 28,
                            border: `1px solid ${alpha(gold.main, 0.3)}`,
                          }} 
                        />
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer sx={{ maxHeight: 500, overflowY: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ bgcolor: maroon.main, '& th': { bgcolor: maroon.main, position: 'sticky', top: 0 } }}>
                            <TableCell sx={{ fontWeight: 900, color: '#fff', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.7, py: 2 }}>Code</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: '#fff', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.7, py: 2 }}>Description</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 900, color: '#fff', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.7, py: 2, width: 80 }}>Units</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 900, color: '#fff', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.7, py: 2, width: 120 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {records.map((record, idx) => (
                            <Tooltip key={record.id} title="Click to view details" placement="left" arrow>
                              <TableRow
                                hover
                                onClick={() => handleSubjectClick(record)}
                                sx={{
                                  cursor: 'pointer',
                                  transition: 'all 0.25s ease',
                                  borderBottom: `1px solid ${alpha(maroon.main, 0.08)}`,
                                  '&:hover': { 
                                    bgcolor: alpha(gold.main, 0.08),
                                    transform: 'scaleX(1.01)',
                                    boxShadow: `inset 3px 0 0 ${gold.main}`,
                                  },
                                  '&:last-child td': { borderBottom: 0 },
                                }}
                              >
                                <TableCell sx={{ fontWeight: 800, color: maroon.main, fontSize: '0.8rem', py: 2, letterSpacing: 0.3 }}>{record.subject?.subjectCode || 'N/A'}</TableCell>
                                <TableCell sx={{ color: 'text.primary', fontSize: '0.8rem', py: 2, fontWeight: 500 }}>{record.subject?.descriptiveTitle || 'N/A'}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem', py: 2, color: maroon.main }}>{record.subject?.units || 'N/A'}</TableCell>
                              
                                <TableCell align="center" sx={{ py: 2 }}><StatusChip status={record.status} /></TableCell>
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
