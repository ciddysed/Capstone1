import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Stack,
  Avatar,
  alpha,
  Grid,
  Card,
  CardContent,
  TablePagination,
  useTheme,
  useMediaQuery,
  Grow,
  createTheme,
  ThemeProvider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import MainLayout from "../../../templates/MainLayout";
import backgroundImage from "../../../assets/login-bg.png";
import axios from "axios";
import { styled } from "@mui/material/styles";

const EVALUATOR_API_URL = "http://localhost:8080/api/evaluators";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C', // lighter maroon
  main: '#6A0000', // maroon
  dark: '#450000', // darker maroon
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9', // lighter gold
  main: '#FFC72C', // gold
  dark: '#D4A500', // darker gold
  contrastText: '#000000',
};

// Create a custom theme with maroon and gold
const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
});

// Styled components for enhanced UI
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
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 45px -10px rgba(106, 0, 0, 0.25)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: maroon.main,
  width: 56,
  height: 56,
  color: '#FFFFFF',
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

const DetailHeader = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(gold.light, 0.3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${gold.main}`,
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

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderWidth: 2,
  '&.MuiChip-outlinedPrimary': {
    borderColor: maroon.main,
    color: maroon.main,
  },
  '&.MuiChip-outlinedSecondary': {
    borderColor: gold.main,
    color: gold.dark,
  },
}));

const EvaluatorManagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [evaluators, setEvaluators] = useState([]);
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);
  const [openEvaluatorDialog, setOpenEvaluatorDialog] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [updatingEvaluator, setUpdatingEvaluator] = useState(false);
  const [evaluatorPage, setEvaluatorPage] = useState(0);
  const [evaluatorRowsPerPage, setEvaluatorRowsPerPage] = useState(10);

  // Fetch all evaluators
  const fetchEvaluators = async () => {
    setLoadingEvaluators(true);
    try {
      const response = await axios.get(`${EVALUATOR_API_URL}`);
      // Ensure evaluators is always an array
      setEvaluators(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching evaluators:", error);
      setEvaluators([]); // fallback to empty array on error
    } finally {
      setLoadingEvaluators(false);
    }
  };

  // Handle open evaluator detail dialog
  const handleOpenEvaluatorDialog = (evaluator) => {
    setSelectedEvaluator(evaluator);
    setOpenEvaluatorDialog(true);
  };

  // Handle close evaluator dialog
  const handleCloseEvaluatorDialog = () => {
    setOpenEvaluatorDialog(false);
    setSelectedEvaluator(null);
  };

  // Toggle evaluator admin status
  const toggleEvaluatorAdminStatus = async (evaluator, isAdmin) => {
    setUpdatingEvaluator(true);
    try {
      const response = await axios.put(
        `${EVALUATOR_API_URL}/${evaluator.evaluatorId}/admin-status?isAdmin=${isAdmin}`
      );
      
      if (response.status === 200) {
        // Update evaluator in the list
        const updatedEvaluators = evaluators.map(e => 
          e.evaluatorId === evaluator.evaluatorId ? {...e, isAdmin} : e
        );
        setEvaluators(updatedEvaluators);
        
        // If the dialog is open, update the selected evaluator
        if (selectedEvaluator && selectedEvaluator.evaluatorId === evaluator.evaluatorId) {
          setSelectedEvaluator({...selectedEvaluator, isAdmin});
        }
        
        alert(`Evaluator ${isAdmin ? 'granted admin privileges' : 'admin privileges revoked'}`);
      }
    } catch (error) {
      console.error("Error updating evaluator admin status:", error);
      alert(`Failed to update evaluator: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdatingEvaluator(false);
    }
  };

  // Handle evaluator pagination
  const handleEvaluatorChangePage = (event, newPage) => {
    setEvaluatorPage(newPage);
  };

  const handleEvaluatorChangeRowsPerPage = (event) => {
    setEvaluatorRowsPerPage(parseInt(event.target.value, 10));
    setEvaluatorPage(0);
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

  useEffect(() => {
    fetchEvaluators();
    
    // Optional: set auto-refresh interval
    const interval = setInterval(() => {
      fetchEvaluators();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Filter evaluators for current page
  const displayedEvaluators = Array.isArray(evaluators)
    ? evaluators.slice(
        evaluatorPage * evaluatorRowsPerPage,
        evaluatorPage * evaluatorRowsPerPage + evaluatorRowsPerPage
      )
    : [];

  return (
    <ThemeProvider theme={customTheme}>
      <MainLayout background={backgroundImage}>
        {/* Evaluators Management Section */}
        <Grow in={true} timeout={500}>
          <AnimatedPaper elevation={3} sx={{ p: 3, my: 2, overflow: 'hidden' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
                borderBottom: `2px solid ${gold.main}`,
                paddingBottom: 1,
                display: 'inline-block'
              }}>
                Evaluator Management
              </Typography>
              <ActionButton
                variant="contained"
                startIcon={loadingEvaluators ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={fetchEvaluators}
                disabled={loadingEvaluators}
                disableElevation
              >
                {loadingEvaluators ? "Refreshing..." : "Refresh"}
              </ActionButton>
            </Box>

            {loadingEvaluators ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 6, alignItems: "center" }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading evaluators...
                </Typography>
              </Box>
            ) : evaluators.length > 0 ? (
              <>
                <TableContainer sx={{ 
                  borderRadius: 2,
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  mb: 2
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>Department</StyledTableCell>
                        <StyledTableCell>Email</StyledTableCell>
                        <StyledTableCell>Role</StyledTableCell>
                        <StyledTableCell align="center">Admin Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedEvaluators.map((evaluator) => (
                        <StyledTableRow key={evaluator.evaluatorId}>
                          <StyledTableCell>{evaluator.evaluatorId}</StyledTableCell>
                          <StyledTableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {getInitials(evaluator.name)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {evaluator.name}
                              </Typography>
                            </Stack>
                          </StyledTableCell>
                          <StyledTableCell>
                            {evaluator.department?.departmentName || 'Not assigned'}
                          </StyledTableCell>
                          <StyledTableCell>{evaluator.email}</StyledTableCell>
                          <StyledTableCell>{evaluator.role || 'Evaluator'}</StyledTableCell>
                          <StyledTableCell align="center">
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={evaluator.isAdmin}
                                  onChange={(e) => toggleEvaluatorAdminStatus(evaluator, e.target.checked)}
                                  color="secondary"
                                  disabled={updatingEvaluator}
                                />
                              }
                              label={evaluator.isAdmin ? "Admin" : "Regular"}
                              labelPlacement="start"
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <Tooltip title="View Evaluator Details">
                              <IconButton 
                                color="primary"
                                onClick={() => handleOpenEvaluatorDialog(evaluator)}
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
                  count={evaluators.length}
                  rowsPerPage={evaluatorRowsPerPage}
                  page={evaluatorPage}
                  onPageChange={handleEvaluatorChangePage}
                  onRowsPerPageChange={handleEvaluatorChangeRowsPerPage}
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
                <SupervisorAccountIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No evaluators found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are currently no evaluators in the system.
                </Typography>
              </Box>
            )}
          </AnimatedPaper>
        </Grow>

        {/* Evaluator Details Dialog */}
        <Dialog 
          open={openEvaluatorDialog} 
          onClose={handleCloseEvaluatorDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.3)',
              overflow: 'hidden',
            }
          }}
          fullScreen={isMobile}
          TransitionComponent={Grow}
          transitionDuration={300}
        >
          {selectedEvaluator && (
            <>
              <DialogTitle sx={{ 
                bgcolor: maroon.main,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <StyledAvatar>
                  {getInitials(selectedEvaluator.name)}
                </StyledAvatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Evaluator Details
                  </Typography>
                  <Typography variant="body2">
                    {selectedEvaluator.name}
                  </Typography>
                </Box>
              </DialogTitle>
              <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <DetailHeader>
                      <Typography variant="h6" color={maroon.main} gutterBottom>
                        Personal Information
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Full Name
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedEvaluator.name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Email Address
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvaluator.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Contact Number
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvaluator.contactNumber || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Role
                          </Typography>
                          <Typography variant="body1">
                            {selectedEvaluator.role || 'Evaluator'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </DetailHeader>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <SupervisorAccountIcon sx={{ color: maroon.main }} />
                          <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                            Admin Privileges
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                        
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={selectedEvaluator.isAdmin}
                                onChange={(e) => toggleEvaluatorAdminStatus(selectedEvaluator, e.target.checked)}
                                color="secondary"
                                disabled={updatingEvaluator}
                                size="large"
                              />
                            }
                            label={selectedEvaluator.isAdmin ? "Admin Access Enabled" : "Admin Access Disabled"}
                          />
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                            {selectedEvaluator.isAdmin 
                              ? "This evaluator has access to administrative features, including applicant management."
                              : "Enable admin privileges to grant access to administrative features."}
                          </Typography>
                          
                          <Box sx={{ 
                            mt: 3, 
                            p: 2, 
                            bgcolor: alpha(selectedEvaluator.isAdmin ? gold.light : theme.palette.grey[100], 0.5), 
                            borderRadius: 2,
                            border: `1px dashed ${selectedEvaluator.isAdmin ? gold.main : theme.palette.grey[400]}`
                          }}>
                            <Typography variant="body2" color={selectedEvaluator.isAdmin ? 'secondary.dark' : 'text.secondary'} sx={{ fontWeight: selectedEvaluator.isAdmin ? 'medium' : 'regular' }}>
                              {selectedEvaluator.isAdmin
                                ? "This evaluator can access the full system, review applications, and perform administrative actions."
                                : "This evaluator has limited access and cannot view applications until admin privileges are granted."}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </InfoCard>
                  </Grid>

                  <Grid item xs={12}>
                    <InfoCard>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6" fontWeight="medium" color={maroon.main}>
                            Department Assignment
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                        
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {selectedEvaluator.department?.departmentName || 'Not assigned to a department'}
                          </Typography>
                          
                          {selectedEvaluator.department ? (
                            <StyledChip
                              label={selectedEvaluator.department.departmentName}
                              color="primary"
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          ) : (
                            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                              This evaluator needs to be assigned to a department
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </InfoCard>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2.5, bgcolor: alpha(gold.light, 0.2) }}>
                <Button 
                  onClick={handleCloseEvaluatorDialog} 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    px: 3, 
                    borderColor: maroon.main,
                    color: maroon.main,
                    '&:hover': {
                      borderColor: maroon.dark,
                      backgroundColor: alpha(maroon.light, 0.1),
                    }
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </MainLayout>
    </ThemeProvider>
  );
};

export default EvaluatorManagementPage;
