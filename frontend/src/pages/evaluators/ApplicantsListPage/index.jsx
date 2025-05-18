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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListLayoutWithFilters from "../../../templates/ListLayoutWithFilters";

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
  console.log("Logged in evaluatorId:", evaluatorId);
  const [evaluations, setEvaluations] = useState([]);
  const [applicantMap, setApplicantMap] = useState({});
  const [courseMap, setCourseMap] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    if (evaluatorId) {
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
    }
  }, [evaluatorId]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Always use an array for paginatedData
  const paginatedData = Array.isArray(evaluations)
    ? evaluations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];
  const handleViewApplication = (applicantId) => {
    // Pass applicantId in navigation state for ViewApplicantPage
    navigate("/evaluator/applicants/view-applicant", {
      state: { applicantId }
    });
  };

  return (
    <ListLayoutWithFilters>
      {/* Show evaluatorId for demonstration */}
      {evaluatorId && (
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          
        </div>
      )}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant Name</TableCell>
              <TableCell>Course Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Evaluated</TableCell>
              
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((evaluation) => {
              const applicantId =
                evaluation.applicant?.applicantId || evaluation.applicantId;
              const courseId = evaluation.course?.courseId || evaluation.courseId;
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
                <TableRow key={evaluation.evaluationId}>
                  <TableCell>
                    {fullName}
                  </TableCell>
                  <TableCell>
                    {course?.courseName || "-"}
                  </TableCell>
                  <TableCell>
                    {evaluation.evaluationStatus || "-"}
                  </TableCell>
                  <TableCell>
                    {evaluation.dateEvaluated
                      ? new Date(evaluation.dateEvaluated).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: "20px",
                        color: "#800000",
                        borderColor: "#800000",
                      }}
                      onClick={() => handleViewApplication(applicantId)}
                    >
                      View Application
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

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
