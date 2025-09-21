import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const API_URL = "http://localhost:8080/api/accepted-applicants";
const EVALUATOR_API = "http://localhost:8080/api/evaluators";

const Accreditations = () => {
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
  const navigate = useNavigate();

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
            fetch(`http://localhost:8080/api/applicant-subject-records/applicant/${id}`)
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
      fetch(`http://localhost:8080/api/curriculums?departmentId=${departmentId}`)
        .then(res => res.json())
        .then(data => setCurriculums(data))
        .catch(() => setCurriculums([]));
    }
  }, [departmentId]);

  const displayedApplicants = selectedCourse
    ? acceptedApplicants.filter(a => a.finalCourse.courseId === selectedCourse)
    : acceptedApplicants;

  const handleAccreditClick = applicant => {
    setSelectedApplicant(applicant);
    setConfirmOpen(true);
  };

  const handleConfirmAccredit = async () => {
    setConfirmOpen(false);
    if (selectedApplicant && selectedCurriculumId) {
      try {
        const applicantId = selectedApplicant.applicant?.applicantId;
        const params = new URLSearchParams({ curriculumId: selectedCurriculumId });
        const url = `http://localhost:8080/api/applicants/${applicantId}/create-curriculum-record?${params.toString()}`;
        const response = await fetch(url, { method: "POST" });
        if (!response.ok) {
          const errorText = await response.text();
          alert(`Failed to create curriculum record: ${response.status} ${errorText}`);
        }
      } catch (err) {
        alert("Network error while creating curriculum record.");
      }
      navigate("/evaluator/graded-accreditation", {
        state: {
          applicantId: selectedApplicant.applicant?.applicantId,
          curriculumId: selectedCurriculumId,
        },
      });
    } else {
      alert("Please select a curriculum.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Accepted Applicants (Accreditations)
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Filter by Course:
        </Typography>
        <Select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          displayEmpty
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All Courses</MenuItem>
          {courses.map(course => (
            <MenuItem key={course.courseId} value={course.courseId}>
              {course.courseName}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
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
                <TableCell>Applicant Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Acceptance Date</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedApplicants.map(app => (
                <TableRow key={app.acceptedApplicantId}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {app.applicant?.firstName?.charAt(0)}
                      </Avatar>
                      <Typography>
                        {`${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{app.finalCourse?.courseName}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {app.acceptanceDate
                      ? new Date(app.acceptanceDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{app.remarks || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleAccreditClick(app)}
                    >
                      Accredit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography sx={{ py: 4, textAlign: "center" }}>
            No accepted applicants found for your department.
          </Typography>
        )}
      </Paper>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Accreditation</DialogTitle>
        <DialogContent>
          Are you sure you want to accredit this applicant? This will proceed to
          the graded accreditation process.
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Select Curriculum:
            </Typography>
            <Select
              value={selectedCurriculumId}
              onChange={e => setSelectedCurriculumId(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="" disabled>
                Choose curriculum
              </MenuItem>
              {curriculums.map(cur => (
                <MenuItem key={cur.id} value={cur.id}>
                  {cur.programName} ({cur.yearStarted})
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAccredit}
            variant="contained"
            color="primary"
            disabled={!selectedCurriculumId}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accreditations;

