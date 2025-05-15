import React, { useState } from "react";
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

const mockApplicants = Array.from({ length: 62 }).map((_, i) => ({
  id: i + 1,
  name: `Applicant ${i + 1}`,
  email: `applicant${i + 1}@example.com`,
  course: i % 2 === 0 ? "BSIT" : "BSEd",
  category: "Evaluator",
  dateApplied: "2025-05-07",
}));

const ApplicantsListPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = mockApplicants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const handleViewApplication = () => {
    navigate("/evaluator/applicants/view-applicant");
  };

  return (
    <ListLayoutWithFilters>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((applicant) => (
              <TableRow key={applicant.id}>
                <TableCell>{applicant.name}</TableCell>
                <TableCell>{applicant.email}</TableCell>
                <TableCell>{applicant.course}</TableCell>
                <TableCell>{applicant.category}</TableCell>
                <TableCell>{applicant.dateApplied}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: "20px",
                      color: "#800000",
                      borderColor: "#800000",
                    }}
                    onClick={handleViewApplication}
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
          count={mockApplicants.length}
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
