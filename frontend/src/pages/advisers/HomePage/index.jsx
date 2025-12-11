import React, { useEffect, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  alpha,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from "@mui/icons-material/Book";
import MainLayout from "../../../templates/MainLayout";

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
    backgroundColor: alpha(gold.light, 0.12),
  },
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.24),
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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': { display: 'none' },
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2),
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: alpha(maroon.main, 0.1),
  '&.Mui-expanded': {
    backgroundColor: alpha(maroon.main, 0.15),
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
  },
}));

const AdviserHomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const adviserId = localStorage.getItem("evaluatorId");
        console.log("Adviser ID from localStorage:", adviserId);
        
        if (!adviserId) {
          console.warn("No evaluatorId found in localStorage");
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // First, fetch assignments for this adviser
        const assignmentsUrl = `https://eteeap-foth.onrender.com/api/assignments/evaluator/${adviserId}`;
        console.log("Fetching assignments from:", assignmentsUrl);
        const assignmentsRes = await fetch(assignmentsUrl);
        
        console.log("Assignments API response status:", assignmentsRes.status);
        
        if (!assignmentsRes.ok) {
          const errorText = await assignmentsRes.text();
          console.warn("Error fetching assignments:", assignmentsRes.status, errorText);
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        const assignments = await assignmentsRes.json();
        console.log("Fetched assignments:", assignments);
        
        // Ensure assignments is an array
        if (!Array.isArray(assignments) || assignments.length === 0) {
          console.warn("No assignments found for this adviser");
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // Extract applicant IDs from assignments
        const assignedApplicantIds = assignments.map(assignment => assignment.applicant?.applicantId).filter(Boolean);
        console.log("Assigned applicant IDs:", assignedApplicantIds);
        
        if (assignedApplicantIds.length === 0) {
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // Fetch all accepted applicants
        const res = await fetch("https://eteeap-foth.onrender.com/api/accepted-applicants");
        const allApplicants = await res.json();
        console.log("All accepted applicants:", allApplicants.length);
        
        // Filter to only assigned applicants
        const assignedApplicants = allApplicants.filter(app => 
          assignedApplicantIds.includes(app.applicant?.applicantId)
        );
        console.log("Filtered assigned applicants:", assignedApplicants.length);

        const recordsData = {};

        if (assignedApplicantIds.length > 0) {
          const promises = assignedApplicantIds.map((id) =>
            fetch(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${id}/organized-clean`)
              .then((r) => (r.ok ? r.json() : {}))
              .catch(() => ({}))
          );
          const results = await Promise.all(promises);
          assignedApplicantIds.forEach((id, idx) => {
            const rec = results[idx];
            if (rec && Object.keys(rec).length > 0) {
              recordsData[id] = rec;
            }
          });
        }

        const accredited = assignedApplicants.filter((app) => recordsData[app.applicant?.applicantId]);
        console.log("Accredited applicants with records:", accredited.length);
        setApplicants(accredited);
        setRecordsMap(recordsData);
      } catch (err) {
        console.error("Error fetching adviser dashboard data:", err);
        setApplicants([]);
        setRecordsMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout userType="adviser" data="Adviser Portal">
      <Stack spacing={4} sx={{ width: "100%" }}>
        {/* Welcome Card */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.dark} 100%)`,
            color: "white",
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              Welcome to Your Adviser Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage and review applications and accreditations for all accepted students
            </Typography>
          </Stack>
        </Paper>

        {/* Data Sections */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Applicants with graded records */}
            <InfoCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#000', 0.08)}` }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon sx={{ color: maroon.main }} />
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

                {applicants.length > 0 ? (
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
                      {applicants.map((app) => (
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
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                backgroundColor: maroon.main,
                                '&:hover': { backgroundColor: maroon.dark },
                              }}
                              onClick={() => navigate("/adviser/applicants/view-applicant", {
                                state: {
                                  applicantId: app.applicant?.applicantId,
                                  courseId: app.finalCourse?.courseId,
                                },
                              })}
                            >
                              View Details
                            </Button>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6, mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No accredited applicants yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Graded applicants will appear once subject records are created.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </InfoCard>

            {/* Graded accreditations */}
            <Grow in={true} timeout={400}>
              <InfoCard>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <AssignmentIcon sx={{ color: gold.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Graded Accreditations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organized by applicant and semester
                      </Typography>
                    </Box>
                  </Stack>

                  {applicants.length > 0 ? (
                    applicants.map((applicant) => {
                      const applicantId = applicant.applicant?.applicantId;
                      const records = recordsMap[applicantId] || {};

                      return (
                        <StyledAccordion key={applicantId} defaultExpanded={false}>
                          <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                              <Avatar sx={{ bgcolor: maroon.main }}>
                                {applicant.applicant?.firstName?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                                  {`${applicant.applicant?.firstName || ""} ${applicant.applicant?.lastName || ""}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {applicant.finalCourse?.courseName}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${Object.values(records).flat().filter(r => r.status === 'APPROVED').length} / ${Object.values(records).flat().length} Approved`}
                                color={Object.values(records).flat().every(r => r.status === 'APPROVED') ? 'success' : 'warning'}
                                variant="outlined"
                                size="small"
                              />
                            </Stack>
                          </StyledAccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {Object.keys(records).map((semester) => (
                              <Box key={semester} sx={{ mb: 3, p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                  <BookIcon sx={{ color: maroon.main }} />
                                  <Box>
                                    <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                                      {semester}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {records[semester].length} subjects
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <StyledTableCell>Subject</StyledTableCell>
                                      <StyledTableCell>Grade</StyledTableCell>
                                      <StyledTableCell>Status</StyledTableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {records[semester].map((rec) => (
                                      <StyledTableRow key={rec.id}>
                                        <StyledTableCell>
                                          <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                              {rec.subject?.descriptiveTitle}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {rec.subject?.subjectCode}
                                            </Typography>
                                          </Box>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                          <Typography 
                                            variant="body2" 
                                            fontWeight={600}
                                            sx={{
                                              backgroundColor: alpha(gold.light, 0.3),
                                              padding: 1,
                                              borderRadius: 1,
                                              border: `1px solid ${alpha(gold.main, 0.5)}`,
                                              textAlign: 'center'
                                            }}
                                          >
                                            {rec.grade || "N/A"}
                                          </Typography>
                                        </StyledTableCell>
                                        <StyledTableCell>
                                          <Chip
                                            label={rec.status || "PENDING"}
                                            color={rec.status === 'APPROVED' ? 'success' : rec.status === 'REJECTED' ? 'error' : 'warning'}
                                            size="small"
                                            variant="outlined"
                                          />
                                        </StyledTableCell>
                                      </StyledTableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            ))}
                          </AccordionDetails>
                        </StyledAccordion>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.6, mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No graded accreditations yet.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </InfoCard>
            </Grow>
          </Stack>
        )}

        {/* Info Card */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(gold.light, 0.15),
            borderLeft: `4px solid ${gold.main}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <DashboardIcon sx={{ color: gold.main, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                About Your Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the navigation to access accepted applicants and their graded accreditations.
                You can view student profiles, documents, and course information for every accepted applicant with records.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </MainLayout>
  );
};

export default AdviserHomePage;
