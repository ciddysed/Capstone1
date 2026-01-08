import { Assignment, Logout, Person as UserIcon, School as GraduationCapIcon, Description as FileTextIcon, CheckCircle as CheckCircleIcon, Schedule as ClockIcon, Warning as AlertCircleIcon } from "@mui/icons-material";
import {
  Typography,
  Box,
  Grid,
  ThemeProvider,
  alpha,
  Card,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  Popover,
  Paper,
  LinearProgress,
  Chip
} from "@mui/material";
import axios from "axios";
import { API_BASE } from '../../../config';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Reuse color palette and theme from AppCoursePreference styles
import { maroon, gold, customTheme } from '../AppCoursePreference/styles';
import useResponseHandler from "../../../utils/useResponseHandler";
// logo removed (unused)
import toast from "../../../utils/toast";

// Import reusable components and styles from AppCoursePreference
// Reuse styles via individual components where needed; removed unused imports from AppCoursePreference styles

// Import shared component
import DocumentHandler from "./DocumentHandler";
import CoursePreferences from "./CoursePreferences";

// Notifications
import NotificationCenter from '../../../components/Notifications/NotificationCenter';
import DashboardLink from '../../../components/DashboardLink';
import useSubjectNotifications from '../../../hooks/useSubjectNotifications';
import ApplicationStatusPoller from '../../../components/ApplicationStatusPoller';
import CoursePreferencesPoller from '../../../components/CoursePreferencesPoller';

import {
  StatusChip,
} from "./styled";

import {
  APPLICATION_STATUS,
  DOCUMENT_TYPES,
  getStatusIcon,
  PRIORITY_ORDER
} from "./utils";

// API base URL (centralized)
const API_BASE_URL = API_BASE;

// Required document types
const REQUIRED_DOCUMENTS = [
  { value: "APPLICANTS_EVALUATION_SHEET", label: "Applicant's Evaluation Sheet" },
  { value: "INFORMATIVE_COPY_OF_TOR", label: "Informative Copy of TOR" },
  { value: "PSA_AUTHENTICATED_BIRTH_CERTIFICATE", label: "PSA Birth Certificate" },
  { value: "CERTIFICATE_OF_TRANSFER_CREDENTIAL", label: "Certificate of Transfer Credential" },
  { value: "MARRIAGE_CERTIFICATE", label: "Marriage Certificate" },
  { value: "CERTIFICATE_OF_EMPLOYMENT", label: "Certificate of Employment" },
  { value: "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION", label: "Employer Certified Job Description" },
  { value: "EVIDENCE_OF_BUSINESS_OWNERSHIP", label: "Evidence of Business Ownership" }
];

