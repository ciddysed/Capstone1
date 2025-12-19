import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Avatar,
  alpha,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Grow,
  Paper,
  TextField, // <-- Add this import
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import SendIcon from '@mui/icons-material/Send';
import axios from "axios";
import { styled } from "@mui/material/styles";
import DialogContentText from "@mui/material/DialogContentText";
import toast from "../../../../utils/toast";

const API_URL = 'https://eteeap-foth.onrender.com/api/program-admins';
const EVALUATIONS_API_URL = 'https://eteeap-foth.onrender.com/api/evaluations';

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

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  '&.MuiTableCell-head': {
    backgroundColor: maroon.main,
    color: maroon.contrastText,
    fontSize: 14,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(gold.light, 0.15),
  },
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.3),
    transition: 'background-color 0.2s ease',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: maroon.main,
  width: 56,
  height: 56,
  color: '#FFFFFF',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(106, 0, 0, 0.15)',
  },
  borderTop: `3px solid ${maroon.main}`,
}));

const DetailHeader = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(gold.light, 0.3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${gold.main}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: maroon.main,
  '&:hover': {
    backgroundColor: maroon.dark,
    boxShadow: '0 4px 12px rgba(106, 0, 0, 0.25)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderWidth: 2,
  '&.MuiChip-outlinedPrimary': {
    borderColor: maroon.main,
    color: maroon.main,
  },
  '&.MuiChip-outlinedSecondary': {
    borderColor: gold.main,
    color: gold.dark,
  },
  '&.MuiChip-outlinedSuccess': {
    color: '#2e7d32',
  },
  '&.MuiChip-outlinedError': {
    color: '#d32f2f',
  },
  '&.MuiChip-outlinedInfo': {
    color: '#0288d1',
  },
  '&.MuiChip-outlinedWarning': {
    color: '#ed6c02',
  },
}));

