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
  useTheme,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import toast from "../../../utils/toast";

const API_URL = 'https://eteeap-foth.onrender.com/api/accepted-applicants';
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

const Accreditations = ({ onNavigateToGraded }) => {
  const theme = useTheme();
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [accreditLoading, setAccreditLoading] = useState(false);

  useEffect(() => {
    // Fetch evaluator department
    const fetchDepartment = async () => {
      try {
        const res = await fetch(`${EVALUATOR_API}/${evaluatorId}`);
        const data = await res.json();
        setDepartmentId(data.department?.departmentId);
      } catch {
        setDepartmentId(null);
      }
    };
    fetchDepartment();
  }, [evaluatorId]);

  useEffect(() => {
    if (!departmentId) return;
    setLoading(true);
    // Fetch accepted applicants
    fetch(`${API_URL}`)
      .then(res => res.json())
      .then(async data => {
        // Filter by department
        const filtered = data.filter(
          item => item.finalCourse?.department?.departmentId === departmentId
        );

        // Get all applicantIds that already have subject records
        const applicantIds = filtered.map(item => item.applicant?.applicantId).filter(Boolean);
        let accreditedIds = [];
        if (applicantIds.length > 0) {
          // Fetch all subject records for these applicants
          const promises = applicantIds.map(id =>
            fetch(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${id}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
          const results = await Promise.all(promises);
          accreditedIds = applicantIds.filter((id, idx) => results[idx] && results[idx].length > 0);
        }

        // Remove applicants who are already accredited
        const notYetAccredited = filtered.filter(
          item => !accreditedIds.includes(item.applicant?.applicantId)
        );

        setAcceptedApplicants(notYetAccredited);

        // Get unique courses for filter dropdown
        const uniqueCourses = [
          ...new Map(
            notYetAccredited.map(item => [
              item.finalCourse.courseId,
              item.finalCourse,
            ])
          ).values(),
        ];
        setCourses(uniqueCourses);
        setLoading(false);
      })
      .catch(() => {
        setAcceptedApplicants([]);
        setLoading(false);
      });
  }, [departmentId]);

  // Fetch curriculums for evaluator's department
  useEffect(() => {
    if (departmentId) {
      fetch(`https://eteeap-foth.onrender.com/api/curriculums?departmentId=${departmentId}`)
        .then(res => res.json())
        .then(data => setCurriculums(data))
        .catch(() => setCurriculums([]));
    }
  }, [departmentId]);

  const displayedApplicants = acceptedApplicants.filter(a => {
    const matchesCourse = !selectedCourse || a.finalCourse.courseId === selectedCourse;
    return matchesCourse;
  });

  const handleAccreditClick = applicant => {
    setSelectedApplicant(applicant);
    setConfirmOpen(true);
  };

  const handleConfirmAccredit = async () => {
    if (!selectedApplicant || !selectedCurriculumId) {
      toast.warning("Please select a curriculum before proceeding.");
      return;
    }

    setAccreditLoading(true);
    
    try {
      const applicantId = selectedApplicant.applicant?.applicantId;
      const params = new URLSearchParams({ curriculumId: selectedCurriculumId });
      const url = `https://eteeap-foth.onrender.com/api/applicants/${applicantId}/create-curriculum-record?${params.toString()}`;
      
      const response = await fetch(url, { method: "POST" });
      
      if (response.ok) {
        // Success - navigate to graded accreditation using the callback
        onNavigateToGraded(selectedApplicant.applicant?.applicantId, selectedCurriculumId);
      } else {
        const errorText = await response.text();
        toast.error(`Failed to create curriculum record: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error("Error creating curriculum record:", err);
      toast.error("Network error while creating curriculum record. Please try again.");
    } finally {
      setAccreditLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SchoolIcon sx={{ color: maroon.main, fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
            Start Accreditation Process
          </Typography>
        </Stack>

        {/* Course Filter - Inline */}
        <Select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          displayEmpty
          size="small"
          sx={{ 
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            }
          }}
        >
          <MenuItem value="">All Courses</MenuItem>
          {courses.map(course => (
            <MenuItem key={course.courseId} value={course.courseId}>
              {course.courseName}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {/* Main Content */}
      <Grow in={true} timeout={500}>
        <InfoCard>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(maroon.main, 0.02) }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AssignmentIcon sx={{ color: maroon.main, fontSize: 20 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
                    Accepted Applicants ({displayedApplicants.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Choose applicants to begin their academic journey through ETEEAP
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  Loading accepted applicants...
                </Typography>
              </Box>
            ) : displayedApplicants.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Applicant Name</StyledTableCell>
                    <StyledTableCell>Course</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Acceptance Date</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedApplicants.map(app => (
                    <StyledTableRow key={app.acceptedApplicantId}>
                      <StyledTableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: maroon.main, width: 32, height: 32, fontSize: 14 }}>
                            {app.applicant?.firstName?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {`${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`}
                          </Typography>
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2">{app.finalCourse?.courseName}</Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={app.status}
                          color={
                            app.status === "ACCEPTED"
                              ? "success"
                              : app.status === "ENROLLED"
                              ? "info"
                              : "error"
                          }
                          size="small"
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2">
                          {app.acceptanceDate
                            ? new Date(app.acceptanceDate).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <ActionButton
                          variant="contained"
                          size="small"
                          onClick={() => handleAccreditClick(app)}
                          sx={{ py: 0.5, px: 1.5, fontSize: 12 }}
                        >
                          Start Process
                        </ActionButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No accepted applicants found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No accepted applicants available for accreditation in your department.
                </Typography>
              </Box>
            )}
          </CardContent>
        </InfoCard>
      </Grow>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: maroon.main, color: "white", py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="600">Confirm Accreditation Process</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            You are about to start the accreditation process for:
          </Typography>
          {selectedApplicant && (
            <Box sx={{ p: 1.5, bgcolor: alpha(gold.light, 0.2), borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" fontWeight="600">
                {`${selectedApplicant.applicant?.firstName || ""} ${selectedApplicant.applicant?.lastName || ""}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Course: {selectedApplicant.finalCourse?.courseName}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Select the curriculum:
          </Typography>
          <Select
            value={selectedCurriculumId}
            onChange={e => setSelectedCurriculumId(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ 
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              }
            }}
          >
            <MenuItem value="" disabled>
              <em>Choose curriculum...</em>
            </MenuItem>
            {curriculums.map(cur => (
              <MenuItem key={cur.id} value={cur.id}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {cur.programName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Started: {cur.yearStarted}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {!selectedCurriculumId && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: "block" }}>
              * Required to proceed
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1 }}>
          <Button 
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 1.5, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <ActionButton
            onClick={handleConfirmAccredit}
            variant="contained"
            size="small"
            disabled={!selectedCurriculumId || accreditLoading}
            sx={{ 
              borderRadius: 1.5,
              px: 2,
              textTransform: 'none',
              bgcolor: (!selectedCurriculumId || accreditLoading) ? "grey.300" : maroon.main
            }}
          >
            {accreditLoading ? "Creating..." : "Start Process"}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accreditations;