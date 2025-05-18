import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
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
  // Fix: get applicantId from location.state or from query param if needed
  const applicantId = location.state?.applicantId;

  const [applicant, setApplicant] = useState(null);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!applicantId) return;
    // Fetch applicant profile
    fetch(`http://localhost:8080/api/applicants/${applicantId}`)
      .then((res) => res.json())
      .then(setApplicant)
      .catch(() => setApplicant(null));

    // Fetch course preferences and set selectedCourse to the first course (if any)
    fetch(`http://localhost:8080/api/preferences/applicant/${applicantId}`)
      .then((res) => res.json())
      .then((prefs) => {
        setCoursePreferences(prefs);
        if (prefs && prefs.length > 0 && prefs[0].course) {
          setSelectedCourse(prefs[0].course);
        } else {
          setSelectedCourse(null);
        }
      })
      .catch(() => {
        setCoursePreferences([]);
        setSelectedCourse(null);
      });

    // Fetch documents with error handling for 500
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
  }, [applicantId]);

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.courseId === courseId);
    return course ? course.courseName : "-";
  };

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
