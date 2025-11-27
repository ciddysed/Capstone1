import React, { useState, useEffect } from "react";
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
  Paper,
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
  Tabs,
  Tab,
  Collapse,
  Alert,
} from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookIcon from '@mui/icons-material/Book';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from "axios";
import { styled } from "@mui/material/styles";

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

const API_BASE = "https://eteeap-foth.onrender.com/api";

const CurriculumManagementTab = () => {
  const theme = useTheme();
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Curriculum management state
  const [curriculums, setCurriculums] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCurriculumDialog, setOpenCurriculumDialog] = useState(false);
  const [editingCurriculumId, setEditingCurriculumId] = useState(null);
  const [editingCurriculumData, setEditingCurriculumData] = useState({});
  const [newCurriculum, setNewCurriculum] = useState({
    programName: "",
    yearStarted: "",
    description: "",
    isActive: true,
    department: null,
  });
  
  // Semester and subject management state
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [newSemester, setNewSemester] = useState({
    yearLevel: "",
    semesterNumber: "",
    description: "",
  });
  const [newSubject, setNewSubject] = useState({});
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [openSemesterDialog, setOpenSemesterDialog] = useState(false);
  const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  // Fetch curriculums
  const fetchCurriculums = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/curriculums`);
      setCurriculums(response.data);
    } catch (error) {
      console.error("Error fetching curriculums:", error);
      setAlertMessage({ type: "error", text: "Failed to fetch curriculums" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch curriculum details with semesters
  const fetchCurriculumDetails = async (curriculumId) => {
    try {
      const response = await axios.get(`${API_BASE}/curriculums/${curriculumId}`);
      setSelectedCurriculum(response.data);
      setSemesters(response.data.semesters || []);
    } catch (error) {
      console.error("Error fetching curriculum details:", error);
      setAlertMessage({ type: "error", text: "Failed to fetch curriculum details" });
    }
  };

  // Add or update curriculum
  const handleSaveCurriculum = async () => {
    try {
      const payload = {
        ...newCurriculum,
        department: newCurriculum.department ? { departmentId: Number(newCurriculum.department) } : null
      };

      await axios.post(`${API_BASE}/curriculums`, payload);
      setAlertMessage({ type: "success", text: "Curriculum created successfully" });

      fetchCurriculums();
      setOpenCurriculumDialog(false);
      resetCurriculumForm();
    } catch (error) {
      console.error("Error saving curriculum:", error);
      setAlertMessage({ type: "error", text: "Failed to save curriculum" });
    }
  };

  // Update curriculum inline
  const handleUpdateCurriculum = async (curriculumId) => {
    try {
      const payload = {
        ...editingCurriculumData,
        department: editingCurriculumData.department ? { departmentId: Number(editingCurriculumData.department) } : null
      };

      await axios.put(`${API_BASE}/curriculums/${curriculumId}`, payload);
      setAlertMessage({ type: "success", text: "Curriculum updated successfully" });
      
      fetchCurriculums();
      setEditingCurriculumId(null);
      setEditingCurriculumData({});
    } catch (error) {
      console.error("Error updating curriculum:", error);
      setAlertMessage({ type: "error", text: "Failed to update curriculum" });
    }
  };

  // Add semester
  const handleAddSemester = async () => {
    if (!selectedCurriculum) return;
    
    try {
      const response = await axios.post(`${API_BASE}/semesters`, {
        ...newSemester,
        curriculum: { id: selectedCurriculum.id }
      });
      
      setSemesters(prev => [...prev, { ...response.data, subjects: [] }]);
      setNewSemester({ yearLevel: "", semesterNumber: "", description: "" });
      setOpenSemesterDialog(false);
      setAlertMessage({ type: "success", text: "Semester added successfully" });
    } catch (error) {
      console.error("Error adding semester:", error);
      setAlertMessage({ type: "error", text: "Failed to add semester" });
    }
  };

  // Add subject
  const handleAddSubject = async () => {
    if (!selectedSemesterId) return;
    
    try {
      const response = await axios.post(`${API_BASE}/subjects`, {
        ...newSubject,
        semester: { id: selectedSemesterId }
      });
      
      setSemesters(prev => prev.map(sem =>
        sem.id === selectedSemesterId
          ? { ...sem, subjects: [...(sem.subjects || []), response.data] }
          : sem
      ));
      
      setNewSubject({});
      setOpenSubjectDialog(false);
      setAlertMessage({ type: "success", text: "Subject added successfully" });
    } catch (error) {
      console.error("Error adding subject:", error);
      setAlertMessage({ type: "error", text: "Failed to add subject" });
    }
  };

  // Reset forms
  const resetCurriculumForm = () => {
    setNewCurriculum({
      programName: "",
      yearStarted: "",
      description: "",
      isActive: true,
      department: null,
    });
    setEditingCurriculumId(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setAlertMessage({ type: "", text: "" });
  };

  // Handle edit curriculum - start inline editing
  const handleEditCurriculum = (curriculum) => {
    setEditingCurriculumId(curriculum.id);
    setEditingCurriculumData({
      programName: curriculum.programName,
      yearStarted: curriculum.yearStarted,
      description: curriculum.description || "",
      isActive: curriculum.isActive,
      department: curriculum.department?.departmentId || null,
    });
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setEditingCurriculumId(null);
    setEditingCurriculumData({});
  };

  // Handle view curriculum
  const handleViewCurriculum = (curriculum) => {
    setSelectedCurriculum(curriculum);
    fetchCurriculumDetails(curriculum.id);
    setTabValue(1);
  };

  useEffect(() => {
    fetchCurriculums();
    fetchDepartments();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <SchoolIcon sx={{ color: maroon.main, fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 48,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: maroon.main,
              height: 3,
            },
          }}
        >
          <Tab 
            icon={<LibraryBooksIcon />} 
            iconPosition="start" 
            label="All Curriculums" 
            sx={{ 
              color: tabValue === 0 ? maroon.main : 'text.secondary',
              '&.Mui-selected': {
                color: maroon.main,
              }
            }}
          />
          <Tab 
            icon={<BookIcon />} 
            iconPosition="start" 
            label={selectedCurriculum ? `${selectedCurriculum.programName} Details` : "Curriculum Details"} 
            disabled={!selectedCurriculum}
            sx={{ 
              color: tabValue === 1 ? maroon.main : 'text.secondary',
              '&.Mui-selected': {
                color: maroon.main,
              }
            }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          {/* Action Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" color={maroon.dark}>
              Program Curriculums
            </Typography>
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetCurriculumForm();
                setOpenCurriculumDialog(true);
              }}
            >
              Add New Curriculum
            </ActionButton>
          </Stack>

          {/* Curriculums Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                Loading curriculums...
              </Typography>
            </Box>
          ) : curriculums.length > 0 ? (
            <TableContainer component={Paper} sx={{ 
              borderRadius: 2,
              boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              mb: 2
            }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Program Name</StyledTableCell>
                    <StyledTableCell>Year Started</StyledTableCell>
                    <StyledTableCell>Department</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curriculums.map((curriculum) => (
                    <StyledTableRow key={curriculum.id}>
                      <StyledTableCell>
                        {editingCurriculumId === curriculum.id ? (
                          <TextField
                            size="small"
                            value={editingCurriculumData.programName}
                            onChange={(e) => setEditingCurriculumData({
                              ...editingCurriculumData,
                              programName: e.target.value
                            })}
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          <Typography variant="body2" fontWeight={600}>
                            {curriculum.programName}
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        {editingCurriculumId === curriculum.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={editingCurriculumData.yearStarted}
                            onChange={(e) => setEditingCurriculumData({
                              ...editingCurriculumData,
                              yearStarted: e.target.value
                            })}
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          curriculum.yearStarted
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        {editingCurriculumId === curriculum.id ? (
                          <FormControl size="small" fullWidth>
                            <Select
                              value={editingCurriculumData.department || ""}
                              onChange={(e) => setEditingCurriculumData({
                                ...editingCurriculumData,
                                department: e.target.value
                              })}
                            >
                              {departments.map((dep) => (
                                <MenuItem key={dep.departmentId} value={dep.departmentId}>
                                  {dep.departmentName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          curriculum.department?.departmentName || 'N/A'
                        )}
                      </StyledTableCell>
                      <StyledTableCell sx={{ maxWidth: 200 }}>
                        {editingCurriculumId === curriculum.id ? (
                          <TextField
                            size="small"
                            multiline
                            rows={2}
                            value={editingCurriculumData.description}
                            onChange={(e) => setEditingCurriculumData({
                              ...editingCurriculumData,
                              description: e.target.value
                            })}
                            variant="outlined"
                            fullWidth
                          />
                        ) : (
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {curriculum.description || 'No description'}
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        {editingCurriculumId === curriculum.id ? (
                          <FormControl size="small" fullWidth>
                            <Select
                              value={editingCurriculumData.isActive}
                              onChange={(e) => setEditingCurriculumData({
                                ...editingCurriculumData,
                                isActive: e.target.value
                              })}
                            >
                              <MenuItem value={true}>Active</MenuItem>
                              <MenuItem value={false}>Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          <Chip 
                            label={curriculum.isActive ? 'Active' : 'Inactive'} 
                            color={curriculum.isActive ? 'success' : 'error'} 
                            variant="outlined" 
                            size="small"
                          />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {editingCurriculumId === curriculum.id ? (
                            <>
                              <Tooltip title="Save Changes">
                                <IconButton 
                                  size="small"
                                  color="success"
                                  onClick={() => handleUpdateCurriculum(curriculum.id)}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                                    }
                                  }}
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton 
                                  size="small"
                                  color="error"
                                  onClick={handleCancelEdit}
                                  sx={{ 
                                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                                    }
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewCurriculum(curriculum)}
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
                                  onClick={() => handleEditCurriculum(curriculum)}
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
                            </>
                          )}
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ 
              textAlign: "center", 
              my: 6, 
              py: 6,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 2
            }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No curriculums found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first curriculum to get started.
              </Typography>
            </Box>
          )}
        </>
      )}

      {tabValue === 1 && selectedCurriculum && (
        <>
          {/* Curriculum Details Header */}
          <InfoCard sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="bold" color={maroon.main} gutterBottom>
                    {selectedCurriculum.programName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCurriculum.description || 'No description available'}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      Year Started: {selectedCurriculum.yearStarted}
                    </Typography>
                    <Typography variant="caption">
                      Department: {selectedCurriculum.department?.departmentName || 'N/A'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <ActionButton
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenSemesterDialog(true)}
                      sx={{ 
                        borderColor: maroon.main,
                        color: maroon.main,
                        '&:hover': {
                          borderColor: maroon.dark,
                          backgroundColor: alpha(maroon.main, 0.1),
                        }
                      }}
                    >
                      Add Semester
                    </ActionButton>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </InfoCard>

          {/* Semesters */}
          {semesters.length > 0 ? (
            semesters.map((semester) => (
              <InfoCard key={semester.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                        Year {semester.yearLevel} - Semester {semester.semesterNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {semester.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedSemesterId(semester.id);
                          setOpenSubjectDialog(true);
                        }}
                        sx={{ 
                          borderColor: gold.main,
                          color: gold.dark,
                          '&:hover': {
                            borderColor: gold.dark,
                            backgroundColor: alpha(gold.main, 0.1),
                          }
                        }}
                      >
                        Add Subject
                      </Button>
                      <IconButton
                        onClick={() => setExpandedSemester(
                          expandedSemester === semester.id ? null : semester.id
                        )}
                        sx={{ 
                          backgroundColor: alpha(maroon.main, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(maroon.main, 0.2),
                          }
                        }}
                      >
                        {expandedSemester === semester.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Stack>
                  </Stack>
                  
                  <Collapse in={expandedSemester === semester.id}>
                    {semester.subjects && semester.subjects.length > 0 ? (
                      <TableContainer sx={{ 
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        mt: 2
                      }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Code</StyledTableCell>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Title</StyledTableCell>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Lec</StyledTableCell>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Lab</StyledTableCell>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Units</StyledTableCell>
                              <StyledTableCell sx={{ fontSize: '0.875rem' }}>Prerequisites</StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {semester.subjects.map((subject) => (
                              <StyledTableRow key={subject.id}>
                                <StyledTableCell sx={{ fontWeight: 600 }}>
                                  {subject.subjectCode}
                                </StyledTableCell>
                                <StyledTableCell>{subject.descriptiveTitle}</StyledTableCell>
                                <StyledTableCell>{subject.lecHours || 0}</StyledTableCell>
                                <StyledTableCell>{subject.labHours || 0}</StyledTableCell>
                                <StyledTableCell>{subject.units || 0}</StyledTableCell>
                                <StyledTableCell>{subject.prerequisites || 'None'}</StyledTableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 3, 
                        bgcolor: alpha(theme.palette.background.default, 0.5), 
                        borderRadius: 1,
                        mt: 2
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          No subjects added to this semester yet.
                        </Typography>
                      </Box>
                    )}
                  </Collapse>
                </CardContent>
              </InfoCard>
            ))
          ) : (
            <Box sx={{ 
              textAlign: "center", 
              my: 6, 
              py: 6,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              borderRadius: 2
            }}>
              <BookIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No semesters found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add semesters to organize the curriculum structure.
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Add Curriculum Dialog - Only for new curriculums */}
      <Dialog 
        open={openCurriculumDialog} 
        onClose={() => setOpenCurriculumDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)' }
        }}
      >
        <DialogTitle sx={{ bgcolor: maroon.main, color: 'white' }}>
          Add New Curriculum
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Name"
                value={newCurriculum.programName}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, programName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Started"
                type="number"
                value={newCurriculum.yearStarted}
                onChange={(e) => setNewCurriculum({ ...newCurriculum, yearStarted: e.target.value })}
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
                onChange={(e) => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={newCurriculum.department || ""}
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, department: e.target.value })}
                  label="Department"
                >
                  {departments.map((dep) => (
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
                  onChange={(e) => setNewCurriculum({ ...newCurriculum, isActive: e.target.value })}
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
          <Button onClick={() => setOpenCurriculumDialog(false)} variant="outlined">
            Cancel
          </Button>
          <ActionButton 
            variant="contained" 
            onClick={handleSaveCurriculum}
            disabled={!newCurriculum.programName || !newCurriculum.yearStarted || !newCurriculum.department}
          >
            Create Curriculum
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Add Semester Dialog */}
      <Dialog 
        open={openSemesterDialog} 
        onClose={() => setOpenSemesterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Semester</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Year Level"
                type="number"
                value={newSemester.yearLevel}
                onChange={(e) => setNewSemester({ ...newSemester, yearLevel: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Semester Number"
                type="number"
                value={newSemester.semesterNumber}
                onChange={(e) => setNewSemester({ ...newSemester, semesterNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={newSemester.description}
                onChange={(e) => setNewSemester({ ...newSemester, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSemesterDialog(false)}>Cancel</Button>
          <ActionButton 
            variant="contained" 
            onClick={handleAddSemester}
            disabled={!newSemester.yearLevel || !newSemester.semesterNumber}
          >
            Add Semester
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog 
        open={openSubjectDialog} 
        onClose={() => setOpenSubjectDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject Code"
                value={newSubject.subjectCode || ""}
                onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Units"
                type="number"
                step="0.1"
                value={newSubject.units || ""}
                onChange={(e) => setNewSubject({ ...newSubject, units: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descriptive Title"
                value={newSubject.descriptiveTitle || ""}
                onChange={(e) => setNewSubject({ ...newSubject, descriptiveTitle: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Lecture Hours"
                type="number"
                value={newSubject.lecHours || ""}
                onChange={(e) => setNewSubject({ ...newSubject, lecHours: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Laboratory Hours"
                type="number"
                value={newSubject.labHours || ""}
                onChange={(e) => setNewSubject({ ...newSubject, labHours: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newSubject.description || ""}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prerequisites"
                value={newSubject.prerequisites || ""}
                onChange={(e) => setNewSubject({ ...newSubject, prerequisites: e.target.value })}
                placeholder="e.g., MATH101, PHYS102"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubjectDialog(false)}>Cancel</Button>
          <ActionButton 
            variant="contained" 
            onClick={handleAddSubject}
            disabled={!newSubject.subjectCode || !newSubject.descriptiveTitle}
          >
            Add Subject
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurriculumManagementTab;