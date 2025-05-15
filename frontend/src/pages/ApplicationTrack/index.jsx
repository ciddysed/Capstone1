import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  styled,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Tooltip,
  Divider,
  Avatar,
  Modal,
  IconButton,
  Tab,
  Tabs,
  Badge
} from "@mui/material";
import {
  UploadFile,
  Description,
  Error,
  CheckCircle,
  AccessTime,
  School,
  Close,
  Visibility,
  Download,
  PictureAsPdf,
  InsertDriveFile,
  Image,
  Article
} from "@mui/icons-material";
import axios from "axios";
import MinimalLayout from "../../templates/MinimalLayout";
import backgroundImage from "../../assets/login-bg.png";
import logo from "../../assets/logo.png";
import useResponseHandler from "../../utils/useResponseHandler";

// API base URL - move to environment config in production
const API_BASE_URL = "http://localhost:8080/api";

// Constants for application statuses
const APPLICATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED"
};

// Constants for preference statuses
const PREFERENCE_STATUS = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED"
};

// Constants for priority orders
const PRIORITY_ORDER = {
  FIRST: "FIRST",
  SECOND: "SECOND",
  THIRD: "THIRD"
};

// Document types and their corresponding icons
const DOCUMENT_TYPES = {
  PDF: { icon: <PictureAsPdf sx={{ color: "#D32F2F" }} />, mimeType: "application/pdf" },
  DOCX: { icon: <Article sx={{ color: "#1565C0" }} />, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  DOC: { icon: <Article sx={{ color: "#1565C0" }} />, mimeType: "application/msword" },
  IMAGE: { icon: <Image sx={{ color: "#4CAF50" }} />, mimeType: "image/*" },
  OTHER: { icon: <InsertDriveFile sx={{ color: "#757575" }} />, mimeType: "application/octet-stream" }
};

// Styled components
const TrackingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  width: "100%",
  maxWidth: 800,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease-in-out",
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    [APPLICATION_STATUS.PENDING]: { bg: "#FFF9C4", color: "#827717" },
    [APPLICATION_STATUS.APPROVED]: { bg: "#C8E6C9", color: "#2E7D32" },
    [APPLICATION_STATUS.REJECTED]: { bg: "#FFCDD2", color: "#C62828" },
    [APPLICATION_STATUS.DRAFT]: { bg: "#E0E0E0", color: "#424242" },
    [APPLICATION_STATUS.SUBMITTED]: { bg: "#BBDEFB", color: "#1565C0" },
  };
  
  const statusColor = colors[status] || colors[APPLICATION_STATUS.PENDING];
  
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: "bold",
    borderRadius: 16,
    padding: "4px 12px",
  };
});

const PreferenceStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    [PREFERENCE_STATUS.PENDING]: { bg: "#FFF9C4", color: "#827717" },
    [PREFERENCE_STATUS.REVIEWED]: { bg: "#BBDEFB", color: "#1565C0" },
    [PREFERENCE_STATUS.ACCEPTED]: { bg: "#C8E6C9", color: "#2E7D32" },
    [PREFERENCE_STATUS.REJECTED]: { bg: "#FFCDD2", color: "#C62828" },
  };
  
  const statusColor = colors[status] || colors[PREFERENCE_STATUS.PENDING];
  
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: "bold",
    borderRadius: 16,
    fontSize: "0.75rem",
  };
});

const CourseBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: "#f5f5f5",
  marginBottom: theme.spacing(1.5),
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  }
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222222",
  color: "white",
  borderRadius: 8,
  textTransform: "none",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#000000",
  },
  "&:disabled": {
    backgroundColor: "#cccccc",
  }
}));

const DocumentItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: theme.spacing(1),
  backgroundColor: "#f9f9f9",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#f0f0f0",
    transform: "translateX(4px)",
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  backgroundColor: "#333",
  fontSize: "1rem",
}));

const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: "#fafafa",
  marginBottom: theme.spacing(2),
}));

const PreviewModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  padding: theme.spacing(3),
  position: "relative",
  maxWidth: "95%",
  maxHeight: "90vh",
  width: "auto",
  height: "auto",
  outline: "none",
  display: "flex",
  flexDirection: "column",
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PreviewContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "300px",
  backgroundColor: "#f5f5f5",
  borderRadius: 8,
}));

const DocumentBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    backgroundColor: "#2196F3",
  },
}));

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
  
  // Preview functionality
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewingDocument, setPreviewingDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [documentTab, setDocumentTab] = useState(0);

  // Get applicant initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          downloadUrl: doc.filePath,
          previewUrl: doc.filePath,
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
      
      // Switch to the documents tab if not already there
      setDocumentTab(0);
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

  // Open document preview handler
  const handlePreviewDocument = (document) => {
    setPreviewingDocument(document);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(false);
  };

  // Download document handler
  const handleDownloadDocument = (document) => {
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = document.downloadUrl;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle preview loading complete
  const handlePreviewLoaded = () => {
    setPreviewLoading(false);
  };

  // Handle preview loading error
  const handlePreviewError = () => {
    setPreviewLoading(false);
    setPreviewError(true);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewingDocument(null);
  };

  // Handle document tab change
  const handleDocumentTabChange = (event, newValue) => {
    setDocumentTab(newValue);
  };

  // Get appropriate icon for status
  const getStatusIcon = (status) => {
    switch(status) {
      case APPLICATION_STATUS.APPROVED:
      case PREFERENCE_STATUS.ACCEPTED:
        return <CheckCircle fontSize="small" sx={{ color: "#2E7D32" }} />;
      case APPLICATION_STATUS.REJECTED:
      case PREFERENCE_STATUS.REJECTED:
        return <Error fontSize="small" sx={{ color: "#C62828" }} />;
      case APPLICATION_STATUS.PENDING:
      case PREFERENCE_STATUS.PENDING:
      case PREFERENCE_STATUS.REVIEWED:
      default:
        return <AccessTime fontSize="small" sx={{ color: "#1565C0" }} />;
    }
  };

  // Group documents by type for tabs
  const documentsByType = {
    all: documents,
    required: documents.filter(doc => doc.type === 'Required' || doc.type === 'Transcript' || doc.type === 'ID'),
    other: documents.filter(doc => doc.type === 'General' || doc.type === 'Other')
  };

  // Get current documents based on tab
  const getCurrentDocuments = () => {
    switch(documentTab) {
      case 0: return documentsByType.all;
      case 1: return documentsByType.required;
      case 2: return documentsByType.other;
      default: return documentsByType.all;
    }
  };

  // Render document preview content based on file type
  const renderPreviewContent = () => {
    if (!previewingDocument) return null;
    
    if (previewLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading preview...</Typography>
        </Box>
      );
    }
    
    if (previewError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Error sx={{ fontSize: 48, color: "#C62828" }} />
          <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
            Unable to preview this document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This file type may not support in-browser preview
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<Download />}
            onClick={() => handleDownloadDocument(previewingDocument)}
            sx={{ mt: 2 }}
          >
            Download Instead
          </Button>
        </Box>
      );
    }
    
    // Handle different file types
    if (previewingDocument.fileType === 'PDF') {
      return (
        <iframe
          src={`${previewingDocument.previewUrl}#view=FitH`}
          title={previewingDocument.name}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '500px' }}
          onLoad={handlePreviewLoaded}
          onError={handlePreviewError}
        />
      );
    } else if (previewingDocument.fileType === 'IMAGE') {
      return (
        <img
          src={previewingDocument.previewUrl}
          alt={previewingDocument.name}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          onLoad={handlePreviewLoaded}
          onError={handlePreviewError}
        />
      );
    } else {
      // For doc/docx and other files that might not preview well
      setTimeout(() => handlePreviewError(), 500);
      return null;
    }
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
                <School sx={{ color: "#333" }} />
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
                  <InfoSection>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Applicant Information
                    </Typography>
                    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Name
                        </Typography>
                        <Typography variant="body1">{userData.name}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email
                        </Typography>
                        <Typography variant="body1">{userData.email}</Typography>
                      </Box>
                    </Box>
                  </InfoSection>
                  
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Course Preferences
                    </Typography>
                    
                    {isLoadingDetailData ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : coursePreferences.length > 0 ? (
                      <Stack spacing={1.5}>
                        {coursePreferences.map((pref, index) => (
                          <CourseBox key={index} sx={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center" 
                          }}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatPriority(pref.priorityOrder)}
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {getCourseName(pref.course.courseId)}
                              </Typography>
                            </Box>
                            <Tooltip title={`Status: ${pref.status}`} arrow>
                              <PreferenceStatusChip
                                label={pref.status}
                                status={pref.status}
                                icon={getStatusIcon(pref.status)}
                                size="small"
                              />
                            </Tooltip>
                          </CourseBox>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No course preferences found
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Application Documents
                    </Typography>
                    <DocumentBadge badgeContent={documents.length} color="primary" showZero>
                      <Description sx={{ color: "#555" }} />
                    </DocumentBadge>
                  </Box>
                  
                  <Tabs 
                    value={documentTab} 
                    onChange={handleDocumentTabChange}
                    variant="fullWidth"
                    sx={{ 
                      minHeight: '36px',
                      '& .MuiTabs-indicator': { height: 3 },
                      '& .MuiTab-root': { minHeight: '36px', py: 0.5 }
                    }}
                  >
                    <Tab label={`All (${documentsByType.all.length})`} />
                    <Tab label={`Required (${documentsByType.required.length})`} />
                    <Tab label={`Other (${documentsByType.other.length})`} />
                  </Tabs>
                  
                  {isLoadingDetailData ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : getCurrentDocuments().length > 0 ? (
                    <List sx={{ 
                      bgcolor: "#f8f8f8", 
                      borderRadius: 2,
                      p: 1,
                      maxHeight: "300px",
                      overflowY: "auto"
                    }}>
                      {getCurrentDocuments().map((doc, index) => (
                        <DocumentItem 
                          key={index}
                          sx={{ mb: 0.5 }}
                        >
                          <ListItemIcon>
                            {doc.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={doc.name}
                            secondary={
                              <>
                                <Typography variant="caption" component="span">
                                  Uploaded: {doc.uploadDate}
                                </Typography>
                                {doc.type !== "General" && (
                                  <Chip 
                                    label={doc.type} 
                                    size="small" 
                                    sx={{ ml: 1, height: 18, fontSize: '0.6rem' }}
                                  />
                                )}
                              </>
                            }
                            primaryTypographyProps={{
                              style: { fontWeight: 500, fontSize: '0.9rem' }
                            }}
                          />
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Preview Document">
                              <IconButton 
                                size="small" 
                                onClick={() => handlePreviewDocument(doc)}
                                sx={{ color: '#1976d2' }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Document">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </DocumentItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ 
                      bgcolor: "#f8f8f8", 
                      borderRadius: 2, 
                      p: 3,
                      textAlign: "center" 
                    }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        No documents {documentTab > 0 ? "in this category" : "uploaded yet"}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {documents.length > 0 ? "Upload Additional Documents" : "Upload Required Documents"}
                    </Typography>
                    <UploadButton
                      variant="contained"
                      component="label"
                      startIcon={uploadingFiles ? <CircularProgress size={16} color="inherit" /> : <UploadFile />}
                      size="medium"
                      disabled={uploadingFiles}
                    >
                      {uploadingFiles ? "Uploading..." : "Upload Files"}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        aria-label="Upload application documents"
                      />
                    </UploadButton>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Accepted formats: PDF, Word, JPEG, PNG
                    </Typography>
                  </Box>
                </Stack>
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
      
      {/* Document Preview Modal */}
      <PreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        aria-labelledby="document-preview-modal"
      >
        <PreviewContainer>
          <PreviewHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {previewingDocument?.icon}
              <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                {previewingDocument?.name}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Download">
                <IconButton onClick={() => previewingDocument && handleDownloadDocument(previewingDocument)} size="small">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton onClick={handleClosePreview} size="small">
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </PreviewHeader>
          
          <PreviewContent>
            {renderPreviewContent()}
          </PreviewContent>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="text.secondary">
              Uploaded: {previewingDocument?.uploadDate}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Document type: {previewingDocument?.type}
            </Typography>
          </Box>
        </PreviewContainer>
      </PreviewModal>
      
      {snackbar}
    </MinimalLayout>
  );
};

export default ApplicationTracking;