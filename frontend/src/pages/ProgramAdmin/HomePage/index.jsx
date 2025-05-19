import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack, // Add Stack component import
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download"; // Add this import
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import axios from "axios";

const API_URL = "http://localhost:8080/api/program-admins";

// Add helper function for ordinal suffixes (1st, 2nd, 3rd, etc.)
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

const ProgramAdminHomePage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [finalCourseId, setFinalCourseId] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Status color mapping
  const getStatusChipColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "error",
      WAITLISTED: "info",
      UNDER_REVIEW: "secondary",
    };
    return statusMap[status] || "default";
  };

  // Fetch all applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/applications`);
      
      // Normalize the data to ensure consistent property naming
      const normalizedApplications = response.data.map(app => ({
        ...app,
        id: app.applicationId || app.id, // Ensure id exists for React keys
        applicantName: app.applicantName || (app.applicant ? 
          `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() : 'Unknown'),
        // Use uploadDate with fallbacks to ensure a valid date is always available
        applicationDate: app.uploadDate || app.dateSubmitted || app.applicationDate || new Date().toISOString()
      }));
      
      setApplications(normalizedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch application details including preferences and documents
  const fetchApplicationDetails = async (applicationId) => {
    setLoadingPreferences(true);
    try {
      // Get complete application with preferences and documents
      const response = await axios.get(`${API_URL}/applications/${applicationId}`);
      const application = response.data;
      
      // Ensure documents property exists to prevent null mapping errors
      if (!application.documents) {
        application.documents = [];
      }
      
      // Set selected application with complete details
      setSelectedApplication(application);
      
      // Set course preferences from the response
      if (application.coursePreferences) {
        // Normalize course preference data
        const normalizedPreferences = application.coursePreferences.map(pref => ({
          id: pref.preferenceId || pref.id || Math.random().toString(36).substr(2, 9),
          preferenceId: pref.preferenceId || pref.id,
          preferenceOrder: pref.priorityOrder || pref.preferenceOrder,
          courseId: pref.course?.courseId || pref.courseId,
          courseName: pref.course?.courseName || pref.courseName || `Course ${pref.course?.courseId || pref.courseId}`,
          department: pref.course?.department?.departmentName || 'Department not specified',
          // Add any other fields needed
        }));
        setCoursePreferences(normalizedPreferences);
      } else {
        // Fallback to separate API call if not included
        try {
          const preferencesResponse = await axios.get(`${API_URL}/applications/${applicationId}/preferences`);
          // Normalize preferences from separate call
          const normalizedPreferences = preferencesResponse.data.map(pref => ({
            id: pref.preferenceId || pref.id || Math.random().toString(36).substr(2, 9),
            preferenceId: pref.preferenceId || pref.id,
            preferenceOrder: pref.priorityOrder || pref.preferenceOrder,
            courseId: pref.course?.courseId || pref.courseId,
            courseName: pref.course?.courseName || pref.courseName || `Course ${pref.course?.courseId || pref.courseId}`,
            department: pref.course?.department?.departmentName || 'Department not specified',
          }));
          setCoursePreferences(normalizedPreferences);
        } catch (error) {
          console.error("Error fetching preferences:", error);
          setCoursePreferences([]);
        }
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      // Set defaults to prevent null reference errors
      setSelectedApplication(prev => ({
        ...prev,
        documents: [],
        coursePreferences: []
      }));
      setCoursePreferences([]);
    } finally {
      setLoadingPreferences(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async () => {
    setUpdateLoading(true);
    try {
      const applicationId = selectedApplication.applicationId || selectedApplication.id;
      let url = `${API_URL}/applications/${applicationId}/update-status?status=${newStatus}`;
      
      if (newStatus === "APPROVED" && finalCourseId) {
        url += `&finalCourseId=${finalCourseId}`;
      }
      
      await axios.put(url);
      // Refresh applications after update
      await fetchApplications();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Open application details dialog
  const handleOpenDialog = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setFinalCourseId(application.finalCourseId || "");
    // Use applicationId with fallback to id
    fetchApplicationDetails(application.applicationId || application.id);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApplication(null);
    setCoursePreferences([]);
    setNewStatus("");
    setFinalCourseId("");
  };

  // Handle previewing document in a new tab - added to match DocumentHandler approach
  const handlePreviewDocument = (documentId) => {
    // Create a preview URL using the same format as DocumentHandler
    const previewUrl = `http://localhost:8080/api/documents/preview/${documentId}`;
    
    // Open in a new tab
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle downloading document - added to match DocumentHandler approach
  const handleDownloadDocument = (documentId, fileName) => {
    try {
      // Create a direct download link
      const downloadUrl = `http://localhost:8080/api/documents/download/${documentId}`;
      
      // Create a hidden anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName); // Set download attribute with filename
      link.setAttribute('target', '_blank'); // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      
      // Remove the link after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download document. Please try again later.`);
    }
  };

  useEffect(() => {
    fetchApplications();
    // Optional: set auto-refresh interval
    const interval = setInterval(fetchApplications, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout background={backgroundImage}>
      <Paper elevation={3} sx={{ p: 3, my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Applicant Applications
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
            onClick={fetchApplications}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : applications.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Applicant Name</TableCell>
                  <TableCell>Application Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.applicationId || application.id || `app-${Math.random()}`}>
                    <TableCell>{application.applicationId || application.id}</TableCell>
                    <TableCell>{application.applicantName}</TableCell>
                    <TableCell>
                      {application.applicationDate ? 
                        new Date(application.applicationDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={application.status} 
                        color={getStatusChipColor(application.status)} 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary"
                        onClick={() => handleOpenDialog(application)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No applications found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Application Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedApplication && (
          <>
            <DialogTitle>
              Application Details - {selectedApplication.applicantName}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Application Information</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Application ID</Typography>
                    <Typography variant="body1">{selectedApplication.id}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Applicant ID</Typography>
                    <Typography variant="body1">{selectedApplication.applicantId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Application Date</Typography>
                    <Typography variant="body1">
                      {selectedApplication.applicationDate ? 
                        new Date(selectedApplication.applicationDate).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Current Status</Typography>
                    <Chip 
                      label={selectedApplication.status} 
                      color={getStatusChipColor(selectedApplication.status)} 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Course Preferences</Typography>
                <Divider sx={{ my: 1 }} />
                {loadingPreferences ? (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : coursePreferences.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Preference Order</TableCell>
                          <TableCell>Course Name</TableCell>
                          <TableCell>Department</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coursePreferences
                          .sort((a, b) => {
                            // Handle different priority order formats (FIRST, SECOND, THIRD vs 1, 2, 3)
                            const priorityMap = { "FIRST": 1, "SECOND": 2, "THIRD": 3 };
                            const orderA = typeof a.preferenceOrder === 'string' && isNaN(a.preferenceOrder) 
                              ? priorityMap[a.preferenceOrder] || 999 
                              : a.preferenceOrder;
                            const orderB = typeof b.preferenceOrder === 'string' && isNaN(b.preferenceOrder) 
                              ? priorityMap[b.preferenceOrder] || 999 
                              : b.preferenceOrder;
                            return orderA - orderB;
                          })
                          .map((preference) => (
                            <TableRow key={preference.id || preference.preferenceId || `pref-${Math.random()}`}>
                              <TableCell>
                                {preference.preferenceOrder === "FIRST" ? "1st Choice" :
                                 preference.preferenceOrder === "SECOND" ? "2nd Choice" :
                                 preference.preferenceOrder === "THIRD" ? "3rd Choice" :
                                 `${preference.preferenceOrder}${getOrdinalSuffix(preference.preferenceOrder)} Choice`}
                              </TableCell>
                              <TableCell>{preference.courseName}</TableCell>
                              <TableCell>{preference.department}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No course preferences found
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Submitted Documents</Typography>
                <Divider sx={{ my: 1 }} />
                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Document Type</TableCell>
                          <TableCell>File Name</TableCell>
                          <TableCell>Upload Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedApplication.documents.map((document) => (
                          <TableRow key={document.documentId}>
                            <TableCell>{document.documentType}</TableCell>
                            <TableCell>{document.fileName}</TableCell>
                            <TableCell>
                              {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Preview Document">
                                  <IconButton 
                                    size="small"
                                    color="primary"
                                    onClick={() => handlePreviewDocument(document.documentId)}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download Document">
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleDownloadDocument(document.documentId, document.fileName)}
                                    sx={{ color: '#333' }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No documents found
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Update Status</Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newStatus}
                      label="Status"
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <MenuItem value="PENDING">PENDING</MenuItem>
                      <MenuItem value="APPROVED">APPROVED</MenuItem>
                      <MenuItem value="REJECTED">REJECTED</MenuItem>
                      <MenuItem value="WAITLISTED">WAITLISTED</MenuItem>
                      <MenuItem value="UNDER_REVIEW">UNDER_REVIEW</MenuItem>
                    </Select>
                  </FormControl>

                  {newStatus === "APPROVED" && (
                    <FormControl fullWidth>
                      <InputLabel>Assign Final Course</InputLabel>
                      <Select
                        value={finalCourseId}
                        label="Assign Final Course"
                        onChange={(e) => setFinalCourseId(e.target.value)}
                      >
                        {coursePreferences.map((preference) => (
                          <MenuItem 
                            key={preference.preferenceId || preference.id || `pref-${preference.courseId}-${preference.preferenceOrder}`} 
                            value={preference.courseId}
                          >
                            {preference.courseName} - {preference.department} (Preference: {
                              preference.preferenceOrder === "FIRST" ? "1st" :
                              preference.preferenceOrder === "SECOND" ? "2nd" :
                              preference.preferenceOrder === "THIRD" ? "3rd" :
                              preference.preferenceOrder
                            })
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={updateApplicationStatus}
                disabled={updateLoading || (newStatus === selectedApplication.status && finalCourseId === (selectedApplication.finalCourseId || ""))}
                startIcon={updateLoading ? <CircularProgress size={20} /> : null}
              >
                {updateLoading ? "Updating..." : "Update Status"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainLayout>
  );
};

export default ProgramAdminHomePage;
