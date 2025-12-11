import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Grow,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Autocomplete,
  Dialog,
  DialogContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from "axios";
import toast from "../../../utils/toast";

const API_BASE = 'https://eteeap-foth.onrender.com/api';
const EVALUATOR_API = 'https://eteeap-foth.onrender.com/api/evaluators';

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

// Styled components
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

const GradedAccreditation = ({ applicantId, curriculumId, onClose, isOpen }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advisers, setAdvisers] = useState([]);
  const [selectedAdviser, setSelectedAdviser] = useState(null);
  const [existingAssignment, setExistingAssignment] = useState(null);
  const [savingAdviser, setSavingAdviser] = useState(false);
  const saveTimers = useRef({});

  const flushTimers = () => {
    Object.values(saveTimers.current).forEach(clearTimeout);
    saveTimers.current = {};
  };

  // debounce save helper (also saves empty strings to allow clearing)
  const queueSave = (recId, semester, field, value) => {
    const key = `${recId}-${field}`;
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);

    setRecords(prev => ({
      ...prev,
      [semester]: prev[semester].map(r =>
        r.id === recId ? { ...r, [field]: value } : r
      )
    }));

    saveTimers.current[key] = setTimeout(async () => {
      const params = new URLSearchParams();
      params.append(field, value ?? "");
      try {
        await axios.put(
          `${API_BASE}/applicant-subject-records/${recId}?${params.toString()}`,
          null,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      } catch (err) {
        toast.error(`Failed to save ${field}.`);
      } finally {
        delete saveTimers.current[key];
      }
    }, 350);
  };

  useEffect(() => {
    return () => flushTimers();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      flushTimers();
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
      .then((res) => {
        setRecords(res.data);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [applicantId, isOpen]);

  // Fetch existing assignment for this applicant (only on mount or applicantId change)
  useEffect(() => {
    if (applicantId && advisers.length > 0 && isOpen) {
      axios
        .get(`${API_BASE}/assignments/applicant/${applicantId}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const assignment = res.data[0]; // Get the first/latest assignment
            setExistingAssignment(assignment);
            // Find and set the assigned adviser only on initial load
            const assignedAdviser = advisers.find(
              (adv) => adv.evaluatorId === assignment.evaluator?.evaluatorId
            );
            if (assignedAdviser) {
              setSelectedAdviser(assignedAdviser);
            }
          } else {
            // No existing assignment
            setExistingAssignment(null);
            setSelectedAdviser(null);
          }
        })
        .catch((err) => {
          console.log("No existing assignment found or error:", err);
          setExistingAssignment(null);
          setSelectedAdviser(null);
        });
    }
  }, [applicantId, advisers, isOpen]);

  // Fetch all evaluators for adviser selection
  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const res = await fetch(`${EVALUATOR_API}`);
        const data = await res.json();
        console.log("Fetched advisers:", data);
        setAdvisers(data);
      } catch (error) {
        console.error("Error fetching evaluators:", error);
        setAdvisers([]);
      }
    };
    fetchAdvisers();
  }, []);

  // Handle adviser selection and save to backend
  const handleAdviserChange = async (event, newValue) => {
    setSelectedAdviser(newValue);
    
    if (!newValue || !applicantId) return;

    setSavingAdviser(true);
    try {
      if (existingAssignment) {
        // Update existing assignment - backend only accepts notes in PUT
        const updateRes = await axios.put(`${API_BASE}/assignments/${existingAssignment.assignmentId}`, {
          notes: existingAssignment.notes || ""
        });
        console.log("Assignment updated successfully:", updateRes.data);
        toast.success("Adviser assignment updated successfully.");
        // Update the existing assignment state without re-selecting
        setExistingAssignment(updateRes.data);
      } else {
        // Create new assignment
        const createRes = await axios.post(`${API_BASE}/assignments`, {
          applicantId: applicantId,
          evaluatorId: newValue.evaluatorId,
          notes: ""
        });
        console.log("Assignment created successfully:", createRes.data);
        toast.success("Adviser assigned successfully.");
        // Set the newly created assignment
        if (createRes.data && createRes.data.assignmentId) {
          setExistingAssignment(createRes.data);
        }
      }
    } catch (error) {
      console.error("Error saving adviser assignment:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to save adviser assignment. Please try again.");
      // Reset selected adviser on error
      setSelectedAdviser(null);
    } finally {
      setSavingAdviser(false);
    }
  };

  // Handle delete/clear adviser assignment
  const handleDeleteAssignment = async () => {
    if (!existingAssignment) {
      toast.info("No assignment to delete");
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this adviser assignment?")) {
      return;
    }

    setSavingAdviser(true);
    try {
      await axios.delete(`${API_BASE}/assignments/${existingAssignment.assignmentId}`);
      console.log("Assignment deleted successfully");
      toast.success("Adviser assignment deleted successfully.");
      
      // Clear the selection
      setSelectedAdviser(null);
      setExistingAssignment(null);
    } catch (error) {
      console.error("Error deleting adviser assignment:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to delete adviser assignment. Please try again.");
    } finally {
      setSavingAdviser(false);
    }
  };

  // Accreditation function (bulk create records from curriculum)
  const handleCreateCurriculumRecord = async () => {
    if (!applicantId || !curriculumId) return;
    try {
      await axios.post(
        `${API_BASE}/applicants/${applicantId}/create-curriculum-record?curriculumId=${curriculumId}`
      );
      // Refresh records
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => setRecords(res.data));
      toast.success("Curriculum records created successfully.");
    } catch (err) {
      toast.error("Failed to create curriculum records.");
    }
  };


  // Toggle lock/unlock status via PUT; unlocking sets status to PENDING, locking sets to APPROVED
  const handleToggleLock = async (rec) => {
    const nextStatus = rec.status === "APPROVED" ? "PENDING" : "APPROVED";

    try {
      const params = new URLSearchParams();
      params.append('status', nextStatus);

      await axios.put(
        `${API_BASE}/applicant-subject-records/${rec.id}?${params.toString()}`,
        null,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const refreshed = await axios.get(
        `${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`
      );
      setRecords(refreshed.data);
    } catch (err) {
      console.error("Failed to toggle lock:", err);
      toast.error("Failed to toggle lock status.");
    }
  };

  const modalContent = (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* Header with Back Button */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: maroon.main,
            '&:hover': {
              backgroundColor: alpha(maroon.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <GradeIcon sx={{ color: maroon.main, fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
          Graded Accreditation Record
        </Typography>
      </Stack>

      {/* Compact Header Section */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#fff',
          borderRadius: 1.5,
          p: 1.5,
          mb: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
        >
          {/* Left Side: Title + Description */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SchoolIcon sx={{ color: gold.main, fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
                Subject Evaluation & Grading
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review and grade individual subjects for accreditation
              </Typography>
            </Box>
          </Stack>

          {/* Right Side: Adviser Selection */}
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ color: maroon.main, fontSize: 20 }} />
            <Autocomplete
              options={advisers}
              value={selectedAdviser}
              onChange={handleAdviserChange}
              getOptionLabel={(option) =>
                option?.firstName
                  ? `${option.firstName} ${option.lastName}`
                  : option?.name || option?.email?.split("@")[0] || ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Adviser"
                  size="small"
                  sx={{ 
                    width: 200,
                    '& .MuiInputBase-root': {
                      fontSize: 13,
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {savingAdviser ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              disabled={savingAdviser}
              noOptionsText="No evaluators found"
              sx={{
                '& .MuiAutocomplete-listbox': {
                  '& .MuiAutocomplete-option': {
                    fontSize: 13,
                    py: 0.75,
                  },
                },
              }}
            />

            {/* Delete Button */}
            {selectedAdviser && existingAssignment && (
              <Tooltip title="Delete assignment">
                <IconButton
                  size="small"
                  onClick={handleDeleteAssignment}
                  disabled={savingAdviser}
                  sx={{
                    color: '#d32f2f',
                    '&:hover': { bgcolor: 'rgba(211,47,47,0.1)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>
      
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={32} />
          <Typography variant="body2" sx={{ mt: 1.5 }}>Loading records...</Typography>
        </Box>
      ) : Object.keys(records).length > 0 ? (
        <Grow in={true} timeout={500}>
          <Box>
            {Object.keys(records).map((semester, index) => (
              <StyledAccordion key={semester} defaultExpanded={index === 0}>
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}
                  sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                    <BookIcon sx={{ color: maroon.main, fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600" color={maroon.dark}>
                        {semester}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {records[semester].length} subjects
                      </Typography>
                    </Box>
                    <Chip
                      label={`${records[semester].filter(r => r.status === 'APPROVED').length} / ${records[semester].length} Approved`}
                      color={records[semester].every(r => r.status === 'APPROVED') ? 'success' : 'warning'}
                      size="small"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </Stack>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ minWidth: 200 }}>Subject</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 80 }}>Grade</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 180 }}>Process of Accreditation</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 180 }}>Substantive Basis</StyledTableCell>
                        <StyledTableCell align="center" sx={{ minWidth: 100 }}>Status</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records[semester].map((rec) => {
                        const isLocked = rec.status === "APPROVED";
                        
                        return (
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
                            
                            {/* Grade Cell */}
                            <StyledTableCell>
                              {!isLocked ? (
                                <TextField
                                  size="small"
                                  value={rec.grade || ""}
                                  onChange={(e) => queueSave(rec.id, semester, "grade", e.target.value)}
                                  fullWidth
                                  placeholder="Grade"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 13,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  fontWeight={rec.grade ? 600 : 400}
                                  color={rec.grade ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    fontSize: 13,
                                  }}
                                >
                                  {rec.grade || "Not graded"}
                                </Typography>
                              )}
                            </StyledTableCell>
                            
                            {/* Process of Accreditation Cell */}
                            <StyledTableCell>
                              {!isLocked ? (
                                <TextField
                                  size="small"
                                  value={rec.processOfAccreditation || ""}
                                  onChange={(e) => queueSave(rec.id, semester, "processOfAccreditation", e.target.value)}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter process"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 12,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography 
                                  variant="caption"
                                  color={rec.processOfAccreditation ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    display: 'block',
                                  }}
                                >
                                  {rec.processOfAccreditation || "Not specified"}
                                </Typography>
                              )}
                            </StyledTableCell>
                            
                            {/* Substantive Basis Cell */}
                            <StyledTableCell>
                              {!isLocked ? (
                                <TextField
                                  size="small"
                                  value={rec.substantiveBasis || ""}
                                  onChange={(e) => queueSave(rec.id, semester, "substantiveBasis", e.target.value)}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter basis"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 12,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography 
                                  variant="caption"
                                  color={rec.substantiveBasis ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    display: 'block',
                                  }}
                                >
                                  {rec.substantiveBasis || "Not specified"}
                                </Typography>
                              )}
                            </StyledTableCell>
                            
                            {/* Actions Cell */}
                            <StyledTableCell align="center">
                              <Tooltip title={isLocked ? "Unlock" : "Lock"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleLock(rec)}
                                  sx={{
                                    color: isLocked ? '#ff9800' : '#4caf50',
                                    backgroundColor: alpha(isLocked ? '#ff9800' : '#4caf50', 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(isLocked ? '#ff9800' : '#4caf50', 0.2),
                                    }
                                  }}
                                >
                                  {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </StyledAccordion>
            ))}
          </Box>
        </Grow>
      ) : (
        <InfoCard>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No accreditation records found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No subject records have been created for this applicant yet.
            </Typography>
          </CardContent>
        </InfoCard>
      )}
    </Box>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          borderRadius: 0,
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', height: '100vh' }}>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default GradedAccreditation;