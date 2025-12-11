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
  Card,
  CardContent,
  Grow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import AdviserNavigation from "../../../components/Navigation/AdviserNavigation";

const API_BASE = 'https://eteeap-foth.onrender.com/api';

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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
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

const AdviserGradedAccreditationsPage = () => {
  const adviserId = localStorage.getItem("evaluatorId");
  const [applicants, setApplicants] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdviserApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adviserId]);

  const fetchAdviserApplicants = async () => {
    setLoading(true);
    try {
      if (!adviserId) {
        console.warn("No evaluatorId found in localStorage");
        setApplicants([]);
        setRecordsMap({});
        setLoading(false);
        return;
      }
      
      console.log("Fetching assignments for adviser:", adviserId);
      
      // First, fetch assignments for this adviser
      const assignmentsRes = await fetch(`${API_BASE}/assignments/evaluator/${adviserId}`);
      
      console.log("Assignments response status:", assignmentsRes.status);
      
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
      const assignedApplicantIds = assignments.map(assignment => {
        console.log("Assignment applicant:", assignment.applicant);
        return assignment.applicant?.applicantId;
      }).filter(Boolean);
      
      console.log("Assigned applicant IDs:", assignedApplicantIds);
      
      if (assignedApplicantIds.length === 0) {
        setApplicants([]);
        setRecordsMap({});
        setLoading(false);
        return;
      }
      
      // Fetch all accepted applicants
      const appRes = await fetch('https://eteeap-foth.onrender.com/api/accepted-applicants');
      const allApplicants = await appRes.json();

      // Filter to only assigned applicants
      const adviserApplicants = allApplicants.filter(app => 
        assignedApplicantIds.includes(app.applicant?.applicantId)
      );

      // Fetch graded records for each assigned applicant
      const recordsData = {};

      for (const applicantId of assignedApplicantIds) {
        try {
          const recordsRes = await fetch(
            `${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`
          );
          if (recordsRes.ok) {
            const records = await recordsRes.json();
            if (Object.keys(records).length > 0) {
              recordsData[applicantId] = records;
            }
          }
        } catch (err) {
          console.error(`Error fetching records for applicant ${applicantId}:`, err);
        }
      }

      // Filter to only applicants with graded records
      const applicantsWithRecords = adviserApplicants.filter(app => 
        recordsData[app.applicant?.applicantId]
      );

      setApplicants(applicantsWithRecords);
      setRecordsMap(recordsData);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChipColor = (status) => {
    const statusMap = {
      APPROVED: "success",
      PENDING: "warning",
      REJECTED: "error",
    };
    return statusMap[status] || "default";
  };

  if (loading) {
    return (
      <AdviserNavigation>
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading graded accreditations...</Typography>
        </Box>
      </AdviserNavigation>
    );
  }

  return (
    <AdviserNavigation>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <GradeIcon sx={{ color: maroon.main, fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
            Graded Accreditations (All Applicants)
          </Typography>
        </Stack>

        {/* Info Card */}
        <InfoCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <AssignmentIcon sx={{ color: gold.main, fontSize: 24 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                  Subject Grades Review
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review graded subjects for all accepted applicants with records
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </InfoCard>

        {/* Applicants with Graded Records */}
        <Grow in={true} timeout={500}>
          <Box>
            {applicants.length > 0 ? (
              applicants.map((applicant) => {
                const applicantId = applicant.applicant?.applicantId;
                const records = recordsMap[applicantId] || {};

                return (
                  <StyledAccordion key={applicantId} defaultExpanded={false}>
                    <StyledAccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}
                    >
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
                                      color={getStatusChipColor(rec.status)}
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
              <InfoCard>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                  <GradeIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No graded accreditations found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded accreditations will appear here once evaluators complete the grading process.
                  </Typography>
                </CardContent>
              </InfoCard>
            )}
          </Box>
        </Grow>
      </Box>
    </AdviserNavigation>
  );
};

export default AdviserGradedAccreditationsPage;
