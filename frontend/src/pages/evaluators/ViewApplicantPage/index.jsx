import React, { useEffect, useState } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
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
  alpha,
  createTheme,
  ThemeProvider,
  useTheme,
  Avatar,
  Grid,
  Grow,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
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
  "INFORMATIVE_COPY_OF_TOR",
  "CERTIFICATE_OF_EMPLOYMENT",
];

const formatDocumentType = (type) => {
  if (!type) return "-";
  // Convert enum to readable label
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const ViewApplicantPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper to get state from location or sessionStorage
  const getPersistedState = (key) => {
    const storageKey = `viewApplicant_${key}`;
    const locationValue = location.state?.[key];
    
    if (locationValue !== undefined && locationValue !== null) {
      sessionStorage.setItem(storageKey, String(locationValue));
      return locationValue;
    }
    
    const stored = sessionStorage.getItem(storageKey);
    return stored || null;
  };

  // Get IDs - persisted through refresh
  const applicantId = getPersistedState('applicantId');
  const evaluationId = getPersistedState('evaluationId');
  const specificCourseId = getPersistedState('courseId');
  const evaluatorId = localStorage.getItem("evaluatorId");

  // Redirect if no applicantId
  useEffect(() => {
    if (!applicantId) {
      navigate("/evaluator/applicants");
    }
  }, [applicantId, navigate]);

  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
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

  // Add new state for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!applicantId) {
      console.error("No applicantId provided in location state");
      return;
    }
    // Fetch applicant profile
    fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`)
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
      fetch(`https://eteeap-foth.onrender.com/api/evaluations/${evaluationId}`)
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
    fetch(`https://eteeap-foth.onrender.com/api/evaluations/applicant/${applicantId}`)
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
    fetch(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`)
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
    fetch("https://eteeap-foth.onrender.com/api/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(() => setCourses([]));

    // Fetch forwarding information to display which admin forwarded this application
    fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}/forward-info`)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!applicantId || !selectedCourse || !evaluatorId) return;

    console.log("Checking for evaluation with:", {
      applicantId,
      courseId: selectedCourse.courseId,
      evaluatorId
    });

    // Check if there's an existing evaluation
    fetch(`https://eteeap-foth.onrender.com/api/evaluations/check?applicantId=${applicantId}&courseId=${selectedCourse.courseId}&evaluatorId=${evaluatorId}`)
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

  // Modified submit handler - check if status is final before submitting
  const handleSubmitClick = () => {
    if (!selectedCourse || !evaluationStatus) {
      setSubmissionMessage({ 
        type: "error", 
        text: "Please complete all required fields" 
      });
      return;
    }

    // If status is APPROVED or REJECTED, show confirmation dialog
    if (evaluationStatus === "APPROVED" || evaluationStatus === "REJECTED") {
      setConfirmDialogOpen(true);
    } else {
      // For PENDING or UNDER_REVIEW, submit directly
      handleSubmitEvaluation();
    }
  };

  // Helper: Call update-status-by-applicant-application-course endpoint in background
  const updateStatusByApplicantApplicationAndCourse = async ({
    applicantId,
    applicationId,
    courseId,
    status,
    comments, // add comments param
  }) => {
    if (!applicantId || !applicationId || !courseId || !status) return;
    try {
      // Encode comments for URL
      const commentsParam = comments ? `&comments=${encodeURIComponent(comments)}` : "";
      fetch(
        `https://eteeap-foth.onrender.com/api/evaluations/update-status-by-applicant-application-course?applicantId=${applicantId}&applicationId=${applicationId}&courseId=${courseId}&status=${status}${commentsParam}`,
        { method: "PUT" }
      );
    } catch (e) {
      // Silently ignore errors
      // console.error("Background status update failed", e);
    }
  };

  // Submit evaluation
  const handleSubmitEvaluation = async () => {
    setConfirmDialogOpen(false); // Close dialog if open
    
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
        ? `https://eteeap-foth.onrender.com/api/evaluations/${existingEvaluation.evaluationId}`
        : currentEvaluation
          ? `https://eteeap-foth.onrender.com/api/evaluations/${currentEvaluation.evaluationId}`
          : "https://eteeap-foth.onrender.com/api/evaluations";

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
        
        // --- Call background status update endpoint here ---
        // Try to get applicationId from applicant object if available
        const applicationId =
          applicant?.applicationId ||
          applicant?.currentApplicationId ||
          data.applicationId ||
          data.application?.applicationId;
        updateStatusByApplicantApplicationAndCourse({
          applicantId: Number(applicantId),
          applicationId: Number(applicationId),
          courseId: selectedCourse.courseId,
          status: evaluationStatus,
          comments: remarks, // pass remarks as comments
        });
        // ---------------------------------------------------

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

  // Helper to preview document - NOW OPENS IN NEW TAB
  const handlePreview = (doc) => {
    const url = `https://eteeap-foth.onrender.com/api/documents/preview/${doc.documentId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper to download document
  const handleDownload = (docId) => {
    window.open(`https://eteeap-foth.onrender.com/api/documents/download/${docId}`, "_blank");
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

  // Add helper function to check if evaluation is locked (after existing helper functions)
  const isEvaluationLocked = () => {
    const currentStatus = existingEvaluation?.evaluationStatus || currentEvaluation?.evaluationStatus;
    return currentStatus === "APPROVED" || currentStatus === "REJECTED";
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
                />
              </Stack>
            </AnimatedPaper>
          </Fade>
        )}
        
        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          {/* Applicant Profile Section */}
          <Grid item xs={12} md={3}>
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

          {/* Middle Section - Course & Documents */}
          <Grid item xs={12} md={5}>
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
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <DescriptionIcon sx={{ color: maroon.main }} />
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Submitted Documents
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                  
                  <Box sx={{ 
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  }}>
                    <List sx={{ p: 0 }}>
                      {DOCUMENT_TYPE_LABELS.map((docType, index) => {
                        const doc = documents.find((d) => d.documentType === docType);
                        return (
                          <ListItem key={docType}
                            sx={{
                              py: 2,
                              px: 2,
                              borderBottom: index < DOCUMENT_TYPE_LABELS.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha(gold.light, 0.15),
                              },
                              flexWrap: 'wrap',
                            }}
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
                              }}
                              sx={{ flex: 1, minWidth: 200 }}
                            />
                            {doc ? (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handlePreview(doc)}
                                  sx={{
                                    borderColor: maroon.main,
                                    color: maroon.main,
                                    textTransform: 'none',
                                    '&:hover': {
                                      borderColor: maroon.dark,
                                      bgcolor: alpha(maroon.main, 0.08),
                                    },
                                  }}
                                >
                                  Preview
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={() => handleDownload(doc.documentId)}
                                  sx={{
                                    bgcolor: maroon.main,
                                    textTransform: 'none',
                                    '&:hover': {
                                      bgcolor: maroon.dark,
                                    },
                                  }}
                                >
                                  Download
                                </Button>
                              </Stack>
                            ) : (
                              <StyledChip 
                                label="Not Provided" 
                                size="small" 
                                variant="outlined"
                                color="default"
                              />
                            )}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                </AnimatedPaper>
              </Grow>
            </Stack>
          </Grid>

          {/* Right Section - Evaluation Form (Vertical) */}
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={900}>
              <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <AssignmentIcon sx={{ color: maroon.main }} />
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Evaluation Form
                  </Typography>
                </Stack>
                {currentEvaluation && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Evaluation #{currentEvaluation.evaluationId}
                  </Typography>
                )}
                <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />

                {applicant && !checkForwardStatus() && (
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{ mb: 3, borderWidth: 2, fontSize: '0.75rem' }}
                  >
                    This application has not been forwarded for evaluation yet.
                  </Alert>
                )}

                {submissionMessage.text && (
                  <Alert 
                    severity={submissionMessage.type} 
                    sx={{ mb: 2, borderWidth: 2 }}
                    variant="outlined"
                    onClose={() => setSubmissionMessage({ type: "", text: "" })}
                  >
                    {submissionMessage.text}
                  </Alert>
                )}

                <Stack spacing={2.5}>
                  {/* Course Selection */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Course to Evaluate</InputLabel>
                    <Select
                      value={selectedCourse?.courseId || ""}
                      onChange={handleCourseChange}
                      label="Course to Evaluate"
                      disabled={Boolean(currentEvaluation || evaluationId) || isEvaluationLocked()}
                    >
                      {getAvailableCoursesForEvaluation().map((course) => (
                        <MenuItem key={course.courseId} value={course.courseId}>
                          {course.courseName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Evaluation Status */}
                  <FormControl fullWidth size="small">
                    <InputLabel>Evaluation Status</InputLabel>
                    <Select
                      value={evaluationStatus}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        if (existingEvaluation?.evaluationId) {
                          try {
                            await fetch(
                              `https://eteeap-foth.onrender.com/api/evaluations/${existingEvaluation.evaluationId}/update-status?status=${newStatus}`,
                              { method: "PUT" }
                            );
                            setEvaluationStatus(newStatus);
                          } catch (err) {
                            // Optionally show error to user
                            console.error("Failed to update status", err);
                          }
                        } else {
                          setEvaluationStatus(newStatus);
                        }
                      }}
                      label="Evaluation Status"
                      disabled={!selectedCourse || submitting || !checkForwardStatus() || isEvaluationLocked()}
                    >
                      <MenuItem value="APPROVED">Approved</MenuItem>
                      <MenuItem value="REJECTED">Rejected</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Remarks */}
                  <TextField
                    label="Evaluation Remarks"
                    multiline
                    rows={5}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={!selectedCourse || submitting || !checkForwardStatus() || isEvaluationLocked()}
                    placeholder="Provide comments..."
                  />

                  {/* Previous Evaluation Info */}
                  {existingEvaluation && (
                    <Box sx={{ 
                      bgcolor: isEvaluationLocked() 
                        ? alpha(existingEvaluation.evaluationStatus === "APPROVED" ? '#2e7d32' : '#d32f2f', 0.1)
                        : alpha(theme.palette.background.default, 0.5),
                      p: 1.5,
                      borderRadius: 2,
                      border: `1px solid ${
                        isEvaluationLocked()
                          ? alpha(existingEvaluation.evaluationStatus === "APPROVED" ? '#2e7d32' : '#d32f2f', 0.3)
                          : alpha(theme.palette.divider, 0.5)
                      }`,
                    }}>
                      <Typography variant="caption" fontWeight="medium" color="text.secondary">
                        {isEvaluationLocked() ? "Final Decision" : "Previous Evaluation"}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <StyledChip
                          label={existingEvaluation.evaluationStatus || "UNKNOWN"} 
                          color={getStatusChipColor(existingEvaluation.evaluationStatus)}
                          variant={isEvaluationLocked() ? "filled" : "outlined"}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {existingEvaluation.dateEvaluated ? 
                            new Date(existingEvaluation.dateEvaluated).toLocaleDateString() : 
                            "-"}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* Submit Button - Hidden when locked */}
                  {!isEvaluationLocked() && (
                    <ActionButton
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitClick}
                      disabled={!selectedCourse || !evaluationStatus || submitting || !checkForwardStatus()}
                      fullWidth
                      sx={{ borderRadius: "12px", py: 1.5 }}
                      endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                    >
                      {submitting ? "Submitting..." : existingEvaluation || currentEvaluation ? "Update" : "Submit"}
                    </ActionButton>
                  )}

                  {/* Show locked message instead of button */}
                  {isEvaluationLocked() && (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 1.5,
                      px: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      borderRadius: 2,
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        🔒 Evaluation has been finalized
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </AnimatedPaper>
            </Grow>
          </Grid>
        </Grid>

        {/* Confirmation Dialog for Final Status */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: evaluationStatus === "APPROVED" ? alpha('#2e7d32', 0.1) : alpha('#d32f2f', 0.1),
            color: evaluationStatus === "APPROVED" ? '#2e7d32' : '#d32f2f',
            fontWeight: 'bold',
          }}>
            ⚠️ Confirm Final Decision
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" gutterBottom>
              You are about to mark this application as <strong>{evaluationStatus}</strong>.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> After submitting this decision, the evaluation cannot be modified anymore. 
                Please make sure you have reviewed all documents and information carefully.
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Are you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setConfirmDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderColor: 'grey.400',
                color: 'text.secondary',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitEvaluation}
              variant="contained"
              sx={{ 
                bgcolor: evaluationStatus === "APPROVED" ? '#2e7d32' : '#d32f2f',
                '&:hover': {
                  bgcolor: evaluationStatus === "APPROVED" ? '#1b5e20' : '#b71c1c',
                },
              }}
              endIcon={<SendIcon />}
            >
              Yes, Submit Final Decision
            </Button>
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