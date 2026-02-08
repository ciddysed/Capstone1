import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  Button,
  Stack,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Avatar,
  alpha,
  TablePagination,
  useTheme,
  Paper,
  Grow,
} from "@mui/material";
// NotificationsIcon import removed; NotificationCenter is used instead
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from '@mui/icons-material/Person';
import logo from "../../../assets/logo.png";
import backgroundImage from "../../../assets/login-bg.png";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Import the tab components
import AcceptedStudentsTab from "../../../pages/ProgramAdmin/HomePage/components/AcceptedStudentsTab";
import ApplicationDetailsDialog from "../../../pages/ProgramAdmin/HomePage/components/ApplicationDetailsDialog";
import ProgramAdminNotificationCenter from "../../Notifications/ProgramAdminNotificationCenter";
import ProgramAdminChat from "./ProgramAdminChat";

const API_URL = "https://eteeap-foth.onrender.com/api/program-admins";

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

const ProgramAdminNavigation = ({ children }) => {
  const theme = useTheme();
  const [activeButton, setActiveButton] = useState("Applications");
  const navItems = ["Applications", "Accepted Students", "Logout"];
  const navigate = useNavigate();
  const chatRef = useRef(null);

  // Application management state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const handleNavItemClick = (item) => {
    setActiveButton(item);

    if (item === "Logout") {
      // Clear all localStorage data
      localStorage.clear();
      
      // Redirect to program-admin login page
      navigate("/program-admin/login");
    }
  };

  // Fetch all applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/applications`);
      
      // Fetch accepted applicants to filter them out
      let acceptedApplicantIds = [];
      try {
        const acceptedResponse = await axios.get("https://eteeap-foth.onrender.com/api/accepted-applicants");
        acceptedApplicantIds = acceptedResponse.data.map(accepted => accepted.applicant?.applicantId).filter(Boolean);
      } catch (error) {
        console.error("Error fetching accepted applicants:", error);
      }
      
      // Normalize the data and filter out accepted applicants
      const normalizedApplications = response.data
        .filter(app => {
          const applicantId = app.applicant?.applicantId;
          // Exclude applications where the applicant has been accepted
          return applicantId && !acceptedApplicantIds.includes(applicantId);
        })
        .map(app => ({
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

  // Handle initiate chat with applicant
  const handleInitiateChat = (application) => {
    if (chatRef.current && application.applicant?.applicantId) {
      chatRef.current.initiateChat(
        application.applicant.applicantId,
        application.applicantName
      );
    }
  };

  useEffect(() => {
    if (activeButton === "Applications") {
      fetchApplications();
      
      // Optional: set auto-refresh interval
      const interval = setInterval(fetchApplications, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [activeButton]);

  // Get unique courses for filter dropdown
  const courseOptions = Array.from(new Set(applications.map(a => a.courseName || a.course?.courseName).filter(Boolean)));

  // Filtering logic
  const filteredApplications = applications.filter(app => {
    let statusMatch = true, courseMatch = true, dateMatch = true;
    if (statusFilter) statusMatch = app.status === statusFilter;
    if (courseFilter) courseMatch = (app.courseName || app.course?.courseName) === courseFilter;
    if (dateFilter) {
      if (!app.applicationDate) return false;
      const appDate = new Date(app.applicationDate);
      const filterDate = new Date(dateFilter);
      dateMatch = appDate.toISOString().slice(0,10) === filterDate.toISOString().slice(0,10);
    }
    return statusMatch && courseMatch && dateMatch;
  });

  // Filter applications for current page
  const displayedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Function to render the appropriate content based on active button
  const renderContent = () => {
    switch (activeButton) {
      case "Applications":
        return (
          <Grow in={true} timeout={500}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.2)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 45px -10px rgba(106, 0, 0, 0.25)',
                },
              }}
            >
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
                              <Tooltip title="Chat with Applicant">
                                <IconButton 
                                  color="secondary"
                                  onClick={() => handleInitiateChat(application)}
                                  sx={{ 
                                    ml: 1,
                                    backgroundColor: alpha(gold.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(gold.main, 0.2),
                                    }
                                  }}
                                >
                                  <ChatIcon />
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

              {/* Application Details Dialog */}
              <ApplicationDetailsDialog
                open={openDialog}
                onClose={handleCloseDialog}
                application={selectedApplication}
                onRefreshApplications={fetchApplications}
              />
            </Paper>
          </Grow>
        );
      case "Accepted Students":
        return <AcceptedStudentsTab />;
      default:
        return children;
    }
  };

  // Function to get the appropriate title for the top bar
  const getPageTitle = () => {
    switch (activeButton) {
      case "Applications":
        return "Applications Management";
      case "Accepted Students":
        return "Accepted Students";
      default:
        return "Program Administration";
    }
  };

  // Function to determine if filters should be shown
  const shouldShowFilters = () => {
    return activeButton === "Applications";
  };

  // Get program admin ID from localStorage
  const programAdminId = localStorage.getItem("programAdminId");

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Left NavBar */}
      <Box sx={{ width: 240, bgcolor: maroon.main, color: "white", p: 2 }}>
        {/* Logo */}
        <Stack
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            p: 1,
            mb: 2,
            alignItems: "center",
          }}
        >
          <img src={logo} alt="Logo" style={{ height: 100 }} />
        </Stack>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
        <Stack>
          <List>
            {navItems.map((item) => (
              <ListItem key={item} disablePadding sx={{ my: 1 }}>
                <Button
                  fullWidth
                  onClick={() => handleNavItemClick(item)}
                  sx={{
                    justifyContent: "flex-start",
                    color: activeButton === item ? "#000" : "#fff",
                    bgcolor: activeButton === item ? gold.main : "transparent",
                    "&:hover": {
                      bgcolor:
                        activeButton === item
                          ? gold.main
                          : "rgba(255,255,255,0.1)",
                    },
                    textTransform: "none",
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  {item}
                </Button>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Box>

      {/* Right Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          maxHeight: "100vh",
        }}
      >
        <Box sx={{ flexShrink: 0, bgcolor: "transparent", zIndex: 1100 }}>
          {/* Top Bar */}
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between", p: 0 }}>
              <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                {getPageTitle()}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {activeButton === "Applications" && (
                  <ActionButton
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    onClick={fetchApplications}
                    disabled={loading}
                    disableElevation
                    size="small"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </ActionButton>
                )}
                <TextField
                  size="small"
                  placeholder="Search..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                    sx: { borderRadius: 5, bgcolor: "#fff" },
                  }}
                />
                
                {/* Program Admin Notification Center */}
                <ProgramAdminNotificationCenter programAdminId={programAdminId} />
                <ProgramAdminChat ref={chatRef} programAdminId={programAdminId} colors={{ primary: maroon, secondary: gold, accent: { info: "#0288d1" }, neutral: { 50: "#faf9f7", 100: "#f5f3f0", 200: "#e8e4df", 600: "#4a4540", 900: "#0d0c0b" } }} />
                
              </Box>
            </Toolbar>
          </AppBar>

          {/* Filters - Only show for Applications */}
          {shouldShowFilters() && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                flexWrap: "wrap",
                px: 2,
                py: 1,
                position: "sticky",
                top: "64px",
                zIndex: 1000,
              }}
            >
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="WAITLISTED">Waitlisted</MenuItem>
                  <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Course</InputLabel>
                <Select
                  label="Course"
                  value={courseFilter}
                  onChange={e => { setCourseFilter(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">All</MenuItem>
                  {courseOptions.map(course => (
                    <MenuItem key={course} value={course}>{course}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Date Applied"
                type="date"
                value={dateFilter}
                onChange={e => { setDateFilter(e.target.value); setPage(0); }}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
              <Button onClick={() => { setStatusFilter(""); setCourseFilter(""); setDateFilter(""); setPage(0); }} variant="outlined" size="small">Clear Filters</Button>
            </Box>
          )}
        </Box>
        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 2,
            py: 2,
            bgcolor: "transparent",
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ProgramAdminNavigation;