import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate, useParams } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout";

// Mock data that matches the backend structure
const mockApplicant = {
  applicantId: 1,
  firstName: "John",
  middleInitial: "D",
  lastName: "Doe",
  email: "john.doe@example.com",
  contactNumber: "09123456789",
  address: "123 Sample Street, Cebu City, Philippines",
  profileDetails: "I am a dedicated student looking for opportunities to grow in my field.",
  dateOfBirth: "2000-05-15",
  gender: "MALE",
  createdAt: "2023-05-05",
  preferences: [
    {
      preferenceId: 1,
      course: {
        courseId: 1,
        courseName: "BSIT",
        description: "Bachelor of Science in Information Technology"
      },
      priorityOrder: "FIRST",
      status: "PENDING"
    },
    {
      preferenceId: 2,
      course: {
        courseId: 2,
        courseName: "BSEd",
        description: "Bachelor of Science in Education"
      },
      priorityOrder: "SECOND",
      status: "PENDING"
    }
  ]
};

const documents = [
  { id: 1, requirement: "Resume/CV", filename: "john_doe_resume.pdf", type: "application/pdf" },
  { id: 2, requirement: "Transcript of Records", filename: "john_doe_transcript.pdf", type: "application/pdf" },
  { id: 3, requirement: "ID Photo", filename: "john_doe_photo.jpg", type: "image/jpeg" },
];

const ViewApplicantPage = () => {
  const navigate = useNavigate();
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    // Redirect to applicants list if no applicantId is provided
    if (!applicantId) {
      navigate("/evaluator/applicants");
      return;
    }

    // Simulate API fetch with applicantId
    const fetchApplicantData = () => {
      setLoading(true);
      setTimeout(() => {
        // In a real app, you'd fetch data for the specific applicantId using the API
        // For now just use mock data
        setApplicant(mockApplicant);
        setLoading(false);
      }, 800);
    };

    fetchApplicantData();
  }, [applicantId, navigate]);

  const handleUpdateStatus = (preference) => {
    setSelectedPreference(preference);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = (newStatus) => {
    console.log(`Updating preference ${selectedPreference.preferenceId} status to ${newStatus}`);
    // Here you would call your API to update the status
    setStatusDialogOpen(false);
    
    // Simulate status update in the mock data
    const updatedPreferences = applicant.preferences.map(pref => 
      pref.preferenceId === selectedPreference.preferenceId 
        ? {...pref, status: newStatus}
        : pref
    );
    
    setApplicant({...applicant, preferences: updatedPreferences});
  };

  const handleDocumentPreview = (document) => {
    setSelectedDocument(document);
    setPreviewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "#FFF9C4", color: "#9E9D24" };
      case "REVIEWED":
        return { bg: "#E3F2FD", color: "#1565C0" };
      case "ACCEPTED":
        return { bg: "#E8F5E9", color: "#2E7D32" };
      case "REJECTED":
        return { bg: "#FFEBEE", color: "#C62828" };
      default:
        return { bg: "#F5F5F5", color: "#757575" };
    }
  };

  if (loading) {
    return (
      <ListLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress sx={{ color: "#800000" }} />
        </Box>
      </ListLayout>
    );
  }

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
        <Typography variant="h6" fontWeight={600}>
          Applicant Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Applicant Profile Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <DetailItem xs={12} label="Full Name" 
                  value={`${applicant.firstName} ${applicant.middleInitial}. ${applicant.lastName}`} />
                <DetailItem xs={6} label="Email" value={applicant.email} />
                <DetailItem xs={6} label="Phone" value={applicant.contactNumber || "Not provided"} />
                <DetailItem xs={6} label="Gender" value={applicant.gender || "Not provided"} />
                <DetailItem xs={6} label="Birth Date" value={applicant.dateOfBirth || "Not provided"} />
                <DetailItem xs={12} label="Address" value={applicant.address || "Not provided"} />
                <DetailItem xs={12} label="Application Date" value={applicant.createdAt} />
                <DetailItem xs={12} label="Profile Details" value={applicant.profileDetails || "Not provided"} />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Course Preferences Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Course Preferences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applicant.preferences && applicant.preferences.length > 0 ? (
                    applicant.preferences.map((preference) => (
                      <TableRow key={preference.preferenceId}>
                        <TableCell>{preference.priorityOrder}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {preference.course.courseName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {preference.course.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={preference.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(preference.status).bg,
                              color: getStatusColor(preference.status).color,
                              fontWeight: "500",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleUpdateStatus(preference)}
                            sx={{
                              color: "#800000",
                              "&:hover": { backgroundColor: "rgba(128,0,0,0.04)" }
                            }}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No course preferences found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents Card */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Uploaded Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Document Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.requirement}</TableCell>
                      <TableCell>{doc.filename}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleDocumentPreview(doc)}
                            sx={{
                              color: "#800000",
                              borderColor: "#800000",
                              "&:hover": {
                                borderColor: "#800000",
                                backgroundColor: "rgba(128, 0, 0, 0.04)",
                              },
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            sx={{
                              backgroundColor: "#800000",
                              "&:hover": {
                                backgroundColor: "#660000",
                              },
                            }}
                          >
                            Download
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Application Status</DialogTitle>
        <DialogContent>
          <Typography>
            Update status for {selectedPreference?.course?.courseName} preference:
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleStatusChange("ACCEPTED")}
              sx={{ bgcolor: "#4CAF50", "&:hover": { bgcolor: "#388E3C" } }}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleStatusChange("REVIEWED")}
            >
              Mark as Reviewed
            </Button>
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={() => handleStatusChange("REJECTED")}
              sx={{ bgcolor: "#F44336", "&:hover": { bgcolor: "#D32F2F" } }}
            >
              Reject
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog 
        open={previewDialogOpen} 
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDocument?.filename}
          <IconButton
            aria-label="close"
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {selectedDocument?.type.startsWith('image/') ? (
              <img 
                src={`/mock-files/${selectedDocument?.filename}`} 
                alt="Document preview" 
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/600x800?text=Image+Preview+Unavailable";
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Document Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF preview not available in this demo. 
                  In a real application, you would integrate a PDF viewer component.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ backgroundColor: "#800000", "&:hover": { backgroundColor: "#660000" } }}
          >
            Download
          </Button>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ListLayout>
  );
};

// Helper component for displaying details
const DetailItem = ({ xs, label, value }) => (
  <Grid item xs={xs}>
    <Typography variant="caption" color="textSecondary" display="block">
      {label}:
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Grid>
);

export default ViewApplicantPage;