// Helper functions
const getOrdinalSuffix = (num) => {
  const number = Number(num);
  if (Number.isNaN(number)) return '';
  
  if (number % 100 >= 11 && number % 100 <= 13) {
    return 'th';
  }
  
  switch (number % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const getStatusChipColor = (status) => {
  const statusMap = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
    WAITLISTED: "info",
    UNDER_REVIEW: "secondary",
  };
  return statusMap[status] || "default";
};

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ApplicationDetailsDialog = ({ 
  open, 
  onClose, 
  application, 
  onRefreshApplications 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [preferenceEvaluations, setPreferenceEvaluations] = useState({});
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [forwardingLoading, setForwardingLoading] = useState(false);
  
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [acceptRemarks, setAcceptRemarks] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);

  const [showResendDialog, setShowResendDialog] = useState(false);
  const [pendingForwardAction, setPendingForwardAction] = useState(false);
  const [alreadySentToEvaluator, setAlreadySentToEvaluator] = useState(false);

  // New state for Application Remarks
  const [applicationNotes, setApplicationNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesEdit, setNotesEdit] = useState(false);
  const [notesSaveLoading, setNotesSaveLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [notesStatus, setNotesStatus] = useState(""); // <-- store status from GET

  // Fetch evaluation statuses for course preferences
  const fetchEvaluationStatusesForPreferences = useCallback(async (applicantId, preferences) => {
    setLoadingEvaluations(true);
    try {
      const response = await axios.get(`https://eteeap-foth.onrender.com/api/preferences/applicant/${applicantId}/with-evaluation`);
      const preferencesWithEval = response.data;
      
      const evaluationMap = {};
      
      if (Array.isArray(preferencesWithEval) && preferencesWithEval.length > 0) {
        for (const pref of preferencesWithEval) {
          const courseId = pref?.course?.courseId;
          if (courseId) {
            evaluationMap[courseId] = {
              status: pref?.evaluationStatus || 'PENDING',
              evaluatorName: pref?.evaluator ? 
                `${pref.evaluator.firstName || ''} ${pref.evaluator.lastName || ''}`.trim() : 
                'Unknown Evaluator',
              dateEvaluated: pref?.dateEvaluated || null,
              comments: pref?.comments || '',
              evaluationId: pref?.evaluationId
            };
          }
        }
      }
      
      setPreferenceEvaluations(evaluationMap);
    } catch (error) {
      console.error("Error fetching evaluation statuses:", error);
      setPreferenceEvaluations({});
    } finally {
      setLoadingEvaluations(false);
    }
  }, []);

  // Fetch application details including preferences and documents
  const fetchApplicationDetails = useCallback(async (applicationId) => {
    setLoadingPreferences(true);
    try {
      const response = await axios.get(`${API_URL}/applications/${applicationId}`);
      const applicationData = response.data;
      
      if (!applicationData.documents) {
        applicationData.documents = [];
      }
      
      setSelectedApplication(prev => ({
        ...applicationData,
        applicationDate: prev?.applicationDate || applicationData.applicationDate || applicationData.uploadDate || applicationData.dateSubmitted || new Date().toISOString(),
        applicantName: prev?.applicantName || applicationData.applicantName || 
          (applicationData.applicant ? 
            `${applicationData.applicant.firstName || ''} ${applicationData.applicant.lastName || ''}`.trim() : 'Unknown'),
        documents: applicationData.documents
      }));
      
      let prefsToUse = [];
      if (applicationData.coursePreferences) {
        prefsToUse = applicationData.coursePreferences.map(pref => ({
            id: pref.preferenceId || pref.id || Math.random().toString(36).slice(2, 11),
          preferenceId: pref.preferenceId || pref.id,
          preferenceOrder: pref.priorityOrder || pref.preferenceOrder,
          courseId: pref.course?.courseId || pref.courseId,
          courseName: pref.course?.courseName || pref.courseName || `Course ${pref.course?.courseId || pref.courseId}`,
          department: pref.course?.department?.departmentName || 'Department not specified',
        }));
        setCoursePreferences(prefsToUse);
      } else {
        try {
          const preferencesResponse = await axios.get(`${API_URL}/applications/${applicationId}/preferences`);
          prefsToUse = preferencesResponse.data.map(pref => ({
              id: pref.preferenceId || pref.id || Math.random().toString(36).slice(2, 11),
            preferenceId: pref.preferenceId || pref.id,
            preferenceOrder: pref.priorityOrder || pref.preferenceOrder,
            courseId: pref.course?.courseId || pref.courseId,
            courseName: pref.course?.courseName || pref.courseName || `Course ${pref.course?.courseId || pref.courseId}`,
            department: pref.course?.department?.departmentName || 'Department not specified',
          }));
          setCoursePreferences(prefsToUse);
        } catch (error) {
          console.error("Error fetching preferences:", error);
          setCoursePreferences([]);
          prefsToUse = [];
        }
      }

      if (prefsToUse.length > 0 && applicationData.applicant?.applicantId) {
        await fetchEvaluationStatusesForPreferences(applicationData.applicant.applicantId, prefsToUse);
      }

    } catch (error) {
      console.error("Error fetching application details:", error);
      setSelectedApplication(prev => ({
        ...prev,
        documents: [],
        coursePreferences: []
      }));
      setCoursePreferences([]);
    } finally {
      setLoadingPreferences(false);
    }
  }, [fetchEvaluationStatusesForPreferences]);

  // Update application status
  const updateApplicationStatus = async () => {
    setUpdateLoading(true);
    try {
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      const url = `${API_URL}/applications/${applicationId}/update-status?status=${newStatus}`;
      
      await axios.put(url);
      
      await onRefreshApplications();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error(`Failed to update application status: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Note: forwarding a single application to a department is handled
  // via the `forwardAllPreferencesToDepartments` function below.

  // Forward all course preferences to their respective departments
  const forwardAllPreferencesToDepartments = async () => {
    if (!coursePreferences || coursePreferences.length === 0) {
      toast.info("No course preferences found to forward");
      return;
    }

    setForwardingLoading(true);
    try {
      const applicantId = selectedApplication.applicant?.applicantId;
      const applicationId = selectedApplication.applicationId || selectedApplication.id; // <-- define applicationId here
      if (!applicantId) {
        throw new Error("Applicant ID not found");
      }
      if (!applicationId) {
        throw new Error("Application ID not found");
      }

      // --- Check if application already has evaluations ---
      const evalRes = await axios.get(`https://eteeap-foth.onrender.com/api/evaluations/by-application/${applicationId}`);
      if (Array.isArray(evalRes.data) && evalRes.data.length > 0 && !pendingForwardAction) {
        setShowResendDialog(true);
        setPendingForwardAction(true);
        setForwardingLoading(false);
        return;
      }
      setPendingForwardAction(false);
      // --------------------------------------------------

      // Get courses that haven't been forwarded yet (not evaluated or pending)
      const coursesToForward = coursePreferences.filter(pref => {
        const evaluation = preferenceEvaluations[pref.courseId];
        return !evaluation || evaluation.status === 'PENDING';
      });

      if (coursesToForward.length === 0) {
        toast.info("All course preferences have already been forwarded for evaluation");
        return;
      }

      const url = `${EVALUATIONS_API_URL}/forward-all-preferences/${applicantId}`;
      const requestData = { 
        applicationId: applicationId,
        courseIds: coursesToForward.map(pref => Number.parseInt(pref.courseId, 10))
      };

      const response = await axios.post(url, requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000,
      });
      
      if (response.status === 200 || response.status === 201) {
        const forwardedCount = coursesToForward.length;
        toast.success(`Successfully forwarded ${forwardedCount} course preference${forwardedCount > 1 ? 's' : ''} for evaluation`);
        await onRefreshApplications();
        // Refresh evaluation statuses
        await fetchEvaluationStatusesForPreferences(applicantId, coursePreferences);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error forwarding all preferences:", error);
      
      let errorMessage = "Failed to forward course preferences for evaluation.";
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 500) {
          errorMessage += " Internal server error occurred. Please check server logs for details.";
        } else if (error.response.status === 400) {
          errorMessage += " Invalid request data. Please check the course preferences.";
        } else if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage += ` ${error.response.data}`;
          } else if (error.response.data.message) {
            errorMessage += ` ${error.response.data.message}`;
          } else if (error.response.data.error) {
            errorMessage += ` ${error.response.data.error}`;
          } else {
            errorMessage += ` Server error (${error.response.status})`;
          }
        } else {
          errorMessage += ` Server error (${error.response.status})`;
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage += " No response from server. Please check your connection and ensure the server is running.";
      } else {
        console.error("Request setup error:", error.message);
        errorMessage += ` ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setForwardingLoading(false);
    }
  };

  // Handler for confirming resend
  const handleConfirmResend = async () => {
    setShowResendDialog(false);
    setPendingForwardAction(false);
    await forwardAllPreferencesToDepartments();
  };

  // Handler for canceling resend
  const handleCancelResend = () => {
    setShowResendDialog(false);
    setPendingForwardAction(false);
  };

  // Handle previewing document
  const handlePreviewDocument = (documentId) => {
    const previewUrl = `https://eteeap-foth.onrender.com/api/documents/preview/${documentId}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle downloading document
  const handleDownloadDocument = (documentId, fileName) => {
    try {
      const downloadUrl = `https://eteeap-foth.onrender.com/api/documents/download/${documentId}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        try {
          link.remove();
        } catch (e) {
          // ignore removal errors
        }
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Failed to download document. Please try again later.`);
    }
  };

  // Helper functions for evaluation status
  const getEvaluationStatusForCourse = (courseId) => {
    return preferenceEvaluations[courseId] || null;
  };

  const getEvaluationStatusChip = (courseId) => {
    const evaluation = getEvaluationStatusForCourse(courseId);
    
    if (!evaluation) {
      return (
        <StyledChip 
          label="Not Evaluated" 
          color="default" 
          variant="outlined"
          size="small"
        />
      );
    }
    
    return (
      <StyledChip 
        label={evaluation.status} 
        color={getStatusChipColor(evaluation.status)} 
        variant="outlined"
        size="small"
      />
    );
  };

  const getEvaluationTooltipText = (courseId) => {
    const evaluation = getEvaluationStatusForCourse(courseId);
    
    if (!evaluation) {
      return "No evaluation data available";
    }
    const dateText = evaluation.dateEvaluated ?
      `Evaluated on ${new Date(evaluation.dateEvaluated).toLocaleDateString()}` :
      "Date not available";

    const parts = [`${evaluation.status} by ${evaluation.evaluatorName}`, dateText];
    if (evaluation.comments) parts.push(`Comments: ${evaluation.comments}`);
    return parts.join('\n');
  };

  // Get count of courses that can be forwarded
  const getForwardableCoursesCount = () => {
    return coursePreferences.filter(pref => {
      const evaluation = preferenceEvaluations[pref.courseId];
      return !evaluation || evaluation.status === 'PENDING';
    }).length;
  };

  // Get courses that have already been forwarded
  const getForwardedCoursesCount = () => {
    return coursePreferences.filter(pref => {
      const evaluation = preferenceEvaluations[pref.courseId];
      return evaluation && evaluation.status !== 'PENDING';
    }).length;
  };

  // Close dialog
  const handleCloseDialog = () => {
    setSelectedApplication(null);
    setCoursePreferences([]);
    setNewStatus("");
    onClose();
  };

  // Initialize when application prop changes
  useEffect(() => {
    if (application && open) {
      setSelectedApplication({
        ...application,
        applicationDate: application.applicationDate || application.uploadDate || application.dateSubmitted || new Date().toISOString(),
        applicantName: application.applicantName
      });
      setNewStatus(application.status);
      fetchApplicationDetails(application.applicationId || application.id);
    }
  }, [application, open, fetchApplicationDetails]);

  // Check if any course preference is approved
  useEffect(() => {
    if (
      coursePreferences.some(
        pref => preferenceEvaluations[pref.courseId]?.status === "APPROVED"
      )
    ) {
      setShowAcceptDialog(true);
    } else {
      setShowAcceptDialog(false);
    }
  }, [coursePreferences, preferenceEvaluations]);

  // Accept applicant handler
  const handleAcceptApplicant = async () => {
    setAcceptLoading(true);
    try {
      // Find the first approved course
      const approvedPref = coursePreferences.find(
        pref => preferenceEvaluations[pref.courseId]?.status === "APPROVED"
      );
      if (!approvedPref) {
        toast.warning("No approved course found.");
        setAcceptLoading(false);
        return;
      }
      const applicantId = selectedApplication.applicant?.applicantId;
      const finalCourseId = approvedPref.courseId;
      const remarks = acceptRemarks;

      await axios.post(
        `https://eteeap-foth.onrender.com/api/accepted-applicants/accept`,
        null,
        {
          params: {
            applicantId,
            finalCourseId,
            remarks,
          },
        }
      );
      
      // Update the application status to APPROVED
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      await axios.put(`${API_URL}/applications/${applicationId}/update-status?status=APPROVED`);
      
      toast.success("Applicant accepted and recorded.");
      setShowAcceptDialog(false);
      setAcceptRemarks("");
      await onRefreshApplications();
      handleCloseDialog();
    } catch (error) {
      console.error("Error accepting applicant:", error);
      toast.error("Failed to accept applicant.");
    } finally {
      setAcceptLoading(false);
    }
  };

  // Precompute labels and counts used by the Course Forwarding UI
  const forwardableCount = getForwardableCoursesCount();
  const forwardedCount = getForwardedCoursesCount();
  let forwardButtonLabel;
  if (forwardingLoading) forwardButtonLabel = "Forwarding...";
  else if (loadingPreferences || loadingEvaluations) forwardButtonLabel = "Loading...";
  else if (forwardableCount === 0) forwardButtonLabel = "All Forwarded";
  else forwardButtonLabel = `Forward ${forwardableCount} Course${forwardableCount > 1 ? 's' : ''}`;

  // Check if application already has evaluations (for note display)
  useEffect(() => {
    const checkAlreadySent = async () => {
      if (!selectedApplication) return;
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      if (!applicationId) return;
      try {
        const evalRes = await axios.get(`https://eteeap-foth.onrender.com/api/evaluations/by-application/${applicationId}`);
        setAlreadySentToEvaluator(Array.isArray(evalRes.data) && evalRes.data.length > 0);
      } catch {
        setAlreadySentToEvaluator(false);
      }
    };
    checkAlreadySent();
    // Only run when dialog opens or selectedApplication changes
  }, [selectedApplication]);

  // Fetch application notes and status when dialog opens or selectedApplication changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedApplication) return;
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      if (!applicationId) return;
      setNotesLoading(true);
      setNotesError("");
      try {
        const res = await axios.get(`https://eteeap-foth.onrender.com/api/applications/${applicationId}`);
        setApplicationNotes(res.data.applicationNotes || "");
        setNotesStatus(res.data.status || ""); // fetch status for later PUT
      } catch (err) {
        setNotesError("Failed to load application notes.");
        setApplicationNotes("");
        setNotesStatus("");
      } finally {
        setNotesLoading(false);
      }
    };
    fetchNotes();
  }, [selectedApplication]);

  // Save notes handler (PUT with status as parameter)
  const handleSaveNotes = async () => {
    if (!selectedApplication) return;
    const applicationId = selectedApplication.applicationId || selectedApplication.id;
    setNotesSaveLoading(true);
    setNotesError("");
    try {
      await axios.put(
        `https://eteeap-foth.onrender.com/api/applications/${applicationId}`,
        {
          applicationNotes,
          status: notesStatus // always send status to avoid null
        }
      );
      setNotesEdit(false);
      toast.success("Application notes updated.");
    } catch (err) {
      setNotesError("Failed to save notes.");
    } finally {
      setNotesSaveLoading(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)',
            overflow: 'hidden',
          }
        }}
        fullScreen={isMobile}
        TransitionComponent={Grow}
        transitionDuration={300}
      >
        {selectedApplication && (
          <>
            <DialogTitle sx={{ 
              bgcolor: maroon.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <StyledAvatar>
                {getInitials(selectedApplication.applicantName)}
              </StyledAvatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Application Details
                </Typography>
                <Typography variant="body2">
                  {selectedApplication.applicantName}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DetailHeader>
                    <Typography variant="h6" color={maroon.main} gutterBottom>
                      Application Information
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Applicant Name
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {selectedApplication.applicantName}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Stack direction="row" spacing={1} alignItems="center">
                            <EmailIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Email Address
                              </Typography>
                              <Typography variant="body1">
                                {selectedApplication.applicant?.email || selectedApplication.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Application Date
                              </Typography>
                              <Typography variant="body1">
                                {selectedApplication.applicationDate ? 
                                  new Date(selectedApplication.applicationDate).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }) : 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Current Status
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <StyledChip 
                                  label={selectedApplication.status} 
                                  color={getStatusChipColor(selectedApplication.status)} 
                                  variant="outlined" 
                                />
                              </Box>
                            </Box>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </DetailHeader>
                </Grid>

                {/* Course Preferences Section */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <SchoolIcon sx={{ color: maroon.main }} />
                        <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                          Course Preferences
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                      {loadingPreferences ? (
                        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : coursePreferences.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined" sx={{ 
                          borderRadius: 2,
                          boxShadow: 'none',
                          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <StyledTableCell>Preference</StyledTableCell>
                                <StyledTableCell>Course</StyledTableCell>
                                <StyledTableCell>Department</StyledTableCell>
                                <StyledTableCell>Evaluation Status</StyledTableCell>
                                <StyledTableCell>Remarks from Evaluator</StyledTableCell> {/* New column */}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(() => {
                                // Create a sorted copy to avoid mutating original
                                const priorityMap = { "FIRST": 1, "SECOND": 2, "THIRD": 3 };
                                const sortedPreferences = [...coursePreferences].sort((a, b) => {
                                  const orderA = typeof a.preferenceOrder === 'string' && Number.isNaN(Number(a.preferenceOrder))
                                    ? priorityMap[a.preferenceOrder] || 999
                                    : a.preferenceOrder;
                                  const orderB = typeof b.preferenceOrder === 'string' && Number.isNaN(Number(b.preferenceOrder))
                                    ? priorityMap[b.preferenceOrder] || 999
                                    : b.preferenceOrder;
                                  return orderA - orderB;
                                });

                                return sortedPreferences.map((preference) => {
                                  const order = preference.preferenceOrder;
                                  let label;
                                  if (order === "FIRST") label = "1st Choice";
                                  else if (order === "SECOND") label = "2nd Choice";
                                  else if (order === "THIRD") label = "3rd Choice";
                                  else label = `${order}${getOrdinalSuffix(order)} Choice`;

                                    let color;
                                    if (order === "FIRST" || order === 1) color = "primary";
                                    else if (order === "SECOND" || order === 2) color = "secondary";
                                    else color = "default";

                                  return (
                                    <StyledTableRow key={preference.id || preference.preferenceId || `pref-${Math.random()}`}>
                                      <StyledTableCell sx={{ width: '20%' }}>
                                        <Chip label={label} size="small" color={color} variant="outlined" />
                                      </StyledTableCell>
                                      <StyledTableCell sx={{ fontWeight: 'medium' }}>{preference.courseName}</StyledTableCell>
                                      <StyledTableCell>{preference.department}</StyledTableCell>
                                      <StyledTableCell>
                                        <Tooltip title={getEvaluationTooltipText(preference.courseId)} arrow placement="top">
                                          <Box sx={{ display: 'inline-block' }}>
                                            {loadingEvaluations ? (
                                              <CircularProgress size={20} thickness={5} />
                                            ) : (
                                              getEvaluationStatusChip(preference.courseId)
                                            )
                                            }
                                          </Box>
                                        </Tooltip>
                                      </StyledTableCell>
                                      <StyledTableCell>
                                        {
                                          // Show remarks/comments from evaluation, if available
                                          (() => {
                                            const evaluation = getEvaluationStatusForCourse(preference.courseId);
                                            return evaluation && evaluation.comments
                                              ? evaluation.comments
                                              : <span style={{ color: "#888" }}>—</span>;
                                          })()
                                        }
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  );
                                });
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                          No course preferences found
                        </Typography>
                      )}
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* Documents Section */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                          Submitted Documents
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                      {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                        <TableContainer sx={{ 
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          maxHeight: 300,
                          overflowY: 'auto'
                        }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <StyledTableCell>Document Type</StyledTableCell>
                                <StyledTableCell>File Name</StyledTableCell>
                                <StyledTableCell>Upload Date</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedApplication.documents.map((document) => (
                                <StyledTableRow key={document.documentId}>
                                  <StyledTableCell>
                                    <Chip 
                                      label={document.documentType} 
                                      size="small" 
                                      color={document.documentType === "Required" ? "secondary" : "default"}
                                      variant="outlined"
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {document.fileName}
                                  </StyledTableCell>
                                  <StyledTableCell>
                                    {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'N/A'}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                      <Tooltip title="Preview Document">
                                        <IconButton 
                                          size="small"
                                          color="primary"
                                          onClick={() => handlePreviewDocument(document.documentId)}
                                          sx={{ 
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': {
                                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                            }
                                          }}
                                        >
                                          <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Download Document">
                                        <IconButton 
                                          size="small"
                                          onClick={() => handleDownloadDocument(document.documentId, document.fileName)}
                                          sx={{ 
                                            backgroundColor: alpha(theme.palette.grey[700], 0.1),
                                            color: theme.palette.grey[700],
                                            '&:hover': {
                                              backgroundColor: alpha(theme.palette.grey[700], 0.2),
                                            }
                                          }}
                                        >
                                          <DownloadIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box sx={{ py: 3, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            No documents found
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* Status Update Section */}
                <Grid item xs={12}>
                  <InfoCard>
                    <CardContent>
                      <Typography variant="h6" fontWeight="medium" color={maroon.main} gutterBottom>
                        Update Application Status
                      </Typography>
                      <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={newStatus}
                            label="Status"
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="APPROVED">APPROVED</MenuItem>
                            <MenuItem value="REJECTED">REJECTED</MenuItem>
                          </Select>
                        </FormControl>

                        {/* Course Forwarding Section */}
                        {coursePreferences.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                              Course Evaluation Forwarding
                            </Typography>
                            {/* Show note if already sent */}
                            {alreadySentToEvaluator && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                                  Application already sent to evaluator{forwardedCount > 1 ? "s" : ""}.
                                </Typography>
                              </Box>
                            )}
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                bgcolor: alpha(gold.light, 0.1),
                                borderColor: alpha(gold.main, 0.3),
                                borderRadius: 2
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                  <Stack spacing={1}>
                                    <Typography variant="body2" fontWeight="medium">
                                      Forward All Course Preferences for Evaluation
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {forwardableCount > 0 ? (
                                        <>
                                          {forwardableCount} course{forwardableCount > 1 ? 's' : ''} ready to forward
                                          {forwardedCount > 0 && (
                                            <>, {forwardedCount} already forwarded</>
                                          )}
                                        </>
                                      ) : (
                                        "All course preferences have been forwarded"
                                      )}
                                    </Typography>
                                    
                                    {/* Show which courses will be forwarded */}
                                    {getForwardableCoursesCount() > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                          Courses to be forwarded:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                          {coursePreferences
                                            .filter(pref => {
                                              const evaluation = preferenceEvaluations[pref.courseId];
                                              return !evaluation || evaluation.status === 'PENDING';
                                            })
                                            .map(pref => (
                                              <Chip
                                                key={pref.courseId}
                                                label={`${pref.courseName} (${pref.department})`}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem' }}
                                              />
                                            ))}
                                        </Stack>
                                      </Box>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <ActionButton 
                                    variant="contained"
                                    fullWidth
                                    onClick={forwardAllPreferencesToDepartments}
                                    disabled={forwardingLoading || getForwardableCoursesCount() === 0 || loadingPreferences || loadingEvaluations}
                                    startIcon={forwardingLoading ? <CircularProgress size={20} /> : <SendIcon />}
                                    sx={{ 
                                      borderRadius: 2, 
                                      bgcolor: gold.main,
                                      color: gold.contrastText,
                                      '&:hover': {
                                        bgcolor: gold.dark,
                                      },
                                      '&:disabled': {
                                        bgcolor: alpha(gold.main, 0.5),
                                        color: alpha(gold.contrastText, 0.7),
                                      }
                                    }}
                                  >
                                    {forwardButtonLabel}
                                  </ActionButton>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </InfoCard>
                </Grid>

                {/* --- Application Remarks Section (right side) --- */}
                <Grid item xs={12} md={4}>
                  <InfoCard>
                    <CardContent>
                      <Typography variant="h6" fontWeight="medium" color={maroon.main} gutterBottom>
                        Application Remarks
                      </Typography>
                      <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                      {notesLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        <>
                          {notesError && (
                            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                              {notesError}
                            </Typography>
                          )}
                          {!notesEdit ? (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {applicationNotes ? applicationNotes : <span style={{ color: "#888" }}>No remarks yet.</span>}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() => setNotesEdit(true)}
                              >
                                Edit Remarks
                              </Button>
                            </Box>
                          ) : (
                            <Box>
                              <TextField
                                multiline
                                minRows={4}
                                maxRows={8}
                                fullWidth
                                value={applicationNotes}
                                onChange={e => setApplicationNotes(e.target.value)}
                                disabled={notesSaveLoading}
                                placeholder="Enter remarks about this application..."
                                sx={{ mb: 1 }}
                              />
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={handleSaveNotes}
                                  disabled={notesSaveLoading}
                                >
                                  {notesSaveLoading ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => setNotesEdit(false)}
                                  disabled={notesSaveLoading}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Box>
                          )}
                        </>
                      )}
                    </CardContent>
                  </InfoCard>
                </Grid>
                {/* --- End Application Remarks Section --- */}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: alpha(gold.light, 0.2) }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined"
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  px: 3, 
                  borderColor: maroon.main,
                  color: maroon.main,
                  '&:hover': {
                    borderColor: maroon.dark,
                    backgroundColor: alpha(maroon.light, 0.1),
                  }
                }}
              >
                Cancel
              </Button>
              <ActionButton 
                variant="contained"
                onClick={updateApplicationStatus}
                disabled={updateLoading || newStatus === selectedApplication.status}
                startIcon={updateLoading ? <CircularProgress size={20} /> : null}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {updateLoading ? "Updating..." : "Update Status"}
              </ActionButton>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={showAcceptDialog}
        onClose={() => setShowAcceptDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Accept Applicant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {(() => {
              const approvedPref = coursePreferences.find(
                pref => preferenceEvaluations[pref.courseId]?.status === "APPROVED"
              );
              const courseName = approvedPref ? approvedPref.courseName : "the approved course";
              return (
                <>
                  Applicant has been evaluated and approved for <b>{courseName}</b>. You may now accept this applicant.
                </>
              );
            })()}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Remarks (optional):
            </Typography>
            <textarea
              value={acceptRemarks}
              onChange={e => setAcceptRemarks(e.target.value)}
              rows={3}
              style={{ width: "100%", borderRadius: 4, border: "1px solid #ccc", padding: 8 }}
              placeholder="Enter remarks for acceptance..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAcceptDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAcceptApplicant}
            variant="contained"
            color="primary"
            disabled={acceptLoading}
          >
            {acceptLoading ? "Accepting..." : "Accept Applicant"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resend Confirmation Dialog */}
      <Dialog
        open={showResendDialog}
        onClose={handleCancelResend}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Resend Evaluation?</DialogTitle>
        <DialogContent>
          <Typography>
            Application already sent for evaluation. Do you want to resend evaluation?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelResend} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmResend} variant="contained" color="primary">
            Resend Evaluation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ApplicationDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  application: PropTypes.shape({
    applicationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    uploadDate: PropTypes.string,
    dateSubmitted: PropTypes.string,
    applicantName: PropTypes.string,
    status: PropTypes.string,
    applicationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    applicant: PropTypes.shape({
      applicantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    }),
    documents: PropTypes.arrayOf(PropTypes.object),
    coursePreferences: PropTypes.arrayOf(PropTypes.object),
  }),
  onRefreshApplications: PropTypes.func.isRequired,
};

export default ApplicationDetailsDialog;