import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  alpha,
  createTheme,
  ThemeProvider,
  useTheme,
  Avatar,
  Grid,
  Grow,
  Tooltip,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description'; 
import { useNavigate, useLocation } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout";
import { styled } from "@mui/material/styles";

// Custom maroon and gold color palette (matching ProgramAdmin)
const maroon = {
  light: '#8D323C', // lighter maroon
  main: '#6A0000', // maroon
  dark: '#450000', // darker maroon
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9', // lighter gold
  main: '#FFC72C', // gold
  dark: '#D4A500', // darker gold
  contrastText: '#000000',
};

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
});

// Styled components for enhanced UI (matching ProgramAdmin)
const StyledTableCell = styled(Box)(({ theme }) => ({
  fontWeight: 500,
  backgroundColor: maroon.main,
  color: maroon.contrastText,
  fontSize: 14,
  fontWeight: 600,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 45px -10px rgba(106, 0, 0, 0.25)',
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

const DOCUMENT_TYPE_LABELS = [
  "APPLICANTS_EVALUATION_SHEET",
  "INFORMATIVE_COPY_OF_TOR",
  "PSA_AUTHENTICATED_BIRTH_CERTIFICATE",
  "CERTIFICATE_OF_TRANSFER_CREDENTIAL",
  "MARRIAGE_CERTIFICATE",
  "CERTIFICATE_OF_EMPLOYMENT",
  "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION",
  "EVIDENCE_OF_BUSINESS_OWNERSHIP"
];

const formatDocumentType = (type) => {
  if (!type) return "-";
  // Convert enum to readable label
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const ViewApplicantPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // Get all necessary IDs from location state
  const applicantId = location.state?.applicantId;
  const evaluationId = location.state?.evaluationId;
  const specificCourseId = location.state?.courseId;
  const evaluatorId = localStorage.getItem("evaluatorId");

  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [coursePreferences, setCoursePreferences] = useState([]);
  
  // New evaluation states
  const [evaluationStatus, setEvaluationStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState({ type: "", text: "" });
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [forwardedAt, setForwardedAt] = useState(null);

  useEffect(() => {
    if (!applicantId) {
      console.error("No applicantId provided in location state");
      return;
    }
    
    console.log("Loading applicant details with:", { 
      applicantId, evaluationId, specificCourseId, evaluatorId
    });
    
    // Fetch applicant profile
    fetch(`http://localhost:8080/api/applicants/${applicantId}`)
      .then((res) => {
        if (!res.ok) {
          console.error(`Error fetching applicant: HTTP ${res.status}`);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Loaded applicant data:", data);
        setApplicant(data);
      })
      .catch((error) => {
        console.error("Error fetching applicant:", error);
        setApplicant(null);
      });

    // If we have an evaluationId, fetch that specific evaluation
    if (evaluationId) {
      console.log(`Fetching specific evaluation: ${evaluationId}`);
      fetch(`http://localhost:8080/api/evaluations/${evaluationId}`)
        .then((res) => {
          if (!res.ok) {
            console.error(`Error fetching evaluation: HTTP ${res.status}`);
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Loaded specific evaluation:", data);
          setCurrentEvaluation(data);
          
          // Set the form values from the evaluation
          if (data) {
            setEvaluationStatus(data.evaluationStatus || "");
            setRemarks(data.comments || "");
            
            // Set the selected course from the evaluation
            if (data.course) {
              console.log("Setting selected course from evaluation:", data.course);
              setSelectedCourse(data.course);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching evaluation:", err);
          setCurrentEvaluation(null);
        });
    }

    // Get all evaluations for this applicant
    console.log(`Fetching all evaluations for applicant: ${applicantId}`);
    fetch(`http://localhost:8080/api/evaluations/applicant/${applicantId}`)
      .then((res) => {
        if (!res.ok) {
          console.error(`Error fetching applicant evaluations: HTTP ${res.status}`);
          return []; // Return empty array to avoid breaking
        }
        return res.json();
      })
      .then((evaluations) => {
        console.log("All evaluations for applicant:", evaluations);
        
        if (Array.isArray(evaluations) && evaluations.length > 0) {
          // Extract course info from evaluations
          const coursesList = evaluations
            .map(ev => ev.course)
            .filter(Boolean);
            
          console.log("Available courses:", coursesList);
          setCoursePreferences(coursesList.map(course => ({ course })));
          
          // Select course based on provided ID or default to first
          if (specificCourseId) {
            const specificCourse = coursesList.find(c => c.courseId === Number(specificCourseId));
            if (specificCourse) {
              console.log("Setting specific course:", specificCourse);
              setSelectedCourse(specificCourse);
            } else if (coursesList.length > 0) {
              setSelectedCourse(coursesList[0]);
            }
          } else if (!selectedCourse && coursesList.length > 0) {
            setSelectedCourse(coursesList[0]);
          }
          
          // Find existing evaluations for this evaluator
          if (evaluatorId) {
            const existingEval = evaluations.find(ev => {
              const matchesEvaluator = ev.evaluator?.evaluatorId === Number(evaluatorId);
              const matchesCourse = selectedCourse && ev.course?.courseId === selectedCourse.courseId;
              return matchesEvaluator && matchesCourse;
            });
            
            if (existingEval) {
              console.log("Found existing evaluation:", existingEval);
              setExistingEvaluation(existingEval);
              setEvaluationStatus(existingEval.evaluationStatus || "");
              setRemarks(existingEval.comments || "");
            }
          }
        } else {
          console.warn("No evaluations found for this applicant");
        }
      })
      .catch((err) => {
        console.error("Error fetching evaluations:", err);
        setCoursePreferences([]);
      });

    // Fetch documents with error handling
    fetch(`http://localhost:8080/api/documents/applicant/${applicantId}`)
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }
        try {
          return await res.json();
        } catch {
          return [];
        }
      })
      .then(setDocuments)
      .catch(() => setDocuments([]));

    // Fetch all courses for mapping courseId to courseName
    fetch("http://localhost:8080/api/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setCourses([]));

    // Fetch forwarding information to display which admin forwarded this application
    fetch(`http://localhost:8080/api/applicants/${applicantId}/forward-info`)
      .then(async (res) => {
        if (!res.ok) return null;
        return await res.json();
      })
      .then((data) => {
        if (data) {
          setAdminInfo(data.admin || null);
          setForwardedAt(data.forwardedAt || null);
        }
      })
      .catch(() => {
        setAdminInfo(null);
        setForwardedAt(null);
      });
  }, [applicantId, evaluationId, specificCourseId, evaluatorId]);

  // Second effect that runs when selectedCourse changes
  useEffect(() => {
    if (!applicantId || !selectedCourse || !evaluatorId) return;

    console.log("Checking for evaluation with:", {
      applicantId,
      courseId: selectedCourse.courseId,
      evaluatorId
    });

    // Check if there's an existing evaluation
    fetch(`http://localhost:8080/api/evaluations/check?applicantId=${applicantId}&courseId=${selectedCourse.courseId}&evaluatorId=${evaluatorId}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return await res.json();
      })
      .then((data) => {
        if (data) {
          console.log("Found evaluation for selected course:", data);
          setExistingEvaluation(data);
          setEvaluationStatus(data.evaluationStatus || "");
          setRemarks(data.comments || "");
        } else {
          // Clear existing evaluation if none found for this course
          setExistingEvaluation(null);
          // Keep current status if we're viewing a specific evaluation
          if (!currentEvaluation) {
            setEvaluationStatus("");
            setRemarks("");
          }
        }
      })
      .catch((err) => {
        console.error("Error checking for evaluation:", err);
        setExistingEvaluation(null);
      });
  }, [selectedCourse, applicantId, evaluatorId, currentEvaluation]);

  // Handle course selection change
  const handleCourseChange = (e) => {
    const courseId = Number(e.target.value);
    console.log("Course selection changed to:", courseId);
    
    const course = getAvailableCoursesForEvaluation().find(c => c.courseId === courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  // Submit evaluation
  const handleSubmitEvaluation = async () => {
    if (!selectedCourse || !evaluationStatus) {
      console.error("Missing required fields:", { 
        courseSelected: Boolean(selectedCourse), 
        statusSelected: Boolean(evaluationStatus) 
      });
      
      setSubmissionMessage({ 
        type: "error", 
        text: "Please complete all required fields" 
      });
      return;
    }

    setSubmitting(true);
    setSubmissionMessage({ type: "", text: "" });

    try {
      // Prepare evaluation data
      const evaluationData = {
        applicantId: Number(applicantId),
        courseId: selectedCourse.courseId,
        evaluatorId: Number(evaluatorId),
        evaluationStatus,
        comments: remarks,
        dateEvaluated: new Date().toISOString()
      };

      console.log("Submitting evaluation data:", evaluationData);

      // Determine correct URL based on whether updating or creating
      const url = existingEvaluation 
        ? `http://localhost:8080/api/evaluations/${existingEvaluation.evaluationId}`
        : currentEvaluation
          ? `http://localhost:8080/api/evaluations/${currentEvaluation.evaluationId}`
          : "http://localhost:8080/api/evaluations";

      const method = (existingEvaluation || currentEvaluation) ? "PUT" : "POST";
      console.log(`Making ${method} request to: ${url}`);

      // Send request
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(evaluationData),
      });

      // Handle response
      if (response.ok) {
        const data = await response.json();
        console.log("Evaluation saved successfully:", data);
        setExistingEvaluation(data);
        setCurrentEvaluation(data);
        
        setSubmissionMessage({ 
          type: "success", 
          text: `Evaluation ${(existingEvaluation || currentEvaluation) ? "updated" : "submitted"} successfully` 
        });
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        console.error("Response status:", response.status);
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Submission error:", error, error.stack);
      setSubmissionMessage({ 
        type: "error", 
        text: `An error occurred: ${error.message}` 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.courseId === courseId);
    return course ? course.courseName : "-";
  };

  // eslint-disable-next-line no-unused-vars
  const formatPriority = (priority) => {
    const formats = {
      FIRST: "Course 1",
      SECOND: "Course 2",
      THIRD: "Course 3",
    };
    return formats[priority] || priority;
  };

  // Helper to preview document in modal
  const handlePreview = (doc) => {
    const url = `http://localhost:8080/api/documents/preview/${doc.documentId}`;
    setPreviewUrl(url);
    const fileName = doc.fileName || doc.name || "";
    setPreviewType(typeof fileName === "string" ? fileName.toLowerCase() : "");
    setPreviewFileName(fileName);
    setZoom(1); // Reset zoom on new preview
    setPreviewOpen(true);
  };

  // Helper to download document
  const handleDownload = (docId) => {
    window.open(`http://localhost:8080/api/documents/download/${docId}`, "_blank");
  };

  // Helper to get available courses for the applicant - improved
  const getAvailableCoursesForEvaluation = () => {
    // Start with courses from preferences
    const courses = coursePreferences
      .map(preference => preference.course)
      .filter(Boolean);
      
    // If we have a specific course from location state, make sure it's included
    if (specificCourseId && courses.length > 0) {
      const courseIdNum = Number(specificCourseId);
      if (!courses.some(c => c.courseId === courseIdNum)) {
        // Find it in all available courses
        const specificCourse = courses.find(c => c.courseId === courseIdNum);
        if (specificCourse) {
          return [...courses, specificCourse];
        }
      }
    }
    
    return courses;
  };

  // Add a helper function to check if the applicant has been forwarded for evaluation
  const checkForwardStatus = () => {
    // If we have an evaluationId or currentEvaluation, then it's been forwarded
    return Boolean(evaluationId || currentEvaluation || (applicant && applicant.forwardedForEvaluation === true));
  };

  // Get initials from name (matching ProgramAdmin)
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get status chip color
  const getStatusChipColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "error",
      UNDER_REVIEW: "secondary",
    };
    return statusMap[status] || "default";
  };

  return (
    <ThemeProvider theme={customTheme}>
      <ListLayout>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 1 }}>
          <IconButton
            onClick={() => navigate("/evaluator/applicants")}
            sx={{ mr: 1 }}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
            borderBottom: `2px solid ${gold.main}`,
            paddingBottom: 1,
            display: 'inline-block'
          }}>
            Applicant Evaluation
          </Typography>
        </Box>

        {/* Admin Forwarding Information */}
        {checkForwardStatus() && (
          <Fade in={true} timeout={800}>
            <AnimatedPaper elevation={3} sx={{ p: 2, mb: 3, bgcolor: alpha(gold.light, 0.2), borderLeft: `4px solid ${gold.main}` }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: maroon.main }}>
                    Forwarded for Evaluation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {adminInfo ? (
                      `Forwarded by ${adminInfo.firstName} ${adminInfo.lastName}`
                    ) : (
                      'Forwarded by a program administrator'
                    )}
                    {forwardedAt && (
                      ` on ${new Date(forwardedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}`
                    )}
                  </Typography>
                </Box>
                <StyledChip 
                  label="Ready for Evaluation" 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                  icon={<CheckCircleIcon fontSize="small" />} 
                />
              </Stack>
            </AnimatedPaper>
          </Fade>
        )}
        
        <Grid container spacing={3}>
          {/* Applicant Profile Section */}
          <Grid item xs={12} md={5}>
            <Grow in={true} timeout={600}>
              <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <StyledAvatar>
                    {applicant ? getInitials(
                      [applicant.firstName, applicant.lastName].filter(Boolean).join(" ")
                    ) : "??"}
                  </StyledAvatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Applicant Profile
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {applicantId || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                
                <Stack spacing={2.5}>
                  <DetailRowStyled 
                    icon={<PersonIcon />} 
                    label="Full Name" 
                    value={
                      applicant
                        ? [
                            applicant.firstName,
                            applicant.middleInitial
                              ? applicant.middleInitial + "."
                              : "",
                            applicant.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : "-"
                    }
                  />
                  <DetailRowStyled 
                    icon={<EmailIcon />} 
                    label="Email" 
                    value={applicant?.email || "-"} 
                  />
                  <DetailRowStyled 
                    icon={<HomeIcon />} 
                    label="Address" 
                    value={applicant?.address || "-"} 
                  />
                  <DetailRowStyled 
                    icon={<CakeIcon />} 
                    label="Date of Birth" 
                    value={
                      applicant?.dateOfBirth
                        ? new Date(applicant.dateOfBirth).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : "-"
                    }
                  />
                  <DetailRowStyled 
                    icon={<WcIcon />} 
                    label="Gender" 
                    value={applicant?.gender || "-"} 
                  />
                </Stack>
              </AnimatedPaper>
            </Grow>
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3} height="100%">
              {/* Applied Course */}
              <Grow in={true} timeout={700}>
                <AnimatedPaper elevation={3} sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <SchoolIcon sx={{ color: maroon.main }} />
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Course Applied For
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                  
                  {selectedCourse ? (
                    <Box 
                      sx={{ 
                        bgcolor: alpha(gold.light, 0.3), 
                        p: 2, 
                        borderRadius: 2, 
                        borderLeft: `3px solid ${gold.main}` 
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {selectedCourse.courseName}
                      </Typography>
                      {selectedCourse.department && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Department: {selectedCourse.department.departmentName || "Not specified"}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No course selection available
                    </Typography>
                  )}
                </AnimatedPaper>
              </Grow>

              {/* Uploaded Documents */}
              <Grow in={true} timeout={800}>
                <AnimatedPaper elevation={3} sx={{ p: 3, flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <DescriptionIcon sx={{ color: maroon.main }} />
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Submitted Documents
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                  
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    <List dense>
                      {DOCUMENT_TYPE_LABELS.map((docType) => {
                        const doc = documents.find((d) => d.documentType === docType);
                        return (
                          <ListItem key={docType}
                            sx={{
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                              '&:last-child': { borderBottom: 'none' },
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(gold.light, 0.15),
                              },
                            }}
                            secondaryAction={
                              doc ? (
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Preview Document">
                                    <IconButton
                                      edge="end"
                                      aria-label="preview"
                                      onClick={() => handlePreview(doc)}
                                      size="small"
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
                                      edge="end"
                                      aria-label="download"
                                      onClick={() => handleDownload(doc.documentId)}
                                      size="small"
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
                              ) : (
                                <StyledChip 
                                  label="Not Provided" 
                                  size="small" 
                                  variant="outlined"
                                  color="default"
                                />
                              )
                            }
                          >
                            <ListItemText
                              primary={formatDocumentType(docType)}
                              secondary={doc ? (doc.fileName || doc.name) : null}
                              primaryTypographyProps={{
                                fontWeight: doc ? 600 : 400,
                                variant: 'body2',
                                color: doc ? 'text.primary' : 'text.secondary',
                              }}
                              secondaryTypographyProps={{
                                variant: 'caption',
                                sx: { 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                }
                              }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </AnimatedPaper>
              </Grow>
            </Stack>
          </Grid>

          {/* Evaluation Form Section */}
          <Grid item xs={12}>
            <Grow in={true} timeout={900}>
              <AnimatedPaper elevation={3} sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <AssignmentIcon sx={{ color: maroon.main }} />
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Evaluation Form {currentEvaluation && `- Evaluation #${currentEvaluation.evaluationId}`}
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />

                {applicant && !checkForwardStatus() && (
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{ mb: 3, borderWidth: 2 }}
                    action={
                      <Button color="primary" size="small" variant="outlined" onClick={() => navigate("/evaluator/applicants")}>
                        View Other Applications
                      </Button>
                    }
                  >
                    This application has not yet been forwarded for evaluation by an administrator. You cannot evaluate it until it's forwarded to you.
                  </Alert>
                )}

                {submissionMessage.text && (
                  <Alert 
                    severity={submissionMessage.type} 
                    sx={{ mb: 3, borderWidth: 2 }}
                    variant="outlined"
                    onClose={() => setSubmissionMessage({ type: "", text: "" })}
                  >
                    {submissionMessage.text}
                  </Alert>
                )}

                <Grid container spacing={3} sx={{ mb: 2 }}>
                  {/* Course Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Course to Evaluate</InputLabel>
                      <Select
                        value={selectedCourse?.courseId || ""}
                        onChange={handleCourseChange}
                        label="Select Course to Evaluate"
                        disabled={Boolean(currentEvaluation || evaluationId)}
                      >
                        {getAvailableCoursesForEvaluation().map((course) => (
                          <MenuItem key={course.courseId} value={course.courseId}>
                            {course.courseName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Evaluation Status */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Evaluation Status</InputLabel>
                      <Select
                        value={evaluationStatus}
                        onChange={(e) => setEvaluationStatus(e.target.value)}
                        label="Evaluation Status"
                        disabled={!selectedCourse || submitting || !checkForwardStatus()}
                      >
                        <MenuItem value="APPROVED">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CheckCircleIcon color="success" fontSize="small" />
                            <span>Approved</span>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Remarks */}
                  <Grid item xs={12}>
                    <TextField
                      label="Evaluation Remarks"
                      multiline
                      rows={4}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      fullWidth
                      variant="outlined"
                      disabled={!selectedCourse || submitting || !checkForwardStatus()}
                      placeholder="Provide detailed comments about your evaluation decision..."
                    />
                  </Grid>
                </Grid>

                {/* Submit Button & Evaluation Status */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 4,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}>
                  {/* Evaluation History */}
                  {existingEvaluation && (
                    <Box sx={{ 
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom color="text.secondary">
                        Previous Evaluation
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <StyledChip
                          label={existingEvaluation.evaluationStatus || "UNKNOWN"} 
                          color={getStatusChipColor(existingEvaluation.evaluationStatus)}
                          variant="outlined"
                        />
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTimeIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {existingEvaluation.dateEvaluated ? 
                              new Date(existingEvaluation.dateEvaluated).toLocaleString() : 
                              "-"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                  
                  <ActionButton
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitEvaluation}
                    disabled={!selectedCourse || !evaluationStatus || submitting || !checkForwardStatus()}
                    sx={{ borderRadius: "24px", px: 4, py: 1 }}
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  >
                    {submitting ? "Submitting..." : existingEvaluation || currentEvaluation ? "Update Evaluation" : "Submit Evaluation"}
                  </ActionButton>
                </Box>
              </AnimatedPaper>
            </Grow>
          </Grid>
        </Grid>
        
        {/* Preview Modal */}
        <Dialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fullScreen
          PaperProps={{
            sx: {
              borderRadius: 0,
              overflow: 'hidden',
            }
          }}
          TransitionComponent={Grow}
          transitionDuration={300}
        >
          <DialogTitle sx={{ 
            bgcolor: maroon.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <DescriptionIcon />
            <Typography variant="h6">
              {previewFileName}
            </Typography>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              minHeight: "100vh",
              maxHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "#f5f5f5",
              p: 0,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 2 }}>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
                disabled={zoom <= 0.2}
                startIcon={<ZoomOutIcon />}
              >
                Zoom Out
              </Button>
              <Typography variant="body2" sx={{ 
                minWidth: 60, 
                textAlign: "center", 
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                borderRadius: 1,
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${theme.palette.divider}`
              }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <Button
                variant="outlined" 
                size="small"
                onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
                disabled={zoom >= 5}
                endIcon={<ZoomInIcon />}
              >
                Zoom In
              </Button>
            </Stack>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                flex: 1,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                bgcolor: "#e0e0e0",
              }}
            >
              {previewType.endsWith(".pdf") ? (
                <Box sx={{ width: "100%", height: "100%", overflow: "auto" }}>
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    width={Math.round(window.innerWidth * 0.9 * zoom)}
                    height={Math.round(window.innerHeight * 0.8 * zoom)}
                    style={{
                      border: "none",
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                      display: "block",
                    }}
                  />
                </Box>
              ) : previewType.endsWith(".jpg") ||
                previewType.endsWith(".jpeg") ||
                previewType.endsWith(".png") ||
                previewType.endsWith(".gif") ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Document Preview"
                    style={{
                      maxWidth: `${window.innerWidth * 0.9 * zoom}px`,
                      maxHeight: `${window.innerHeight * 0.8 * zoom}px`,
                      width: "auto",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                      transform: `scale(${zoom})`,
                      transformOrigin: "top left",
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Preview not available for this file type
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(previewUrl.split('/').pop())}
                  >
                    Download File Instead
                  </Button>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: alpha(gold.light, 0.2) }}>
            <ActionButton onClick={() => setPreviewOpen(false)}>
              Close Preview
            </ActionButton>
          </DialogActions>
        </Dialog>
      </ListLayout>
    </ThemeProvider>
  );
};

// Enhanced DetailRow Component with icons
const DetailRowStyled = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Avatar
      sx={{ 
        width: 36, 
        height: 36, 
        bgcolor: alpha(maroon.main, 0.1), 
        color: maroon.main 
      }}
    >
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default ViewApplicantPage;
