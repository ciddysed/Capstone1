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
import { useNavigate, useLocation } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout";

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
    // Defensive: check for fileName or name before calling toLowerCase
    const fileName = doc.fileName || doc.name || "";
    setPreviewType(typeof fileName === "string" ? fileName.toLowerCase() : "");
    setPreviewFileName(fileName);
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
              {documents.length > 0 ? (
                documents.map((doc, idx) => (
                  <ListItem key={idx}
                    secondaryAction={
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
                    }
                  >
                    <ListItemText primary={doc.fileName || doc.name} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No documents uploaded yet." />
                </ListItem>
              )}
            </List>
          </Paper>
        </Stack>
      </Stack>

      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview: {previewFileName}
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: 400 }}>
          {previewType.endsWith(".pdf") ? (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
              style={{ border: "none" }}
            />
          ) : previewType.endsWith(".jpg") ||
            previewType.endsWith(".jpeg") ||
            previewType.endsWith(".png") ||
            previewType.endsWith(".gif") ? (
            <img
              src={previewUrl}
              alt="Document Preview"
              style={{ maxWidth: "100%", maxHeight: 500, display: "block", margin: "0 auto" }}
            />
          ) : (
            <Typography>
              Preview not available for this file type.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
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
