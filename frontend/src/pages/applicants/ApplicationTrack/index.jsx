import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Typography,
  Box,
  Grid,
  Stack,
  CircularProgress,
  Tooltip,
  ThemeProvider,
  alpha,
  Grow,
  Divider,
  Button
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import useResponseHandler from "../../../utils/useResponseHandler";

// Import reusable components and styles from AppCoursePreference
import ApplicationHeader from "../AppCoursePreference/components/ApplicationHeader";
import {
  AnimatedPaper,
  customTheme,
  gold,
  InfoBox,
  maroon,
  SectionTitle
} from '../AppCoursePreference/styles';

// Import shared component
import DocumentHandler from "../../../components/shared/DocumentHandler";

import {
  TrackingPaper,
  StatusChip,
  UserAvatar
} from "./styled";
import {
  APPLICATION_STATUS,
  DOCUMENT_TYPES,
  getStatusIcon,
  PRIORITY_ORDER,
  getDocumentType,
  getDocumentTypeLabel
} from "./utils";
import ApplicantInfo from "./ApplicantInfo";
import CoursePreferences from "./CoursePreferences";

// API base URL - move to environment config in production
const API_BASE_URL = "http://localhost:8080/api";

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
  const [missingDocuments, setMissingDocuments] = useState([]);

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

  // Check for missing required documents
  const checkMissingDocuments = useCallback((documents) => {
    const uploadedTypes = documents.map(doc => doc.type);
    const missing = REQUIRED_DOCUMENTS.filter(
      reqDoc => !uploadedTypes.includes(reqDoc.value)
    );
    setMissingDocuments(missing);
  }, []);

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
  }, [api, checkMissingDocuments]);
  
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
    required: documents.filter(doc => 
      doc.type && doc.type !== "GENERAL" && doc.type !== "General"
    ),
    other: documents.filter(doc => 
      !doc.type || doc.type === "GENERAL" || doc.type === "General"
    )
  }), [documents]);

  // Document tab state
  const [documentTab, setDocumentTab] = useState(0);
  
  // Handle changing tabs
  const handleDocumentTabChange = (event, newValue) => {
    setDocumentTab(newValue);
  };
  
  // Document preview/download handlers
  const handlePreviewDocument = (doc) => {
    // Create a URL from the base URL and the document's path
    const previewUrl = `${API_BASE_URL}${doc.previewUrl}`;
    window.open(previewUrl, '_blank');
  };
  
  const handleDownloadDocument = (doc) => {
    // Create a URL from the base URL and the document's path
    const downloadUrl = `${API_BASE_URL}${doc.downloadUrl}`;
    window.open(downloadUrl, '_blank');
  };

  // Display loading states
  const isLoading = loading.profile || loading.courses || loading.preferences || loading.documents;

  const handleLogout = () => {
    localStorage.removeItem("applicantId");
    localStorage.removeItem("userType");
    handleSuccess("Logged out successfully!");
    navigate("/login");
  };

  return (
    <ThemeProvider theme={customTheme}>
      <MinimalLayout backgroundImage={backgroundImage}>
        <Stack alignItems="center" spacing={3} sx={{ width: "100%" }}>
          <ApplicationHeader userData={userData} />
          
          <Grow in={true} timeout={500}>
            <Box sx={{ textAlign: 'center', mb: 1 }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '25%',
                  width: '50%',
                  height: 3,
                  backgroundColor: gold.main,
                  borderRadius: 8,
                }
              }}>
                Application Tracking
              </Typography>
            </Box>
          </Grow>
          
          {isLoading ? (
            <Box sx={{ 
              display: "flex", 
              flexDirection: 'column',
              justifyContent: "center", 
              alignItems: "center",
              my: 6,
              backgroundColor: alpha('#FFFFFF', 0.9),
              p: 4,
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: 400,
            }}>
              <CircularProgress size={60} sx={{ color: maroon.main, mb: 3 }} />
              <Typography variant="h6" sx={{ color: maroon.main, fontWeight: 600 }}>
                Loading Application Data
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Please wait while we prepare your application...
              </Typography>
            </Box>
          ) : (
            <Grow in={true} timeout={800}>
              <AnimatedPaper elevation={3}>
                {/* Status Header - Using InfoBox style */}
                <InfoBox sx={{ mb: 3 }}>
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
                        <SectionTitle variant="subtitle1">Application Status</SectionTitle>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mt: 1 }}>
                          Track your application progress and view submitted information
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
                </InfoBox>
                
                <Grid container spacing={4} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  {/* Left Column with Applicant Info and Course Preferences */}
                  <Grid item md={7} xs={12} sx={{ minWidth: 0, flex: 1 }}>
                    <Stack spacing={4}>
                      {/* Personal Information - Using InfoBox style */}
                      <InfoBox>
                        <SectionTitle variant="subtitle1">Personal Information</SectionTitle>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                              Name
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {userData.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                              Email
                            </Typography>
                            <Typography variant="body1">
                              {userData.email}
                            </Typography>
                          </Grid>
                        </Grid>
                      </InfoBox>
                      
                      {/* Course Preferences - Using same style as AppCoursePreference */}
                      <Box>
                        <SectionTitle variant="subtitle1">Course Preference(s)</SectionTitle>
                        <Box sx={{
                          bgcolor: alpha('#FFFFFF', 0.7),
                          borderRadius: 2,
                          padding: 2,
                          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
                        }}>
                          <CoursePreferences
                            isLoading={false}
                            coursePreferences={coursePreferences}
                            formatPriority={formatPriority}
                            getCourseName={getCourseName}
                            maroon={maroon}
                            gold={gold}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  {/* Right Column with Documents - Using shared DocumentHandler */}
                  <Grid item md={5} xs={12} sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{
                      bgcolor: alpha('#FFFFFF', 0.7),
                      borderRadius: 2,
                      padding: 2,
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
                      height: 'fit-content'
                    }}>
                      <DocumentHandler
                        documents={documents}
                        uploadingFiles={uploadingFiles}
                        handleFileUpload={handleFileUpload}
                        handleFileChange={handleFileChange}
                        missingDocuments={missingDocuments}
                        handleMissingFileUpload={handleMissingFileUpload}
                        requiredDocuments={REQUIRED_DOCUMENTS}
                        maroon={maroon}
                        gold={gold}
                        showPreviewDownload={false}
                        showSimpleList={false}
                        apiBaseUrl={API_BASE_URL}
                        SectionTitle={SectionTitle}
                        getDocumentTypeLabel={getDocumentTypeLabel}
                        UploadButton={({ children, ...props }) => (
                          <Button
                            variant="contained"
                            sx={{
                              backgroundColor: "#222222",
                              color: "white",
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 500,
                              width: "100%",
                              justifyContent: "flex-start",
                              padding: "8px 16px",
                              marginBottom: "8px",
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              "&:hover": {
                                backgroundColor: "#000000",
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              }
                            }}
                            {...props}
                          >
                            {children}
                          </Button>
                        )}
                        documentTab={documentTab}
                        documentsByType={documentsByType}
                        handleDocumentTabChange={handleDocumentTabChange}
                        handlePreviewDocument={handlePreviewDocument}
                        handleDownloadDocument={handleDownloadDocument}
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                {applicationStatus === APPLICATION_STATUS.PENDING && (
                  <>
                    <Divider sx={{ my: 3, borderColor: alpha(maroon.main, 0.1) }} />
                    <InfoBox sx={{ 
                      bgcolor: alpha(gold.light, 0.2),
                      border: `1px solid ${alpha(gold.main, 0.3)}`,
                      textAlign: 'center'
                    }}>
                      <Typography variant="subtitle1" color={maroon.dark} gutterBottom sx={{ fontWeight: 600 }}>
                        Your Application is Under Review
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Our admissions team is currently processing your application.
                        You will receive an email notification when there's an update.
                      </Typography>
                    </InfoBox>
                  </>
                )}
              </AnimatedPaper>
            </Grow>
          )}
        </Stack>
        
        {snackbar}
      </MinimalLayout>
    </ThemeProvider>
  );
};

export default ApplicationTracking;