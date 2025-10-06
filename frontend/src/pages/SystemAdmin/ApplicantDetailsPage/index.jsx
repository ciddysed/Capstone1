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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import SendIcon from "@mui/icons-material/Send";
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
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const ApplicantDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const applicantId = location.state?.applicantId;

  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  
  // Application status management
  const [applicationStatus, setApplicationStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  
  // Forwarding to evaluator
  const [evaluators, setEvaluators] = useState([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState("");
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [forwardMessage, setForwardMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!applicantId) return;
    
    // Fetch applicant profile
    fetch(`http://localhost:8080/api/applicants/${applicantId}`)
      .then((res) => res.json())
      .then((data) => {
        setApplicant(data);
        setApplicationStatus(data.applicationStatus || "PENDING");
        setStatusRemarks(data.statusRemarks || "");
      })
      .catch(() => setApplicant(null));

    // Fetch course preferences
    fetch(`http://localhost:8080/api/preferences/applicant/${applicantId}`)
      .then((res) => res.json())
      .then(setCoursePreferences)
      .catch(() => setCoursePreferences([]));

    // Fetch documents
    fetch(`http://localhost:8080/api/documents/applicant/${applicantId}`)
      .then(async (res) => {
        if (!res.ok) return [];
        try {
          return await res.json();
        } catch {
          return [];
        }
      })
      .then(setDocuments)
      .catch(() => setDocuments([]));
      
    // Fetch evaluators
    fetch(`http://localhost:8080/api/evaluators/active`)
      .then((res) => res.json())
      .then(setEvaluators)
      .catch(() => setEvaluators([]));
  }, [applicantId]);

  // Update application status
  const updateApplicationStatus = async () => {
    if (!applicationStatus) {
      setStatusMessage({ 
        type: "error", 
        text: "Please select an application status" 
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "", text: "" });

    try {
      const statusData = {
        applicationStatus,
        statusRemarks,
        statusUpdatedAt: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:8080/api/applicants/${applicantId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusData),
      });

      if (response.ok) {
        const updatedApplicant = await response.json();
        setApplicant(updatedApplicant);
        setStatusMessage({ 
          type: "success", 
          text: "Application status updated successfully" 
        });
      } else {
        setStatusMessage({ 
          type: "error", 
          text: "Failed to update application status" 
        });
      }
    } catch (error) {
      setStatusMessage({ 
        type: "error", 
        text: "An error occurred while updating status" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open forward dialog
  const openForwardDialog = () => {
    if (applicationStatus !== "APPROVED") {
      setStatusMessage({
        type: "error",
        text: "Only approved applications can be forwarded to evaluators"
      });
      return;
    }
    
    // Make sure we have evaluators
    if (evaluators.length === 0) {
      setStatusMessage({
        type: "error",
        text: "No active evaluators found to forward this application to"
      });
      return;
    }
    
    setForwardDialogOpen(true);
  };

  // Forward application to evaluator
  const forwardToEvaluator = async () => {
    if (!selectedEvaluator) {
      setForwardMessage({
        type: "error",
        text: "Please select an evaluator"
      });
      return;
    }

    setForwarding(true);
    setForwardMessage({ type: "", text: "" });

    try {
      const forwardData = {
        applicantId,
        evaluatorId: selectedEvaluator,
        forwardedAt: new Date().toISOString(),
        forwardedForEvaluation: true
      };

      const response = await fetch(`http://localhost:8080/api/applicants/${applicantId}/forward`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forwardData),
      });

      if (response.ok) {
        const updatedApplicant = await response.json();
        setApplicant(updatedApplicant);
        setForwardMessage({ 
          type: "success", 
          text: "Application forwarded to evaluator successfully" 
        });
        
        // Close dialog after a short delay
        setTimeout(() => {
          setForwardDialogOpen(false);
          // Update the main status message as well
          setStatusMessage({
            type: "success",
            text: "Application forwarded to evaluator successfully"
          });
        }, 1500);
      } else {
        setForwardMessage({ 
          type: "error", 
          text: "Failed to forward application" 
        });
      }
    } catch (error) {
      setForwardMessage({ 
        type: "error", 
        text: "An error occurred while forwarding application" 
      });
    } finally {
      setForwarding(false);
    }
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
          onClick={() => navigate("/admin/applicants")}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography fontWeight={600}>Applicant Details</Typography>
      </Box>

      {/* Status and Actions Bar */}
      <Paper elevation={4} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle2">Status:</Typography>
          <Chip 
            label={applicant?.applicationStatus || "PENDING"} 
            color={
              applicant?.applicationStatus === "APPROVED" ? "success" :
              applicant?.applicationStatus === "REJECTED" ? "error" :
              "default"
            }
            variant="outlined"
          />
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SendIcon />}
            onClick={openForwardDialog}
            disabled={applicationStatus !== "APPROVED" || applicant?.forwardedForEvaluation}
            sx={{ borderRadius: "20px", ml: 1 }}
          >
            Forward to Evaluator
          </Button>
        </Box>
      </Paper>

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

        {/* Right: Course Preferences and Uploaded Documents */}
        <Stack flex={1} spacing={2}>
          {/* Course Preferences */}
          <Paper elevation={4} sx={{ p: 3 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
            >
              Course Preferences
            </Typography>
            <List dense sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}>
              {coursePreferences.length > 0 ? (
                coursePreferences.map((pref, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${idx + 1}. ${pref.course?.courseName || "-"}`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No course preferences found" />
                </ListItem>
              )}
            </List>
          </Paper>

          {/* Uploaded Documents */}
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

      {/* Application Status Update */}
      <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
        >
          Update Application Status
        </Typography>

        {statusMessage.text && (
          <Alert 
            severity={statusMessage.type} 
            sx={{ mb: 2 }}
            onClose={() => setStatusMessage({ type: "", text: "" })}
          >
            {statusMessage.text}
          </Alert>
        )}

        {applicant?.forwardedForEvaluation && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
          >
            This application has been forwarded to an evaluator for review.
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Application Status</InputLabel>
            <Select
              value={applicationStatus}
              onChange={(e) => setApplicationStatus(e.target.value)}
              label="Application Status"
              disabled={submitting || applicant?.forwardedForEvaluation}
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="INCOMPLETE">Incomplete</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Remarks"
            multiline
            rows={3}
            value={statusRemarks}
            onChange={(e) => setStatusRemarks(e.target.value)}
            fullWidth
            disabled={submitting || applicant?.forwardedForEvaluation}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={updateApplicationStatus}
              disabled={submitting || !applicationStatus || applicant?.forwardedForEvaluation}
              sx={{ borderRadius: "20px", bgcolor: "#800000" }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Status"
              )}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Forward to Evaluator Dialog */}
      <Dialog 
        open={forwardDialogOpen} 
        onClose={() => !forwarding && setForwardDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Forward Application to Evaluator</DialogTitle>
        <DialogContent>
          {forwardMessage.text && (
            <Alert 
              severity={forwardMessage.type} 
              sx={{ mb: 2, mt: 1 }}
              onClose={() => setForwardMessage({ type: "", text: "" })}
            >
              {forwardMessage.text}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Select an evaluator to review this application. The evaluator will determine
            which of the applicant's course preferences will be approved.
          </Typography>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Evaluator</InputLabel>
            <Select
              value={selectedEvaluator}
              onChange={(e) => setSelectedEvaluator(e.target.value)}
              label="Select Evaluator"
              disabled={forwarding}
            >
              {evaluators.map((evaluator) => (
                <MenuItem key={evaluator.evaluatorId} value={evaluator.evaluatorId}>
                  {evaluator.firstName} {evaluator.lastName} ({evaluator.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setForwardDialogOpen(false)} 
            disabled={forwarding}
          >
            Cancel
          </Button>
          <Button 
            onClick={forwardToEvaluator}
            variant="contained"
            color="primary"
            disabled={!selectedEvaluator || forwarding}
            startIcon={forwarding ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ bgcolor: "#800000" }}
          >
            {forwarding ? "Forwarding..." : "Forward Application"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen
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

export default ApplicantDetailsPage;
