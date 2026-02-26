  import React, { useEffect, useState } from "react";
  import { useLocation } from "react-router-dom";
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

  const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
      borderRadius: theme.shape.borderRadius * 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
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
          backgroundColor: alpha(maroon.main, 0.1), 
          borderBottom: `2px solid ${maroon.main}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          color: maroon.dark,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ color: maroon.main }} />
            <span>Applicant Details</span>
          </Stack>
          <IconButton onClick={onClose} size="small">
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

        <DialogActions sx={{ p: 2, backgroundColor: alpha(gold.light, 0.05) }}>
          <Button onClick={onClose} sx={{ color: maroon.main, fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
    );
  };

  const AccreditedAccounts = () => {
    const theme = useTheme();
    const [accreditedApplicants, setAccreditedApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [gradedModalOpen, setGradedModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [selectedModalData, setSelectedModalData] = useState({
      applicantId: null,
      curriculumId: null,
    });

    // Open modal automatically if redirected with state
    useEffect(() => {
      if (location.state?.openApplicantId && location.state?.openCurriculumId) {
        setSelectedModalData({
          applicantId: location.state.openApplicantId,
          curriculumId: location.state.openCurriculumId,
        });
        setGradedModalOpen(true);
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
    };

    return (
      <>
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <PersonIcon sx={{ color: maroon.main, fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
              Accredited Applicants
            </Typography>
          </Stack>

          {/* Main Content */}
          <Grow in={true} timeout={500}>
            <InfoCard>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(maroon.main, 0.02) }}>
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
      </>
    );
  };

  export default AccreditedAccounts;
