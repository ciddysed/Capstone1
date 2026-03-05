import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Avatar,
  Stack,
  Chip,
  Grid,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const API_URL = "https://eteeap-foth.onrender.com/api/accepted-applicants";

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  '&.MuiTableCell-head': {
    backgroundColor: maroon.main,
    color: maroon.contrastText,
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: alpha(maroon.main, 0.03),
  },
  '&:hover': {
    backgroundColor: alpha(maroon.main, 0.07),
    transition: 'background-color 0.2s ease',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderWidth: 2,
  '&.MuiChip-outlinedSuccess': {
    color: '#2e7d32',
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255,255,255,0.93)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 20px rgba(106,0,0,0.10)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(106,0,0,0.15)',
  },
}));

const Finalized = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [approvedApplicants, setApprovedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch approved accreditation applicants
  const fetchApprovedApplicants = async () => {
    setLoading(true);
    try {
      // Fetch from accepted-applicants endpoint like AcceptedStudentsTab
      const response = await axios.get(API_URL);
      
      console.log("Raw API Response:", response.data); // Debug log to see data structure
      
      // Filter for applicants with approved accreditation status
      const approvedAccreditationApplicants = response.data.filter(acceptedStudent => {
        // Check if the applicant has approved accreditation status
        return acceptedStudent.applicant?.accreditationStatus === 'APPROVED';
      });
      
      console.log("Filtered approved accreditation applicants:", approvedAccreditationApplicants);
      
      // Process the approved applicants (follow AcceptedStudentsTab structure)
      const processedApplicants = approvedAccreditationApplicants.map(acceptedStudent => ({
        ...acceptedStudent,
        id: acceptedStudent.acceptedApplicantId,
        applicantName: acceptedStudent.applicant ? 
          `${acceptedStudent.applicant.firstName || ''} ${acceptedStudent.applicant.lastName || ''}`.trim() : 
          'Unknown',
        accreditationStatus: 'APPROVED',
        applicationDate: acceptedStudent.acceptanceDate || acceptedStudent.applicant?.createdAt || new Date().toISOString()
      }));
      
      setApprovedApplicants(processedApplicants);
    } catch (error) {
      console.error("Error fetching approved applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view applicant details
  const handleViewApplicantDetails = (applicant) => {
    // Navigate to finalCapix with applicant information
    navigate('/program-admin/final-capix', { 
      state: { 
        applicantId: applicant.applicant?.applicantId || applicant.acceptedApplicantId,
        applicantName: applicant.applicantName,
        finalCourse: applicant.finalCourse
      } 
    });
  };

  useEffect(() => {
    fetchApprovedApplicants();
  }, []);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get statistics
  const totalApproved = approvedApplicants.length;

  // Filter applicants for current page
  const displayedApplicants = approvedApplicants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, bgcolor: 'transparent' }}>
      {/* Header Banner */}
      <Box sx={{
        background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
        borderRadius: 3, p: 3, mb: 3,
        display: 'flex', alignItems: 'center', gap: 2,
        boxShadow: `0 4px 20px ${alpha(maroon.main, 0.35)}`
      }}>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircleIcon sx={{ color: '#fff', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#fff">
            Finalized Accreditations
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
            Overview of all finalized accredited applicants 
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" fontWeight="bold" color={maroon.main} sx={{ lineHeight: 1 }}>
                {totalApproved}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
                Approved Accreditations
              </Typography>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      {/* Approved Applicants Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading approved accreditations...
          </Typography>
        </Box>
      ) : approvedApplicants.length > 0 ? (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ 
            borderRadius: 2,
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 20px rgba(106,0,0,0.10)',
            mb: 2
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Applicant</StyledTableCell>
                  <StyledTableCell>Final Course</StyledTableCell>
                  <StyledTableCell>Application Date</StyledTableCell>
                  <StyledTableCell>Accreditation Status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedApplicants.map((applicant) => (
                  <StyledTableRow key={applicant.acceptedApplicantId}>
                    <StyledTableCell>{applicant.acceptedApplicantId || applicant.id}</StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: maroon.main }}>
                          {getInitials(applicant.applicantName)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {applicant.applicantName}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {applicant.finalCourse?.courseName || 'N/A'}
                      </Typography>
                      {applicant.finalCourse?.department?.departmentName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {applicant.finalCourse?.department?.departmentName}
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {applicant.applicationDate ? 
                        new Date(applicant.applicationDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : 'N/A'}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StyledChip 
                        label="APPROVED" 
                        color="success" 
                        variant="outlined" 
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Tooltip title="View Applicant Details">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewApplicantDetails(applicant)}
                          sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={approvedApplicants.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          my: 6, 
          py: 6,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderRadius: 2
        }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No approved accreditations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Applicants with approved accreditation status will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Finalized;