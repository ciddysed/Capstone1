import React, { useState, useEffect } from "react";
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

const API_URL = "http://localhost:8080/api/program-admins";
const EVALUATIONS_API_URL = "http://localhost:8080/api/evaluations";

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
  if (isNaN(number)) return '';
  
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
  const [selectedCourse, setSelectedCourse] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [forwardingLoading, setForwardingLoading] = useState(false);

  // Fetch application details including preferences and documents
  const fetchApplicationDetails = async (applicationId) => {
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
          id: pref.preferenceId || pref.id || Math.random().toString(36).substr(2, 9),
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
            id: pref.preferenceId || pref.id || Math.random().toString(36).substr(2, 9),
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
  };

  // Fetch evaluation statuses for course preferences
  const fetchEvaluationStatusesForPreferences = async (applicantId, preferences) => {
    setLoadingEvaluations(true);
    try {
      const response = await axios.get(`${EVALUATIONS_API_URL}/applicant/${applicantId}`);
      const evaluations = response.data;
      
      const evaluationMap = {};
      
      if (Array.isArray(evaluations) && evaluations.length > 0) {
        evaluations.forEach(evaluation => {
          if (evaluation.course && evaluation.course.courseId) {
            evaluationMap[evaluation.course.courseId] = {
              status: evaluation.evaluationStatus || 'PENDING',
              evaluatorName: evaluation.evaluator ? 
                `${evaluation.evaluator.firstName || ''} ${evaluation.evaluator.lastName || ''}`.trim() : 
                'Unknown Evaluator',
              dateEvaluated: evaluation.dateEvaluated || null,
              comments: evaluation.comments || '',
              evaluationId: evaluation.evaluationId
            };
          }
        });
      }
      
      setPreferenceEvaluations(evaluationMap);
    } catch (error) {
      console.error("Error fetching evaluation statuses:", error);
      setPreferenceEvaluations({});
    } finally {
      setLoadingEvaluations(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async () => {
    setUpdateLoading(true);
    try {
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      const url = `${API_URL}/applications/${applicationId}/update-status?status=${newStatus}`;
      
      await axios.put(url);
      
      if (newStatus === "APPROVED" && selectedCourse) {
        try {
          const applicantId = selectedApplication.applicant?.applicantId;
          if (applicantId) {
            await axios.post(`${API_URL}/applications/${applicationId}/assign-course`, {
              applicantId: applicantId,
              courseId: selectedCourse
            });
            
            alert("Course successfully assigned to applicant");
          }
        } catch (courseError) {
          console.error("Error assigning course:", courseError);
          alert(`Status updated but course assignment failed: ${courseError.response?.data?.message || courseError.message}`);
        }
      }
      
      await onRefreshApplications();
      if (newStatus !== "APPROVED") {
        handleCloseDialog();
      } else {
        setSelectedApplication(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert(`Failed to update application status: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Forward application to department
  const forwardApplicationToDepartment = async () => {
    if (!selectedCourse) {
      alert("Please select a course to forward for evaluation");
      return;
    }

    setForwardingLoading(true);
    try {
      const applicantId = selectedApplication.applicant?.applicantId;
      if (!applicantId) {
        throw new Error("Applicant ID not found");
      }

      if (!selectedApplication.applicationId && !selectedApplication.id) {
        throw new Error("Application ID not found");
      }

      console.log("Forwarding application with data:", {
        applicantId,
        courseId: selectedCourse,
        applicationId: selectedApplication.applicationId || selectedApplication.id
      });
      
      const url = `${EVALUATIONS_API_URL}/forward-application/${applicantId}`;
      const requestData = { 
        courseId: parseInt(selectedCourse, 10),
        applicationId: selectedApplication.applicationId || selectedApplication.id
      };

      console.log("Making POST request to:", url);
      console.log("Request payload:", requestData);
      
      const response = await axios.post(url, requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000,
      });
      
      console.log("Response received:", response);
      
      if (response.status === 200 || response.status === 201) {
        alert(`Application successfully forwarded for evaluation`);
        await onRefreshApplications();
        // Refresh evaluation statuses
        if (coursePreferences.length > 0) {
          await fetchEvaluationStatusesForPreferences(applicantId, coursePreferences);
        }
        handleCloseDialog();
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error forwarding application:", error);
      
      let errorMessage = "Failed to forward application for evaluation.";
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        if (error.response.status === 500) {
          errorMessage += " Internal server error occurred. Please check server logs for details.";
        } else if (error.response.status === 400) {
          errorMessage += " Invalid request data. Please check the selected course.";
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
      
      alert(errorMessage);
    } finally {
      setForwardingLoading(false);
    }
  };

  // Handle previewing document
  const handlePreviewDocument = (documentId) => {
    const previewUrl = `http://localhost:8080/api/documents/preview/${documentId}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle downloading document
  const handleDownloadDocument = (documentId, fileName) => {
    try {
      const downloadUrl = `http://localhost:8080/api/documents/download/${documentId}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download document. Please try again later.`);
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
    
    return `${evaluation.status} by ${evaluation.evaluatorName}\n${dateText}${evaluation.comments ? `\nComments: ${evaluation.comments}` : ''}`;
  };

  // Close dialog
  const handleCloseDialog = () => {
    setSelectedApplication(null);
    setCoursePreferences([]);
    setNewStatus("");
    setSelectedCourse("");
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
      setSelectedCourse("");
      fetchApplicationDetails(application.applicationId || application.id);
    }
  }, [application, open]);

  return (
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {coursePreferences
                              .sort((a, b) => {
                                const priorityMap = { "FIRST": 1, "SECOND": 2, "THIRD": 3 };
                                const orderA = typeof a.preferenceOrder === 'string' && isNaN(a.preferenceOrder) 
                                  ? priorityMap[a.preferenceOrder] || 999 
                                  : a.preferenceOrder;
                                const orderB = typeof b.preferenceOrder === 'string' && isNaN(b.preferenceOrder) 
                                  ? priorityMap[b.preferenceOrder] || 999 
                                  : b.preferenceOrder;
                                return orderA - orderB;
                              })
                              .map((preference) => (
                                <StyledTableRow key={preference.id || preference.preferenceId || `pref-${Math.random()}`}>
                                  <StyledTableCell sx={{ width: '20%' }}>
                                    <Chip
                                      label={
                                        preference.preferenceOrder === "FIRST" ? "1st Choice" :
                                        preference.preferenceOrder === "SECOND" ? "2nd Choice" :
                                        preference.preferenceOrder === "THIRD" ? "3rd Choice" :
                                        `${preference.preferenceOrder}${getOrdinalSuffix(preference.preferenceOrder)} Choice`
                                      }
                                      size="small"
                                      color={
                                        preference.preferenceOrder === "FIRST" || preference.preferenceOrder === 1 ? "primary" :
                                        preference.preferenceOrder === "SECOND" || preference.preferenceOrder === 2 ? "secondary" : 
                                        "default"
                                      }
                                      variant="outlined"
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell sx={{ fontWeight: 'medium' }}>{preference.courseName}</StyledTableCell>
                                  <StyledTableCell>{preference.department}</StyledTableCell>
                                  <StyledTableCell>
                                    <Tooltip 
                                      title={getEvaluationTooltipText(preference.courseId)}
                                      arrow
                                      placement="top"
                                    >
                                      <Box sx={{ display: 'inline-block' }}>
                                        {loadingEvaluations ? (
                                          <CircularProgress size={20} thickness={5} />
                                        ) : (
                                          getEvaluationStatusChip(preference.courseId)
                                        )}
                                      </Box>
                                    </Tooltip>
                                  </StyledTableCell>
                                </StyledTableRow>
                              ))}
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
                          <MenuItem value="WAITLISTED">WAITLISTED</MenuItem>
                          <MenuItem value="UNDER_REVIEW">UNDER_REVIEW</MenuItem>
                        </Select>
                      </FormControl>

                      {(newStatus === "APPROVED" || selectedApplication.status === "APPROVED") && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Assign Course Based on Preferences
                          </Typography>
                          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                            <InputLabel>Assign Course</InputLabel>
                            <Select
                              value={selectedCourse}
                              label="Assign Course"
                              onChange={(e) => setSelectedCourse(e.target.value)}
                              disabled={loadingPreferences}
                            >
                              {coursePreferences.sort((a, b) => {
                                const priorityMap = { "FIRST": 1, "SECOND": 2, "THIRD": 3 };
                                const orderA = typeof a.preferenceOrder === 'string' && isNaN(a.preferenceOrder) 
                                  ? priorityMap[a.preferenceOrder] || 999 
                                  : a.preferenceOrder;
                                const orderB = typeof b.preferenceOrder === 'string' && isNaN(b.preferenceOrder) 
                                  ? priorityMap[b.preferenceOrder] || 999 
                                  : b.preferenceOrder;
                                return orderA - orderB;
                              }).map((pref) => (
                                <MenuItem key={pref.courseId} value={pref.courseId}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                      size="small"
                                      label={
                                        pref.preferenceOrder === "FIRST" ? "1st" :
                                        pref.preferenceOrder === "SECOND" ? "2nd" :
                                        pref.preferenceOrder === "THIRD" ? "3rd" :
                                        `${pref.preferenceOrder}${getOrdinalSuffix(pref.preferenceOrder)}`
                                      }
                                      color={
                                        pref.preferenceOrder === "FIRST" || pref.preferenceOrder === 1 ? "primary" :
                                        pref.preferenceOrder === "SECOND" || pref.preferenceOrder === 2 ? "secondary" : 
                                        "default"
                                      }
                                      variant="outlined"
                                      sx={{ minWidth: 40 }}
                                    />
                                    {pref.courseName} ({pref.department})
                                  </Box>
                                </MenuItem>
                              ))}
                              {coursePreferences.length === 0 && (
                                <MenuItem disabled value="">
                                  No course preferences available
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </InfoCard>
              </Grid>
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
              {updateLoading ? "Updating..." : (newStatus === "APPROVED" && selectedCourse ? "Update & Assign Course" : "Update Status")}
            </ActionButton>
            
            {(newStatus === "APPROVED" || selectedApplication.status === "APPROVED") && (
              <ActionButton 
                variant="contained"
                onClick={forwardApplicationToDepartment}
                disabled={forwardingLoading || !selectedCourse || loadingPreferences}
                startIcon={forwardingLoading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ 
                  borderRadius: 2, 
                  px: 3, 
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
                {forwardingLoading ? "Forwarding..." : 
                 loadingPreferences ? "Loading..." : 
                 !selectedCourse ? "Select Course First" : 
                 "Forward for Evaluation"}
              </ActionButton>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ApplicationDetailsDialog;
