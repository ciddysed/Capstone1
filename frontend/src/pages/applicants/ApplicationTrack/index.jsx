import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Box,
  Grid,
  Stack,
  CircularProgress,
  Tooltip,
  createTheme,
  ThemeProvider,
  alpha,
  Grow,
  Card
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
import axios from "axios";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import useResponseHandler from "../../../utils/useResponseHandler";
import {
  TrackingPaper,
  StatusChip,
  UserAvatar
} from "./styled";
import {
  APPLICATION_STATUS,
  DOCUMENT_TYPES,
  getStatusIcon,
  PRIORITY_ORDER
} from "./utils";
import ApplicantInfo from "./ApplicantInfo";
import CoursePreferences from "./CoursePreferences";
import DocumentHandler from "./DocumentHandler";

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

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    }
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(gold.main, 0.3),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

// API base URL - move to environment config in production
const API_BASE_URL = "http://localhost:8080/api";

// Main component
const ApplicationTracking = () => {
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [applicantId, setApplicantId] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    initials: "",
  });
  const [applicationStatus, setApplicationStatus] = useState(APPLICATION_STATUS.PENDING);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    courses: true,
    preferences: true,
    documents: true
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Create axios instance with common configurations - use useMemo to avoid recreating on each render
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add interceptors for error handling
    instance.interceptors.response.use(
      response => response,
      error => {
        console.error("API Error:", error);
        const errorMessage = error.response?.data?.message || "An error occurred while communicating with the server";
        handleError(errorMessage);
        return Promise.reject(error);
      }
    );

    return instance;
  }, [handleError]);

  // Get applicant initials for avatar
  const getInitials = useCallback((name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Helper to determine document type from filename
  const getDocumentType = useCallback((filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(extension)) return extension === 'doc' ? 'DOC' : 'DOCX';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'IMAGE';
    return 'OTHER';
  }, []);

  const fetchApplicantData = useCallback(async (id) => {
    if (!id) return;
    
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      
      // Fetch applicant profile
      const profileResponse = await api.get(`/applicants/${id}`);
      const applicantData = profileResponse.data;
      
      const fullName = `${applicantData.firstName} ${applicantData.middleInitial ? applicantData.middleInitial + '.' : ''} ${applicantData.lastName}`;
      
      // Set user data
      setUserData({
        name: fullName,
        email: applicantData.email,
        initials: getInitials(fullName)
      });
      
      // Check if applicant already has an application
      const applicationsResponse = await api.get(`/applications/applicant/${id}`);
      
      if (applicationsResponse.data && applicationsResponse.data.length > 0) {
        // Store application status but don't set unused applicationId
        setApplicationStatus(applicationsResponse.data[0].status);
      } else {
        handleError("No application found");
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [api, getInitials, handleError]);

  const fetchDocuments = useCallback(async (applicantId) => {
    if (!applicantId) return;
    
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      const response = await api.get(`/documents/applicant/${applicantId}`);
      
      const documents = response.data.map((doc) => {
        const docType = getDocumentType(doc.fileName);
        return {
          id: doc.documentId,
          name: doc.fileName,
          type: doc.documentType || "General",
          fileType: docType,
          icon: DOCUMENT_TYPES[docType]?.icon || DOCUMENT_TYPES.OTHER.icon,
          mimeType: DOCUMENT_TYPES[docType]?.mimeType || DOCUMENT_TYPES.OTHER.mimeType,
          // Direct download and preview URLs - simplified approach
          downloadUrl: `/documents/download/${doc.documentId}`,
          previewUrl: `/documents/preview/${doc.documentId}`,
          uploadDate: new Date(doc.uploadDate || Date.now()).toLocaleDateString(),
          size: doc.fileSize || "Unknown"
        };
      });
      
      setDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  }, [api, getDocumentType]);
  
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }));
      const response = await api.get("/courses");
      setAvailableCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  }, [api]);
 
  const fetchCoursePreferences = useCallback(async (applicantId) => {
    if (!applicantId) return;
    
    try {
      setLoading(prev => ({ ...prev, preferences: true }));
      const response = await api.get(`/preferences/applicant/${applicantId}`);
      
      // Sort preferences by priority
      const priorityOrder = { 
        [PRIORITY_ORDER.FIRST]: 1, 
        [PRIORITY_ORDER.SECOND]: 2, 
        [PRIORITY_ORDER.THIRD]: 3 
      };
      
      const sortedPrefs = [...response.data].sort((a, b) => 
        priorityOrder[a.priorityOrder] - priorityOrder[b.priorityOrder]
      );
      
      setCoursePreferences(sortedPrefs);
    } catch (error) {
      console.error("Error fetching course preferences:", error);
      setCoursePreferences([]); 
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }));
    }
  }, [api]);

  // Initialize application data
  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      return;
    }

    setApplicantId(storedApplicantId);
  }, [handleError]); // Added handleError to dependency array

  // Separate effect for fetching data after applicantId is set
  useEffect(() => {
    if (applicantId) {
      fetchApplicantData(applicantId);
      fetchCourses();
      fetchCoursePreferences(applicantId);
      fetchDocuments(applicantId);
    }
  }, [applicantId, fetchApplicantData, fetchCourses, fetchCoursePreferences, fetchDocuments]);

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

      handleSuccess(`${fileList.length} ${fileList.length === 1 ? 'file' : 'files'} uploaded successfully!`);
      
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

  // Get the course name for a given course ID
  const getCourseName = useCallback((courseId) => {
    const course = availableCourses.find(c => c.courseId === courseId);
    return course ? course.courseName : "Course not found";
  }, [availableCourses]);

  // Convert priority order to readable format
  const formatPriority = useCallback((priority) => {
    const formats = {
      [PRIORITY_ORDER.FIRST]: "Course 1",
      [PRIORITY_ORDER.SECOND]: "Course 2",
      [PRIORITY_ORDER.THIRD]: "Course 3"
    };
    return formats[priority] || priority;
  }, []);

  // Group documents by type for tabs
  const documentsByType = useMemo(() => ({
    all: documents,
    required: documents.filter(doc => doc.type === 'Required' || doc.type === 'Transcript' || doc.type === 'ID'),
    other: documents.filter(doc => doc.type === 'General' || doc.type === 'Other')
  }), [documents]);

  // Display loading states
  const isLoadingInitialData = loading.profile || loading.courses;
  const isLoadingDetailData = loading.preferences || loading.documents;

  return (
    <ThemeProvider theme={customTheme}>
      <MinimalLayout backgroundImage={backgroundImage}>
        <Stack alignItems="center" spacing={3} sx={{ width: "100%" }}>
          {/* Header with Logo and User Info */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            width: "100%", 
            maxWidth: 850,
            mb: 1
          }}>
            <img src={logo} alt="University Logo" style={{ height: 50 }} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {userData.email}
                </Typography>
                <UserAvatar 
                  alt={userData.name}
                  sx={{ 
                    bgcolor: maroon.main, 
                    color: maroon.contrastText,
                    boxShadow: `0 3px 5px ${alpha('#000', 0.2)}`
                  }}
                >
                  {userData.initials}
                </UserAvatar>
              </Stack>
            </Box>
          </Box>
          
          {isLoadingInitialData ? (
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              minHeight: "300px",
              width: "100%",
              maxWidth: 850,
              bgcolor: alpha('#fff', 0.8),
              borderRadius: 2,
              py: 8,
              boxShadow: '0 8px 40px -12px rgba(0,0,0,0.2)',
            }}>
              <CircularProgress sx={{ color: maroon.main }} size={46} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
                Loading Application Details...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Please wait while we retrieve your information
              </Typography>
            </Box>
          ) : (
            <Grow in={true} timeout={800}>
              <TrackingPaper 
                elevation={3}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 10px 40px -12px rgba(106, 0, 0, 0.3)',
                  overflow: 'hidden',
                  pb: 0,
                }}
              >
                {/* Header Section */}
                <Box 
                  sx={{ 
                    bgcolor: alpha(maroon.main, 0.04),
                    borderBottom: `1px solid ${alpha(gold.main, 0.3)}`,
                    p: 3,
                    mb: 3
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    flexWrap: "wrap",
                    gap: 2 
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box 
                        sx={{ 
                          bgcolor: alpha(maroon.main, 0.1), 
                          borderRadius: '50%', 
                          p: 1.2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Assignment sx={{ color: maroon.main, fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" color={maroon.dark} gutterBottom>
                          Application Tracking
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                          Track your application status, view submitted documents, and review your course preferences
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Tooltip title={`Application Status: ${applicationStatus}`} arrow placement="top">
                        <StatusChip 
                          label={applicationStatus} 
                          status={applicationStatus}
                          icon={getStatusIcon(applicationStatus)}
                          sx={{ py: 1, px: 1.5 }}
                        />
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ px: 3, pb: 3 }}>
                  <Grid container spacing={3}>
                    {/* Left Column with Applicant Info and Course Preferences */}
                    <Grid item xs={12} md={7}>
                      <Stack spacing={3}>
                        <Card sx={{ 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)', 
                          borderRadius: 1,
                          overflow: 'hidden' 
                        }}>
                          <ApplicantInfo userData={userData} maroon={maroon} gold={gold} />
                        </Card>
                        
                        <Card sx={{ 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)', 
                          borderRadius: 1,
                          overflow: 'hidden'  
                        }}>
                          <CoursePreferences
                            isLoading={isLoadingDetailData}
                            coursePreferences={coursePreferences}
                            formatPriority={formatPriority}
                            getCourseName={getCourseName}
                            maroon={maroon}
                            gold={gold}
                          />
                        </Card>
                      </Stack>
                    </Grid>
                    
                    {/* Right Column with Documents */}
                    <Grid item xs={12} md={5}>
                      <Card sx={{ 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)', 
                        borderRadius: 1,
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <DocumentHandler
                          isLoading={isLoadingDetailData}
                          documents={documents}
                          documentsByType={documentsByType}
                          apiBaseUrl={API_BASE_URL}
                          uploadingFiles={uploadingFiles}
                          handleFileUpload={handleFileUpload}
                          maroon={maroon}
                          gold={gold}
                        />
                      </Card>
                    </Grid>
                  </Grid>
                  
                  {applicationStatus === APPLICATION_STATUS.PENDING && (
                    <Box sx={{ 
                      mt: 3, 
                      p: 3, 
                      bgcolor: alpha(gold.light, 0.2),
                      border: `1px solid ${alpha(gold.main, 0.3)}`,
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle1" color={maroon.dark} gutterBottom>
                        Your Application is Under Review
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Our admissions team is currently processing your application.
                        You will receive an email notification when there's an update.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </TrackingPaper>
            </Grow>
          )}
        </Stack>
        
        {snackbar}
      </MinimalLayout>
    </ThemeProvider>
  );
};

export default ApplicationTracking;