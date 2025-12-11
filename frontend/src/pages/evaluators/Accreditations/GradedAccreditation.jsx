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

const GradedAccreditation = ({ applicantId, curriculumId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advisers, setAdvisers] = useState([]);
  const [selectedAdviser, setSelectedAdviser] = useState(null);
  const [existingAssignment, setExistingAssignment] = useState(null);
  const [savingAdviser, setSavingAdviser] = useState(false);
  

  useEffect(() => {
    if (applicantId) {
      setLoading(true);
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => {
          setRecords(res.data);
        })
        .catch(() => setRecords([]))
        .finally(() => setLoading(false));
    }
  }, [applicantId]);

  // Fetch existing assignment for this applicant (only on mount or applicantId change)
  useEffect(() => {
    if (applicantId && advisers.length > 0) {
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
  }, [applicantId, advisers]);

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


  // Toggle lock/unlock status
  const handleToggleLock = async (recordId, currentStatus) => {
    const newStatus = currentStatus === "APPROVED" ? "PENDING" : "APPROVED";
    
    try {
      const params = new URLSearchParams();
      params.append('status', newStatus);

      await axios.put(
        `${API_BASE}/applicant-subject-records/${recordId}?${params.toString()}`,
        null,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      const refreshResponse = await axios.get(
        `${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`
      );
      setRecords(refreshResponse.data);
      
      // Removed alert - just update silently
    } catch (err) {
      console.error("Failed to toggle lock:", err);
      // Only show alert on error
      toast.error("Failed to toggle lock status.");
    }
  };

  

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <GradeIcon sx={{ color: maroon.main, fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
          Graded Accreditation Record
        </Typography>
      </Stack>

      {/* Info Card */}
      <InfoCard sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <SchoolIcon sx={{ color: gold.main, fontSize: 24 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Subject Evaluation & Grading
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and grade individual subjects for accreditation completion
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            {/* Adviser Selection - Autocomplete */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 280 }}>
              <PersonIcon sx={{ color: maroon.main, fontSize: 20 }} />
              <Autocomplete
                options={advisers}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  const name = option.firstName ? `${option.firstName} ${option.lastName || ''}`.trim() : 
                               option.name ? option.name :
                               option.email ? option.email.split('@')[0] :
                               'Unknown';
                  return name;
                }}
                isOptionEqualToValue={(option, value) => option?.evaluatorId === value?.evaluatorId}
                value={selectedAdviser}
                onChange={handleAdviserChange}
                disabled={savingAdviser}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Adviser"
                    placeholder="Type name..."
                    size="small"
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#fff',
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {savingAdviser ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                sx={{
                  flex: 1,
                  '& .MuiAutocomplete-paper': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  '& .MuiAutocomplete-listbox': {
                    '& .MuiAutocomplete-option': {
                      padding: '8px 16px !important',
                      '&[aria-selected="true"]': {
                        backgroundColor: alpha(maroon.main, 0.1),
                      },
                      '&:hover': {
                        backgroundColor: alpha(gold.main, 0.2),
                      },
                    },
                  },
                }}
                noOptionsText="No evaluators found"
              />
              
              {/* Delete/Clear Assignment Button */}
              {selectedAdviser && existingAssignment && (
                <Tooltip title="Delete adviser assignment">
                  <IconButton
                    size="small"
                    onClick={handleDeleteAssignment}
                    disabled={savingAdviser}
                    sx={{
                      color: '#d32f2f',
                      '&:hover': {
                        backgroundColor: alpha('#d32f2f', 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </InfoCard>
      
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading records...</Typography>
        </Box>
      ) : Object.keys(records).length > 0 ? (
        <Grow in={true} timeout={500}>
          <Box>
            {Object.keys(records).map((semester, index) => (
              <StyledAccordion key={semester} defaultExpanded={index === 0}>
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <BookIcon sx={{ color: maroon.main }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                        {semester}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {records[semester].length} subjects
                      </Typography>
                    </Box>
                    <Chip
                      label={`${records[semester].filter(r => r.status === 'APPROVED').length} / ${records[semester].length} Approved`}
                      color={records[semester].every(r => r.status === 'APPROVED') ? 'success' : 'warning'}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ minWidth: 250 }}>Subject</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 100 }}>Grade</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 200 }}>Process of Accreditation</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 200 }}>Substantive Basis</StyledTableCell>
                        <StyledTableCell align="center" sx={{ minWidth: 150 }}>Lock/Unlock Record</StyledTableCell>
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
                                  onChange={(e) => {
                                    // Auto-save on change
                                    const newGrade = e.target.value;
                                    const params = new URLSearchParams();
                                    if (newGrade) params.append('grade', newGrade);
                                    
                                    axios.put(
                                      `${API_BASE}/applicant-subject-records/${rec.id}?${params.toString()}`,
                                      null,
                                      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                                    ).then(() => {
                                      // Update local state
                                      setRecords(prev => ({
                                        ...prev,
                                        [semester]: prev[semester].map(r => 
                                          r.id === rec.id ? { ...r, grade: newGrade } : r
                                        )
                                      }));
                                    });
                                  }}
                                  fullWidth
                                  placeholder="Enter grade"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
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
                                    padding: 1,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`
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
                                  onChange={(e) => {
                                    // Auto-save on change
                                    const newProcess = e.target.value;
                                    const params = new URLSearchParams();
                                    if (newProcess) params.append('processOfAccreditation', newProcess);
                                    
                                    axios.put(
                                      `${API_BASE}/applicant-subject-records/${rec.id}?${params.toString()}`,
                                      null,
                                      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                                    ).then(() => {
                                      // Update local state
                                      setRecords(prev => ({
                                        ...prev,
                                        [semester]: prev[semester].map(r => 
                                          r.id === rec.id ? { ...r, processOfAccreditation: newProcess } : r
                                        )
                                      }));
                                    });
                                  }}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter process"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography 
                                  variant="body2"
                                  color={rec.processOfAccreditation ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 1,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
                                  onChange={(e) => {
                                    // Auto-save on change
                                    const newBasis = e.target.value;
                                    const params = new URLSearchParams();
                                    if (newBasis) params.append('substantiveBasis', newBasis);
                                    
                                    axios.put(
                                      `${API_BASE}/applicant-subject-records/${rec.id}?${params.toString()}`,
                                      null,
                                      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                                    ).then(() => {
                                      // Update local state
                                      setRecords(prev => ({
                                        ...prev,
                                        [semester]: prev[semester].map(r => 
                                          r.id === rec.id ? { ...r, substantiveBasis: newBasis } : r
                                        )
                                      }));
                                    });
                                  }}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter basis"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography 
                                  variant="body2"
                                  color={rec.substantiveBasis ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 1,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {rec.substantiveBasis || "Not specified"}
                                </Typography>
                              )}
                            </StyledTableCell>
                            
                            {/* Actions Cell */}
                            <StyledTableCell align="center">
                              <Tooltip title={isLocked ? "Unlock Record" : "Lock Record"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleLock(rec.id, rec.status)}
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
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No accreditation records found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No subject records have been created for this applicant yet.
            </Typography>
            {applicantId && curriculumId && (
              <ActionButton
                variant="contained"
                onClick={handleCreateCurriculumRecord}
                startIcon={<SchoolIcon />}
              >
                Create Curriculum Records
              </ActionButton>
            )}
          </CardContent>
        </InfoCard>
      )}
    </Box>
  );
};

export default GradedAccreditation;