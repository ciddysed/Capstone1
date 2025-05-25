import React, { useState, useEffect, useCallback } from "react";
import { 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Stack,
  Paper,
  CircularProgress,
  createTheme,
  ThemeProvider,
  alpha,
  Divider,
  Grow
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MinimalLayout from "../../../templates/MinimalLayout";
import backgroundImage from "../../../assets/login-bg.png";
import logo from "../../../assets/logo.png";
import useResponseHandler from "../../../utils/useResponseHandler";

// Import components
import CourseSelectionDialog from "../../../components/OrganizedCourseDialog";
import ApplicationHeader from "./components/ApplicationHeader";
import CoursePreferences from "./components/CoursePreferences";
import DocumentUpload from "./components/DocumentUpload";
import DocumentList from "./components/DocumentList";
import SuccessModal from "./components/SuccessModal";

// Import styled components and theme
import { 
  AnimatedPaper,
  SubmitButton,
  maroon,
  gold,
  SectionTitle,
  InfoBox,
  customTheme
} from './styles';

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
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const priorityOrders = ["FIRST", "SECOND", "THIRD"];

  // Get priority label with ordinal suffix
  const getPriorityLabel = (index) => {
    return `${index + 1}${getOrdinalSuffix(index + 1)} Choice`;
  };

  // Helper function for ordinal suffixes
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
        let department = "";
        // Assign department based on course.department?.departmentId
        const deptId = course.department?.departmentId;
        if (deptId === 1) {
          department = "College of Computer Studies";
        } else if (deptId === 2) {
          department = "College of Arts, Sciences, and Education";
        } else if (deptId === 3) {
          department = "College of Management, Business and Accountancy";
        } else if (deptId === 4) {
          department = "College of Engineering and Architecture";
        } else {
          department = "Other Programs";
        }

        // Log if description is present
        if (course.description) {
          console.log(`Course "${course.courseName}" has description: "${course.description}"`);
        } else {
          console.log(`Course "${course.courseName}" has NO description.`);
        }

        // Add displayName as a string with courseName and description
        const displayName = course.description;

        return {
          ...course,
          department: department,
          courseCode: course.courseCode || displayName,
         // displayName: displayName,
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
        documentType: doc.documentType
      }));
      setFiles(documents);
    } catch (error) {
      console.error("Error fetching uploaded documents:", error);
      handleError("Failed to load uploaded documents");
    }
  }, [handleError]);

  useEffect(() => {
    setLoading(true);
    const storedApplicantId = localStorage.getItem("applicantId");

    if (!storedApplicantId) {
      handleError("Please login to continue");
      navigate("/login");
      return;
    }

    setApplicantId(storedApplicantId);

    // Fetch all required data in parallel
    Promise.all([
      fetchApplicantData(storedApplicantId),
      fetchCoursesFromBackend(),
      fetchUploadedDocuments(storedApplicantId),
      fetchCoursePreferences(storedApplicantId)
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error("Error loading application data:", error);
      handleError("Some data could not be loaded. Please refresh the page.");
      setLoading(false);
    });
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

    // Find if a preference for this priority already exists
    const existingPreference = coursePreferences.find(
      (pref) => pref.priorityOrder === priorityOrders[currentPriorityIndex]
    );

    try {
      if (existingPreference) {
        // Update (PUT) the existing preference
        const updatedPreference = {
          preferenceId: existingPreference.preferenceId,
          applicant: { applicantId: applicantId },
          course: { courseId: selectedCourse.courseId },
          priorityOrder: priorityOrders[currentPriorityIndex],
          status: existingPreference.status || "PENDING"
        };

        const response = await axios.put(
          `http://localhost:8080/api/preferences/${existingPreference.preferenceId}`,
          updatedPreference
        );

        // Replace the updated preference in the list
        const updatedPreferences = coursePreferences.map((pref) =>
          pref.preferenceId === existingPreference.preferenceId ? response.data : pref
        );
        setCoursePreferences(updatedPreferences);
        handleSuccess("Course preference updated!");
      } else {
        // Create (POST) a new preference
        const newPreference = {
          course: { courseId: selectedCourse.courseId },
          priorityOrder: priorityOrders[currentPriorityIndex],
        };

        const response = await axios.post(
          `http://localhost:8080/api/preferences/applicant/${applicantId}`,
          newPreference
        );

        const updatedPreferences = [...coursePreferences];
        const filteredPreferences = updatedPreferences.filter(
          (pref) => pref.priorityOrder !== priorityOrders[currentPriorityIndex]
        );
        filteredPreferences.push(response.data);

        setCoursePreferences(filteredPreferences);
        handleSuccess("Course preference added!");
      }
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

    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB");
      return;
    }

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
      
      const uploadedFile = {
        name: response.data.fileName,
        id: response.data.documentId,
        downloadUrl: response.data.downloadUrl,
        documentType: documentType
      };

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

  const handleSubmit = async () => {
    // Check if "INFORMATIVE_COPY_OF_TOR" is uploaded
    const hasTOR = files.some(file => file.documentType === "INFORMATIVE_COPY_OF_TOR");
    if (!hasTOR) {
      handleError('You must upload the "Informative Copy of TOR" before submitting your application.');
      return;
    }

    try {
      setSubmitting(true);
      
      try {
        const response = await axios.get(`http://localhost:8080/api/applications/applicant/${applicantId}`);
        if (response.data && response.data.length > 0) {
          setSuccessModalOpen(true);
          setSubmitting(false);
          return;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No existing application found. Proceeding to create a new application.");
        } else {
          console.error("Error checking existing application:", error);
          handleError("Failed to check existing application. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      const newApplication = {
        status: "PENDING",
      };

      await axios.post(`http://localhost:8080/api/applications/applicant/${applicantId}`, newApplication, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      handleSuccess("Application submitted successfully!");
      setSubmitting(false);
      navigate("/ApplicationTrack");
    } catch (error) {
      console.error("Error submitting application:", error);
      handleError("Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  };

  const handleTrackApplication = () => {
    setSuccessModalOpen(false);
    navigate("/ApplicationTrack");
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
                Application Form
              </Typography>
            </Box>
          </Grow>
          
          {loading ? (
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
                <Grid container spacing={4} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  <Grid item md={7} xs={12} sx={{ minWidth: 0, flex: 1 }}>
                    <Stack spacing={4}>
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
                      
                      <CoursePreferences 
                        priorityOrders={priorityOrders}
                        coursePreferences={coursePreferences}
                        availableCourses={availableCourses}
                        openCourseDialog={openCourseDialog}
                        getPriorityLabel={getPriorityLabel}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item md={5} xs={12} sx={{ minWidth: 0, flex: 1 }}>
                    <Stack spacing={4}>
                      <DocumentUpload 
                        documentTypes={documentTypes}
                        files={files}
                        handleFileUpload={handleFileUpload}
                        getDocumentTypeLabel={getDocumentTypeLabel}
                      />
                      
                      <DocumentList 
                        files={files}
                        getDocumentTypeLabel={getDocumentTypeLabel}
                      />
                    </Stack>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3, borderColor: alpha(maroon.main, 0.1) }} />
                
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <SubmitButton 
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting && <CircularProgress size={20} color="inherit" />}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </SubmitButton>
                </Box>
              </AnimatedPaper>
            </Grow>
          )}
        </Stack>

        <CourseSelectionDialog
          open={courseDialogOpen}
          onClose={handleDialogClose}
          onConfirm={handleDialogConfirm}
          availableCourses={availableCourses}
          priorityIndex={currentPriorityIndex}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />
        
        <SuccessModal
          open={successModalOpen}
          userData={userData}
          handleTrackApplication={handleTrackApplication}
        />
        
        {snackbar}
      </MinimalLayout>
    </ThemeProvider>
  );
};

export default ApplicationForm;