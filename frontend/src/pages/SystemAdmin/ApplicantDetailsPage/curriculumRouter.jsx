import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Collapse,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
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
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(106, 0, 0, 0.15)',
  },
  borderTop: `3px solid ${maroon.main}`,
  marginBottom: theme.spacing(2),
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

export default function CurriculumRouter() {
  const theme = useTheme();
  const { curriculumId } = useParams();
  const [curriculum, setCurriculum] = useState(null);
  const [newSemester, setNewSemester] = useState({
    yearLevel: "",
    semesterNumber: "",
    description: "",
  });
  const [newSubject, setNewSubject] = useState({});
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [expandedSemester, setExpandedSemester] = useState(null);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });

  // Fetch curriculum details (with semesters and subjects organized correctly)
  useEffect(() => {
    axios.get(`${API_BASE}/curriculums/${curriculumId}`)
      .then(res => setCurriculum(res.data))
      .catch(() => {
        setCurriculum(null);
        setAlertMessage({ type: "error", text: "Failed to load curriculum" });
      });
  }, [curriculumId]);

  // Add semester
  const handleAddSemester = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/semesters`, {
      ...newSemester,
      curriculum: { id: Number(curriculumId) }
    }).then(res => {
      setCurriculum(prev => ({
        ...prev,
        semesters: [...(prev.semesters || []), { ...res.data, subjects: [] }]
      }));
      setNewSemester({ yearLevel: "", semesterNumber: "", description: "" });
      setAlertMessage({ type: "success", text: "Semester added successfully" });
    }).catch(() => {
      setAlertMessage({ type: "error", text: "Error adding semester" });
    });
  };

  // Add subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/subjects`, {
      ...newSubject,
      semester: { id: selectedSemesterId }
    }).then(res => {
      setCurriculum(prev => ({
        ...prev,
        semesters: prev.semesters.map(sem =>
          sem.id === selectedSemesterId
            ? { ...sem, subjects: [...(sem.subjects || []), res.data] }
            : sem
        )
      }));
      setNewSubject({});
      setSelectedSemesterId(null);
      setAlertMessage({ type: "success", text: "Subject added successfully" });
    }).catch(() => {
      setAlertMessage({ type: "error", text: "Error adding subject" });
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 4 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <SchoolIcon sx={{ color: maroon.main, fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold" color={maroon.dark}>
          Manage Curriculum {curriculum ? `- ${curriculum.programName}` : ''}
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

      {/* Add Semester Form */}
      <InfoCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" color={maroon.main} gutterBottom>
            Add New Semester
          </Typography>
          <form onSubmit={handleAddSemester}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Year Level"
                  value={newSemester.yearLevel}
                  onChange={e => setNewSemester({ ...newSemester, yearLevel: e.target.value })}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Semester Number"
                  value={newSemester.semesterNumber}
                  onChange={e => setNewSemester({ ...newSemester, semesterNumber: e.target.value })}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newSemester.description}
                  onChange={e => setNewSemester({ ...newSemester, description: e.target.value })}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <ActionButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add
                </ActionButton>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </InfoCard>

      {/* Semesters List */}
      <InfoCard>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight="bold" color={maroon.main}>
              Semesters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage semesters and their subjects
            </Typography>
          </Box>

          {(!curriculum || !curriculum.semesters || curriculum.semesters.length === 0) ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 6,
              px: 3
            }}>
              <BookIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No semesters found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add the first semester to get started.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              {curriculum.semesters.map(semester => (
                <Card key={semester.id} sx={{ mb: 2, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
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
                          onClick={() => setSelectedSemesterId(
                            selectedSemesterId === semester.id ? null : semester.id
                          )}
                          sx={{ 
                            borderColor: gold.main,
                            color: gold.dark,
                            '&:hover': {
                              borderColor: gold.dark,
                              backgroundColor: alpha(gold.main, 0.1),
                            }
                          }}
                        >
                          {selectedSemesterId === semester.id ? 'Cancel' : 'Add Subject'}
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

                    {/* Add Subject Form */}
                    <Collapse in={selectedSemesterId === semester.id}>
                      <Box sx={{ 
                        mb: 2, 
                        p: 2, 
                        bgcolor: alpha(gold.light, 0.1), 
                        borderRadius: 1,
                        border: `1px solid ${alpha(gold.main, 0.3)}`
                      }}>
                        <Typography variant="subtitle2" fontWeight="bold" color={gold.dark} gutterBottom>
                          Add New Subject
                        </Typography>
                        <form onSubmit={handleAddSubject}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Subject Code"
                                value={newSubject.subjectCode || ""}
                                onChange={e => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                                required
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Units"
                                type="number"
                                step="0.1"
                                value={newSubject.units || ""}
                                onChange={e => setNewSubject({ ...newSubject, units: e.target.value })}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Descriptive Title"
                                value={newSubject.descriptiveTitle || ""}
                                onChange={e => setNewSubject({ ...newSubject, descriptiveTitle: e.target.value })}
                                required
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                fullWidth
                                label="Lec Hours"
                                type="number"
                                value={newSubject.lecHours || ""}
                                onChange={e => setNewSubject({ ...newSubject, lecHours: e.target.value })}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <TextField
                                fullWidth
                                label="Lab Hours"
                                type="number"
                                value={newSubject.labHours || ""}
                                onChange={e => setNewSubject({ ...newSubject, labHours: e.target.value })}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Prerequisites"
                                value={newSubject.prerequisites || ""}
                                onChange={e => setNewSubject({ ...newSubject, prerequisites: e.target.value })}
                                size="small"
                                placeholder="e.g., MATH101, PHYS102"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <ActionButton
                                type="submit"
                                variant="contained"
                                startIcon={<AddIcon />}
                                fullWidth
                                sx={{ height: '40px' }}
                              >
                                Add Subject
                              </ActionButton>
                            </Grid>
                          </Grid>
                        </form>
                      </Box>
                    </Collapse>

                    {/* Subjects Table */}
                    <Collapse in={expandedSemester === semester.id}>
                      {(semester.subjects || []).length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 3, 
                          bgcolor: alpha(theme.palette.background.default, 0.5), 
                          borderRadius: 1
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            No subjects found for this semester.
                          </Typography>
                        </Box>
                      ) : (
                        <TableContainer sx={{ 
                          borderRadius: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`
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
                              {semester.subjects.map(subject => (
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
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </InfoCard>
    </Box>
  );
}
                    