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
  Box,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ListLayoutWithFilters from "../../../templates/ListLayoutWithFilters";

// Mock data that matches backend model structure
const mockApplicants = Array.from({ length: 62 }).map((_, i) => ({
  applicantId: i + 1,
  firstName: `John${i + 1}`,
  middleInitial: "D",
  lastName: `Doe${i + 1}`,
  email: `applicant${i + 1}@example.com`,
  contactNumber: `09${Math.floor(Math.random() * 1000000000)}`,
  preferences: [
    {
      preferenceId: i * 3 + 1,
      course: {
        courseId: 1,
        courseName: i % 3 === 0 ? "BSIT" : i % 3 === 1 ? "BSEd" : "BSBA",
      },
      priorityOrder: "FIRST",
      status: ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"][i % 4],
    },
  ],
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 86400000
  )
    .toISOString()
    .split("T")[0],
}));

const ApplicantsListPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API fetch
    const fetchApplicants = () => {
      setLoading(true);
      setTimeout(() => {
        setApplicants(mockApplicants);
        setLoading(false);
      }, 800);
    };

    fetchApplicants();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = applicants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleViewApplication = (applicantId) => {
    // Ensure applicantId is properly passed as a string in the URL
    navigate(`/evaluator/applicants/view-applicant/${applicantId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "#FFF9C4", color: "#9E9D24" };
      case "REVIEWED":
        return { bg: "#E3F2FD", color: "#1565C0" };
      case "ACCEPTED":
        return { bg: "#E8F5E9", color: "#2E7D32" };
      case "REJECTED":
        return { bg: "#FFEBEE", color: "#C62828" };
      default:
        return { bg: "#F5F5F5", color: "#757575" };
    }
  };

  return (
    <ListLayoutWithFilters>
      <Paper elevation={3} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#800000" }} />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Applicant Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Contact Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date Applied</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((applicant) => (
                  <TableRow key={applicant.applicantId} hover>
                    <TableCell>
                      {`${applicant.firstName} ${applicant.middleInitial}. ${applicant.lastName}`}
                    </TableCell>
                    <TableCell>{applicant.email}</TableCell>
                    <TableCell>{applicant.contactNumber || "N/A"}</TableCell>
                    <TableCell>
                      {applicant.preferences && applicant.preferences.length > 0
                        ? applicant.preferences[0].course.courseName
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {applicant.preferences && applicant.preferences.length > 0 ? (
                        <Chip
                          label={applicant.preferences[0].status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(
                              applicant.preferences[0].status
                            ).bg,
                            color: getStatusColor(
                              applicant.preferences[0].status
                            ).color,
                            fontWeight: "500",
                          }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{applicant.createdAt}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: "20px",
                          color: "#800000",
                          borderColor: "#800000",
                          "&:hover": {
                            backgroundColor: "rgba(128, 0, 0, 0.04)",
                            borderColor: "#600000",
                          },
                        }}
                        onClick={() =>
                          handleViewApplication(applicant.applicantId)
                        }
                      >
                        View Application
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <TablePagination
              component="div"
              count={applicants.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </Paper>
    </ListLayoutWithFilters>
  );
};

export default ApplicantsListPage;
