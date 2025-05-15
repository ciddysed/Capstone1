import React, { useState, useEffect, useCallback } from "react";
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Stack,
  List,
  ListItem,
  ListItemText,
  Modal,
  Divider,
  styled
} from "@mui/material";
import { UploadFile } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MinimalLayout from "../../templates/MinimalLayout";
import backgroundImage from "../../assets/login-bg.png";
import logo from "../../assets/logo.png";
import useResponseHandler from "../../utils/useResponseHandler";
import CourseSelectionDialog from "../../components/OrganizedCourseDialog";

// Styled components
const ApplicationPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  width: "100%",
  maxWidth: 800,
}));

const CourseButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#800000",
  color: "white",
  borderRadius: 4,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#600000",
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#800000",
  color: "white",
  borderRadius: 20,
  padding: "10px 40px",
  fontSize: 16,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#600000",
  }
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222222",
  color: "white",
  borderRadius: 4,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#000000",
  },
  width: "100%",
  justifyContent: "flex-start",
  padding: "8px 16px",
  marginBottom: "8px"
}));

// Styled components for the success modal
const SuccessModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const SuccessModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 16,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: 400,
  textAlign: "center",
}));

const TrackButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ffde00",
  color: "black",
  borderRadius: 20,
  padding: "10px 30px",
  fontSize: 16,
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#e6c800",
  }
}));

