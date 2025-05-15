import React, { useState, useEffect } from "react";
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
  Chip
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import axios from "axios";
import MinimalLayout from "../../templates/MinimalLayout";
import backgroundImage from "../../assets/login-bg.png";
import logo from "../../assets/logo.png";
import useResponseHandler from "../../utils/useResponseHandler";

// Styled components
const TrackingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  width: "100%",
  maxWidth: 800,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    PENDING: { bg: "#FFF9C4", color: "#827717" },
    APPROVED: { bg: "#C8E6C9", color: "#2E7D32" },
    REJECTED: { bg: "#FFCDD2", color: "#C62828" },
    DRAFT: { bg: "#E0E0E0", color: "#424242" },
    SUBMITTED: { bg: "#BBDEFB", color: "#1565C0" },
  };
  
  const statusColor = colors[status] || colors.PENDING;
  
  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: "bold",
    borderRadius: 16,
  };
});

const CourseBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: 8,
  backgroundColor: "#f5f5f5",
  marginBottom: theme.spacing(1),
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222222",
  color: "white",
  borderRadius: 4,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#000000",
  }
}));

const ApplicationTracking = () => {
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [applicantId, setApplicantId] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [applicationStatus, setApplicationStatus] = useState("PENDING");
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      return;
    }

    setApplicantId(storedApplicantId);

    // Fetch applicant data and preferences
    fetchApplicantData(storedApplicantId);

    // Fetch available courses
    fetchCourses();
  }, [handleError]);

  const fetchApplicantData = async (id) => {
    try {
      // Fetch applicant profile
      const profileResponse = await axios.get(`http://localhost:8080/api/applicants/${id}`);
      
      // Set user data
      setUserData({
        name: `${profileResponse.data.firstName} ${profileResponse.data.middleInitial ? profileResponse.data.middleInitial + '.' : ''} ${profileResponse.data.lastName}`,
        email: profileResponse.data.email
      });
      
      // Check if applicant already has an application
      const applicationsResponse = await axios.get(`http://localhost:8080/api/applications/applicant/${id}`);
      
      if (applicationsResponse.data && applicationsResponse.data.length > 0) {
        const appId = applicationsResponse.data[0].applicationId;
        setApplicationId(appId);
        setApplicationStatus(applicationsResponse.data[0].status);
        
        // Fetch course preferences for this application
        fetchCoursePreferences(id);
        
        // Fetch documents for this applicant
        fetchDocuments(id);
      } else {
        handleError("No application found");
      }
    } catch (error) {
      console.error("Error fetching applicant data:", error);
      handleError("Failed to load applicant data");
    }
  };

  const fetchDocuments = async (applicantId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/documents/applicant/${applicantId}`);
      const documents = response.data.map((doc) => ({
        id: doc.documentId,
        name: doc.fileName,
        downloadUrl: doc.filePath, // Assuming filePath is the download URL
      }));
      setDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      handleError("Failed to load documents");
    }
  };
  
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/courses");
      setAvailableCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      handleError("Failed to load available courses");
    }
  };
 
  const fetchCoursePreferences = async (applicantId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/preferences/applicant/${applicantId}`);
      
      // Sort preferences by priority
      const priorityOrder = { "FIRST": 1, "SECOND": 2, "THIRD": 3 };
      const sortedPrefs = [...response.data].sort((a, b) => 
        priorityOrder[a.priorityOrder] - priorityOrder[b.priorityOrder]
      );
      
      setCoursePreferences(sortedPrefs);
    } catch (error) {
      console.error("Error fetching course preferences:", error);
      setCoursePreferences([]); // Ensure state is cleared only on error
    }
  };

  const handleFileUpload = async (event) => {
    const fileList = Array.from(event.target.files);

    // Prepare form data for file upload
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("applicantId", applicantId);
    formData.append("documentType", "General"); // Example document type

    try {
      const response = await axios.post("http://localhost:8080/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess("Files uploaded successfully!");
      console.log("Uploaded files:", response.data);

      // Fetch updated documents after upload
      fetchDocuments(applicantId);
    } catch (error) {
      console.error("Error uploading files:", error);
      handleError("Failed to upload files");
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
      "FIRST": "Course 1",
      "SECOND": "Course 2",
      "THIRD": "Course 3"
    };
    return formats[priority] || priority;
  };

  return (
    <MinimalLayout backgroundImage={backgroundImage}>
      <Stack alignItems="center" spacing={2} sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 800 }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {userData.email}
            </Typography>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#333" }} />
          </Box>
        </Box>
        
        <TrackingPaper elevation={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Application Tracking
            </Typography>
            <StatusChip 
              label={applicationStatus} 
              status={applicationStatus}
            />
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Name:</Typography>
                  <Typography variant="body1">{userData.name}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Email:</Typography>
                  <Typography variant="body1">{userData.email}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Course Preference(s):</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {coursePreferences.map((pref, index) => (
                      <CourseBox key={index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatPriority(pref.priorityOrder)}
                          </Typography>
                          <Typography variant="body1">
                            {getCourseName(pref.course.courseId)}
                          </Typography>
                        </Box>
                        <Chip
                          label={pref.status}
                          sx={{
                            backgroundColor: pref.status === "PENDING" ? "#FFF9C4" :
                                             pref.status === "REVIEWED" ? "#BBDEFB" :
                                             pref.status === "ACCEPTED" ? "#C8E6C9" :
                                             pref.status === "REJECTED" ? "#FFCDD2" : "#E0E0E0",
                            color: pref.status === "PENDING" ? "#827717" :
                                   pref.status === "REVIEWED" ? "#1565C0" :
                                   pref.status === "ACCEPTED" ? "#2E7D32" :
                                   pref.status === "REJECTED" ? "#C62828" : "#424242",
                            fontWeight: "bold",
                            borderRadius: 16,
                          }}
                        />
                      </CourseBox>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Typography variant="subtitle1">Uploaded Documents</Typography>
                
                {documents.length > 0 ? (
                  <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    {documents.map((doc, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={doc.name} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No documents uploaded yet
                  </Typography>
                )}
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Missing Files?
                  </Typography>
                  <UploadButton
                    variant="contained"
                    component="label"
                    startIcon={<UploadFile />}
                    size="small"
                  >
                    Upload Files
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      multiple
                    />
                  </UploadButton>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </TrackingPaper>
      </Stack>
      
      {snackbar}
    </MinimalLayout>
  );
};

export default ApplicationTracking;