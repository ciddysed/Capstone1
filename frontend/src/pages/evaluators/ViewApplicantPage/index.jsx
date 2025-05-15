import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import ListLayout from "../../../templates/ListLayout"; // Adjust path if needed

const applicant = {
  name: "John Doe",
  email: "john@example.com",
  dateApplied: "2025-05-05",
  address: "123 Sample Street, Cebu City",
  appliedFor: "Evaluator",
};

const documents = [
  { id: 1, requirement: "Resume", filename: "john_doe_resume.pdf" },
  { id: 2, requirement: "Transcript", filename: "john_doe_transcript.pdf" },
];

const ViewApplicantPage = () => {
  const navigate = useNavigate();

  return (
    <ListLayout>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/evaluator/applicants")}
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography fontWeight={600}>View Details</Typography>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }}>
        {/* Left: Applicant Profile */}
        <Paper elevation={4} sx={{ flex: 1, p: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Applicant Profile
          </Typography>
          <Stack spacing={1}>
            <DetailRow label="Name" value={applicant.name} />
            <DetailRow label="Email" value={applicant.email} />
            <DetailRow label="Date Applied" value={applicant.dateApplied} />
            <DetailRow label="Address" value={applicant.address} />
            <DetailRow label="Applied For" value={applicant.appliedFor} />
          </Stack>
        </Paper>

        {/* Right: Documents */}
        <Paper elevation={4} sx={{ flex: 1, p: 3 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mb: 2, borderBottom: "2px solid #ddd", pb: 1 }}
          >
            Uploaded Documents
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Requirement</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.requirement}</TableCell>
                  <TableCell>{doc.filename}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{
                          color: "#800000",
                          borderColor: "#800000",
                          "&:hover": {
                            borderColor: "#800000",
                            backgroundColor: "#fff0f0",
                          },
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{
                          backgroundColor: "#800000",
                          "&:hover": {
                            backgroundColor: "#660000",
                          },
                        }}
                      >
                        Download
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </ListLayout>
  );
};

const DetailRow = ({ label, value }) => (
  <Stack direction="row" spacing={1}>
    <Typography fontWeight={500} width={120}>
      {label}:
    </Typography>
    <Typography>{value}</Typography>
  </Stack>
);

export default ViewApplicantPage;
