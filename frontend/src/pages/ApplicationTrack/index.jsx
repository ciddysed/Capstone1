import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Tooltip,
  Divider
} from "@mui/material";
import { Description } from "@mui/icons-material";
import axios from "axios";
import MinimalLayout from "../../templates/MinimalLayout";
import backgroundImage from "../../assets/login-bg.png";
import logo from "../../assets/logo.png";
import useResponseHandler from "../../utils/useResponseHandler";
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
import DocumentHandler from "./DocumentHandler"; // Import our new consolidated component

// API base URL - move to environment config in production
const API_BASE_URL = "http://localhost:8080/api";

// Main component
const ApplicationTracking = () => {
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [applicantId, setApplicantId] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
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

  // Create axios instance with common configurations
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add interceptors for error handling
  api.interceptors.response.use(
    response => response,
    error => {
      console.error("API Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while communicating with the server";
      handleError(errorMessage);
      return Promise.reject(error);
    }
  );

  // Get applicant initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchApplicantData = useCallback(async (id) => {
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
        const appId = applicationsResponse.data[0].applicationId;
        setApplicationId(appId);
        setApplicationStatus(applicationsResponse.data[0].status);
      } else {
        handleError("No application found");
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [handleError]);

  // Helper to determine document type from filename
  const getDocumentType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (extension === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(extension)) return extension === 'doc' ? 'DOC' : 'DOCX';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return 'IMAGE';
    return 'OTHER';
  };

  const fetchDocuments = useCallback(async (applicantId) => {
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
  }, []);
  
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
  }, []);
 
  const fetchCoursePreferences = useCallback(async (applicantId) => {
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
  }, []);

  // Initialize application data
  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      return;
    }

    setApplicantId(storedApplicantId);

    // Fetch all necessary data
    fetchApplicantData(storedApplicantId);
    fetchCourses();
  }, [fetchApplicantData, fetchCourses, handleError]);

  // Fetch related data after application ID is set
  useEffect(() => {
    if (applicantId) {
      fetchCoursePreferences(applicantId);
      fetchDocuments(applicantId);
    }
  }, [applicantId, fetchCoursePreferences, fetchDocuments]);

  const handleFileUpload = async (event) => {
    const fileList = Array.from(event.target.files);
    
    if (fileList.length === 0) return;

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
  const getCourseName = (courseId) => {
    const course = availableCourses.find(c => c.courseId === courseId);
    return course ? course.courseName : "Course not found";
  };

  // Convert priority order to readable format
  const formatPriority = (priority) => {
    const formats = {
      [PRIORITY_ORDER.FIRST]: "Course 1",
      [PRIORITY_ORDER.SECOND]: "Course 2",
      [PRIORITY_ORDER.THIRD]: "Course 3"
    };
    return formats[priority] || priority;
  };

  // Group documents by type for tabs
  const documentsByType = {
    all: documents,
    required: documents.filter(doc => doc.type === 'Required' || doc.type === 'Transcript' || doc.type === 'ID'),
    other: documents.filter(doc => doc.type === 'General' || doc.type === 'Other')
  };

  // Display loading states
  const isLoadingInitialData = loading.profile || loading.courses;
  const isLoadingDetailData = loading.preferences || loading.documents;

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={3} sx={{ width: "100%" }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          width: "100%", 
          maxWidth: 800 
        }}>
          <img src={logo} alt="University Logo" style={{ height: 48 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {userData.email}
              </Typography>
              <UserAvatar alt={userData.name}>
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
            minHeight: "300px" 
          }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading application data...
            </Typography>
          </Box>
        ) : (
          <TrackingPaper elevation={3}>
            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 3,
              flexWrap: "wrap",
              gap: 2 
            }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Description sx={{ color: "#333" }} />
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  Application Tracking
                </Typography>
              </Stack>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title={`Application Status: ${applicationStatus}`} arrow placement="top">
                  <StatusChip 
                    label={applicationStatus} 
                    status={applicationStatus}
                    icon={getStatusIcon(applicationStatus)}
                  />
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Stack spacing={3}>
                  <ApplicantInfo userData={userData} />
                  <CoursePreferences
                    isLoading={isLoadingDetailData}
                    coursePreferences={coursePreferences}
                    formatPriority={formatPriority}
                    getCourseName={getCourseName}
                  />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={5}>
                {/* Using the new consolidated DocumentHandler component */}
                <DocumentHandler
                  isLoading={isLoadingDetailData}
                  documents={documents}
                  documentsByType={documentsByType}
                  apiBaseUrl={API_BASE_URL}
                  uploadingFiles={uploadingFiles}
                  handleFileUpload={handleFileUpload}
                />
              </Grid>
            </Grid>
            
            {applicationStatus === APPLICATION_STATUS.PENDING && (
              <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #eeeeee" }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Your application is currently under review. You will receive an email when there's an update.
                </Typography>
              </Box>
            )}
          </TrackingPaper>
        )}
      </Stack>
      
      {/* The document preview modal is now handled within the DocumentHandler component */}
      {snackbar}
    </MinimalLayout>
  );
};

export default ApplicationTracking;