// Main component
const ApplicationTracking = () => {

  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const navigate = useNavigate();
  const [applicantId, setApplicantId] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    initials: "",
  });
  const [applicationStatus, setApplicationStatus] = useState(
    APPLICATION_STATUS.PENDING
  );
  // Debug: Track applicationStatus changes
  useEffect(() => {
    console.log('[ApplicationTrack] applicationStatus updated:', applicationStatus);
  }, [applicationStatus]);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    courses: true,
    preferences: true,
    documents: true,
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const userType = localStorage.getItem("userType");

  // New state for Application Notes
  const [applicationNotes, setApplicationNotes] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState("");
  const [applicationId, setApplicationId] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Create axios instance with common configurations - use useMemo to avoid recreating on each render
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptors for error handling
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        // Only show the generic error if it's not a 404 from acceptance check
        if (error.response?.status === 404 && error.config.url?.includes('/accepted-applicants/applicant/')) {
          // Do not show error banner for normal 'not accepted yet' case
          return Promise.reject(error);
        }
        const errorMessage =
          error.response?.data?.message ||
          "An error occurred while communicating with the server";
        handleError(errorMessage);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [handleError]);

  // Get applicant initials for avatar
  const getInitials = useCallback((name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Helper to determine document type from filename
  const getDocumentType = useCallback((filename) => {
    const extension = filename.split(".").pop().toLowerCase();

    if (extension === "pdf") return "PDF";
    if (["doc", "docx"].includes(extension))
      return extension === "doc" ? "DOC" : "DOCX";
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension))
      return "IMAGE";
    return "OTHER";
  }, []);

  // Check for missing required documents
  const checkMissingDocuments = useCallback((documents) => {
    const uploadedTypes = new Set(documents.map(doc => doc.type));
    const missing = REQUIRED_DOCUMENTS.filter(
      reqDoc => !uploadedTypes.has(reqDoc.value)
    );
    setMissingDocuments(missing);
  }, []);

  const fetchApplicantData = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setLoading((prev) => ({ ...prev, profile: true }));

        // Fetch applicant profile
        const profileResponse = await api.get(`/applicants/${id}`);
        const applicantData = profileResponse.data;

        const fullName = `${applicantData.firstName} ${
          applicantData.middleInitial ? applicantData.middleInitial + "." : ""
        } ${applicantData.lastName}`;

        // Set user data
        setUserData({
          name: fullName,
          email: applicantData.email,
          initials: getInitials(fullName),
        });

        // Check if applicant already has an application
        const applicationsResponse = await api.get(
          `/applications/applicant/${id}`
        );

        if (applicationsResponse.data && applicationsResponse.data.length > 0) {
          // Store application status and applicationId
          setApplicationStatus(applicationsResponse.data[0].status);
          console.log('[ApplicationTrack] setApplicationStatus called with:', applicationsResponse.data[0].status);
          setApplicationId(applicationsResponse.data[0].applicationId || applicationsResponse.data[0].id);

          // Fetch application remarks in real time
          setNotesLoading(true);
          setNotesError("");
          try {
            const remarksRes = await api.get(`/applications/${applicationsResponse.data[0].applicationId || applicationsResponse.data[0].id}`);
            setApplicationNotes(remarksRes.data.applicationNotes || "");
            console.log('[ApplicationTrack] applicationNotes updated:', remarksRes.data.applicationNotes);
          } catch (err) {
            setNotesError("Failed to load application remarks.");
            setApplicationNotes("");
          } finally {
            setNotesLoading(false);
          }
        } else {
          handleError("No application found");
        }
      } catch (error) {
        console.error("Error fetching applicant data:", error);
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }));
      }
    },
    [api, getInitials, handleError]
  );

    // Fetch all subjects for notification tracking
    const fetchAllSubjects = useCallback(async () => {
      const id = localStorage.getItem('applicantId');
      if (!id) return [];

      try {
        const response = await api.get(`/applicant-subject-records/applicant/${id}/organized-clean`);
        const allSubjects = [];
        Object.values(response.data).forEach(semesterSubjects => {
          allSubjects.push(...semesterSubjects);
        });
        setSubjectsList(allSubjects);
        return allSubjects;
      } catch (err) {
        console.warn('Failed to fetch subjects for notifications', err);
        setSubjectsList([]);
        return [];
      }
    }, [api]);

  const fetchDocuments = useCallback(async (applicantId) => {
    if (!applicantId) return;
    
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      const response = await api.get(`/documents/applicant/${applicantId}`);
      
      const documents = response.data.map((doc) => {
        const fileType = getDocumentType(doc.fileName);
        return {
          id: doc.documentId,
          name: doc.fileName,
          type: doc.documentType || "GENERAL",  // Use the actual documentType from backend
          fileType: fileType,
          icon: DOCUMENT_TYPES[fileType]?.icon || DOCUMENT_TYPES.OTHER.icon,
          mimeType: DOCUMENT_TYPES[fileType]?.mimeType || DOCUMENT_TYPES.OTHER.mimeType,
          // Direct download and preview URLs - simplified approach
          downloadUrl: `/documents/download/${doc.documentId}`,
          previewUrl: `/documents/preview/${doc.documentId}`,
          uploadDate: new Date(doc.uploadDate || Date.now()).toLocaleDateString(),
          size: doc.fileSize || "Unknown"
        };
      });
      
      setDocuments(documents);
      checkMissingDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  }, [api, getDocumentType, checkMissingDocuments]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, courses: true }));
      const response = await api.get("/courses");
      setAvailableCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  }, [api]);

  // Initialize subject-level notifications (real-time polling and toasts)
  // Initialize subject-level notifications (real-time polling and toasts)
  useSubjectNotifications(
    localStorage.getItem('applicantId'),
    subjectsList,
    fetchAllSubjects,
    {
      enablePolling: true,
      pollingInterval: 30000,
      showToast: true,
      autoInitialize: true
    }
  );

  const fetchCoursePreferences = useCallback(
    async (applicantId) => {
      if (!applicantId) return;

      try {
        setLoading((prev) => ({ ...prev, preferences: true }));
        // Use the endpoint that returns evaluationStatus in the DTO
        const response = await api.get(`/preferences/applicant/${applicantId}/with-evaluation`);

        // Sort preferences by priority
        const priorityOrder = {
          [PRIORITY_ORDER.FIRST]: 1,
          [PRIORITY_ORDER.SECOND]: 2,
          [PRIORITY_ORDER.THIRD]: 3,
        };

        const sortedPrefs = [...response.data].sort(
          (a, b) =>
            priorityOrder[a.priorityOrder] - priorityOrder[b.priorityOrder]
        );

        setCoursePreferences(sortedPrefs);
      } catch (error) {
        console.error("Error fetching course preferences:", error);
        setCoursePreferences([]);
      } finally {
        setLoading((prev) => ({ ...prev, preferences: false }));
      }
    },
    [api]
  );

  // Initialize application data
  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      return;
    }

    setApplicantId(storedApplicantId);
  }, [handleError]); // Added handleError to dependency array

  // Check if applicant is accepted and redirect to accepted dashboard
  const checkAcceptanceStatus = useCallback(async (applicantId) => {
    if (isAccepted) return true; // Already accepted, don't check again
    
    try {
      console.log('Checking acceptance status for applicant:', applicantId);
      const response = await api.get(`/accepted-applicants/applicant/${applicantId}`);
      console.log('Acceptance check response:', response);
      
      if (response.data && response.status === 200) {
        console.log('Applicant is accepted!');
        setIsAccepted(true);
        // Show a notification only; let NotificationCenter handle redirect via user action
        toast.success('Congratulations! Your application has been accepted. Please check your notifications to proceed to the enrollment dashboard.', {
          duration: 6000
        });
        return true;
      }
      console.log('Applicant not accepted yet');
      return false;
    } catch (error) {
      console.log('Acceptance check error (expected if not accepted):', error.response?.status);
      // If 404 or error, applicant is not accepted yet
      return false;
    }
  }, [api, isAccepted]);

  // Separate effect for fetching data after applicantId is set
  useEffect(() => {
    if (applicantId && !isAccepted) {
      // First check if applicant is already accepted
      checkAcceptanceStatus(applicantId).then(accepted => {
        if (!accepted) {
          // Only fetch application tracking data if not accepted
          fetchApplicantData(applicantId);
          fetchCourses();
          fetchCoursePreferences(applicantId);
          fetchDocuments(applicantId);
            // Also fetch subject records to enable subject-level notifications
            fetchAllSubjects();
        }
      });
    }
  }, [
    applicantId,
    isAccepted,
    checkAcceptanceStatus,
    fetchApplicantData,
    fetchCourses,
    fetchCoursePreferences,
    fetchDocuments,
    fetchAllSubjects,
  ]);

  // Periodic check for acceptance status (every 30 seconds)
  useEffect(() => {
    if (!applicantId || isAccepted) return;

    const intervalId = setInterval(() => {
      checkAcceptanceStatus(applicantId);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [applicantId, isAccepted, checkAcceptanceStatus]);

  const handleFileUpload = async (event) => {
    const fileList = Array.from(event.target.files);

    if (fileList.length === 0 || !applicantId) return;

    // Prepare form data for file upload
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("applicantId", applicantId);
    formData.append("documentType", "General");

    setUploadingFiles(true);

    try {
      await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess(
        `${fileList.length} ${
          fileList.length === 1 ? "file" : "files"
        } uploaded successfully!`
      );

      // Fetch updated documents after upload
      fetchDocuments(applicantId);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploadingFiles(false);

      // Reset file input
      event.target.value = null;
    }
  };

  const handleMissingFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    
    if (!file || !applicantId) return;

    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB");
      return;
    }

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("files", file);
    formData.append("applicantId", applicantId);
    formData.append("documentType", documentType);

    setUploadingFiles(true);

    try {
      await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const docLabel = REQUIRED_DOCUMENTS.find(doc => doc.value === documentType)?.label || documentType;
      handleSuccess(`${docLabel} uploaded successfully!`);
      
      // Fetch updated documents after upload
      fetchDocuments(applicantId);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response && error.response.data) {
        handleError(`Failed to upload: ${error.response.data}`);
      } else {
        handleError("Failed to upload file. Please try again.");
      }
    } finally {
      setUploadingFiles(false);
      
      // Reset file input
      event.target.value = null;
    }
  };

  const handleFileChange = async (event, documentToReplace) => {
    const file = event.target.files[0];
    
    if (!file || !applicantId) return;

    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB");
      return;
    }

    setUploadingFiles(true);

    try {
      // Use PUT request to efficiently update the existing document
      const formData = new FormData();
      formData.append("files", file);
      
      // We don't need to include applicantId or documentType since we're not changing ownership
      // Only include them if you actually want to change these values
      // formData.append("applicantId", applicantId);
      // formData.append("documentType", documentToReplace.documentType || documentToReplace.type);

      // Call the PUT endpoint
      const response = await api.put(`/documents/${documentToReplace.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess(`Document replaced successfully!`);
      
      // Update the specific document in the documents array
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === documentToReplace.id 
            ? {
                ...doc,
                name: response.data.fileName,
                uploadDate: new Date().toLocaleDateString(),
                size: response.data.fileSize || "Unknown"
              }
            : doc
        )
      );
    } catch (error) {
      console.error("Error replacing file:", error);
      if (error.response && error.response.data) {
        handleError(`Failed to replace file: ${error.response.data}`);
      } else {
        handleError("Failed to replace file. Please try again.");
      }
    } finally {
      setUploadingFiles(false);
      
      // Reset file input
      event.target.value = null;
    }
  };

  // Get the course name for a given course ID
  const getCourseName = useCallback(
    (courseId) => {
      const course = availableCourses.find((c) => c.courseId === courseId);
      return course ? course.courseName : "Course not found";
    },
    [availableCourses]
  );

  // Convert priority order to readable format
  const formatPriority = useCallback((priority) => {
    const formats = {
      [PRIORITY_ORDER.FIRST]: "Course 1",
      [PRIORITY_ORDER.SECOND]: "Course 2",
      [PRIORITY_ORDER.THIRD]: "Course 3",
    };
    return formats[priority] || priority;
  }, []);

  // Group documents by type for tabs
  const documentsByType = useMemo(() => ({
    all: documents,
    required: documents.filter(doc => 
      doc.type && doc.type !== "GENERAL" && doc.type !== "General"
    ),
    other: documents.filter(doc => 
      !doc.type || doc.type === "GENERAL" || doc.type === "General"
    )
  }), [documents]);

  // Document preview/download are handled in DocumentHandler/DocumentList components

  // Display loading states

  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 4; // Personal info, preferences, required docs, application status

    if (userData.name && userData.email) completed++;
    if (coursePreferences.length > 0) completed++;
    if (documents.some((f) => f.type === "INFORMATIVE_COPY_OF_TOR")) completed++;
    if (documents.length >= 3) completed++;

    return (completed / total) * 100;
  };

  const handleLogout = () => {
    localStorage.removeItem("applicantId");
    localStorage.removeItem("evaluatorId");
    localStorage.removeItem("userType");
    handleSuccess("Logged out successfully!");

    // Redirect AFTER a brief delay or state update
    setTimeout(() => {
      if (userType === "applicant") {
        navigate("/login", { replace: true });
      } else if (userType === "evaluator") {
        navigate("/evaluator/login", { replace: true });
      } else if (userType === "admin") {
        navigate("/admin/login", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 0);
  };

  // Application remarks are now fetched in real time via fetchApplicantData polling

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ 
        minHeight: "100vh", 
        background: `linear-gradient(135deg, ${alpha('#B8860B', 0.05)} 0%, ${alpha('#FFD700', 0.03)} 100%)`,
        bgcolor: "grey.50" 
      }}>
        {/* Header - matching AppCoursePreference style */}
        <Paper elevation={1} sx={{ borderRadius: 0, bgcolor: maroon.main }}>
          <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "white",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCapIcon sx={{ color: maroon.main, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    APPLICATION TRACKING DASHBOARD
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Track your application status and manage documents
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Dashboard link always visible */}
                <DashboardLink />
                {/* Notification icon */}
                <NotificationCenter userType={userType} userId={applicantId} />
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight="medium" color="white">
                    {userData.name || "Loading..."}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.8)">
                    {userData.email || "Loading..."}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={handleClick}
                > 
                  <UserIcon sx={{ color: maroon.main, fontSize: 16 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Progress Bar - matching AppCoursePreference style */}
        <Paper elevation={1} sx={{ borderRadius: 0, background: `linear-gradient(135deg, ${alpha('#FFD700', 0.1)} 0%, ${alpha('#B8860B', 0.08)} 100%)` }}>
          <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight="medium" color="text.primary">
                Application Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(calculateProgress())}% Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateProgress()}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha('#FFD700', 0.2),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${maroon.main} 0%, ${gold.main} 100%)`
                }
              }}
            />
          </Box>
        </Paper>

        {/* User Menu Popover */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: 220,
              borderRadius: 2,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              mt: 1.5,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {userData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userType
                ? `${
                    userType.charAt(0).toUpperCase() + userType.slice(1)
                  } Account`
                : "User Account"}
            </Typography>
          </Box>

          <Divider />

          <MenuItem
            onClick={() => {
              handleLogout();
              handleClosePopover();
            }}
            sx={{
              py: 1.5,
              "&:hover": {
                backgroundColor: "rgba(128, 0, 0, 0.08)",
              },
            }}
          >
            <Logout
              fontSize="small"
              sx={{ mr: 1.5, color: "text.secondary" }}
            />
            <Typography variant="body2">Sign Out</Typography>
          </MenuItem>
        </Popover>

        {/* Main Content - always render, update sections as data loads */}
        <Box sx={{ maxWidth: "1400px", mx: "auto", px: 3, py: 4 }}>
          <Grid container spacing={3}>
                {/* Left Column - Personal Info & Course Preferences */}
                <Grid item xs={12} lg={6}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    

                    {/* Personal Information Card */}
                    <Card elevation={2} sx={{ 
                      border: `2px solid ${alpha(gold.light, 0.2)}`,
                      '&:hover': { 
                        boxShadow: `0 8px 32px ${alpha(maroon.main, 0.12)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardHeader
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <UserIcon sx={{ color: maroon.main, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: maroon.main, fontWeight: 600 }}>Personal Information</Typography>
                          </Box>
                        }
                        sx={{ 
                          pb: 2,
                          background: `linear-gradient(135deg, ${alpha(gold.light, 0.08)} 0%, ${alpha(maroon.main, 0.05)} 100%)`
                        }}
                      />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                Full Name
                              </Typography>
                            </Box>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              background: `linear-gradient(135deg, ${alpha(gold.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                              border: `1px solid ${alpha(gold.main, 0.2)}`
                            }}>
                              <Typography fontWeight="medium" color="text.primary">
                                {userData.name}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                Email Address
                              </Typography>
                            </Box>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              background: `linear-gradient(135deg, ${alpha(gold.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                              border: `1px solid ${alpha(gold.main, 0.2)}`
                            }}>
                              <Typography color="text.primary">{userData.email}</Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Application Status Card */}
                    <Card elevation={2} sx={{ 
                      border: `2px solid ${alpha(gold.light, 0.2)}`,
                      '&:hover': { 
                        boxShadow: `0 8px 32px ${alpha(maroon.main, 0.12)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardHeader
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Assignment sx={{ color: maroon.main, fontSize: 20 }} />
                              <Typography variant="h6" sx={{ color: maroon.main, fontWeight: 600 }}>Application Status</Typography>
                            </Box>
                            <StatusChip
                              label={applicationStatus}
                              status={applicationStatus}
                              icon={getStatusIcon(applicationStatus)}
                            />
                          </Box>
                        }
                        subheader="Track your application progress and review details"
                        sx={{ 
                          pb: 2,
                          background: `linear-gradient(135deg, ${alpha(gold.light, 0.08)} 0%, ${alpha(maroon.main, 0.05)} 100%)`
                        }}
                      />
                      <CardContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {documents.some((f) => f.type === "INFORMATIVE_COPY_OF_TOR") ? (
                              <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                            ) : (
                              <AlertCircleIcon sx={{ color: "error.main", fontSize: 16 }} />
                            )}
                            <Typography variant="body2">Required Documents</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {coursePreferences.length > 0 ? (
                              <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                            ) : (
                              <ClockIcon sx={{ color: "warning.main", fontSize: 16 }} />
                            )}
                            <Typography variant="body2">Course Preferences</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {documents.length >= 3 ? (
                              <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
                            ) : (
                              <ClockIcon sx={{ color: "warning.main", fontSize: 16 }} />
                            )}
                            <Typography variant="body2">Document Count (Min 3)</Typography>
                          </Box>
                        </Box>
                        {/* --- Application Remarks Section --- */}
                        <Divider sx={{ my: 2, borderColor: alpha(gold.main, 0.2) }} />
                        <Box
                          sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: 2,
                            background: `linear-gradient(90deg, ${alpha(gold.main, 0.18)} 0%, ${alpha(maroon.main, 0.08)} 100%)`,
                            border: `2px solid ${alpha(gold.main, 0.5)}`,
                            boxShadow: `0 2px 12px ${alpha(maroon.main, 0.07)}`,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: maroon.main,
                              fontWeight: 800,
                              mb: 1,
                              letterSpacing: 0.5,
                              fontSize: "1.15rem",
                              textShadow: `0 1px 0 ${alpha(gold.main, 0.2)}`
                            }}
                          >
                            Application Remarks
                          </Typography>
                          {notesLoading ? (
                            <Typography variant="body1" color="text.secondary">Loading...</Typography>
                          ) : notesError ? (
                            <Typography variant="body1" color="error">{notesError}</Typography>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                color: applicationNotes ? maroon.dark : "#888",
                                fontWeight: applicationNotes ? 600 : 400,
                                fontSize: "1.05rem",
                                minHeight: 32
                              }}
                            >
                              {applicationNotes ? applicationNotes : "No remarks yet."}
                            </Typography>
                          )}
                        </Box>
                        {/* --- End Application Remarks Section --- */}
                      </CardContent>
                    </Card>

                  </Box>
                </Grid>

                {/* Right Column - Documents */}
                <Grid item xs={12} lg={6}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={2} sx={{ 
                        border: `2px solid ${alpha(gold.light, 0.2)}`,
                        '&:hover': { 
                          boxShadow: `0 8px 32px ${alpha(maroon.main, 0.12)}`,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease',
                        height: 'fit-content'
                      }}>
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FileTextIcon sx={{ color: maroon.main, fontSize: 20 }} />
                                <Typography variant="h6" sx={{ color: maroon.main, fontWeight: 600 }}>Application Documents</Typography>
                              </Box>
                              <Chip 
                                label={documents.length} 
                                size="small" 
                                sx={{
                                  backgroundColor: gold.main,
                                  color: 'black',
                                  fontWeight: 600
                                }}
                              />
                            </Box>
                          }
                          subheader="Manage your uploaded documents"
                          sx={{ 
                            pb: 2,
                            background: `linear-gradient(135deg, ${alpha(gold.light, 0.08)} 0%, ${alpha(maroon.main, 0.05)} 100%)`
                          }}
                        />
                        <CardContent>
                          <DocumentHandler
                            isLoading={loading.documents}
                            documents={documents}
                            documentsByType={documentsByType}
                            apiBaseUrl={API_BASE_URL}
                            uploadingFiles={uploadingFiles}
                            handleFileUpload={handleFileUpload}
                            handleFileChange={handleFileChange}
                            missingDocuments={missingDocuments}
                            handleMissingFileUpload={handleMissingFileUpload}
                            requiredDocuments={REQUIRED_DOCUMENTS}
                            maroon={maroon}
                            gold={gold}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card elevation={2} sx={{ 
                        border: `2px solid ${alpha(gold.light, 0.2)}`,
                        '&:hover': { 
                          boxShadow: `0 8px 32px ${alpha(maroon.main, 0.12)}`,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}>
                        
                        <CardContent>
                          <CoursePreferences
                            isLoading={false}
                            coursePreferences={coursePreferences}
                            formatPriority={formatPriority}
                            getCourseName={getCourseName}
                            maroon={maroon}
                            gold={gold}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Status Message */}
              {applicationStatus === APPLICATION_STATUS.PENDING && (
                <Box sx={{ mt: 4 }}>
                  <Card elevation={3} sx={{ 
                    border: `2px solid ${alpha(gold.light, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(gold.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
                    '&:hover': { 
                      boxShadow: `0 12px 40px ${alpha(maroon.main, 0.15)}`,
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    <CardContent sx={{ pt: 3 }}>
                      <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ color: maroon.main }}>
                            Application Under Review
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Our admissions team is currently processing your application. You will receive an email notification when there's an update.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
        {snackbar}
        <ApplicationStatusPoller applicantId={applicantId} fetchApplicantData={fetchApplicantData} />
        <CoursePreferencesPoller applicantId={applicantId} fetchCoursePreferences={fetchCoursePreferences} />
      </Box>
    </ThemeProvider>
  );
};

export default ApplicationTracking;
