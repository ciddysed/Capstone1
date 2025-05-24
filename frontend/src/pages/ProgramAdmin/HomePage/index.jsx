import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  alpha,
  TablePagination,
  useTheme,
  Grow,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from '@mui/icons-material/Person';
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import ApplicationDetailsDialog from "./components/ApplicationDetailsDialog";
import axios from "axios";
import { styled } from "@mui/material/styles";

const API_URL = "http://localhost:8080/api/program-admins";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
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

const ProgramAdminHomePage = () => {
  const theme = useTheme();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/applications`);
      
      // Normalize the data to ensure consistent property naming
      const normalizedApplications = response.data.map(app => ({
        ...app,
        id: app.applicationId || app.id,
        applicantName: app.applicantName || (app.applicant ? 
          `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() : 'Unknown'),
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
      applicationDate: application.applicationDate || application.uploadDate || application.dateSubmitted || new Date().toISOString(),
      applicantName: application.applicantName
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedApplication(null);
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
        <ApplicationDetailsDialog
          open={openDialog}
          onClose={handleCloseDialog}
          application={selectedApplication}
          onRefreshApplications={fetchApplications}
        />
      </MainLayout>
    </ThemeProvider>
  );
};

export default ProgramAdminHomePage;
