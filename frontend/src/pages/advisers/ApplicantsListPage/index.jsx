import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Stack,
  Avatar,
  alpha,
  useTheme,
  Button,
  Card,
  CardContent,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import AdviserNavigation from "../../../components/Navigation/AdviserNavigation";

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

const ViewButton = styled(Button)(({ theme }) => ({
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

const ApplicantsListPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const adviserId = localStorage.getItem("evaluatorId");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adviserId]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      if (!adviserId) {
        console.warn("No evaluatorId found in localStorage");
        setApplicants([]);
        setLoading(false);
        return;
      }
      
      console.log("Fetching assignments for adviser:", adviserId);
      
      // First, fetch assignments for this adviser
      const assignmentsRes = await fetch(`https://eteeap-foth.onrender.com/api/assignments/evaluator/${adviserId}`);
      
      console.log("Assignments response status:", assignmentsRes.status);
      
      if (!assignmentsRes.ok) {
        const errorText = await assignmentsRes.text();
        console.warn("Error fetching assignments:", assignmentsRes.status, errorText);
        setApplicants([]);
        setLoading(false);
        return;
      }
      
      const assignments = await assignmentsRes.json();
      console.log("Fetched assignments:", assignments);
      
      // Ensure assignments is an array
      if (!Array.isArray(assignments) || assignments.length === 0) {
        console.warn("No assignments found for this adviser");
        setApplicants([]);
        setLoading(false);
        return;
      }
      
      // Extract applicant IDs from assignments
      const assignedApplicantIds = assignments.map(assignment => {
        console.log("Assignment applicant:", assignment.applicant);
        return assignment.applicant?.applicantId;
      }).filter(Boolean);
      
      console.log("Assigned applicant IDs:", assignedApplicantIds);
      
      if (assignedApplicantIds.length === 0) {
        setApplicants([]);
        setLoading(false);
        return;
      }
      
      // Fetch all accepted applicants
      const applicantsRes = await fetch('https://eteeap-foth.onrender.com/api/accepted-applicants');
      const allApplicants = await applicantsRes.json();
      
      // Filter to only assigned applicants
      const assignedApplicants = allApplicants.filter(app => 
        assignedApplicantIds.includes(app.applicant?.applicantId)
      );

      // Get applicants that have graded accreditations
      let accreditedApplicants = [];

      if (assignedApplicantIds.length > 0) {
        const promises = assignedApplicantIds.map(id =>
          fetch(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${id}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        const results = await Promise.all(promises);
        
        accreditedApplicants = assignedApplicants.filter((app, idx) => {
          const resultIndex = assignedApplicantIds.indexOf(app.applicant?.applicantId);
          return results[resultIndex] && Array.isArray(results[resultIndex]) && results[resultIndex].length > 0;
        });
      }

      setApplicants(accreditedApplicants);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplicant = (applicant) => {
    navigate("/adviser/applicants/view-applicant", {
      state: {
        applicantId: applicant.applicant?.applicantId,
        courseId: applicant.finalCourse?.courseId,
      },
    });
  };

  return (
    <AdviserNavigation>
      <Box sx={{ p: 3 }}>
        {/* Back Navigation */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/adviser/homepage")}
          sx={{
            mb: 2,
            color: maroon.main,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(maroon.main, 0.08),
            },
          }}
        >
          Back to Dashboard
        </Button>

        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <PersonIcon sx={{ color: maroon.main, fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
            Accepted Applicants with Graded Records
          </Typography>
        </Stack>

        {/* Info Card */}
        <InfoCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <AssignmentIcon sx={{ color: gold.main, fontSize: 24 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                  Accredited Applicants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review applicant details and graded accreditations for all accepted applicants with records
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </InfoCard>

        {/* Main Content */}
        <Grow in={true} timeout={500}>
          <InfoCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AssignmentIcon sx={{ color: maroon.main }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Accredited Applicants ({applicants.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Applicants that already have graded subject records
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {loading ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>
                    Loading applicants...
                  </Typography>
                </Box>
              ) : applicants.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Applicant Name</StyledTableCell>
                      <StyledTableCell>Course</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Acceptance Date</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {applicants.map(app => (
                      <StyledTableRow key={app.acceptedApplicantId}>
                        <StyledTableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: maroon.main }}>
                              {app.applicant?.firstName?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>
                              {`${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`}
                            </Typography>
                          </Stack>
                        </StyledTableCell>
                        <StyledTableCell>{app.finalCourse?.courseName}</StyledTableCell>
                        <StyledTableCell>
                          <Chip
                            label={app.status}
                            color={
                              app.status === "ACCEPTED"
                                ? "success"
                                : app.status === "ENROLLED"
                                ? "info"
                                : "error"
                            }
                            variant="outlined"
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          {app.acceptanceDate
                            ? new Date(app.acceptanceDate).toLocaleDateString()
                            : "-"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <ViewButton
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewApplicant(app)}
                          >
                            View Details
                          </ViewButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ 
                  textAlign: "center", 
                  py: 6,
                  px: 3
                }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No accredited applicants yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded applicants will appear here once accreditation records are created.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </InfoCard>
        </Grow>
      </Box>
    </AdviserNavigation>
  );
};

export default ApplicantsListPage;