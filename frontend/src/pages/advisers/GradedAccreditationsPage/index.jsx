import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import { API_BASE } from '../../../config.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import AdviserNavigation from "../../../components/Navigation/AdviserNavigation";
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
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

const maroon = { main: '#800000', dark: '#4B0000' };
const gold = { main: '#FFD700', light: '#FFF8DC' };

// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));
const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  minHeight: 48,
  '&.Mui-expanded': { minHeight: 48 },
  '& .MuiAccordionSummary-content': { alignItems: 'center' },
}));
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  fontSize: 15,
  backgroundColor: theme.palette.background.default,
}));
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// InfoCard fallback (simple Card wrapper)
const InfoCard = ({ children, sx }) => (
  <Card sx={{ borderRadius: 2, boxShadow: 2, ...sx }}>{children}</Card>
);



// Helper to sort and deduplicate subjects in each semester, using applicantId and subjectId for uniqueness
const sortAndDeduplicateSemesterSubjects = (data, applicantId) => {
  if (!data || typeof data !== 'object') return data;
  const sorted = {};
  Object.keys(data).forEach((semester) => {
    sorted[semester] = data[semester];
  });
  return sorted;
};

const AdviserGradedAccreditationsPage = () => {
      // Track which record is being edited: { [recordId]: true }
      const [editingRecord, setEditingRecord] = useState({});
    // Save grade for a subject record
    const handleGradeChange = async (recId, semester, value, applicantId) => {
      try {
        await axios.put(
          `${API_BASE}/applicant-subject-records/${recId}?grade=${encodeURIComponent(value)}`,
          null,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        // Refetch records for this applicant to update UI
        const refreshed = await fetch(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`);
        if (refreshed.ok) {
          const newRecords = await refreshed.json();
          setRecordsMap((prev) => ({ ...prev, [applicantId]: newRecords }));
        }
      } catch (err) {
        alert('Failed to save grade.');
      }
    };
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
                // Deduplicate and sort records per semester using applicantId for uniqueness
                const recordsRaw = recordsMap[applicantId] || {};
                const records = sortAndDeduplicateSemesterSubjects(recordsRaw, applicantId);

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
                        {/* Deduplicate across all semesters for this applicant */}
                        {(() => {
                          const allRecords = Object.values(records).flat();
                          const seen = new Set();
                          const uniqueRecords = allRecords.filter((rec) => {
                            const key = rec.subject?.subjectId || rec.subject?.subjectCode || rec.subject?.descriptiveTitle || rec.id;
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                          });
                          const approvedCount = uniqueRecords.filter(r => r.status === 'APPROVED').length;
                          const totalCount = uniqueRecords.length;
                          return (
                            <Chip
                              label={`${approvedCount} / ${totalCount} Approved`}
                              color={uniqueRecords.length > 0 && approvedCount === totalCount ? 'success' : 'warning'}
                              variant="outlined"
                              size="small"
                            />
                          );
                        })()}
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
                              {records[semester].map((rec, idx) => {
                                const rowKey = rec.id || `${rec.subject?.subjectId || ''}-${rec.subject?.subjectCode || ''}-${semester}-${idx}`;
                                return (
                                  <StyledTableRow key={rowKey}>
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
                                      {(
                                        rec.grade === undefined ||
                                        rec.grade === null ||
                                        rec.grade === "" ||
                                        (typeof rec.grade === "string" && rec.grade.trim().toLowerCase() === "n/a")
                                      ) ? (
                                        editingRecord[rowKey] ? (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <TextField
                                              size="small"
                                              value={rec.grade || ''}
                                              onChange={e => handleGradeChange(rec.id, semester, e.target.value, applicantId)}
                                              placeholder="Input grade"
                                              sx={{ width: 90, mr: 1 }}
                                              autoFocus
                                              onBlur={() => setEditingRecord(prev => ({ ...prev, [rowKey]: false }))}
                                            />
                                            <Tooltip title="Save by clicking outside the box">
                                              <span style={{ color: gold.main, fontSize: 12, marginLeft: 4 }}>*editing*</span>
                                            </Tooltip>
                                          </Box>
                                        ) : (
                                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Tooltip title="Click to input grade">
                                              <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => setEditingRecord(prev => ({ ...prev, [rowKey]: true }))}
                                                sx={{ ml: 1 }}
                                                aria-label="Edit Grade"
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                              No grade yet
                                            </Typography>
                                          </Box>
                                        )
                                      ) : (
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
                                          {rec.grade}
                                        </Typography>
                                      )}
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
                                );
                              })}
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