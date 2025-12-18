import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BookIcon from "@mui/icons-material/Book";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import MainLayout from "../../../templates/MainLayout";
import login2Bg from '../../../assets/login2-bg.png';
import {
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  alpha,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grow,
  TextField,
  MenuItem,
} from "@mui/material";


const maroon = {
  light: "#8D323C",
  main: "#6A0000",
  dark: "#450000",
  contrastText: "#FFFFFF",
};

const gold = {
  light: "#FFF0B9",
  main: "#FFC72C",
  dark: "#D4A500",
  contrastText: "#000000",
};

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
    backgroundColor: alpha(gold.light, 0.12),
  },
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.24),
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

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': { display: 'none' },
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

const AdviserHomePage = () => {
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [recordsMap, setRecordsMap] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [editRow, setEditRow] = useState({}); // { [recordId]: true }
  const [editFields, setEditFields] = useState({}); // { [recordId]: { grade, processOfAccreditation, substantiveBasis } }
  const [adviserName, setAdviserName] = useState("");

  useEffect(() => {
    // Fetch adviser profile for name
    const adviserId = localStorage.getItem("evaluatorId");
    if (adviserId) {
      fetch(`https://eteeap-foth.onrender.com/api/evaluators/${adviserId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && (data.name || (data.firstName && data.lastName))) {
            setAdviserName(data.name || `${data.firstName} ${data.lastName}`);
          }
        });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const adviserId = localStorage.getItem("evaluatorId");
        console.log("Adviser ID from localStorage:", adviserId);
        
        if (!adviserId) {
          console.warn("No evaluatorId found in localStorage");
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // First, fetch assignments for this adviser
        const assignmentsUrl = `https://eteeap-foth.onrender.com/api/assignments/evaluator/${adviserId}`;
        console.log("Fetching assignments from:", assignmentsUrl);
        const assignmentsRes = await fetch(assignmentsUrl);
        
        console.log("Assignments API response status:", assignmentsRes.status);
        
        if (!assignmentsRes.ok) {
          const errorText = await assignmentsRes.text();
          console.warn("Error fetching assignments:", assignmentsRes.status, errorText);
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        const assignments = await assignmentsRes.json();
        console.log("Fetched assignments:", assignments);
        
        // Ensure assignments is an array
        if (!Array.isArray(assignments) || assignments.length === 0) {
          console.warn("No assignments found for this adviser");
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // Extract applicant IDs from assignments
        const assignedApplicantIds = assignments.map(assignment => assignment.applicant?.applicantId).filter(Boolean);
        console.log("Assigned applicant IDs:", assignedApplicantIds);
        
        if (assignedApplicantIds.length === 0) {
          setApplicants([]);
          setRecordsMap({});
          setLoading(false);
          return;
        }
        
        // Fetch all accepted applicants
        const res = await fetch("https://eteeap-foth.onrender.com/api/accepted-applicants");
        const allApplicants = await res.json();
        console.log("All accepted applicants:", allApplicants.length);
        
        // Filter to only assigned applicants
        const assignedApplicants = allApplicants.filter(app => 
          assignedApplicantIds.includes(app.applicant?.applicantId)
        );
        console.log("Filtered assigned applicants:", assignedApplicants.length);

        const recordsData = {};

        if (assignedApplicantIds.length > 0) {
          const promises = assignedApplicantIds.map((id) =>
            fetch(`https://eteeap-foth.onrender.com/api/applicant-subject-records/applicant/${id}/organized-clean`)
              .then((r) => (r.ok ? r.json() : {}))
              .catch(() => ({}))
          );
          const results = await Promise.all(promises);
          assignedApplicantIds.forEach((id, idx) => {
            const rec = results[idx];
            if (rec && Object.keys(rec).length > 0) {
              recordsData[id] = rec;
            }
          });
        }

        const accredited = assignedApplicants.filter((app) => recordsData[app.applicant?.applicantId]);
        console.log("Accredited applicants with records:", accredited.length);
        setApplicants(accredited);
        setRecordsMap(recordsData);
      } catch (err) {
        console.error("Error fetching adviser dashboard data:", err);
        setApplicants([]);
        setRecordsMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (rec) => {
    setEditRow((prev) => ({ ...prev, [rec.id]: true }));
    setEditFields((prev) => ({
      ...prev,
      [rec.id]: {
        grade: rec.grade || "",
        processOfAccreditation: rec.processOfAccreditation || "",
        substantiveBasis: rec.substantiveBasis || "",
      },
    }));
  };

  const handleEditFieldChange = (recId, field, value) => {
    setEditFields((prev) => ({
      ...prev,
      [recId]: {
        ...prev[recId],
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async (rec, semester, applicantId) => {
    const updated = { ...editFields[rec.id], status: "APPROVED" }; // Set status to APPROVED
    try {
      const params = new URLSearchParams();
      Object.entries(updated).forEach(([key, value]) => {
        params.append(key, value ?? "");
      });
      await fetch(
        `https://eteeap-foth.onrender.com/api/applicant-subject-records/${rec.id}?${params.toString()}`,
        { method: "PUT", headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      // Update local state after save
      setRecordsMap((prev) => {
        const newMap = { ...prev };
        if (newMap[applicantId] && newMap[applicantId][semester]) {
          newMap[applicantId][semester] = newMap[applicantId][semester].map((r) =>
            r.id === rec.id ? { ...r, ...updated } : r
          );
        }
        return newMap;
      });
      setEditRow((prev) => ({ ...prev, [rec.id]: false }));
    } catch (err) {
      window.alert("Failed to save changes.");
    }
  };

  // Add cancel edit
  const handleCancelEdit = (recId) => {
    setEditRow((prev) => ({ ...prev, [recId]: false }));
  };

  return (
    <MainLayout userType="adviser" data={adviserName || "Adviser Portal"} adviserName={adviserName}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        {/* Welcome Card */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            background: `url(${login2Bg}) center/cover no-repeat`,
            color: "white",
            minHeight: 300,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              {adviserName ? `Welcome ${adviserName}` : "Welcome to Your Adviser Dashboard"}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage and review applications and accreditations for all accepted students
            </Typography>
          </Stack>
        </Paper>

        {/* Data Sections */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Applicants with graded records */}
            <InfoCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#000', 0.08)}` }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon sx={{ color: maroon.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Accredited Applicants ({applicants.length})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Applicants that already have graded subject records
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {applicants.length > 0 ? (
                  <Table>
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
                      {applicants.map((app) => (
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
                          <StyledTableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                backgroundColor: maroon.main,
                                '&:hover': { backgroundColor: maroon.dark },
                              }}
                              onClick={() => {
                                setSelectedApplicant({
                                  applicantId: app.applicant?.applicantId,
                                  courseId: app.finalCourse?.courseId,
                                });
                                setDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6, mb: 1 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No accredited applicants yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Graded applicants will appear once subject records are created.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </InfoCard>

            {/* Graded accreditations */}
            <Grow in={true} timeout={400}>
              <InfoCard>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <AssignmentIcon sx={{ color: gold.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Graded Accreditations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Organized by applicant and semester
                      </Typography>
                    </Box>
                  </Stack>

                  {applicants.length > 0 ? (
                    applicants.map((applicant) => {
                      const applicantId = applicant.applicant?.applicantId;
                      const records = recordsMap[applicantId] || {};

                      return (
                        <StyledAccordion key={applicantId} defaultExpanded={false}>
                          <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                              <Avatar sx={{ bgcolor: maroon.main }}>
                                {applicant.applicant?.firstName?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                                  {`${applicant.applicant?.firstName || ""} ${applicant.applicant?.lastName || ""}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {applicant.finalCourse?.courseName}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${Object.values(records).flat().filter(r => r.status === 'APPROVED').length} / ${Object.values(records).flat().length} Approved`}
                                color={Object.values(records).flat().every(r => r.status === 'APPROVED') ? 'success' : 'warning'}
                                variant="outlined"
                                size="small"
                              />
                            </Stack>
                          </StyledAccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {Object.keys(records).map((semester) => (
                              <Box key={semester} sx={{ mb: 3, p: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                  <BookIcon sx={{ color: maroon.main }} />
                                  <Box>
                                    <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
                                      {semester}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {records[semester].length} subjects
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <StyledTableCell>Subject</StyledTableCell>
                                      <StyledTableCell>Grade</StyledTableCell>
                                      <StyledTableCell>Process of Accreditation</StyledTableCell>
                                      <StyledTableCell>Substantive Basis</StyledTableCell>
                                      <StyledTableCell>Status</StyledTableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {records[semester].map((rec) => {
                                      const isPending = rec.status === "PENDING";
                                      const isEditing = !!editRow[rec.id];
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
                                          <StyledTableCell>
                                            {isEditing ? (
                                              <TextField
                                                size="small"
                                                value={editFields[rec.id]?.grade ?? ""}
                                                onChange={e => handleEditFieldChange(rec.id, "grade", e.target.value)}
                                                fullWidth
                                                placeholder="Grade"
                                                variant="outlined"
                                                sx={{ minWidth: 90, background: "#fff" }}
                                                inputProps={{ style: { fontWeight: 600 } }}
                                              />
                                            ) : (
                                              <Typography variant="body2" fontWeight={600}>
                                                {rec.grade || "N/A"}
                                              </Typography>
                                            )}
                                          </StyledTableCell>
                                          <StyledTableCell>
                                            {isEditing ? (
                                              <TextField
                                                select
                                                size="small"
                                                value={editFields[rec.id]?.processOfAccreditation ?? ""}
                                                onChange={e => handleEditFieldChange(rec.id, "processOfAccreditation", e.target.value)}
                                                fullWidth
                                                placeholder="Select process"
                                                variant="outlined"
                                                sx={{ minWidth: 160, background: "#fff" }}
                                              >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                <MenuItem value="TOR Accreditation">TOR Accreditation</MenuItem>
                                                <MenuItem value="Portfolio Review">Portfolio Review</MenuItem>
                                                <MenuItem value="Remediation Class">Remediation Class</MenuItem>
                                                <MenuItem value="Home Reading Report">Home Reading Report</MenuItem>
                                                <MenuItem value="One-on-One Tutorial">One-on-One Tutorial</MenuItem>
                                                <MenuItem value="Problem Solving">Problem Solving</MenuItem>
                                                <MenuItem value="Job Description Review">Job Description Review</MenuItem>
                                              </TextField>
                                            ) : (
                                              rec.processOfAccreditation || "N/A"
                                            )}
                                          </StyledTableCell>
                                          <StyledTableCell>
                                            {isEditing ? (
                                              <TextField
                                                size="small"
                                                value={editFields[rec.id]?.substantiveBasis ?? ""}
                                                onChange={e => handleEditFieldChange(rec.id, "substantiveBasis", e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={2}
                                                placeholder="Enter basis"
                                                variant="outlined"
                                                sx={{ minWidth: 160, background: "#fff" }}
                                              />
                                            ) : (
                                              rec.substantiveBasis || "N/A"
                                            )}
                                          </StyledTableCell>
                                          <StyledTableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                              <Chip
                                                label={rec.status || "PENDING"}
                                                color={rec.status === 'APPROVED' ? 'success' : rec.status === 'REJECTED' ? 'error' : 'warning'}
                                                size="small"
                                                variant="outlined"
                                                icon={rec.status === "APPROVED" ? <CheckCircleIcon fontSize="small" /> : undefined}
                                              />
                                              {isPending && (
                                                isEditing ? (
                                                  <>
                                                    <Button
                                                      size="small"
                                                      variant="contained"
                                                      color="success"
                                                      startIcon={<SaveIcon />}
                                                      sx={{
                                                        ml: 1,
                                                        borderRadius: 2,
                                                        minWidth: 0,
                                                        px: 2,
                                                        boxShadow: "none",
                                                        fontWeight: 600,
                                                        textTransform: "none",
                                                        background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)"
                                                      }}
                                                      onClick={() => handleSaveEdit(rec, semester, applicantId)}
                                                    >
                                                      Save
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      color="inherit"
                                                      startIcon={<CancelIcon />}
                                                      sx={{
                                                        ml: 1,
                                                        borderRadius: 2,
                                                        minWidth: 0,
                                                        px: 2,
                                                        fontWeight: 600,
                                                        textTransform: "none",
                                                        borderColor: "#aaa"
                                                      }}
                                                      onClick={() => handleCancelEdit(rec.id)}
                                                    >
                                                      Cancel
                                                    </Button>
                                                  </>
                                                ) : (
                                                  <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<EditIcon />}
                                                    sx={{
                                                      ml: 1,
                                                      borderRadius: 2,
                                                      minWidth: 0,
                                                      px: 2,
                                                      fontWeight: 600,
                                                      textTransform: "none",
                                                      borderColor: maroon.main,
                                                      color: maroon.main,
                                                      "&:hover": {
                                                        background: maroon.main,
                                                        color: "#fff",
                                                        borderColor: maroon.main,
                                                      }
                                                    }}
                                                    onClick={() => handleEditClick(rec)}
                                                  >
                                                    Edit
                                                  </Button>
                                                )
                                              )}
                                            </Stack>
                                          </StyledTableCell>
                                        </StyledTableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </Box>
                            ))}
                          </AccordionDetails>
                        </StyledAccordion>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.6, mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No graded accreditations yet.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </InfoCard>
            </Grow>
          </Stack>
        )}

        {/* Info Card */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(gold.light, 0.15),
            borderLeft: `4px solid ${gold.main}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <DashboardIcon sx={{ color: gold.main, mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                About Your Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the navigation to access accepted applicants and their graded accreditations.
                You can view student profiles, documents, and course information for every accepted applicant with records.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
      {/* Applicant Details Modal */}
      <ApplicantDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        applicantId={selectedApplicant?.applicantId}
        courseId={selectedApplicant?.courseId}
      />
      {/* <GradedAccreditation
        applicantId={gradedApplicant?.applicantId}
        curriculumId={gradedApplicant?.curriculumId}
        isOpen={gradedModalOpen}
        onClose={() => setGradedModalOpen(false)}
      /> */}
    </MainLayout>
  );
};

export default AdviserHomePage;