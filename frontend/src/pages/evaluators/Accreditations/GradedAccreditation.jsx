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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFields, setEditFields] = useState({
    grade: "",
    processOfAccreditation: "",
    substantiveBasis: "",
    status: "",
  });

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

  // Edit record dialog handlers
  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditFields({
      grade: record.grade || "",
      processOfAccreditation: record.processOfAccreditation || "",
      substantiveBasis: record.substantiveBasis || "",
      status: record.status || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    try {
      await axios.put(`${API_BASE}/applicant-subject-records/${selectedRecord.id}`, editFields);
      setEditDialogOpen(false);
      // Refresh records
      axios
        .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
        .then((res) => setRecords(res.data));
      alert("Record updated.");
    } catch (err) {
      alert("Failed to update record.");
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
                        <StyledTableCell>Subject</StyledTableCell>
                        <StyledTableCell>Grade</StyledTableCell>
                        <StyledTableCell>Process</StyledTableCell>
                        <StyledTableCell>Basis</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
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
                              fontWeight={rec.grade ? 600 : 400}
                              color={rec.grade ? 'text.primary' : 'text.secondary'}
                            >
                              {rec.grade || "Not graded"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2">
                              {rec.processOfAccreditation || "-"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Typography variant="body2">
                              {rec.substantiveBasis || "-"}
                            </Typography>
                          </StyledTableCell>
                          <StyledTableCell>
                            <Chip
                              label={rec.status}
                              color={getStatusColor(rec.status)}
                              variant="outlined"
                              size="small"
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="Edit Record">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(rec)}
                                sx={{
                                  color: maroon.main,
                                  backgroundColor: alpha(maroon.main, 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha(maroon.main, 0.2),
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: maroon.main, color: "white", pb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditIcon />
            <Typography variant="h6">Edit Subject Record</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Grade"
              value={editFields.grade}
              onChange={(e) => handleEditFieldChange("grade", e.target.value)}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Process of Accreditation"
              value={editFields.processOfAccreditation}
              onChange={(e) => handleEditFieldChange("processOfAccreditation", e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Substantive Basis"
              value={editFields.substantiveBasis}
              onChange={(e) => handleEditFieldChange("substantiveBasis", e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Status"
              value={editFields.status}
              onChange={(e) => handleEditFieldChange("status", e.target.value)}
              fullWidth
              select
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="APPROVED">APPROVED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <ActionButton 
            onClick={handleSaveEdit} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Save Changes
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradedAccreditation;
