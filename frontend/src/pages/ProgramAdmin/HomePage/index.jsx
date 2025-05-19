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
  Stack,
  Avatar,
  alpha,
  Grid,
  Card,
  CardContent,
  TablePagination,
  useTheme,
  useMediaQuery,
  Grow,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import axios from "axios";
import { styled } from "@mui/material/styles";

const API_URL = "http://localhost:8080/api/program-admins";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C', // lighter maroon
  main: '#6A0000', // maroon
  dark: '#450000', // darker maroon
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9', // lighter gold
  main: '#FFC72C', // gold
  dark: '#D4A500', // darker gold
  contrastText: '#000000',
};

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
});

// Styled components for enhanced UI
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  '&.MuiTableCell-head': {
    backgroundColor: maroon.main,
    color: maroon.contrastText,
    fontSize: 14,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(gold.light, 0.15),
  },
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.3),
    transition: 'background-color 0.2s ease',
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 45px -10px rgba(106, 0, 0, 0.25)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: maroon.main,
  width: 56,
  height: 56,
  color: '#FFFFFF',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(106, 0, 0, 0.15)',
  },
  borderTop: `3px solid ${maroon.main}`,
}));

const DetailHeader = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(gold.light, 0.3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${gold.main}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: maroon.main,
  '&:hover': {
    backgroundColor: maroon.dark,
    boxShadow: '0 4px 12px rgba(106, 0, 0, 0.25)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderWidth: 2,
  '&.MuiChip-outlinedPrimary': {
    borderColor: maroon.main,
    color: maroon.main,
  },
  '&.MuiChip-outlinedSecondary': {
    borderColor: gold.main,
    color: gold.dark,
  },
  '&.MuiChip-outlinedSuccess': {
    color: '#2e7d32',
  },
  '&.MuiChip-outlinedError': {
    color: '#d32f2f',
  },
  '&.MuiChip-outlinedInfo': {
    color: '#0288d1',
  },
  '&.MuiChip-outlinedWarning': {
    color: '#ed6c02',
  },
}));

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [coursePreferences, setCoursePreferences] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [finalCourseId, setFinalCourseId] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Open application details dialog
  const handleOpenDialog = (application) => {
    setSelectedApplication({
      ...application,
      // Ensure applicationDate is available in the selected application
      applicationDate: application.applicationDate || application.uploadDate || application.dateSubmitted || new Date().toISOString(),
      // Explicitly copy the applicant name to ensure consistency
      applicantName: application.applicantName
    });
    setNewStatus(application.status);
    setFinalCourseId(application.finalCourseId || "");
    // Use applicationId with fallback to id
    fetchApplicationDetails(application.applicationId || application.id);
    setOpenDialog(true);
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
      
      // Set selected application with complete details while preserving date information and applicant name
      setSelectedApplication(prev => ({
        ...application,
        applicationDate: prev.applicationDate || application.applicationDate || application.uploadDate || application.dateSubmitted || new Date().toISOString(),
        // Preserve the applicant name from the grid if it exists, otherwise use the one from the API
        applicantName: prev.applicantName || application.applicantName || 
          (application.applicant ? 
            `${application.applicant.firstName || ''} ${application.applicant.lastName || ''}`.trim() : 'Unknown'),
        documents: application.documents
      }));
      
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

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    fetchApplications();
    // Optional: set auto-refresh interval
    const interval = setInterval(fetchApplications, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Filter applications for current page
  const displayedApplications = applications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <ThemeProvider theme={customTheme}>
      <MainLayout background={backgroundImage}>
        <Grow in={true} timeout={500}>
          <AnimatedPaper elevation={3} sx={{ p: 3, my: 2, overflow: 'hidden' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
                borderBottom: `2px solid ${gold.main}`,
                paddingBottom: 1,
                display: 'inline-block'
              }}>
                Applicant Applications
              </Typography>
              <ActionButton
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={fetchApplications}
                disabled={loading}
                disableElevation
              >
                {loading ? "Refreshing..." : "Refresh"}
              </ActionButton>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading applications...
                </Typography>
              </Box>
            ) : applications.length > 0 ? (
              <>
                <TableContainer sx={{ 
                  borderRadius: 2,
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  mb: 2
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Applicant</StyledTableCell>
                        <StyledTableCell>Application Date</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedApplications.map((application) => (
                        <StyledTableRow key={application.applicationId || application.id || `app-${Math.random()}`}>
                          <StyledTableCell>{application.applicationId || application.id}</StyledTableCell>
                          <StyledTableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {getInitials(application.applicantName)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {application.applicantName}
                              </Typography>
                            </Stack>
                          </StyledTableCell>
                          <StyledTableCell>
                            {application.applicationDate ? 
                              new Date(application.applicationDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }) : 'N/A'}
                          </StyledTableCell>
                          <StyledTableCell>
                            <StyledChip 
                              label={application.status} 
                              color={getStatusChipColor(application.status)} 
                              variant="outlined" 
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="View Application Details">
                              <IconButton 
                                color="primary"
                                onClick={() => handleOpenDialog(application)}
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={applications.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Box sx={{ 
                textAlign: "center", 
                my: 6, 
                py: 6,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                borderRadius: 2
              }}>
                <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No applications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are currently no applications in the system.
                </Typography>
              </Box>
            )}
          </AnimatedPaper>
        </Grow>

        {/* Application Details Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)',
              overflow: 'hidden',
            }
          }}
          fullScreen={isMobile}
          TransitionComponent={Grow}
          transitionDuration={300}
        >
          {selectedApplication && (
            <>
              <DialogTitle sx={{ 
                bgcolor: maroon.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <StyledAvatar>
                  {getInitials(selectedApplication.applicantName)}
                </StyledAvatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Application Details
                  </Typography>
                  <Typography variant="body2">
                    {selectedApplication.applicantName}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <DetailHeader>
                      <Typography variant="h6" color={maroon.main} gutterBottom>
                        Application Information
                      </Typography>
                      <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PersonIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Applicant Name
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {selectedApplication.applicantName}
                                </Typography>
                              </Box>
                            </Stack>
                            
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EmailIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Email Address
                                </Typography>
                                <Typography variant="body1">
                                  {selectedApplication.applicant?.email || selectedApplication.email || 'N/A'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccessTimeIcon color="primary" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Application Date
                                </Typography>
                                <Typography variant="body1">
                                  {selectedApplication.applicationDate ? 
                                    new Date(selectedApplication.applicationDate).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    }) : 'N/A'}
                                </Typography>
                              </Box>
                            </Stack>
                            
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Current Status
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <StyledChip 
                                    label={selectedApplication.status} 
                                    color={getStatusChipColor(selectedApplication.status)} 
                                    variant="outlined" 
                                  />
                                </Box>
                              </Box>
                            </Stack>
                          </Stack>
                        </Grid>
                      </Grid>
                    </DetailHeader>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <SchoolIcon sx={{ color: maroon.main }} />
                          <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                            Course Preferences
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                        {loadingPreferences ? (
                          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                            <CircularProgress size={30} />
                          </Box>
                        ) : coursePreferences.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined" sx={{ 
                            borderRadius: 2,
                            boxShadow: 'none',
                            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`
                          }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <StyledTableCell>Preference</StyledTableCell>
                                  <StyledTableCell>Course</StyledTableCell>
                                  <StyledTableCell>Department</StyledTableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {coursePreferences
                                  .sort((a, b) => {
                                    // Handle different priority order formats
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
                                    <StyledTableRow key={preference.id || preference.preferenceId || `pref-${Math.random()}`}>
                                      <StyledTableCell sx={{ width: '25%' }}>
                                        <Chip
                                          label={
                                            preference.preferenceOrder === "FIRST" ? "1st Choice" :
                                            preference.preferenceOrder === "SECOND" ? "2nd Choice" :
                                            preference.preferenceOrder === "THIRD" ? "3rd Choice" :
                                            `${preference.preferenceOrder}${getOrdinalSuffix(preference.preferenceOrder)} Choice`
                                          }
                                          size="small"
                                          color={
                                            preference.preferenceOrder === "FIRST" || preference.preferenceOrder === 1 ? "primary" :
                                            preference.preferenceOrder === "SECOND" || preference.preferenceOrder === 2 ? "secondary" : 
                                            "default"
                                          }
                                          variant="outlined"
                                        />
                                      </StyledTableCell>
                                      <StyledTableCell sx={{ fontWeight: 'medium' }}>{preference.courseName}</StyledTableCell>
                                      <StyledTableCell>{preference.department}</StyledTableCell>
                                    </StyledTableRow>
                                  ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No course preferences found
                          </Typography>
                        )}
                      </CardContent>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                            Submitted Documents
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                        {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                          <TableContainer sx={{ 
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                            maxHeight: 300,
                            overflowY: 'auto'
                          }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <StyledTableCell>Document Type</StyledTableCell>
                                  <StyledTableCell>File Name</StyledTableCell>
                                  <StyledTableCell>Upload Date</StyledTableCell>
                                  <StyledTableCell align="center">Actions</StyledTableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedApplication.documents.map((document) => (
                                  <StyledTableRow key={document.documentId}>
                                    <StyledTableCell>
                                      <Chip 
                                        label={document.documentType} 
                                        size="small" 
                                        color={document.documentType === "Required" ? "secondary" : "default"}
                                        variant="outlined"
                                      />
                                    </StyledTableCell>
                                    <StyledTableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {document.fileName}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                      {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'N/A'}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                      <Stack direction="row" spacing={1} justifyContent="center">
                                        <Tooltip title="Preview Document">
                                          <IconButton 
                                            size="small"
                                            color="primary"
                                            onClick={() => handlePreviewDocument(document.documentId)}
                                            sx={{ 
                                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                              '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                              }
                                            }}
                                          >
                                            <VisibilityIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Download Document">
                                          <IconButton 
                                            size="small"
                                            onClick={() => handleDownloadDocument(document.documentId, document.fileName)}
                                            sx={{ 
                                              backgroundColor: alpha(theme.palette.grey[700], 0.1),
                                              color: theme.palette.grey[700],
                                              '&:hover': {
                                                backgroundColor: alpha(theme.palette.grey[700], 0.2),
                                              }
                                            }}
                                          >
                                            <DownloadIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </StyledTableCell>
                                  </StyledTableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        ) : (
                          <Box sx={{ py: 3, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              No documents found
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <CardContent>
                        <Typography variant="h6" fontWeight="medium" color={maroon.main} gutterBottom>
                          Update Application Status
                        </Typography>
                        <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <FormControl fullWidth variant="outlined">
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
                            <FormControl fullWidth variant="outlined">
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
                      </CardContent>
                    </InfoCard>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2.5, bgcolor: alpha(gold.light, 0.2) }}>
                <Button 
                  onClick={handleCloseDialog} 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    px: 3, 
                    borderColor: maroon.main,
                    color: maroon.main,
                    '&:hover': {
                      borderColor: maroon.dark,
                      backgroundColor: alpha(maroon.light, 0.1),
                    }
                  }}
                >
                  Cancel
                </Button>
                <ActionButton 
                  variant="contained"
                  onClick={updateApplicationStatus}
                  disabled={updateLoading || (newStatus === selectedApplication.status && finalCourseId === (selectedApplication.finalCourseId || ""))}
                  startIcon={updateLoading ? <CircularProgress size={20} /> : null}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {updateLoading ? "Updating..." : "Update Status"}
                </ActionButton>
              </DialogActions>
            </>
          )}
        </Dialog>
      </MainLayout>
    </ThemeProvider>
  );
};

export default ProgramAdminHomePage;
