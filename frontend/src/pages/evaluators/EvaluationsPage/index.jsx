import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  Stack,
  styled,
  Box,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  alpha,
  createTheme,
  ThemeProvider,
  Grow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MainLayout from "../../../templates/MainLayout";

// Custom maroon and gold color palette
const maroon = {
  light: "#8D323C",
  main: "#6A0000",
  dark: "#450000",
  contrastText: "#FFFFFF",
};

const gold = {
  light: "#FFF0B9",
  main: "#FFC72C",
  dark: "#D4A500",
  contrastText: "#000000",
};

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

// Styled components for enhanced UI
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  "&.MuiTableCell-head": {
    backgroundColor: maroon.main,
    color: maroon.contrastText,
    fontSize: 14,
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(gold.light, 0.15),
  },
  "&:hover": {
    backgroundColor: alpha(gold.light, 0.3),
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: "0 8px 40px -12px rgba(106, 0, 0, 0.2)",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 45px -10px rgba(106, 0, 0, 0.25)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  padding: "12px 24px",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(106, 0, 0, 0.25)",
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  "&.MuiChip-outlined": {
    borderWidth: 2,
  },
}));

const EvaluationsPage = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentEvaluations();
  }, []);

  const fetchDepartmentEvaluations = async () => {
    try {
      setLoading(true);
      const evaluatorId = localStorage.getItem("evaluatorId");

      if (!evaluatorId) {
        setError("Evaluator ID not found. Please log in again.");
        return;
      }

      // Fetch evaluations filtered by evaluator's department
      const response = await fetch(
        `http://localhost:8080/api/evaluators/${evaluatorId}/department-evaluations`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch evaluations");
      }

      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setError("Failed to load evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (evaluationId) => {
    // Implement resend logic here
    console.log("Resend evaluation with ID:", evaluationId);
  };

  const handleBackToHome = () => {
    navigate("/evaluator/homepage");
  };

  const getStatusChip = (status) => {
    const statusColors = {
      APPROVED: "success",
      REJECTED: "error",
      PENDING: "warning",
      IN_PROGRESS: "info",
    };
    return statusColors[status] || "default";
  };

  return (
    <ThemeProvider theme={customTheme}>
      <MainLayout>
        <Grow in={true} timeout={500}>
          <AnimatedPaper elevation={3} sx={{ p: 3, my: 2, overflow: "hidden" }}>
            {/* Header with Navigation */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title="Back to Homepage" arrow>
                  <IconButton
                    onClick={handleBackToHome}
                    sx={{
                      bgcolor: maroon.main,
                      color: "white",
                      width: 48,
                      height: 48,
                      "&:hover": {
                        bgcolor: maroon.dark,
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={maroon.dark}
                    sx={{
                      borderBottom: `2px solid ${gold.main}`,
                      paddingBottom: 1,
                      display: "inline-block",
                    }}
                  >
                    Department Evaluations
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    View and manage evaluations for your department
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={1}>
                <ActionButton
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={handleBackToHome}
                  sx={{
                    borderColor: maroon.main,
                    color: maroon.main,
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: maroon.dark,
                      backgroundColor: alpha(maroon.main, 0.1),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Homepage
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={fetchDepartmentEvaluations}
                  disabled={loading}
                  sx={{
                    background: `linear-gradient(45deg, ${maroon.main}, ${maroon.light})`,
                    color: "white",
                    fontWeight: 600,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${maroon.dark}, ${maroon.main})`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </ActionButton>
              </Stack>
            </Box>

            {/* Content */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  my: 6,
                  flexDirection: "column",
                }}
              >
                <CircularProgress sx={{ color: maroon.main, mb: 2 }} size={60} />
                <Typography variant="h6" color="text.secondary">
                  Loading evaluations...
                </Typography>
              </Box>
            ) : error ? (
              <Box
                sx={{
                  textAlign: "center",
                  my: 6,
                  py: 6,
                  backgroundColor: alpha("#ffebee", 0.8),
                  borderRadius: 2,
                  border: "1px solid #ffcdd2",
                }}
              >
                <AssessmentIcon
                  sx={{
                    fontSize: 60,
                    color: "error.main",
                    opacity: 0.5,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" color="error" gutterBottom>
                  {error}
                </Typography>
                <ActionButton
                  variant="contained"
                  onClick={fetchDepartmentEvaluations}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </ActionButton>
              </Box>
            ) : evaluations.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  my: 6,
                  py: 6,
                  backgroundColor: alpha(gold.light, 0.2),
                  borderRadius: 2,
                }}
              >
                <AssessmentIcon
                  sx={{
                    fontSize: 60,
                    color: "text.secondary",
                    opacity: 0.5,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No evaluations found for your department
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back later or contact your administrator
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  borderRadius: 2,
                  boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
                  backgroundColor: alpha("#ffffff", 0.8),
                  mb: 2,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>
                        <TableSortLabel>Evaluation ID</TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>
                        <TableSortLabel>Applicant Name</TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>
                        <TableSortLabel>Position</TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell>
                        <TableSortLabel>Status</TableSortLabel>
                      </StyledTableCell>
                      <StyledTableCell align="center">Action</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <StyledTableRow key={evaluation.evaluationId}>
                        <StyledTableCell>{evaluation.evaluationId}</StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {evaluation.applicantName}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>{evaluation.position}</StyledTableCell>
                        <StyledTableCell>
                          <StyledChip
                            label={evaluation.status}
                            color={getStatusChip(evaluation.status)}
                            variant="outlined"
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <ActionButton
                            variant="outlined"
                            size="small"
                            onClick={() => handleResend(evaluation.evaluationId)}
                            sx={{
                              borderColor: gold.main,
                              color: gold.dark,
                              "&:hover": {
                                borderColor: gold.dark,
                                backgroundColor: alpha(gold.main, 0.1),
                              },
                            }}
                          >
                            Resend
                          </ActionButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AnimatedPaper>
        </Grow>
      </MainLayout>
    </ThemeProvider>
  );
};

export default EvaluationsPage;