// Document type definitions with user-friendly names
const documentTypes = [
  { value: "APPLICANTS_EVALUATION_SHEET", label: "Applicant's Evaluation Sheet" },
  { value: "INFORMATIVE_COPY_OF_TOR", label: "Informative Copy of TOR" },
  { value: "PSA_AUTHENTICATED_BIRTH_CERTIFICATE", label: "PSA Birth Certificate" },
  { value: "CERTIFICATE_OF_TRANSFER_CREDENTIAL", label: "Certificate of Transfer Credential" },
  { value: "MARRIAGE_CERTIFICATE", label: "Marriage Certificate" },
  { value: "CERTIFICATE_OF_EMPLOYMENT", label: "Certificate of Employment" },
  { value: "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION", label: "Employer Certified Job Description" },
  { value: "EVIDENCE_OF_BUSINESS_OWNERSHIP", label: "Evidence of Business Ownership" }
];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { handleSuccess, handleError, snackbar } = useResponseHandler();
  const [applicantId, setApplicantId] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [files, setFiles] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  // Add state for success modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const priorityOrders = ["FIRST", "SECOND", "THIRD"];

  const fetchApplicantData = useCallback(async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/applicants/${id}`);
      setUserData({
        name: `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email,
      });
    } catch (error) {
      console.error("Error fetching applicant data:", error);
      handleError("Failed to load applicant data");
    }
  }, [handleError]);

  const fetchCoursesFromBackend = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/courses");
      const processedCourses = response.data.map((course) => {
        const name = course.courseName.toLowerCase();
        let department = "";

        if (name.includes("business") || name.includes("accounting") || name.includes("management")) {
          department = "College of Management, Business and Accountancy";
        } else if (name.includes("computer") || name.includes("information") || name.includes("technology")) {
          department = "College of Computer Studies";
        } else if (name.includes("education") || name.includes("art") || name.includes("science")) {
          department = "College of Arts, Sciences, and Education";
        } else if (name.includes("engineering") || name.includes("architecture")) {
          department = "College of Engineering & Architecture";
        } else {
          department = "Other Programs";
        }

        return {
          ...course,
          department: department,
          courseCode: course.courseCode || `CRS-${course.courseId}`, // Add course code if not present
        };
      });

      setAvailableCourses(processedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      handleError("Failed to load courses");
    }
  }, [handleError]);

  const fetchUploadedDocuments = useCallback(async (applicantId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/documents/applicant/${applicantId}`);
      const documents = response.data.map((doc) => ({
        name: doc.fileName,
        id: doc.documentId,
        downloadUrl: doc.downloadUrl,
        documentType: doc.documentType // Include document type
      }));
      setFiles(documents);
    } catch (error) {
      console.error("Error fetching uploaded documents:", error);
      handleError("Failed to load uploaded documents");
    }
  }, [handleError]);

  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      navigate("/login");
      return;
    }

    setApplicantId(storedApplicantId);

    // Fetch applicant data to set Name and Email
    fetchApplicantData(storedApplicantId);

    // Fetch course preferences using applicant ID
    fetchCoursePreferences(storedApplicantId);

    // Fetch courses from backend
    fetchCoursesFromBackend();

    // Fetch uploaded documents for the applicant
    fetchUploadedDocuments(storedApplicantId);
  }, [navigate, handleError, fetchApplicantData, fetchCoursesFromBackend, fetchUploadedDocuments]);

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
      setCoursePreferences([]);
    }
  };

  const openCourseDialog = (priorityIndex) => {
    setCurrentPriorityIndex(priorityIndex);
    setCourseDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCourseDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleDialogConfirm = async () => {
    if (!selectedCourse || currentPriorityIndex === null) {
      return;
    }

    try {
      // Create new preference
      const newPreference = {
        course: { courseId: selectedCourse.courseId },
        priorityOrder: priorityOrders[currentPriorityIndex],
      };

      const response = await axios.post(
        `http://localhost:8080/api/preferences/applicant/${applicantId}`,
        newPreference
      );

      // Update local state with the new/updated preference
      const updatedPreferences = [...coursePreferences];

      // Remove the old preference if it existed
      const filteredPreferences = updatedPreferences.filter(
        (pref) => pref.priorityOrder !== priorityOrders[currentPriorityIndex]
      );

      // Add the new preference
      filteredPreferences.push(response.data);

      setCoursePreferences(filteredPreferences);
      handleSuccess("Course preference updated!");
    } catch (error) {
      console.error("Error saving course preference:", error);
      handleError("Failed to save course preference");
    }

    setCourseDialogOpen(false);
    setSelectedCourse(null);
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];

    if (!file) {
      handleError("No file selected for upload.");
      return;
    }

    // Check file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB");
      return;
    }

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append("files", file);
    formData.append("applicantId", applicantId);
    formData.append("documentType", documentType);

    try {
      const response = await axios.post("http://localhost:8080/api/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      handleSuccess(`${getDocumentTypeLabel(documentType)} uploaded successfully!`);
      console.log("Uploaded file:", response.data);

      // Handle response
      const uploadedFile = {
        name: response.data.fileName,
        id: response.data.documentId,
        downloadUrl: response.data.downloadUrl,
        documentType: documentType
      };

      // Update the local state with the uploaded file
      setFiles((prevFiles) => [...prevFiles, uploadedFile]);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error.response && error.response.data) {
        handleError(`Failed to upload: ${error.response.data}`);
      } else {
        handleError("Failed to upload file. Please try again.");
      }
    }
  };

  // Helper function to get document type label
  const getDocumentTypeLabel = (value) => {
    const docType = documentTypes.find(type => type.value === value);
    return docType ? docType.label : value;
  };

  // Check if a document type already has a file uploaded
  const isDocumentTypeUploaded = (documentType) => {
    return files.some(file => file.documentType === documentType);
  };

  const handleSubmit = async () => {
    try {
      console.log("Applicant ID:", applicantId); // Log the applicantId for debugging

      // Check if the applicant already has an application
      try {
        const response = await axios.get(`http://localhost:8080/api/applications/applicant/${applicantId}`);
        if (response.data && response.data.length > 0) {
          // Trigger SuccessModal if an application already exists
          setSuccessModalOpen(true);
          return;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No existing application found. Proceeding to create a new application.");
        } else {
          console.error("Error checking existing application:", error);
          handleError("Failed to check existing application. Please try again.");
          return;
        }
      }

      // Create a new application for the applicant
      const newApplication = {
        status: "PENDING",
      };

      // Send the POST request to create the application
      await axios.post(`http://localhost:8080/api/applications/applicant/${applicantId}`, newApplication, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      handleSuccess("Application submitted successfully!");
      navigate("/ApplicationTrack");
    } catch (error) {
      console.error("Error submitting application:", error);
      handleError("Failed to submit application. Please try again.");
    }
  };

  const handleTrackApplication = () => {
    setSuccessModalOpen(false);
    navigate("/ApplicationTrack");
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
        
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Application
        </Typography>
        
        <ApplicationPaper elevation={3}>
          <Grid container spacing={4} sx={{ flexWrap: "nowrap" }}>
            <Grid item md={7} sx={{ minWidth: 0, flex: 1 }}>
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
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    {priorityOrders.map((priority, index) => {
                      // Find course information for this priority
                      const preference = coursePreferences.find(pref => pref.priorityOrder === priority);
                      const course = preference ? availableCourses.find(c => c.courseId === preference.course.courseId) : null;
                      
                      return (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: "flex", 
                            alignItems: "center",
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                            p: 1,
                            backgroundColor: "#f9f9f9"
                          }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              Priority {index + 1}
                            </Typography>
                            {course ? (
                              <>
                                <Typography variant="body1" fontWeight="medium">
                                  {course.courseName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {course.courseCode} · {course.department}
                                </Typography>
                                {course.majors && course.majors.length > 0 && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                    Available Majors: {course.majors.join(', ')}
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                No course selected
                              </Typography>
                            )}
                          </Box>
                          <CourseButton 
                            size="small"
                            onClick={() => openCourseDialog(index)}
                            variant={course ? "outlined" : "contained"}
                            sx={{ 
                              minWidth: 100,
                              ...(course && {
                                color: "#800000",
                                borderColor: "#800000",
                                backgroundColor: "transparent"
                              })
                            }}
                          >
                            {course ? "Change" : "Choose"}
                          </CourseButton>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item md={5} sx={{ minWidth: 0, flex: 1 }}>
              <Stack spacing={3}>
                <Typography variant="subtitle1">Required Documents</Typography>
                
                {/* Document upload buttons */}
                <Box sx={{ maxHeight: 300, overflow: "auto", border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}>
                  {documentTypes.map((docType) => {
                    // Check if a file has already been uploaded for this document type
                    const uploadedDoc = files.find(file => file.documentType === docType.value);
                    
                    return (
                      <Box key={docType.value} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="body2" fontWeight={uploadedDoc ? "bold" : "normal"}>
                            {docType.label}
                            {uploadedDoc && 
                              <Box component="span" sx={{ ml: 1, color: "success.main" }}>
                                ✓
                              </Box>
                            }
                          </Typography>
                        </Box>
                        
                        {uploadedDoc ? (
                          <Box 
                            sx={{ 
                              p: 1, 
                              bgcolor: "#f0f0f0", 
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: '#800000',
                                mr: 1 
                              }} 
                            />
                            <a 
                              href={uploadedDoc.downloadUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#800000', 
                                textDecoration: 'none',
                                fontWeight: 500,
                                flexGrow: 1
                              }}
                            >
                              {uploadedDoc.name}
                            </a>
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                              component="label"
                              sx={{ minWidth: "auto" }}
                            >
                              Change
                              <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload(e, docType.value)}
                              />
                            </Button>
                          </Box>
                        ) : (
                          <UploadButton
                            variant="contained"
                            component="label"
                            startIcon={<UploadFile />}
                            size="small"
                          >
                            Upload {docType.label}
                            <input
                              type="file"
                              hidden
                              onChange={(e) => handleFileUpload(e, docType.value)}
                            />
                          </UploadButton>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Files Uploaded ({files.length})</Typography>
                  {files.length > 0 ? (
                    <List dense sx={{ 
                      bgcolor: "#f5f5f5", 
                      borderRadius: 1,
                      border: "1px solid #e0e0e0",
                      maxHeight: 200,
                      overflow: "auto"
                    }}>
                      {files.map((file, index) => (
                        <React.Fragment key={file.id}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: '#800000',
                                      mr: 1 
                                    }} 
                                  />
                                  <a 
                                    href={file.downloadUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: '#800000', 
                                      textDecoration: 'none',
                                      fontWeight: 500
                                    }}
                                  >
                                    {file.name}
                                  </a>
                                </Box>
                              }
                              secondary={getDocumentTypeLabel(file.documentType)}
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ 
                      bgcolor: "#f5f5f5", 
                      p: 2, 
                      borderRadius: 1,
                      border: "1px dashed #cccccc",
                      textAlign: "center"
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No files uploaded yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <SubmitButton 
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </SubmitButton>
          </Box>
        </ApplicationPaper>
      </Stack>

      {/* Course Selection Dialog */}
      <CourseSelectionDialog
        open={courseDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        availableCourses={availableCourses}
        priorityIndex={currentPriorityIndex}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />
      
      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
      >
        <SuccessModalContent>
          <img src={logo} alt="Logo" style={{ height: 40, marginBottom: 16 }} />
          <Typography variant="h6" id="success-modal-title" sx={{ mb: 2 }}>
            Hi, {userData.name.split(' ')[0]}. You already submitted an application.
          </Typography>
          <Typography variant="body2" id="success-modal-description" sx={{ mb: 3 }}>
            Click here to
          </Typography>
          <TrackButton onClick={handleTrackApplication}>
            Track your Application
          </TrackButton>
        </SuccessModalContent>
      </SuccessModal>
      
      {snackbar}
    </MinimalLayout>
  );
};

export default ApplicationForm;