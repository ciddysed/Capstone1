import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from "@mui/icons-material/Book";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import MainLayout from "../../../templates/MainLayout";
import login2Bg from '../../../assets/login2-bg.png';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  Container,
  IconButton,
  Tooltip
} from "@mui/material";

// --- Design Tokens & Styled Components ---

const maroon = {
  light: "#9e4751",
  main: "#6A0000",
  dark: "#3d0000",
  contrastText: "#FFFFFF",
};

const gold = {
  light: "#ffe57f",
  main: "#FFC72C",
  dark: "#c79a00",
  contrastText: "#000000",
};

// Modern card with glass-like header or clean white look
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid rgba(0,0,0,0.05)',
  overflow: 'hidden',
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  }
}));

const CardHeaderBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: '#fff',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px 24px',
  fontSize: 14,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  '&.MuiTableCell-head': {
    backgroundColor: alpha(maroon.main, 0.04),
    color: maroon.main,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: 12,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(maroon.main, 0.02),
  },
}));

// A cleaner accordion that looks like a detached record
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  background: '#fff',
  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  borderRadius: '12px !important',
  boxShadow: 'none',
  marginBottom: theme.spacing(2),
  '&:before': { display: 'none' },
  '&:first-of-type': { borderRadius: '12px !important' },
  '&.Mui-expanded': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    borderColor: alpha(maroon.main, 0.2),
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  borderRadius: 12,
  minHeight: 72,
  '&.Mui-expanded': {
    minHeight: 72,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    backgroundColor: alpha(maroon.main, 0.02),
  },
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
    alignItems: 'center',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color = theme.palette.grey[500];
  let bg = theme.palette.grey[100];
  
  if (status === 'APPROVED' || status === 'ACCEPTED') {
    color = theme.palette.success.main;
    bg = alpha(theme.palette.success.light, 0.15);
  } else if (status === 'PENDING') {
    color = theme.palette.warning.dark;
    bg = alpha(theme.palette.warning.light, 0.15);
  } else if (status === 'REJECTED' || status === 'FAILED') {
    color = theme.palette.error.main;
    bg = alpha(theme.palette.error.light, 0.15);
  } else if (status === 'ENROLLED') {
    color = theme.palette.info.main;
    bg = alpha(theme.palette.info.light, 0.15);
  }

  return {
    fontWeight: 600,
    color: color,
    backgroundColor: bg,
    border: 'none',
    borderRadius: 8,
  };
});

// Helper functions to avoid nested ternaries
const getStatusBackgroundColor = (status, alphaValue = 0.1) => {
  if (status === "APPROVED") return alpha('#4caf50', alphaValue);
  if (status === "FOR_ENROLLMENT") return alpha('#2196f3', alphaValue);
  return alpha('#ff9800', alphaValue);
};

const getStatusTextColor = (status) => {
  if (status === "APPROVED") return '#2e7d32';
  if (status === "FOR_ENROLLMENT") return '#1565c0';
  return '#e65100';
};

