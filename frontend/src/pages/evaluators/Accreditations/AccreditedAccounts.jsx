  import React, { useEffect, useState } from "react";
  import { useLocation, useNavigate } from "react-router-dom";
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
    Card,
    CardContent,
    Grow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from "@mui/material";
  import { styled } from "@mui/material/styles";
  import PersonIcon from '@mui/icons-material/Person';
  import AssignmentIcon from '@mui/icons-material/Assignment';
  import CloseIcon from '@mui/icons-material/Close';
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import DescriptionIcon from '@mui/icons-material/Description';
  import VerifiedIcon from '@mui/icons-material/Verified';

  import GradedAccreditation from "./GradedAccreditation";
  import { API_BASE } from '../../../config';
  import toast from '../../../utils/toast';

  const API_ACCEPTED = `${API_BASE}/accepted-applicants`;
  const API_SUBJECT_RECORDS = `${API_BASE}/applicant-subject-records`;
  const API_ASSIGNMENTS = `${API_BASE}/assignments/applicant`;
  const API_DOCUMENTS = `${API_BASE}/documents/applicant`;

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
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
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
    background: 'rgba(255, 255, 255, 0.93)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 24px rgba(106, 0, 0, 0.12), 0 1px 4px rgba(0,0,0,0.06)',
    borderRadius: theme.shape.borderRadius * 2,
    transition: 'box-shadow 0.3s ease, transform 0.2s ease',
    '&:hover': {
      boxShadow: '0 8px 32px rgba(106, 0, 0, 0.18)',
      transform: 'translateY(-1px)',
    },
    border: `1px solid rgba(255,255,255,0.6)`,
    borderTop: `3px solid ${maroon.main}`,
    overflow: 'hidden',
  }));

  const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    backgroundColor: maroon.main,
    color: '#fff',
    '&:hover': {
      backgroundColor: maroon.dark,
      boxShadow: '0 4px 12px rgba(106, 0, 0, 0.3)',
    },
  }));

  const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
      borderRadius: theme.shape.borderRadius * 2.5,
      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.22)',
      overflow: 'hidden',
    },
  }));

  const SectionHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: alpha(maroon.main, 0.08),
    borderLeft: `4px solid ${maroon.main}`,
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  }));

  const DetailRow = styled(Stack)(({ theme }) => ({
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  }));

  const StyledAccordion = styled(Accordion)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1),
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      backgroundColor: alpha(gold.main, 0.05),
    },
  }));

  const getAssignmentStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'warning',
      'ACTIVE': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
    };
    return statusColors[status] || 'default';
  };

  const DetailsModal = ({ open, onClose, applicant, applicantId }) => {
    const [assignments, setAssignments] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (open && applicantId) {
        setLoading(true);
        Promise.all([
          fetch(`${API_ASSIGNMENTS}/${applicantId}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []),
          fetch(`${API_DOCUMENTS}/${applicantId}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []),
        ]).then(([assignmentsData, documentsData]) => {
          setAssignments(assignmentsData || []);
          setDocuments(documentsData || []);
          setLoading(false);
        });
      }
    }, [open, applicantId]);

    // Group documents by documentType
    const groupedDocuments = documents.reduce((acc, doc) => {
      const type = doc.documentType || 'OTHER';
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    }, {});

    return (
      <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          color: '#ffffff',
          px: 3,
          py: 2,
        }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: alpha('#fff', 0.15), border: `2px solid ${alpha('#fff', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon sx={{ color: gold.main, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>Applicant Details</Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>Full profile and accreditation records</Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: alpha('#fff', 0.8), '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.1) } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack direction="row" spacing={4} sx={{ minHeight: '500px' }}>
              {/* LEFT COLUMN - PERSONAL INFORMATION */}
              <Box sx={{ flex: 1, pr: 2 }}>
                {applicant && (
                  <>
                    <SectionHeader>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon sx={{ color: maroon.main }} />
                        <Typography variant="subtitle1" fontWeight="bold" color={maroon.main}>
                          Personal Information
                        </Typography>
                      </Stack>
                    </SectionHeader>

                    <Box sx={{ px: 1 }}>
                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body2">
                          {applicant.firstName} {applicant.middleInitial ? applicant.middleInitial + ' ' : ''}{applicant.lastName}
                        </Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body2">{applicant.email || '-'}</Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Contact Number
                        </Typography>
                        <Typography variant="body2">{applicant.contactNumber || '-'}</Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Gender
                        </Typography>
                        <Typography variant="body2">{applicant.gender || '-'}</Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Date of Birth
                        </Typography>
                        <Typography variant="body2">
                          {applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : '-'}
                        </Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body2">{applicant.address || '-'}</Typography>
                      </DetailRow>

                      <DetailRow spacing={1}>
                        <Typography variant="caption" fontWeight="600" color="text.secondary">
                          Pre-evaluation Self Assessment
                        </Typography>
                        <Chip 
                          label={applicant.hasSubmitted ? 'Submitted' : 'Not Submitted'}
                          color={applicant.hasSubmitted ? 'success' : 'warning'}
                          size="small"
                          variant="outlined"
                        />
                      </DetailRow>
                    </Box>
                  </>
                )}
              </Box>

              {/* VERTICAL DIVIDER */}
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

              {/* RIGHT COLUMN - ASSIGNMENTS & DOCUMENTS */}
              <Box sx={{ flex: 1, pl: 2 }}>
                <Stack spacing={3}>

              {/* ASSIGNMENTS SECTION */}
              <SectionHeader>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AssignmentIcon sx={{ color: maroon.main }} />
                  <Typography variant="subtitle1" fontWeight="bold" color={maroon.main}>
                    Assignment
                  </Typography>
                </Stack>
              </SectionHeader>

              {assignments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No assignments found
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {assignments.map((assignment) => (
                    <StyledAccordion key={assignment.assignmentId}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                          <AssignmentIcon sx={{ color: maroon.main, fontSize: 20 }} />
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight="600">
                              {assignment.evaluator?.name || 'Evaluator Name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {assignment.evaluator?.role || 'Role'}
                            </Typography>
                          </Box>
                          <Chip 
                            label={assignment.status}
                            color={getAssignmentStatusColor(assignment.status)}
                            size="small"
                          />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ backgroundColor: alpha('#f5f5f5', 0.5) }}>
                        <Stack spacing={1.5}>
                          <DetailRow spacing={0.5}>
                            <Typography variant="caption" fontWeight="600" color="text.secondary">
                              Assigned Date
                            </Typography>
                            <Typography variant="body2">
                              {assignment.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : '-'}
                            </Typography>
                          </DetailRow>
                          {assignment.notes && (
                            <DetailRow spacing={0.5}>
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                Notes
                              </Typography>
                              <Typography variant="body2">{assignment.notes}</Typography>
                            </DetailRow>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </StyledAccordion>
                  ))}
                </Stack>
              )}

              <Divider />

              {/* DOCUMENTS SECTION */}
              <SectionHeader>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DescriptionIcon sx={{ color: maroon.main }} />
                  <Typography variant="subtitle1" fontWeight="bold" color={maroon.main}>
                    Documents ({documents.length})
                  </Typography>
                </Stack>
              </SectionHeader>

              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No documents found
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {Object.entries(groupedDocuments).map(([docType, docs]) => (
                    <Box key={docType}>
                      <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: maroon.main }}>
                        {docType}
                      </Typography>
                      <Stack spacing={1}>
                        {docs.map((doc) => (
                          <Card 
                            key={doc.documentId}
                            variant="outlined"
                            sx={{ 
                              p: 1.5,
                              backgroundColor: alpha(gold.light, 0.08),
                              border: `1px solid ${alpha(maroon.main, 0.2)}`,
                              '&:hover': {
                                backgroundColor: alpha(gold.light, 0.12),
                              }
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <DescriptionIcon sx={{ color: maroon.main, mt: 0.5, fontSize: 20 }} />
                                <Box flex={1}>
                                  <Typography variant="body2" fontWeight="600">
                                    {doc.fileName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {doc.fileType} • {doc.fileSize ? (doc.fileSize / 1024).toFixed(2) : '0'} KB
                                  </Typography>
                                </Box>
                                {doc.verified && (
                                  <VerifiedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                               
                                <Typography variant="caption" color="text.secondary">
                                  {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Stack>
                              {doc.notes && (
                                <Typography variant="caption" sx={{ pt: 0.5, color: 'text.secondary' }}>
                                  <strong>Notes:</strong> {doc.notes}
                                </Typography>
                              )}
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: alpha(gold.light, 0.1), borderTop: `1px solid ${alpha(maroon.main, 0.1)}` }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: alpha(maroon.main, 0.4),
              color: maroon.main,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              '&:hover': { borderColor: maroon.main, bgcolor: alpha(maroon.main, 0.05) },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    );
  };

  const AccreditedAccounts = () => {
    const [accreditedApplicants, setAccreditedApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [gradedModalOpen, setGradedModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [selectedModalData, setSelectedModalData] = useState({
      applicantId: null,
      curriculumId: null,
    });
    const [pollingRecords, setPollingRecords] = useState(false);
    const [returnToAccreditations, setReturnToAccreditations] = useState(false);

    // Open modal automatically if redirected with state - with polling
    useEffect(() => {
      if (location.state?.openApplicantId && location.state?.openCurriculumId) {
        const applicantId = location.state.openApplicantId;
        const curriculumId = location.state.openCurriculumId;
        
        // Store the returnToAccreditations flag
        if (location.state?.returnToAccreditations) {
          setReturnToAccreditations(true);
        }
        
        setPollingRecords(true);
        toast.info("Loading accreditation records...");
        
        let pollCount = 0;
        const maxPolls = 20; // Maximum 10 seconds (20 * 500ms)
        
        const checkRecords = async () => {
          try {
            const res = await fetch(`${API_SUBJECT_RECORDS}/applicant/${applicantId}`);
            
            if (!res.ok) {
              throw new Error('Failed to fetch records');
            }
            
            const records = await res.json();
            
            if (records && records.length > 0) {
              // Records are ready, open the modal
              setSelectedModalData({
                applicantId,
                curriculumId,
              });
              setGradedModalOpen(true);
              setPollingRecords(false);
              toast.success("Accreditation records loaded successfully!");
            } else if (pollCount < maxPolls) {
              // Records not ready yet, wait and try again
              pollCount++;
              setTimeout(checkRecords, 500);
            } else {
              // Timeout - records still not available
              setPollingRecords(false);
              toast.error("Records are taking longer than expected. Please refresh the page.");
            }
          } catch (error) {
            console.error("Error checking records:", error);
            setPollingRecords(false);
            toast.error("Failed to load accreditation records. Please try again.");
          }
        };
        
        checkRecords();
      }
    }, [location.state]);

    useEffect(() => {
      // Fetch all accepted applicants
      fetch(API_ACCEPTED)
        .then(res => res.json())
        .then(async data => {
          // Get applicantIds
          const applicantIds = data.map(item => item.applicant?.applicantId).filter(Boolean);
          // Fetch subject records for each applicant
          const fetchSubjectRecords = async (id) => {
            try {
              const res = await fetch(`${API_SUBJECT_RECORDS}/applicant/${id}`);
              if (res.ok) {
                return await res.json();
              }
              return [];
            } catch {
              return [];
            }
          };
          const results = await Promise.all(applicantIds.map(fetchSubjectRecords));
          // Only include applicants who have subject records
          const accredited = data.filter((item, idx) => Array.isArray(results[idx]) && results[idx].length > 0);
          setAccreditedApplicants(accredited);
          setLoading(false);
        })
        .catch(() => {
          setAccreditedApplicants([]);
          setLoading(false);
        });
    }, []);

    const handleViewDetails = (app) => {
      setSelectedApplicant(app.applicant);
      setDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
      setDetailsModalOpen(false);
      setSelectedApplicant(null);
    };

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
      
      // If we came from Accreditations page, navigate back there
      if (returnToAccreditations) {
        setReturnToAccreditations(false);
        navigate('/evaluator/accreditations');
      }
    };

    return (
      <>
        <Box sx={{ p: 2 }}>
          {/* Gradient Page Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
              borderRadius: 3,
              px: 3, py: 2.5,
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 4px 20px rgba(106,0,0,0.25)',
            }}
          >
            <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: alpha('#fff', 0.15), border: `2px solid ${alpha('#fff', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon sx={{ color: gold.main, fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
                Accredited Applicants
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
                Students who have completed the accreditation process
              </Typography>
            </Box>
          </Box>

          {/* Main Content */}
          <Grow in={true} timeout={500}>
            <InfoCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, background: `linear-gradient(90deg, ${alpha(maroon.main, 0.04)} 0%, transparent 100%)` }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AssignmentIcon sx={{ color: maroon.main, fontSize: 20 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
                        Accredited Students ({accreditedApplicants.length})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Students who have completed the accreditation process
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {(() => {
                  if (loading) {
                    return (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" sx={{ mt: 1.5 }}>
                          Loading accredited applicants...
                        </Typography>
                      </Box>
                    );
                  }
                  
                  if (accreditedApplicants.length === 0) {
                    return (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          No accredited applicants found
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          No applicants have completed the accreditation process yet.
                        </Typography>
                      </Box>
                    );
                  }
                  
                  return (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Applicant Name</StyledTableCell>
                          <StyledTableCell>Course</StyledTableCell>
                          <StyledTableCell>Acceptance Date</StyledTableCell>
                          <StyledTableCell align="center">Actions</StyledTableCell>
                          <StyledTableCell>Accreditation Status</StyledTableCell>                         
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accreditedApplicants.map(app => (
                          <StyledTableRow key={app.acceptedApplicantId}>
                            <StyledTableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Avatar sx={{ bgcolor: maroon.main, width: 32, height: 32, fontSize: 14 }}>
                                  {app.applicant?.firstName?.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" fontWeight={500}>
                                  {`${app.applicant?.firstName || ""} ${app.applicant?.lastName || ""}`}
                                </Typography>
                              </Stack>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2">{app.finalCourse?.courseName}</Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2">
                                {app.acceptanceDate
                                  ? new Date(app.acceptanceDate).toLocaleDateString()
                                  : "-"}
                              </Typography>
                            </StyledTableCell>
                      
                            <StyledTableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <ActionButton
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleViewDetails(app)}
                                  sx={{ py: 0.5, px: 1.5, fontSize: 12 }}
                                >
                                  View Details
                                </ActionButton>
                                <ActionButton
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleViewAccreditation(app)}
                                  disabled={!app.applicant?.hasSubmitted}
                                  title={!app.applicant?.hasSubmitted ? "Applicant hasnt complied Pre-evaluation Self Assessment yet" : ""}
                                  sx={{ 
                                    py: 0.5, 
                                    px: 1.5, 
                                    fontSize: 12,
                                    opacity: !app.applicant?.hasSubmitted ? 0.6 : 1,
                                    '&.Mui-disabled': {
                                      backgroundColor: maroon.main,
                                      color: maroon.contrastText,
                                      opacity: 0.6
                                    }
                                  }}
                                >
                                  Accredit
                                </ActionButton>
                              </Stack>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={app.applicant?.accreditationStatus || 'PENDING'}
                                color={
                                  app.applicant?.accreditationStatus === 'APPROVED' ? 'success' :
                                  app.applicant?.accreditationStatus === 'REJECTED' ? 'error' :
                                  app.applicant?.accreditationStatus === 'UNDER_REVIEW' ? 'info' :
                                  app.applicant?.accreditationStatus === 'CONDITIONAL' ? 'warning' :
                                  'default'
                                }
                                size="small"
                                variant="outlined"
                              />
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  );
                })()}
              </CardContent>
            </InfoCard>
          </Grow>
        </Box>

        {/* Details Modal */}
        <DetailsModal
          open={detailsModalOpen}
          onClose={handleCloseDetailsModal}
          applicant={selectedApplicant}
          applicantId={selectedApplicant?.applicantId}
        />

        {/* Graded Accreditation Modal */}
        <GradedAccreditation
          isOpen={gradedModalOpen}
          onClose={handleCloseGradedModal}
          applicantId={selectedModalData.applicantId}
          curriculumId={selectedModalData.curriculumId}
        />

        {/* Polling Overlay */}
        {pollingRecords && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: alpha('#000', 0.5),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <Card
              sx={{
                p: 4,
                minWidth: 300,
                textAlign: 'center',
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <CircularProgress size={48} sx={{ color: maroon.main, mb: 2 }} />
              <Typography variant="h6" fontWeight={600} color={maroon.main} gutterBottom>
                Preparing Accreditation Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we load the curriculum records...
              </Typography>
            </Card>
          </Box>
        )}
      </>
    );
  };

  export default AccreditedAccounts;
