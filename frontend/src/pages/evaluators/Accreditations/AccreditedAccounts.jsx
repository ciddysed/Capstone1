import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
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
  alpha,
  useTheme,
  Card,
  CardContent,
  Grow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradedAccreditation from "./GradedAccreditation";

const API_ACCEPTED = "https://eteeap-foth.onrender.com/api/accepted-applicants";
const API_SUBJECT_RECORDS = "https://eteeap-foth.onrender.com/api/applicant-subject-records";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

// Styled components
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
    backgroundColor: alpha(gold.light, 0.15),
  },
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.3),
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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: maroon.main,
  '&:hover': {
    backgroundColor: maroon.dark,
    boxShadow: '0 4px 12px rgba(106, 0, 0, 0.25)',
  },
}));

const AccreditedAccounts = ({ onNavigateToGraded }) => {
  const theme = useTheme();
  const [accreditedApplicants, setAccreditedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradedModalOpen, setGradedModalOpen] = useState(false);
  const [selectedModalData, setSelectedModalData] = useState({
    applicantId: null,
    curriculumId: null,
  });

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

  const handleViewAccreditation = (app) => {
    setSelectedModalData({
      applicantId: app.applicant?.applicantId,
      curriculumId: app.finalCourse?.curriculum?.id,
    });
    setGradedModalOpen(true);
  };

  const handleCloseGradedModal = () => {
    setGradedModalOpen(false);
    setSelectedModalData({ applicantId: null, curriculumId: null });
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <PersonIcon sx={{ color: maroon.main, fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold" color={maroon.dark}>
            Accredited Applicants
          </Typography>
        </Stack>

        {/* Info Card */}
        <InfoCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <SchoolIcon sx={{ color: gold.main, fontSize: 24 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                  Students with Accreditation Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage students who have completed the accreditation process
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </InfoCard>

        {/* Main Content */}
        <Grow in={true} timeout={500}>
          <InfoCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AssignmentIcon sx={{ color: maroon.main }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                      Accredited Students ({accreditedApplicants.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students who have subject records and accreditation data
                    </Typography>
                  </Box>
                </Stack>
              </Box>

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
                      <StyledTableCell>Applicant Name</StyledTableCell>
                      <StyledTableCell>Course</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell>Acceptance Date</StyledTableCell>
                      <StyledTableCell>Remarks</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accreditedApplicants.map(app => (
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
                        <StyledTableCell>{app.remarks || "-"}</StyledTableCell>
                        <StyledTableCell align="center">
                          <ActionButton
                            variant="contained"
                            size="small"
                            onClick={() => handleViewAccreditation(app)}
                          >
                            View Accreditation
                          </ActionButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ 
                  textAlign: "center", 
                  py: 6,
                  px: 3
                }}>
                  <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No accredited applicants found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No applicants have completed the accreditation process yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </InfoCard>
        </Grow>
      </Box>

      {/* Graded Accreditation Modal */}
      <GradedAccreditation
        isOpen={gradedModalOpen}
        onClose={handleCloseGradedModal}
        applicantId={selectedModalData.applicantId}
        curriculumId={selectedModalData.curriculumId}
      />
    </>
  );
};

export default AccreditedAccounts;
