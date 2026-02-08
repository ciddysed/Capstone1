import React, { useState, useEffect } from "react";
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
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
import EvaluatorAssignedEvaluationsPoller from "../../../components/EvaluatorAssignedEvaluationsPoller";
 
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
    const res = await fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`);
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
    const res = await fetch(`https://eteeap-foth.onrender.com/api/courses/${courseId}`);
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
  const [evaluatorDepartment, setEvaluatorDepartment] = useState("");
  const [page] = useState(0);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const fetchEvaluations = () => {
    setLoading(true);
    
    if (!evaluatorId) {
      console.error("No evaluator ID found in localStorage");
      setEvaluations([]);
      setLoading(false);
      return;
    }

    // Fetch evaluations specific to this evaluator
    fetch(`https://eteeap-foth.onrender.com/api/evaluations/evaluator/${evaluatorId}`)
      .then((res) => {
        if (!res.ok) {
          console.error(`Error fetching evaluations: HTTP ${res.status}`);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async (data) => {
        console.log("Evaluator specific evaluations:", data);
        if (Array.isArray(data)) {
          // Process evaluations to ensure all have required fields
          const processedEvaluations = data.map(ev => ({
            ...ev,
            applicantId: ev.applicant?.applicantId || ev.applicantId,
            courseId: ev.course?.courseId || ev.courseId
          }));
          
          // Get all applicantIds from evaluations
          const applicantIds = [...new Set(
            processedEvaluations
              .map((ev) => ev.applicant?.applicantId || ev.applicantId)
              .filter(Boolean)
          )];
          
          // Check which applicants are already in accepted applicants
          let excludedIds = [];
          if (applicantIds.length > 0) {
            const acceptedApplicantPromises = applicantIds.map(id =>
              fetch(`https://eteeap-foth.onrender.com/api/accepted-applicants/applicant/${id}`)
                .then(res => res.ok ? res.json() : null)
                .catch(() => null)
            );
            const acceptedApplicantResults = await Promise.all(acceptedApplicantPromises);
            excludedIds = applicantIds.filter((id, idx) => acceptedApplicantResults[idx] !== null);
          }
          
          // Filter out applicants who are already in accepted applicants
          const filteredEvaluations = processedEvaluations.filter(
            ev => !excludedIds.includes(ev.applicant?.applicantId || ev.applicantId)
          );
          
          setEvaluations(filteredEvaluations);
          
          // Extract remaining applicant and course IDs for fetching additional data
          const remainingApplicantIds = [...new Set(
            filteredEvaluations
              .map((ev) => ev.applicant?.applicantId || ev.applicantId)
              .filter(Boolean)
          )];
          
          const courseIds = [...new Set(
            filteredEvaluations
              .map((ev) => ev.course?.courseId || ev.courseId)
              .filter(Boolean)
          )];
          
          console.log("Filtered Applicant IDs to fetch:", remainingApplicantIds);
          console.log("Course IDs to fetch:", courseIds);
          
          // Fetch applicants (only those not in accepted applicants)
          if (remainingApplicantIds.length > 0) {
            const applicantPromises = remainingApplicantIds.map(async id => {
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
  
  const fetchEvaluatorDepartment = async () => {
    if (!evaluatorId) return;
    
    try {
      const response = await fetch(`https://eteeap-foth.onrender.com/api/evaluators/${evaluatorId}`);
      if (response.ok) {
        const evaluatorData = await response.json();
        // Extract department name from the department object
        const departmentName = evaluatorData.department?.departmentName || evaluatorData.department || "";
        setEvaluatorDepartment(departmentName);
      }
    } catch (error) {
      console.error("Error fetching evaluator department:", error);
    }
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

  
  
  // Simplified pagination handlers
  

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchEvaluations();
    fetchEvaluatorDepartment();
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <ListLayoutWithFilters>
        {/* Removed notification icon at top right */}
        <Grow in={true} timeout={500}>
          <AnimatedPaper elevation={3} sx={{ p: 3, my: 2, overflow: 'hidden' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
                  borderBottom: `2px solid ${gold.main}`,
                  paddingBottom: 1,
                  display: 'inline-block'
                }}>
                  My Assigned Evaluations
                </Typography>
                {evaluatorDepartment && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    Department: {evaluatorDepartment}
                  </Typography>
                )}
              </Box>
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
                  Loading your assigned evaluations...
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
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {fullName}
                                </Typography>
                                {!isEvaluated && (
                                  <StyledChip
                                    icon={<PendingIcon fontSize="small" />}
                                    label="Needs Evaluation"
                                    color="warning"
                                    size="small"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Stack>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {course?.courseName || "-"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            {item.dateEvaluated && item.evaluationStatus
                              ? new Date(item.dateEvaluated).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : (
                                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Not evaluated yet
                                  </Typography>
                                )}
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
                  No evaluations assigned
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You currently have no evaluations assigned to you.
                </Typography>
              </Box>
            )}

            
          </AnimatedPaper>
        </Grow>
        {/* Poller for automatic updates */}
        <EvaluatorAssignedEvaluationsPoller
          evaluatorId={evaluatorId}
          fetchEvaluations={fetchEvaluations}
        />
      </ListLayoutWithFilters>
    </ThemeProvider>
  );
};

export default ApplicantsListPage;
