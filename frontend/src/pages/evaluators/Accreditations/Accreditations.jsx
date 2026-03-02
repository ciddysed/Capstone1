import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';

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
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
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
  background: 'rgba(255, 255, 255, 0.93)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 24px rgba(106, 0, 0, 0.12), 0 1px 4px rgba(0,0,0,0.06)',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(106, 0, 0, 0.18)',
    transform: 'translateY(-1px)',
  },
  border: `1px solid rgba(255,255,255,0.6)`,
  borderTop: `3px solid ${maroon.main}`,
  overflow: 'hidden',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: maroon.main,
  color: '#fff',
  '&:hover': {
    backgroundColor: maroon.dark,
    boxShadow: '0 4px 12px rgba(106, 0, 0, 0.3)',
  },
}));

const Accreditations = () => {
    const navigate = useNavigate();
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState(null);

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

  const displayedApplicants = acceptedApplicants.filter(a => {
    const matchesCourse = !selectedCourse || a.finalCourse.courseId === selectedCourse;
    return matchesCourse;
  });

  const handleAccreditClick = applicant => {
    // Navigate directly to accredited accounts with applicant info
    navigate(`/evaluator/accredited-accounts`, {
      state: {
        openApplicantId: applicant.applicant?.applicantId,
        applicantData: applicant
      }
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Gradient Page Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
          borderRadius: 3,
          px: 3, py: 2.5,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 20px rgba(106,0,0,0.25)',
        }}
      >
        <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: alpha('#fff', 0.15), border: `2px solid ${alpha('#fff', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SchoolIcon sx={{ color: gold.main, fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
            Start Accreditation Process
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
            Select accepted applicants from your department to begin the accreditation process
          </Typography>
        </Box>
      </Box>

      {/* Course Filter */}
      <InfoCard sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <PersonAddIcon sx={{ color: maroon.main, fontSize: 22 }} />
            <Typography variant="subtitle1" fontWeight={700} color={maroon.main}>
              Filter Applicants
            </Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* Course Filter */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                Filter by Course:
              </Typography>
              <Select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                displayEmpty
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(maroon.main, 0.25) },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: maroon.main },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: maroon.main },
                }}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map(course => (
                  <MenuItem key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </CardContent>
      </InfoCard>

      {/* Main Content */}
      <Grow in={true} timeout={500}>
        <InfoCard>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, background: `linear-gradient(90deg, ${alpha(maroon.main, 0.04)} 0%, transparent 100%)` }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AssignmentIcon sx={{ color: maroon.main }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Accepted Applicants ({displayedApplicants.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose applicants to begin their academic journey through ETEEAP
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>
                  Loading accepted applicants...
                </Typography>
              </Box>
            ) : displayedApplicants.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Applicant Name</StyledTableCell>
                    <StyledTableCell>Course</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Acceptance Date</StyledTableCell>
                    <StyledTableCell>Remarks</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedApplicants.map(app => (
                    <StyledTableRow key={app.acceptedApplicantId}>
                      <StyledTableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: maroon.main }}>
                            {app.applicant?.firstName?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {`${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`}
                          </Typography>
                        </Stack>
                      </StyledTableCell>
                      <StyledTableCell>{app.finalCourse?.courseName}</StyledTableCell>
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
                          variant="outlined"
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        {app.acceptanceDate
                          ? new Date(app.acceptanceDate).toLocaleDateString()
                          : "-"}
                      </StyledTableCell>
                      <StyledTableCell>{app.remarks || "-"}</StyledTableCell>
                      <StyledTableCell align="center">
                        <ActionButton
                          variant="contained"
                          size="small"
                          onClick={() => handleAccreditClick(app)}
                        >
                          Start Accreditation
                        </ActionButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ 
                textAlign: "center", 
                py: 6,
                px: 3
              }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No accepted applicants found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No accepted applicants available for accreditation in your department.
                </Typography>
              </Box>
            )}
          </CardContent>
        </InfoCard>
      </Grow>
    </Box>
  );
};

export default Accreditations;