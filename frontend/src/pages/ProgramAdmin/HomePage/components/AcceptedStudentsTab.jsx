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
  Avatar,
  alpha,
  TablePagination,
  useTheme,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from "axios";
import { styled } from "@mui/material/styles";
import toast from "../../../../utils/toast";

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

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderWidth: 2,
  '&.MuiChip-outlinedSuccess': {
    color: '#2e7d32',
    borderColor: '#2e7d32',
  },
  '&.MuiChip-outlinedInfo': {
    color: '#0288d1',
    borderColor: '#0288d1',
  },
  '&.MuiChip-outlinedWarning': {
    color: '#ed6c02',
    borderColor: '#ed6c02',
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

const AcceptedStudentsTab = () => {
  const theme = useTheme();
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editRemarks, setEditRemarks] = useState("");
  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Fetch accepted students
  const fetchAcceptedStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://eteeap-foth.onrender.com/api/accepted-applicants");
      setAcceptedStudents(response.data);
    } catch (error) {
      console.error("Error fetching accepted students:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = {
      ACCEPTED: "success",
      ENROLLED: "info",
      WITHDRAWN: "warning",
    };
    return statusMap[status] || "default";
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view details
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  // Handle edit remarks
  const handleEditRemarks = (student) => {
    setSelectedStudent(student);
    setEditRemarks(student.remarks || "");
    setOpenEditDialog(true);
  };

  // Update remarks
  const handleUpdateRemarks = async () => {
    try {
      await axios.put(
        `https://eteeap-foth.onrender.com/api/accepted-applicants/${selectedStudent.acceptedApplicantId}/status`,
        null,
        {
          params: {
            status: selectedStudent.status,
            remarks: editRemarks,
          },
        }
      );
      // Optimistically update the UI
      setAcceptedStudents(prev => prev.map(s =>
        s.acceptedApplicantId === selectedStudent.acceptedApplicantId
          ? { ...s, remarks: editRemarks, status: selectedStudent.status }
          : s
      ));
      setOpenEditDialog(false);
      setEditRemarks("");
      setSelectedStudent(null);
      toast.success("Remarks updated successfully");
      // Optionally, re-fetch in the background to ensure consistency
      fetchAcceptedStudents();
    } catch (error) {
      console.error("Error updating remarks:", error);
      toast.error("Failed to update remarks");
    }
  };

  useEffect(() => {
    fetchAcceptedStudents();
  }, []);


  // Get unique courses for filter dropdown
  const courseOptions = Array.from(new Set(acceptedStudents.map(s => s.finalCourse?.courseName).filter(Boolean)));

  // Filtering logic
  const filteredStudents = acceptedStudents.filter(s => {
    let statusMatch = true, courseMatch = true, dateMatch = true;
    if (statusFilter) statusMatch = s.status === statusFilter;
    if (courseFilter) courseMatch = s.finalCourse?.courseName === courseFilter;
    if (dateFilter) {
      if (!s.acceptanceDate) return false;
      const studentDate = new Date(s.acceptanceDate);
      const filterDate = new Date(dateFilter);
      // Compare only date part
      dateMatch = studentDate.toISOString().slice(0,10) === filterDate.toISOString().slice(0,10);
    }
    return statusMatch && courseMatch && dateMatch;
  });

  // Get statistics
  const totalAccepted = filteredStudents.length;
  const enrolledCount = filteredStudents.filter(s => s.status === 'ENROLLED').length;
  const acceptedCount = filteredStudents.filter(s => s.status === 'ACCEPTED').length;
  const withdrawnCount = filteredStudents.filter(s => s.status === 'WITHDRAWN').length;

  // Filter students for current page
  const displayedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <CheckCircleIcon sx={{ color: maroon.main, fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
          Accepted Students
        </Typography>
      </Stack>

      {/* Filter Bar */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="ACCEPTED">ACCEPTED</MenuItem>
            <MenuItem value="ENROLLED">ENROLLED</MenuItem>
            <MenuItem value="WITHDRAWN">WITHDRAWN</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Course</InputLabel>
          <Select
            value={courseFilter}
            label="Course"
            onChange={e => { setCourseFilter(e.target.value); setPage(0); }}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courseOptions.map(course => (
              <MenuItem key={course} value={course}>{course}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Acceptance Date"
          type="date"
          size="small"
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <Button onClick={() => { setStatusFilter(""); setCourseFilter(""); setDateFilter(""); setPage(0); }} variant="outlined" size="small">Clear Filters</Button>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color={maroon.main}>
                {totalAccepted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Accepted
              </Typography>
            </CardContent>
          </InfoCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                {acceptedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recently Accepted
              </Typography>
            </CardContent>
          </InfoCard>
        </Grid>
        
      </Grid>

      {/* Students Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading accepted students...
          </Typography>
        </Box>
      ) : acceptedStudents.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            mb: 2
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Student</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Final Course</StyledTableCell>
                  <StyledTableCell>Department</StyledTableCell>
                  <StyledTableCell>Acceptance Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedStudents.map((student) => (
                  <StyledTableRow key={student.acceptedApplicantId}>
                    <StyledTableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                          {getInitials(
                            student.applicant ? 
                              `${student.applicant.firstName || ''} ${student.applicant.lastName || ''}`.trim() : 
                              'Unknown'
                          )}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {student.applicant ? 
                            `${student.applicant.firstName || ''} ${student.applicant.lastName || ''}`.trim() : 
                            'Unknown Student'}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      {student.applicant?.email || 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {student.finalCourse?.courseName || 'N/A'}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      {student.finalCourse?.department?.departmentName || 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      {student.acceptanceDate ? 
                        new Date(student.acceptanceDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StyledChip 
                        label={student.status} 
                        color={getStatusColor(student.status)} 
                        variant="outlined" 
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(student)}
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
                        <Tooltip title="Edit Remarks">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditRemarks(student)}
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
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={acceptedStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          my: 6, 
          py: 6,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderRadius: 2
        }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No accepted students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Students will appear here once they are accepted through the application process.
          </Typography>
        </Box>
      )}

      {/* Student Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)' }
        }}
      >
        {selectedStudent && (
          <>
            <DialogTitle sx={{ 
              bgcolor: maroon.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {getInitials(
                  selectedStudent.applicant ? 
                    `${selectedStudent.applicant.firstName || ''} ${selectedStudent.applicant.lastName || ''}`.trim() : 
                    'Unknown'
                )}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Student Details
                </Typography>
                <Typography variant="body2">
                  {selectedStudent.applicant ? 
                    `${selectedStudent.applicant.firstName || ''} ${selectedStudent.applicant.lastName || ''}`.trim() : 
                    'Unknown Student'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Student Name
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedStudent.applicant ? 
                            `${selectedStudent.applicant.firstName || ''} ${selectedStudent.applicant.lastName || ''}`.trim() : 
                            'Unknown Student'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.applicant?.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SchoolIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Final Course
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedStudent.finalCourse?.courseName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedStudent.finalCourse?.department?.departmentName || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Acceptance Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedStudent.acceptanceDate ? 
                            new Date(selectedStudent.acceptanceDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <StyledChip 
                    label={selectedStudent.status} 
                    color={getStatusColor(selectedStudent.status)} 
                    variant="outlined"
                  />
                </Grid>
                {selectedStudent.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Remarks
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(gold.light, 0.1) }}>
                      <Typography variant="body2">
                        {selectedStudent.remarks}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setOpenDialog(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Remarks Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Remarks</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Remarks"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editRemarks}
            onChange={(e) => setEditRemarks(e.target.value)}
            placeholder="Enter remarks for this accepted student..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} variant="outlined">
            Cancel
          </Button>
          <ActionButton variant="contained" onClick={handleUpdateRemarks}>
            Update Remarks
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AcceptedStudentsTab;