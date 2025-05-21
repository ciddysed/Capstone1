import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  TablePagination,
  Chip,
  Typography,
  Box,
  Tooltip,
  CircularProgress,
  Avatar,
  Stack,
  alpha,
  useTheme,
  createTheme,
  ThemeProvider,
  Grow,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import ListLayoutWithFilters from "../../../templates/ListLayoutWithFilters";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Custom maroon and gold color palette (matching ProgramAdmin)
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

// Styled components for enhanced UI (matching ProgramAdmin)
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

// Helper to fetch applicant and course details by ID
const fetchApplicant = async (applicantId) => {
  if (!applicantId) return null;
  try {
    // Use the correct endpoint for fetching applicant by ID
    const res = await fetch(`http://localhost:8080/api/applicants/${applicantId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const fetchCourse = async (courseId) => {
  if (!courseId) return null;
  try {
    // Use the correct endpoint for fetching course by ID
    const res = await fetch(`http://localhost:8080/api/courses/${courseId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const ApplicantsListPage = () => {
  const theme = useTheme();
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [evaluations, setEvaluations] = useState([]);
  const [applicantMap, setApplicantMap] = useState({});
  const [courseMap, setCourseMap] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const fetchEvaluations = () => {
    setLoading(true);
    // Simplified approach: just fetch ALL evaluations
    fetch(`http://localhost:8080/api/evaluations/all`)
      .then((res) => {
        if (!res.ok) {
          console.error(`Error fetching evaluations: HTTP ${res.status}`);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async (data) => {
        console.log("All evaluations:", data);
        if (Array.isArray(data)) {
          // Process evaluations to ensure all have required fields
          const processedEvaluations = data.map(ev => ({
            ...ev,
            applicantId: ev.applicant?.applicantId || ev.applicantId,
            courseId: ev.course?.courseId || ev.courseId
          }));
          
          setEvaluations(processedEvaluations);
          
          // Extract applicant and course IDs for fetching additional data
          const applicantIds = [...new Set(
            processedEvaluations
              .map((ev) => ev.applicant?.applicantId || ev.applicantId)
              .filter(Boolean)
          )];
          
          const courseIds = [...new Set(
            processedEvaluations
              .map((ev) => ev.course?.courseId || ev.courseId)
              .filter(Boolean)
          )];
          
          console.log("Applicant IDs to fetch:", applicantIds);
          console.log("Course IDs to fetch:", courseIds);
          
          // Fetch applicants
          if (applicantIds.length > 0) {
            const applicantPromises = applicantIds.map(async id => {
              const applicant = await fetchApplicant(id);
              return [id, applicant];
            });
            const applicantObj = Object.fromEntries(
              (await Promise.all(applicantPromises)).filter(([_, value]) => value !== null)
            );
            setApplicantMap(applicantObj);
          }
          
          // Fetch courses
          if (courseIds.length > 0) {
            const coursePromises = courseIds.map(async id => {
              const course = await fetchCourse(id);
              return [id, course];
            });
            const courseObj = Object.fromEntries(
              (await Promise.all(coursePromises)).filter(([_, value]) => value !== null)
            );
            setCourseMap(courseObj);
          }
        } else {
          console.error("Backend returned non-array data:", data);
          setEvaluations([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch evaluations:", err);
        setEvaluations([]);
        setLoading(false);
      });
  };
  
  // Simplified data source - just return all evaluations
  const paginatedData = evaluations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Improved ViewApplication function to handle both applicantId and evaluationId
  const handleViewApplication = (item) => {
    console.log("Viewing application item details:", item);
    const applicantId = item.applicant?.applicantId || item.applicantId;
    const courseId = item.course?.courseId || item.courseId;
    const evaluationId = item.evaluationId;
    
    if (!applicantId) {
      console.error("Missing applicantId in selected item:", item);
      return; // Prevent navigation with missing ID
    }
    
    navigate("/evaluator/applicants/view-applicant", {
      state: { 
        applicantId,
        evaluationId,
        courseId
      }
    });
  };

  // Get initials from name (matching ProgramAdmin)
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Improved status chip display with better conditional checks
  const getStatusChip = (item) => {
    // Check if this item has an evaluation status and has been explicitly evaluated
    if (item && item.evaluationStatus && item.evaluationStatus !== "PENDING") {
      return (
        <StyledChip
          icon={item.evaluationStatus === "APPROVED" ? <CheckCircleIcon fontSize="small" /> : null}
          label={item.evaluationStatus}
          color={
            item.evaluationStatus === "APPROVED" ? "success" : 
            item.evaluationStatus === "REJECTED" ? "error" : 
            "default"
          }
          size="small"
          variant="outlined"
        />
      );
    } 
    // For pending evaluations that haven't been started yet
    else if (item && item.evaluationStatus === "PENDING") {
      return (
        <StyledChip
          icon={<PendingIcon fontSize="small" />}
          label="In Progress"
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    }
    // For evaluations not yet started
    else {
      return (
        <StyledChip
          icon={<HourglassEmptyIcon fontSize="small" />}
          label="Awaiting Evaluation"
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }
  };
  
  // Simplified pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchEvaluations();
    
    // Optional: set auto-refresh interval
    const interval = setInterval(fetchEvaluations, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <ListLayoutWithFilters>
        <Grow in={true} timeout={500}>
          <AnimatedPaper elevation={3} sx={{ p: 3, my: 2, overflow: 'hidden' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
                borderBottom: `2px solid ${gold.main}`,
                paddingBottom: 1,
                display: 'inline-block'
              }}>
                All Evaluations
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${evaluations.length} Records`}
                  color="primary"
                  size="medium"
                  sx={{ fontWeight: 600 }}
                />
                <ActionButton
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                  onClick={fetchEvaluations}
                  disabled={loading}
                  disableElevation
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </ActionButton>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading evaluations...
                </Typography>
              </Box>
            ) : paginatedData.length > 0 ? (
              <Box sx={{ 
                borderRadius: 2,
                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                mb: 2
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Applicant Name</StyledTableCell>
                      <StyledTableCell>Course Name</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Forwarded At</StyledTableCell>
                      <StyledTableCell>Evaluated Date</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((item, index) => {
                      // Properly check if the item has been evaluated
                      const isEvaluated = Boolean(
                        item.evaluationStatus && 
                        item.evaluationStatus !== "PENDING" && 
                        item.dateEvaluated
                      );
                      
                      const applicantId = item.applicant?.applicantId;
                      const courseId = item.course?.courseId;
                      
                      const applicant = applicantMap[applicantId];
                      const course = courseMap[courseId];
                      
                      const fullName = applicant
                        ? [
                            applicant.firstName,
                            applicant.middleInitial
                              ? applicant.middleInitial + "."
                              : "",
                            applicant.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ")
                        : "-";
                        
                      return (
                        <StyledTableRow key={`${item.evaluationId || index}`}>
                          <StyledTableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {getInitials(fullName)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {fullName}
                              </Typography>
                              {!isEvaluated && (
                                <Tooltip title="Needs evaluation">
                                  <PendingIcon fontSize="small" color="warning" />
                                </Tooltip>
                              )}
                            </Stack>
                          </StyledTableCell>
                          <StyledTableCell>{course?.courseName || "-"}</StyledTableCell>
                          <StyledTableCell>{getStatusChip(item)}</StyledTableCell>
                          <StyledTableCell>
                            {item.forwardedAt
                              ? new Date(item.forwardedAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : "-"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {item.dateEvaluated && item.evaluationStatus
                              ? new Date(item.dateEvaluated).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : "-"}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {!isEvaluated ? (
                              <ActionButton
                                variant="contained"
                                size="small"
                                endIcon={<VisibilityIcon />}
                                onClick={() => handleViewApplication(item)}
                                sx={{
                                  borderRadius: "20px",
                                  backgroundColor: gold.main,
                                  color: gold.contrastText,
                                  fontWeight: 600,
                                  '&:hover': {
                                    backgroundColor: gold.dark,
                                  }
                                }}
                              >
                                Evaluate Now
                              </ActionButton>
                            ) : (
                              <Tooltip title="View Application Details">
                                <IconButton 
                                  color="primary"
                                  onClick={() => handleViewApplication(item)}
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
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: "center", 
                my: 6, 
                py: 6,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                borderRadius: 2
              }}>
                <HourglassEmptyIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No evaluation records found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are currently no evaluations assigned to you.
                </Typography>
              </Box>
            )}

            {/* Pagination Controls */}
            <TablePagination
              component="div"
              count={evaluations.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontWeight: 500,
                },
                '.MuiTablePagination-select': {
                  fontWeight: 600,
                }
              }}
            />
          </AnimatedPaper>
        </Grow>
      </ListLayoutWithFilters>
    </ThemeProvider>
  );
};

export default ApplicantsListPage;
