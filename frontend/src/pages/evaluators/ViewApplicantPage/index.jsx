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
  Chip, // Added missing import
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Added missing import
import { useNavigate, useLocation } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout";

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

  return (
    <ListLayout>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/evaluator/applicants")}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography fontWeight={600}>View Details</Typography>
      </Box>

      {/* Admin Forwarding Information */}
      {checkForwardStatus() && (
        <Paper elevation={4} sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0', borderLeft: '4px solid #1976d2' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Forwarded for Evaluation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {adminInfo ? (
                  `Forwarded by ${adminInfo.firstName} ${adminInfo.lastName}`
                ) : (
                  'Forwarded by a program administrator'
                )}
                {forwardedAt && (
                  ` on ${new Date(forwardedAt).toLocaleString()}`
                )}
              </Typography>
            </Box>
            <Chip 
              label="Ready for Evaluation" 
              color="primary" 
              variant="outlined" 
              size="small"
              icon={<CheckCircleIcon fontSize="small" />} 
            />
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }}>
        {/* Left: Applicant Profile */}
        <Paper elevation={4} sx={{ flex: 1, p: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Applicant Profile
          </Typography>
          <Stack spacing={1}>
            <DetailRow
              label="Name"
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
            <DetailRow label="Email" value={applicant?.email || "-"} />
            <DetailRow label="Address" value={applicant?.address || "-"} />
            <DetailRow
              label="Date of Birth"
              value={
                applicant?.dateOfBirth
                  ? new Date(applicant.dateOfBirth).toLocaleDateString()
                  : "-"
              }
            />
            <DetailRow label="Gender" value={applicant?.gender || "-"} />
          </Stack>
        </Paper>

        {/* Right: Applied For and Uploaded Documents */}
        <Stack flex={1} spacing={2}>
          {/* Applied For Paper */}
          <Paper elevation={4} sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
            >
              Applied for
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {selectedCourse ? selectedCourse.courseName : "-"}
            </Typography>
          </Paper>
          {/* Uploaded Documents Paper */}
          <Paper elevation={4} sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
            >
              Uploaded Documents
            </Typography>
            <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}>
              {DOCUMENT_TYPE_LABELS.map((docType) => {
                const doc = documents.find((d) => d.documentType === docType);
                return (
                  <ListItem key={docType}
                    secondaryAction={
                      doc ? (
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            edge="end"
                            aria-label="preview"
                            onClick={() => handlePreview(doc)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="download"
                            onClick={() => handleDownload(doc.documentId)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Stack>
                      ) : null
                    }
                  >
                    {/* Show documentType on the left */}
                    <Box sx={{ minWidth: 120, mr: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDocumentType(docType)}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={doc ? (doc.fileName || doc.name) : <span style={{ color: "#aaa" }}>Not uploaded</span>}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Stack>
      </Stack>

      {/* Evaluation Section */}
      <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
        >
          Evaluation Form {currentEvaluation && `- Evaluation #${currentEvaluation.evaluationId}`}
        </Typography>

        {applicant && !checkForwardStatus() && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => navigate("/evaluator/applicants")}>
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
            sx={{ mb: 2 }}
            onClose={() => setSubmissionMessage({ type: "", text: "" })}
          >
            {submissionMessage.text}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Course Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Course to Evaluate</InputLabel>
            <Select
              value={selectedCourse?.courseId || ""}
              onChange={handleCourseChange}
              label="Select Course to Evaluate"
              disabled={Boolean(currentEvaluation || evaluationId)} // Disable if viewing specific evaluation
            >
              {getAvailableCoursesForEvaluation().map((course) => (
                <MenuItem key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Evaluation Status */}
          <FormControl fullWidth>
            <InputLabel>Evaluation Status</InputLabel>
            <Select
              value={evaluationStatus}
              onChange={(e) => setEvaluationStatus(e.target.value)}
              label="Evaluation Status"
              disabled={!selectedCourse || submitting || !checkForwardStatus()}
            >
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
            </Select>
          </FormControl>

          {/* Remarks */}
          <TextField
            label="Remarks"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            fullWidth
            variant="outlined"
            disabled={!selectedCourse || submitting || !checkForwardStatus()}
          />

          {/* Submit Button - change wording based on context */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitEvaluation}
              disabled={!selectedCourse || !evaluationStatus || submitting || !checkForwardStatus()}
              sx={{ borderRadius: "20px", bgcolor: "#800000" }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : existingEvaluation || currentEvaluation ? (
                "Update Evaluation"
              ) : (
                "Submit Evaluation"
              )}
            </Button>
          </Box>
          
          {/* Evaluation History */}
          {existingEvaluation && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Evaluation History
              </Typography>
              <DetailRow label="Status" value={existingEvaluation.evaluationStatus} />
              <DetailRow 
                label="Date" 
                value={existingEvaluation.dateEvaluated ? 
                  new Date(existingEvaluation.dateEvaluated).toLocaleString() : 
                  "-"} 
              />
            </Box>
          )}
        </Stack>
      </Paper>
      
      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen
        // Remove maxWidth/fullWidth for fullscreen
      >
        <DialogTitle>
          Preview: {previewFileName}
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
            <IconButton
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
              disabled={zoom <= 0.2}
              size="large"
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: "center" }}>
              {Math.round(zoom * 100)}%
            </Typography>
            <IconButton
              onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
              disabled={zoom >= 5}
              size="large"
            >
              <ZoomInIcon />
            </IconButton>
          </Stack>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              flex: 1,
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
                  }}
                />
              </Box>
            ) : (
              <Typography>
                Preview not available for this file type.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} size="large">Close</Button>
        </DialogActions>
      </Dialog>
    </ListLayout>
  );
};

const DetailRow = ({ label, value }) => (
  <Stack direction="row" spacing={1}>
    <Typography fontWeight={500} width={120}>
      {label}:
    </Typography>
    <Typography>{value}</Typography>
  </Stack>
);

export default ViewApplicantPage;
