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
  
  useEffect(() => {
    // Simplified approach: just fetch ALL evaluations
    fetch(`http://localhost:8080/api/evaluations/all`)
      .then((res) => {
        if (!res.ok) {
          console.error(`Error fetching evaluations: HTTP ${res.status}`);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async (data) => {
        console.log("All evaluations:", data);
        if (Array.isArray(data)) {
          // Process evaluations to ensure all have required fields
          const processedEvaluations = data.map(ev => ({
            ...ev,
            applicantId: ev.applicant?.applicantId || ev.applicantId,
            courseId: ev.course?.courseId || ev.courseId
          }));
          
          setEvaluations(processedEvaluations);
          
          // Extract applicant and course IDs for fetching additional data
          const applicantIds = [...new Set(
            processedEvaluations
              .map((ev) => ev.applicant?.applicantId || ev.applicantId)
              .filter(Boolean)
          )];
          
          const courseIds = [...new Set(
            processedEvaluations
              .map((ev) => ev.course?.courseId || ev.courseId)
              .filter(Boolean)
          )];
          
          console.log("Applicant IDs to fetch:", applicantIds);
          console.log("Course IDs to fetch:", courseIds);
          
          // Fetch applicants
          if (applicantIds.length > 0) {
            const applicantPromises = applicantIds.map(async id => {
              const applicant = await fetchApplicant(id);
              return [id, applicant];
            });
            const applicantObj = Object.fromEntries(
              (await Promise.all(applicantPromises)).filter(([_, value]) => value !== null)
            );
            setApplicantMap(applicantObj);
          }
          
          // Fetch courses
          if (courseIds.length > 0) {
            const coursePromises = courseIds.map(async id => {
              const course = await fetchCourse(id);
              return [id, course];
            });
            const courseObj = Object.fromEntries(
              (await Promise.all(coursePromises)).filter(([_, value]) => value !== null)
            );
            setCourseMap(courseObj);
          }
        } else {
          console.error("Backend returned non-array data:", data);
          setEvaluations([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch evaluations:", err);
        setEvaluations([]);
      });
  }, []);
  
  // Simplified data source - just return all evaluations
  const paginatedData = evaluations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Improved ViewApplication function to handle both applicantId and evaluationId
  const handleViewApplication = (item) => {
    console.log("Viewing application item details:", item);
    const applicantId = item.applicant?.applicantId || item.applicantId;
    const courseId = item.course?.courseId || item.courseId;
    const evaluationId = item.evaluationId;
    
    if (!applicantId) {
      console.error("Missing applicantId in selected item:", item);
      return; // Prevent navigation with missing ID
    }
    
    navigate("/evaluator/applicants/view-applicant", {
      state: { 
        applicantId,
        evaluationId,
        courseId
      }
    });
  };

  // Improved status chip display with better conditional checks
  const getStatusChip = (item) => {
    // Check if this item has an evaluation status and has been explicitly evaluated
    if (item && item.evaluationStatus && item.evaluationStatus !== "PENDING") {
      return (
        <Chip
          icon={item.evaluationStatus === "APPROVED" ? <CheckCircleIcon fontSize="small" /> : null}
          label={item.evaluationStatus}
          color={
            item.evaluationStatus === "APPROVED" ? "success" : 
            item.evaluationStatus === "REJECTED" ? "error" : 
            "default"
          }
          size="small"
        />
      );
    } 
    // For pending evaluations that haven't been started yet
    else if (item && item.evaluationStatus === "PENDING") {
      return (
        <Chip
          icon={<PendingIcon fontSize="small" />}
          label="In Progress"
          color="warning"
          size="small"
        />
      );
    }
    // For evaluations not yet started
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
  
  // Simplified pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <ListLayoutWithFilters>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            All Evaluations
          </Typography>
          <Chip 
            label={`${evaluations.length} Records`}
            color="primary"
            size="medium"
          />
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
                // Properly check if the item has been evaluated
                const isEvaluated = Boolean(
                  item.evaluationStatus && 
                  item.evaluationStatus !== "PENDING" && 
                  item.dateEvaluated
                );
                
                const applicantId = item.applicant?.applicantId;
                const courseId = item.course?.courseId;
                
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
                  <TableRow key={`${item.evaluationId || index}`} 
                    sx={!isEvaluated ? { backgroundColor: 'rgba(255, 244, 229, 0.3)' } : {}}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {!isEvaluated && (
                          <Tooltip title="Needs evaluation">
                            <PendingIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                          </Tooltip>
                        )}
                        {fullName}
                      </Box>
                    </TableCell>
                    <TableCell>{course?.courseName || "-"}</TableCell>
                    <TableCell>{getStatusChip(item)}</TableCell>
                    <TableCell>
                      {item.forwardedAt
                        ? new Date(item.forwardedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {item.dateEvaluated && item.evaluationStatus
                        ? new Date(item.dateEvaluated).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: "20px",
                          color: !isEvaluated ? "#ff6d00" : "#800000",
                          borderColor: !isEvaluated ? "#ff6d00" : "#800000",
                          fontWeight: !isEvaluated ? 600 : 400,
                        }}
                        onClick={() => handleViewApplication(item)}
                      >
                        {!isEvaluated ? "Evaluate Now" : "View Application"}
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
              No evaluation records found
            </Typography>
          </Box>
        )}

        {/* Pagination Controls */}
        <TablePagination
          component="div"
          count={evaluations.length}
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
