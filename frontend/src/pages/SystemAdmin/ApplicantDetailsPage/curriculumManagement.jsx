import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  alpha,
  useTheme,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from "axios";
import { styled } from "@mui/material/styles";
import CurriculumRouterModal from "./CurriculumRouterModal";

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

const API_BASE = "http://localhost:8080/api";

export default function CurriculumManagement() {
  const theme = useTheme();
  const [curriculums, setCurriculums] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  const [newCurriculum, setNewCurriculum] = useState({
    programName: "",
    yearStarted: "",
    description: "",
    isActive: true,
    department: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);

  // Fetch curriculums
  const fetchCurriculums = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/curriculums`);
      setCurriculums(res.data);
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: "error", text: "Failed to fetch curriculums" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  useEffect(() => {
    axios.get(`${API_BASE}/departments`)
      .then(res => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    fetchCurriculums();
  }, []);

  // Add or update curriculum
  const handleSaveCurriculum = async () => {
    try {
      const payload = {
        ...newCurriculum,
        department: newCurriculum.department ? { departmentId: Number(newCurriculum.department) } : null
      };

      if (editingCurriculum) {
        await axios.put(`${API_BASE}/curriculums/${editingCurriculum.id}`, payload);
        setAlertMessage({ type: "success", text: "Curriculum updated successfully" });
      } else {
        const res = await axios.post(`${API_BASE}/curriculums`, payload);
        setCurriculums([...curriculums, res.data]);
        setAlertMessage({ type: "success", text: "Curriculum created successfully" });
      }

      fetchCurriculums();
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      console.error("Error saving curriculum:", err);
      setAlertMessage({ type: "error", text: "Failed to save curriculum" });
    }
  };

  // Reset form
  const resetForm = () => {
    setNewCurriculum({
      programName: "",
      yearStarted: "",
      description: "",
      isActive: true,
      department: null,
    });
    setEditingCurriculum(null);
  };

  // Handle edit
  const handleEdit = (curriculum) => {
    setEditingCurriculum(curriculum);
    setNewCurriculum({
      programName: curriculum.programName,
      yearStarted: curriculum.yearStarted,
      description: curriculum.description || "",
      isActive: curriculum.isActive,
      department: curriculum.department?.departmentId || null,
    });
    setOpenDialog(true);
  };

  // Manage curriculum with modal approach
  const handleManageCurriculum = (curriculumId) => {
    setSelectedCurriculumId(curriculumId);
    setModalOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 4 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <SchoolIcon sx={{ color: maroon.main, fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold" color={maroon.dark}>
          Curriculum Management
        </Typography>
      </Stack>

      {/* Alert Messages */}
      {alertMessage.text && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 3 }}
          onClose={() => setAlertMessage({ type: "", text: "" })}
        >
          {alertMessage.text}
        </Alert>
      )}

      {/* Add New Curriculum Card */}
      <InfoCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight="bold" color={maroon.main} gutterBottom>
                Create New Curriculum
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a new academic program curriculum to the system
              </Typography>
            </Box>
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
              size="large"
            >
              Add Curriculum
            </ActionButton>
          </Stack>
        </CardContent>
      </InfoCard>

      {/* Curriculums List */}
      <InfoCard>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight="bold" color={maroon.main}>
              All Curriculums
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage existing curriculum programs
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                Loading curriculums...
              </Typography>
            </Box>
          ) : curriculums.length === 0 ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 6,
              px: 3
            }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No curriculums found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first curriculum to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Program Name</StyledTableCell>
                    <StyledTableCell>Year Started</StyledTableCell>
                    <StyledTableCell>Course</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curriculums.map(c => (
                    <StyledTableRow key={c.id}>
                      <StyledTableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {c.programName}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell>{c.yearStarted}</StyledTableCell>
                      <StyledTableCell>
                        {c.department?.departmentName || 'N/A'}
                      </StyledTableCell>
                      <StyledTableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {c.description || 'No description'}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip 
                          label={c.isActive ? 'Active' : 'Inactive'} 
                          color={c.isActive ? 'success' : 'error'} 
                          variant="outlined" 
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Manage Curriculum">
                            <IconButton 
                              size="small"
                              color="primary"
                              onClick={() => handleManageCurriculum(c.id)}
                              sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Curriculum">
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(c)}
                              sx={{ 
                                backgroundColor: alpha(gold.main, 0.1),
                                color: gold.dark,
                                '&:hover': {
                                  backgroundColor: alpha(gold.main, 0.2),
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </InfoCard>

      {/* Add/Edit Curriculum Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)' }
        }}
      >
        <DialogTitle sx={{ bgcolor: maroon.main, color: 'white' }}>
          {editingCurriculum ? 'Edit Curriculum' : 'Add New Curriculum'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Name"
                value={newCurriculum.programName}
                onChange={e => setNewCurriculum({ ...newCurriculum, programName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Started"
                type="number"
                value={newCurriculum.yearStarted}
                onChange={e => setNewCurriculum({ ...newCurriculum, yearStarted: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newCurriculum.description}
                onChange={e => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newCurriculum.department || ""}
                  onChange={e => setNewCurriculum({ ...newCurriculum, department: e.target.value })}
                  label="Department"
                >
                  {departments.map(dep => (
                    <MenuItem key={dep.departmentId} value={dep.departmentId}>
                      {dep.departmentName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newCurriculum.isActive}
                  onChange={e => setNewCurriculum({ ...newCurriculum, isActive: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <ActionButton 
            variant="contained" 
            onClick={handleSaveCurriculum}
            disabled={!newCurriculum.programName || !newCurriculum.yearStarted || !newCurriculum.department}
          >
            {editingCurriculum ? 'Update' : 'Create'} Curriculum
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Add the Curriculum Router Modal */}
      <CurriculumRouterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        curriculumId={selectedCurriculumId}
      />
    </Box>
  );
}


