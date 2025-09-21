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
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_ACCEPTED = "http://localhost:8080/api/accepted-applicants";
const API_SUBJECT_RECORDS = "http://localhost:8080/api/applicant-subject-records";

const AccreditedAccounts = () => {
  const [accreditedApplicants, setAccreditedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all accepted applicants
    fetch(API_ACCEPTED)
      .then(res => res.json())
      .then(async data => {
        // Get applicantIds
        const applicantIds = data.map(item => item.applicant?.applicantId).filter(Boolean);
        // Fetch subject records for each applicant
        const promises = applicantIds.map(id =>
          fetch(`${API_SUBJECT_RECORDS}/applicant/${id}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        const results = await Promise.all(promises);
        // Only include applicants who have subject records
        const accredited = data.filter((item, idx) =>
          results[idx] && results[idx].length > 0
        );
        setAccreditedApplicants(accredited);
        setLoading(false);
      })
      .catch(() => {
        setAccreditedApplicants([]);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Accredited Applicants
      </Typography>
      <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              Loading accredited applicants...
            </Typography>
          </Box>
        ) : accreditedApplicants.length > 0 ? (
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
              {accreditedApplicants.map(app => (
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
                      onClick={() =>
                        navigate("/evaluator/graded-accreditation", {
                          state: {
                            applicantId: app.applicant?.applicantId,
                            curriculumId: app.finalCourse?.curriculum?.id,
                          },
                        })
                      }
                    >
                      View Accreditation
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography sx={{ py: 4, textAlign: "center" }}>
            No accredited applicants found.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AccreditedAccounts;