// Component for rendering a single record row to reduce nesting
const RecordRow = ({ rec, applicantId, semester, editRow, editFields, handleEditFieldChange, handleSaveEdit, handleCancelEdit, handleEditClick, handleStatusChange }) => {
  const isPending = rec.status === "PENDING";
  const isEditing = !!editRow[rec.id];

  return (
    <StyledTableRow key={rec.id} sx={{ bgcolor: '#fff' }}>
      <StyledTableCell>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {rec.subject?.descriptiveTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', mt: 0.5, px: 1, py: 0.2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          {rec.subject?.subjectCode}
        </Typography>
      </StyledTableCell>
      
      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            value={editFields[rec.id]?.grade ?? ""}
            onChange={e => handleEditFieldChange(rec.id, "grade", e.target.value)}
            fullWidth
            placeholder="1.0"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
          />
        ) : (
          <Typography variant="body2" fontWeight="bold" color={rec.grade ? maroon.main : "text.disabled"}>
            {rec.grade || "—"}
          </Typography>
        )}
      </StyledTableCell>
      
      <StyledTableCell>
        {isEditing ? (
          <TextField
            select
            size="small"
            value={editFields[rec.id]?.processOfAccreditation ?? ""}
            onChange={e => handleEditFieldChange(rec.id, "processOfAccreditation", e.target.value)}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            <MenuItem value="TOR Accreditation">TOR Accreditation</MenuItem>
            <MenuItem value="Portfolio Review">Portfolio Review</MenuItem>
            <MenuItem value="Remediation Class">Remediation Class</MenuItem>
            <MenuItem value="Home Reading Report">Home Reading Report</MenuItem>
            <MenuItem value="One-on-One Tutorial">One-on-One Tutorial</MenuItem>
            <MenuItem value="Problem Solving">Problem Solving</MenuItem>
            <MenuItem value="Job Description Review">Job Description Review</MenuItem>
          </TextField>
        ) : (
          <Typography variant="body2">
            {rec.processOfAccreditation || "—"}
          </Typography>
        )}
      </StyledTableCell>
      
      <StyledTableCell>
        {isEditing ? (
          <TextField
            size="small"
            value={editFields[rec.id]?.substantiveBasis ?? ""}
            onChange={e => handleEditFieldChange(rec.id, "substantiveBasis", e.target.value)}
            fullWidth
            multiline
            maxRows={3}
            placeholder="Basis..."
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff', fontSize: 13 } }}
          />
        ) : (
          <Typography variant="body2" sx={{ 
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            color: rec.substantiveBasis ? 'text.primary' : 'text.disabled'
          }}>
            {rec.substantiveBasis || "No basis provided"}
          </Typography>
        )}
      </StyledTableCell>

      <StyledTableCell align="center">
        <Tooltip
          title={isPending ? "" : "Change back to PENDING to update this record"}
          placement="top"
          arrow
        >
          <TextField
            select
            size="small"
            value={rec.status || "PENDING"}
            onChange={(e) => handleStatusChange(rec, e.target.value, semester, applicantId)}
            sx={{
              minWidth: 130,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: getStatusBackgroundColor(rec.status, 0.1),
                color: getStatusTextColor(rec.status),
                '&:hover': {
                  backgroundColor: getStatusBackgroundColor(rec.status, 0.2),
                }
              }
            }}
          >
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="APPROVED">APPROVED</MenuItem>
            <MenuItem value="FOR_ENROLLMENT">FOR_ENROLLMENT</MenuItem>
          </TextField>
        </Tooltip>
      </StyledTableCell>

      <StyledTableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          {isPending && (
            isEditing ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleSaveEdit(rec, semester, applicantId)}
                  sx={{ color: 'success.main', bgcolor: alpha('#2e7d32', 0.1) }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleCancelEdit(rec.id)}
                  sx={{ color: 'error.main', bgcolor: alpha('#d32f2f', 0.1) }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton
                size="small"
                onClick={() => handleEditClick(rec)}
                sx={{
                  bgcolor: alpha(maroon.main, 0.1),
                  color: maroon.main,
                  '&:hover': { bgcolor: maroon.main, color: '#fff' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )
          )}
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  );
};

RecordRow.propTypes = {
  rec: PropTypes.object.isRequired,
  applicantId: PropTypes.number.isRequired,
  semester: PropTypes.string.isRequired,
  editRow: PropTypes.object.isRequired,
  editFields: PropTypes.object.isRequired,
  handleEditFieldChange: PropTypes.func.isRequired,
  handleSaveEdit: PropTypes.func.isRequired,
  handleCancelEdit: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
};

// --- Main Component ---

const AdviserHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [editRow, setEditRow] = useState({}); // { [recordId]: true }
  const [editFields, setEditFields] = useState({}); // { [recordId]: { grade, processOfAccreditation, substantiveBasis } }
  const [adviserName, setAdviserName] = useState("");

  useEffect(() => {
    // Fetch adviser profile for name
    const adviserId = localStorage.getItem("evaluatorId");
    if (adviserId) {
      fetch(`https://eteeap-foth.onrender.com/api/evaluators/${adviserId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && (data.name || (data.firstName && data.lastName))) {
            setAdviserName(data.name || `${data.firstName} ${data.lastName}`);
          }
        });
    }
  }, []);

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
          // Helper to fetch records for a single ID
          const fetchRecordsForId = async (id) => {
            try {
              const response = await fetch(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${id}/organized-clean`);
              if (response.ok) {
                return await response.json();
              }
              return {};
            } catch {
              return {};
            }
          };

          const promises = assignedApplicantIds.map(fetchRecordsForId);
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

  const handleEditClick = (rec) => {
    setEditRow((prev) => ({ ...prev, [rec.id]: true }));
    setEditFields((prev) => ({
      ...prev,
      [rec.id]: {
        grade: rec.grade || "",
        processOfAccreditation: rec.processOfAccreditation || "",
        substantiveBasis: rec.substantiveBasis || "",
      },
    }));
  };

  const handleEditFieldChange = (recId, field, value) => {
    setEditFields((prev) => ({
      ...prev,
      [recId]: {
        ...prev[recId],
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async (rec, semester, applicantId) => {
    const updated = { ...editFields[rec.id], status: "APPROVED" }; // Set status to APPROVED
    try {
      const params = new URLSearchParams();
      Object.entries(updated).forEach(([key, value]) => {
        params.append(key, value ?? "");
      });
      await fetch(
        `https://eteeap-foth.onrender.com/api/applicant-subject-records/${rec.id}?${params.toString()}`,
        { method: "PUT", headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      // Update local state after save
      setRecordsMap((prev) => {
        const newMap = { ...prev };
        if (newMap[applicantId]?.[semester]) {
          newMap[applicantId][semester] = newMap[applicantId][semester].map((r) =>
            r.id === rec.id ? { ...r, ...updated } : r
          );
        }
        return newMap;
      });
      setEditRow((prev) => ({ ...prev, [rec.id]: false }));
    } catch (err) {
      console.error('Failed to save changes:', err);
      globalThis.alert("Failed to save changes.");
    }
  };

  // Add cancel edit
  const handleCancelEdit = (recId) => {
    setEditRow((prev) => ({ ...prev, [recId]: false }));
  };

  // Handle status change via PUT
  const handleStatusChange = async (rec, newStatus, semester, applicantId) => {
    try {
      const params = new URLSearchParams();
      params.append('status', newStatus);

      await fetch(
        `https://eteeap-foth.onrender.com/api/applicant-subject-records/${rec.id}?${params.toString()}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      // Update local state after save
      setRecordsMap((prev) => {
        const newMap = { ...prev };
        if (newMap[applicantId]?.[semester]) {
          newMap[applicantId][semester] = newMap[applicantId][semester].map((r) =>
            r.id === rec.id ? { ...r, status: newStatus } : r
          );
        }
        return newMap;
      });
    } catch (err) {
      console.error('Failed to change status:', err);
      globalThis.alert("Failed to change status.");
    }
  };

  return (
    <MainLayout userType="adviser" data={adviserName || "Adviser Portal"} adviserName={adviserName}>
      <Container maxWidth="xl" sx={{ pt: 1, pb: 8 }}>
        <Stack spacing={4}>
          
          {/* Welcome Banner */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              backgroundImage: `linear-gradient(to right, ${alpha(maroon.main, 0.95)}, ${alpha(maroon.dark, 0.85)}), url(${login2Bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: "white",
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 180,
              boxShadow: '0 10px 30px rgba(106, 0, 0, 0.2)',
            }}
          >
            <Stack spacing={1} maxWidth="md">
              <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em' }}>
                {adviserName ? `Welcome, ${adviserName.split(' ')[0]}` : "Welcome to Your Dashboard"}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400 }}>
                Manage student applications, review subject accreditations, and track progress all in one place.
              </Typography>
            </Stack>
          </Paper>

          {/* Quick Info / Help Box */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(gold.light, 0.2),
              border: `1px solid ${alpha(gold.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
             <DashboardIcon sx={{ color: gold.dark }} />
             <Typography variant="body2" color="text.primary">
                <b>Dashboard Guide:</b> View student profiles below. Use the accreditation section to assign grades and bases.
             </Typography>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress sx={{ color: maroon.main }} thickness={4} />
            </Box>
          ) : (
            <ModernCard>
                {/* Unified Header */}
                <CardHeaderBox>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: alpha(maroon.main, 0.1), color: maroon.main }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        Assigned Students
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        List of accepted applicants under your supervision ({applicants.length}) — expand each student to manage their grading workspace
                      </Typography>
                    </Box>
                  </Stack>
                </CardHeaderBox>

                <CardContent sx={{ p: applicants.length > 0 ? 2 : 0 }}>
                  {applicants.length > 0 ? (
                    applicants.map((applicant) => {
                      const applicantId = applicant.applicant?.applicantId;
                      const records = recordsMap[applicantId] || {};
                      const totalRecords = Object.values(records).flat().length;
                      const approvedRecords = Object.values(records).flat().filter(r => r.status === 'APPROVED').length;
                      const progress = totalRecords > 0 ? (approvedRecords / totalRecords) * 100 : 0;

                      return (
                        <StyledAccordion key={applicantId} defaultExpanded={false}>
                          <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ width: '100%', pr: 1 }}>

                              {/* Avatar + Name + Program */}
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                <Avatar sx={{ bgcolor: maroon.main, width: 44, height: 44, fontWeight: 'bold', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                  {applicant.applicant?.firstName?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                    color={maroon.dark}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedApplicant({
                                        applicantId: applicant.applicant?.applicantId,
                                        courseId: applicant.finalCourse?.courseId,
                                      });
                                      setDetailsOpen(true);
                                    }}
                                    sx={{
                                      cursor: 'pointer',
                                      display: 'inline',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                        color: maroon.main,
                                      },
                                    }}
                                  >
                                    {`${applicant.applicant?.firstName || ""} ${applicant.applicant?.lastName || ""}`}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {applicant.finalCourse?.courseName}
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Status + Accepted Date */}
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>Accepted On</Typography>
                                  <Typography variant="body2" fontWeight={500} color="text.primary">
                                    {applicant.acceptanceDate
                                      ? new Date(applicant.acceptanceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                      : "—"}
                                  </Typography>
                                </Box>
                                <StatusChip label={applicant.status} size="small" status={applicant.status} />
                              </Stack>

                              {/* Progress */}
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}>Progress</Typography>
                                  <Typography variant="subtitle2" fontWeight="bold" color={maroon.main}>
                                    {approvedRecords} / {totalRecords}
                                  </Typography>
                                </Box>
                                <CircularProgress
                                  variant="determinate"
                                  value={progress}
                                  size={38}
                                  thickness={5}
                                  sx={{ color: progress === 100 ? 'success.main' : maroon.main, opacity: 0.85 }}
                                />
                              </Stack>

                            </Stack>
                          </StyledAccordionSummary>

                          {/* Grading Workspace — inline inside accordion */}
                          <AccordionDetails sx={{ p: 0, bgcolor: '#fafafa' }}>
                            {/* Grading sub-header */}
                            <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.08)}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: gold.main, color: '#000', width: 28, height: 28 }}>
                                <AssignmentIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Typography variant="subtitle2" fontWeight={700} color={maroon.dark}>
                                Grading Workspace
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                — Review subject allocations and assign grades for each semester
                              </Typography>
                            </Box>

                            {Object.keys(records).length > 0 ? (
                              Object.keys(records).map((semester) => (
                                <Box key={semester} sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <BookIcon fontSize="small" sx={{ color: maroon.light }} />
                                    <Typography variant="subtitle1" fontWeight="bold" color={maroon.dark}>
                                      {semester}
                                    </Typography>
                                    <Chip label={`${records[semester].length} Subjects`} size="small" sx={{ height: 20, fontSize: 10 }} />
                                  </Stack>

                                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <StyledTableCell sx={{ width: '30%' }}>Subject</StyledTableCell>
                                          <StyledTableCell sx={{ width: '10%' }}>Grade</StyledTableCell>
                                          <StyledTableCell sx={{ width: '20%' }}>Accreditation Process</StyledTableCell>
                                          <StyledTableCell sx={{ width: '20%' }}>Substantive Basis</StyledTableCell>
                                          <StyledTableCell sx={{ width: '12%' }} align="center">Status</StyledTableCell>
                                          <StyledTableCell sx={{ width: '8%' }} align="center">Action</StyledTableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {records[semester].map((rec) => (
                                          <RecordRow
                                            key={rec.id}
                                            rec={rec}
                                            applicantId={applicantId}
                                            semester={semester}
                                            editRow={editRow}
                                            editFields={editFields}
                                            handleEditFieldChange={handleEditFieldChange}
                                            handleSaveEdit={handleSaveEdit}
                                            handleCancelEdit={handleCancelEdit}
                                            handleEditClick={handleEditClick}
                                            handleStatusChange={handleStatusChange}
                                          />
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Paper>
                                </Box>
                              ))
                            ) : (
                              <Box sx={{ textAlign: 'center', py: 4 }}>
                                <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.2, mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">No grading records found for this student.</Typography>
                              </Box>
                            )}
                          </AccordionDetails>
                        </StyledAccordion>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No assigned students found
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </ModernCard>
          )}
        </Stack>
      </Container>

      {/* Applicant Details Modal */}
      <ApplicantDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        applicantId={selectedApplicant?.applicantId}
        courseId={selectedApplicant?.courseId}
      />
    </MainLayout>
  );
};

export default AdviserHomePage;