import React, { useState, useEffect } from "react";

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  Stack,
  styled,
} from "@mui/material";

const StyledTableCell = styled(TableCell)({
  fontWeight: "bold",
  backgroundColor: "#f5f5f5",
});

const EvaluationsPage = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartmentEvaluations();
  }, []);

  const fetchDepartmentEvaluations = async () => {
    try {
      setLoading(true);
      const evaluatorId = localStorage.getItem("evaluatorId");

      if (!evaluatorId) {
        setError("Evaluator ID not found. Please log in again.");
        return;
      }

      // Fetch evaluations filtered by evaluator's department
      const response = await fetch(
        `http://localhost:8080/api/evaluators/${evaluatorId}/department-evaluations`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch evaluations");
      }

      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setError("Failed to load evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (evaluationId) => {
    // Implement resend logic here
    console.log("Resend evaluation with ID:", evaluationId);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Evaluations
      </Typography>

      {loading && <Typography>Loading evaluations...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && evaluations.length === 0 && (
        <Typography>No evaluations found for your department.</Typography>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>
                <TableSortLabel>Evaluation ID</TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel>Applicant Name</TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel>Position</TableSortLabel>
              </StyledTableCell>
              <StyledTableCell>
                <TableSortLabel>Status</TableSortLabel>
              </StyledTableCell>
              <StyledTableCell align="right">
                <TableSortLabel>Action</TableSortLabel>
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evaluations.map((evaluation) => (
              <TableRow key={evaluation.evaluationId}>
                <TableCell>{evaluation.evaluationId}</TableCell>
                <TableCell>{evaluation.applicantName}</TableCell>
                <TableCell>{evaluation.position}</TableCell>
                <TableCell>{evaluation.status}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleResend(evaluation.evaluationId)}
                  >
                    Resend
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EvaluationsPage;