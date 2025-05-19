import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  TablePagination,
  Chip,
  Typography,
  Tabs,
  Tab,
  Box,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListLayoutWithFilters from "../../../templates/ListLayoutWithFilters";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Helper to fetch applicant and course details by ID
const fetchApplicant = async (applicantId) => {
  if (!applicantId) return null;
  try {
    // Use the correct endpoint for fetching applicant by ID
    const res = await fetch(`http://localhost:8080/api/applicants/${applicantId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const fetchCourse = async (courseId) => {
  if (!courseId) return null;
  try {
    // Use the correct endpoint for fetching course by ID
    const res = await fetch(`http://localhost:8080/api/courses/${courseId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const ApplicantsListPage = () => {
  const evaluatorId = localStorage.getItem("evaluatorId");
  const [evaluations, setEvaluations] = useState([]);
  const [applicantMap, setApplicantMap] = useState({});
  const [courseMap, setCourseMap] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  
  // New state for forwarded applications that aren't evaluated yet
  const [forwardedApplications, setForwardedApplications] = useState([]);
  
  // Tab state for switching between all and pending applications
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (evaluatorId) {
      // Fetch evaluations that this evaluator has already worked on
      fetch(`http://localhost:8080/api/evaluations/evaluator/${evaluatorId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (Array.isArray(data)) {
            setEvaluations(data);
            
            // Fetch all unique applicantIds and courseIds
            const applicantIds = [
              ...new Set(
                data
                  .map((ev) => ev.applicant?.applicantId || ev.applicantId)
                  .filter(Boolean)
              ),
            ];
            const courseIds = [
              ...new Set(
                data.map((ev) => ev.course?.courseId || ev.courseId).filter(Boolean)
              ),
            ];

            // Fetch applicants
            const applicantEntries = await Promise.all(
              applicantIds.map(async (id) => [id, await fetchApplicant(id)])
            );
            const applicantObj = Object.fromEntries(applicantEntries);

            // Fetch courses
            const courseEntries = await Promise.all(
              courseIds.map(async (id) => [id, await fetchCourse(id)])
            );
            const courseObj = Object.fromEntries(courseEntries);

            setApplicantMap(applicantObj);
            setCourseMap(courseObj);
          } else {
            setEvaluations([]);
            setApplicantMap({});
            setCourseMap({});
            console.error("Backend did not return an array:", data);
          }
        })
        .catch((err) => {
          setEvaluations([]);
          setApplicantMap({});
          setCourseMap({});
          console.error("Failed to fetch evaluations:", err);
        });
        
      // Fetch applications that were forwarded to this evaluator but not yet evaluated
      fetch(`http://localhost:8080/api/applicants/forwarded/${evaluatorId}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (Array.isArray(data)) {
            setForwardedApplications(data);
            
            // Fetch applicant info and add to applicant map
            const applicantPromises = data.map(async (app) => [
              app.applicantId, 
              await fetchApplicant(app.applicantId)
            ]);
            
            const newApplicants = Object.fromEntries(await Promise.all(applicantPromises));
            
            setApplicantMap(prev => ({...prev, ...newApplicants}));
          }
        })
        .catch((err) => {
          console.error("Failed to fetch forwarded applications:", err);
          setForwardedApplications([]);
        });
    }
  }, [evaluatorId]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get correct data source based on active tab
  const getDataSource = () => {
    return tabValue === 0 ? 
      // Combined list: applications specifically forwarded to this evaluator first
      [...forwardedApplications.filter(app => 
        !evaluations.some(ev => ev.applicantId === app.applicantId)
      ), ...evaluations] : 
      // Just pending applications from admin
      forwardedApplications.filter(app => 
        !evaluations.some(ev => ev.applicantId === app.applicantId)
      );
  };

  // Always use an array for paginatedData
  const filteredData = getDataSource();
  const paginatedData = Array.isArray(filteredData)
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  const handleViewApplication = (applicantId) => {
    // Pass applicantId in navigation state for ViewApplicantPage
    navigate("/evaluator/applicants/view-applicant", {
      state: { applicantId }
    });
  };

  const getStatusChip = (item) => {
    // If it's an evaluation
    if (item.evaluationId) {
      return (
        <Chip
          label={item.evaluationStatus || "PENDING"}
          color={
            item.evaluationStatus === "APPROVED" ? "success" : 
            item.evaluationStatus === "REJECTED" ? "error" : "default"
          }
          size="small"
        />
      );
    } 
    // If it's a forwarded application not yet evaluated
    else {
      return (
        <Chip
          icon={<HourglassEmptyIcon fontSize="small" />}
          label="Awaiting Evaluation"
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }
  };

  return (
    <ListLayoutWithFilters>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>All Applications</span>
                <Chip 
                  label={evaluations.length + forwardedApplications.filter(app => 
                    !evaluations.some(ev => ev.applicantId === app.applicantId)
                  ).length} 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            } />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <span>Needs Evaluation</span>
                <Chip 
                  label={forwardedApplications.filter(app => 
                    !evaluations.some(ev => ev.applicantId === app.applicantId)
                  ).length} 
                  color="warning"
                  size="small" 
                  sx={{ ml: 1 }}
                />
              </Box>
            } />
          </Tabs>
        </Box>

        {paginatedData.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant Name</TableCell>
                <TableCell>Course Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Forwarded At</TableCell>
                <TableCell>Evaluated Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((item, index) => {
                // Determine if this is an evaluation or just a forwarded application
                const isEvaluation = Boolean(item.evaluationId);
                
                const applicantId = isEvaluation 
                  ? (item.applicant?.applicantId || item.applicantId)
                  : item.applicantId;
                  
                const courseId = isEvaluation
                  ? (item.course?.courseId || item.courseId)
                  : (item.courseId || (item.preferences && item.preferences[0]?.courseId));
                  
                const applicant = applicantMap[applicantId];
                const course = courseMap[courseId];
                
                const fullName = applicant
                  ? [
                      applicant.firstName,
                      applicant.middleInitial
                        ? applicant.middleInitial + "."
                        : "",
                      applicant.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : "-";
                  
                return (
                  <TableRow key={index} 
                    sx={!isEvaluation ? { backgroundColor: 'rgba(255, 244, 229, 0.3)' } : {}}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {!isEvaluation && (
                          <Tooltip title="New application forwarded by admin">
                            <PendingIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                          </Tooltip>
                        )}
                        {fullName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {course?.courseName || "-"}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(item)}
                    </TableCell>
                    <TableCell>
                      {item.forwardedAt
                        ? new Date(item.forwardedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {isEvaluation && item.dateEvaluated
                        ? new Date(item.dateEvaluated).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: "20px",
                          color: !isEvaluation ? "#ff6d00" : "#800000",
                          borderColor: !isEvaluation ? "#ff6d00" : "#800000",
                          fontWeight: !isEvaluation ? 600 : 400,
                        }}
                        onClick={() => handleViewApplication(applicantId)}
                      >
                        {!isEvaluation ? "Evaluate Now" : "View Application"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {tabValue === 0 
                ? "No applications available for evaluation" 
                : "No new applications forwarded for evaluation"}
            </Typography>
          </Box>
        )}

        {/* Pagination Controls */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </ListLayoutWithFilters>
  );
};

export default ApplicantsListPage;
