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
  MenuItem,
  Card,
  CardContent,
  Grow,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Select,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

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
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editFields, setEditFields] = useState({
    grade: "",
    processOfAccreditation: "",
    substantiveBasis: "",
  });
  const [saving, setSaving] = useState(false);

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
      alert("Curriculum records created successfully.");
    } catch (err) {
      alert("Failed to create curriculum records.");
    }
  };

  // Start editing a record
  const handleEditClick = (record) => {
    setEditingRecordId(record.id);
    setEditFields({
      grade: record.grade || "",
      processOfAccreditation: record.processOfAccreditation || "",
      substantiveBasis: record.substantiveBasis || "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRecordId(null);
    setEditFields({
      grade: "",
      processOfAccreditation: "",
      substantiveBasis: "",
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (recordId) => {
    setSaving(true);
    try {
      const params = new URLSearchParams();
      
      if (editFields.grade !== null && editFields.grade !== undefined && editFields.grade !== "") {
        params.append('grade', editFields.grade);
      }
      if (editFields.processOfAccreditation !== null && editFields.processOfAccreditation !== undefined && editFields.processOfAccreditation !== "") {
        params.append('processOfAccreditation', editFields.processOfAccreditation);
      }
      if (editFields.substantiveBasis !== null && editFields.substantiveBasis !== undefined && editFields.substantiveBasis !== "") {
        params.append('substantiveBasis', editFields.substantiveBasis);
      }

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
      
      setEditingRecordId(null);
      setEditFields({
        grade: "",
        processOfAccreditation: "",
        substantiveBasis: "",
      });
      
      alert("Record updated successfully.");
    } catch (err) {
      console.error("Failed to update record:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data || 
                          err.message || 
                          "Unknown error occurred";
      alert(`Failed to update record: ${errorMessage}`);
    } finally {
      setSaving(false);
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
      alert("Failed to toggle lock status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
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
                        const isEditing = editingRecordId === rec.id;
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
