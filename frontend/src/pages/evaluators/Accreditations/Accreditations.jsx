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
  Dialog,
  DialogContent,
  Card,
  CardContent,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Divider from '@mui/material/Divider';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [accreditLoading, setAccreditLoading] = useState(false);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

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

  // Auto-fetch curriculum based on selected applicant's course
  useEffect(() => {
    if (selectedApplicant?.finalCourse?.courseId && confirmOpen) {
      setLoadingCurriculum(true);
      fetch(`https://eteeap-foth.onrender.com/api/curriculums/course/${selectedApplicant.finalCourse.courseId}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No curriculum found for this course');
        })
        .then(curriculum => {
          setSelectedCurriculumId(curriculum.id);
          toast.success('Curriculum automatically selected');
        })
        .catch(() => {
          // Fallback: if no direct course-curriculum relationship exists,
          // try to find a curriculum matching the course's department
          const courseDeptId = selectedApplicant.finalCourse?.department?.departmentId;
          if (courseDeptId && curriculums.length > 0) {
            const matchingCurriculum = curriculums.find(c => 
              c.department?.departmentId === courseDeptId
            );
            if (matchingCurriculum) {
              setSelectedCurriculumId(matchingCurriculum.id);
              toast.info('Curriculum auto-selected based on department');
            } else {
              toast.warning('Please select a curriculum manually');
            }
          } else {
            toast.warning('Please select a curriculum manually');
          }
        })
        .finally(() => setLoadingCurriculum(false));
    }
  }, [selectedApplicant, confirmOpen, curriculums]);

  const displayedApplicants = acceptedApplicants.filter(a => {
    const matchesCourse = !selectedCourse || a.finalCourse.courseId === selectedCourse;
    return matchesCourse;
  });

  const handleAccreditClick = applicant => {
    setSelectedApplicant(applicant);
    setSelectedCurriculumId(""); // Reset curriculum selection
    setConfirmOpen(true);
  };

  const handleConfirmAccredit = async () => {
    if (!selectedApplicant || !selectedCurriculumId) {
      toast.warning("Please select a curriculum before proceeding.");
      return;
    }

    setAccreditLoading(true);
    toast.info("Creating curriculum records... This may take a moment.");
    
    try {
      const applicantId = selectedApplicant.applicant?.applicantId;
      const params = new URLSearchParams({ curriculumId: selectedCurriculumId });
      const url = `https://eteeap-foth.onrender.com/api/applicants/${applicantId}/create-curriculum-record?${params.toString()}`;
      const response = await fetch(url, { method: "POST" });
      
      if (response.ok) {
        toast.success("Curriculum records created successfully!");
        
        // Wait a moment to ensure records are fully committed to database
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Close modal
        setConfirmOpen(false);
        
        // Redirect to accredited accounts and open the modal for this applicant
        navigate(`/evaluator/accredited-accounts`, {
          state: {
            openApplicantId: applicantId,
            openCurriculumId: selectedCurriculumId
          }
        });
      } else {
        const errorText = await response.text();
        toast.error(`Failed to create curriculum record: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error("Error creating curriculum record:", err);
      toast.error("Network error while creating curriculum record. Please try again.");
    } finally {
      setAccreditLoading(false);
    }
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

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
            px: 3,
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: alpha('#fff', 0.15),
              border: `2px solid ${alpha('#fff', 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <VerifiedUserIcon sx={{ color: gold.main, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
              Confirm Accreditation
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.75), fontSize: 12 }}>
              Review the details below before proceeding
            </Typography>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {/* Applicant Info Section */}
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: maroon.main, fontWeight: 700, letterSpacing: 1, fontSize: 10 }}
            >
              Applicant Details
            </Typography>

            {selectedApplicant && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${alpha(maroon.main, 0.15)}`,
                  bgcolor: alpha(gold.light, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: maroon.main,
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {selectedApplicant.applicant?.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color={maroon.dark}>
                    {`${selectedApplicant.applicant?.firstName || ""} ${selectedApplicant.applicant?.lastName || ""}`}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <SchoolIcon sx={{ fontSize: 14, color: maroon.light }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedApplicant.finalCourse?.courseName}
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    label={selectedApplicant.status}
                    size="small"
                    sx={{
                      bgcolor: alpha('#2e7d32', 0.1),
                      color: '#2e7d32',
                      border: '1px solid #a5d6a7',
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ mx: 3 }} />

          {/* Curriculum Section */}
          <Box sx={{ px: 3, pt: 2, pb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <MenuBookIcon sx={{ fontSize: 16, color: maroon.main }} />
              <Typography
                variant="overline"
                sx={{ color: maroon.main, fontWeight: 700, letterSpacing: 1, fontSize: 10 }}
              >
                Curriculum
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {loadingCurriculum 
                ? "Automatically selecting curriculum based on course..." 
                : "The curriculum will be used for this accreditation process."}
            </Typography>
            <Select
              value={selectedCurriculumId}
              onChange={e => setSelectedCurriculumId(e.target.value)}
              displayEmpty
              fullWidth
              disabled={loadingCurriculum}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: selectedCurriculumId ? maroon.main : alpha(maroon.main, 0.3),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: maroon.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: maroon.main,
                },
              }}
            >
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Choose a curriculum...
                </Typography>
              </MenuItem>
              {curriculums.map(cur => (
                <MenuItem key={cur.id} value={cur.id}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <MenuBookIcon sx={{ fontSize: 16, color: gold.dark }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {cur.programName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Started: {cur.yearStarted}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))}
            </Select>

            {!selectedCurriculumId && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: '#e65100',
                }}
              >
                * Curriculum selection is required to proceed
              </Typography>
            )}

            {selectedCurriculumId && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                <Typography variant="caption" color="#2e7d32" fontWeight={600}>
                  Curriculum selected — ready to proceed
                </Typography>
              </Stack>
            )}
          </Box>
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: alpha(gold.light, 0.1),
            borderTop: `1px solid ${alpha(maroon.main, 0.1)}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: alpha(maroon.main, 0.4),
              color: maroon.main,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': {
                borderColor: maroon.main,
                bgcolor: alpha(maroon.main, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <ActionButton
            onClick={handleConfirmAccredit}
            variant="contained"
            disabled={!selectedCurriculumId || accreditLoading || loadingCurriculum}
            startIcon={
              accreditLoading
                ? <CircularProgress size={16} sx={{ color: 'white' }} />
                : <VerifiedUserIcon sx={{ fontSize: 18 }} />
            }
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: (!selectedCurriculumId || accreditLoading || loadingCurriculum) ? 'grey.300' : maroon.main,
              '&:hover': {
                bgcolor: (!selectedCurriculumId || accreditLoading || loadingCurriculum) ? 'grey.300' : maroon.dark,
              },
            }}
          >
            {accreditLoading ? 'Creating Records...' : loadingCurriculum ? 'Loading...' : 'Start Accreditation'}
          </ActionButton>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Accreditations;