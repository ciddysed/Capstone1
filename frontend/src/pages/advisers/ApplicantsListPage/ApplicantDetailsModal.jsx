import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  IconButton,
  Divider,
  alpha,
  useTheme,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

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

const StyledAvatar = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  backgroundColor: maroon.main,
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 32,
  fontWeight: 600,
}));

const AnimatedPaper = styled(Paper)(({ theme }) => ({
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(106, 0, 0, 0.15)',
  },
}));

const DetailRowStyled = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Box sx={{ color: maroon.main, mt: 0.5 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value || "-"}
      </Typography>
    </Box>
  </Stack>
);

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ApplicantDetailsModal = ({ open, onClose, applicantId, courseId }) => {
  const theme = useTheme();
  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const fetchApplicantData = async () => {
      try {
        setLoading(true);
        const appRes = await fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`);
        const appData = await appRes.json();
        setApplicant(appData);
        const docsRes = await fetch(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`);
        const docsData = docsRes.ok ? await docsRes.json() : [];
        setDocuments(docsData);
        if (courseId) {
          const courseRes = await fetch(`https://eteeap-foth.onrender.com/api/courses/${courseId}`);
          const courseData = courseRes.ok ? await courseRes.json() : null;
          setSelectedCourse(courseData);
        }
      } catch (err) {
        setApplicant(null);
        setDocuments([]);
        setSelectedCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicantData();
  }, [open, applicantId, courseId]);

  const handlePreview = (doc) => {
    const url = `https://eteeap-foth.onrender.com/api/documents/preview/${doc.documentId}`;
    window.open(url, "_blank");
  };
  const handleDownload = (docId) => {
    window.open(`https://eteeap-foth.onrender.com/api/documents/download/${docId}`, "_blank");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 1 }}>
              <IconButton onClick={onClose} sx={{ mr: 1 }} color="primary">
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ borderBottom: `2px solid ${gold.main}`, paddingBottom: 1, display: 'inline-block' }}>
                Applicant Details
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <StyledAvatar>
                      {applicant ? getInitials([
                        applicant.firstName,
                        applicant.lastName
                      ].filter(Boolean).join(" ")) : "??"}
                    </StyledAvatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Applicant Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {applicantId || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                  <Stack spacing={2.5}>
                    <DetailRowStyled icon={<PersonIcon />} label="Full Name" value={applicant ? [applicant.firstName, applicant.middleInitial ? applicant.middleInitial + "." : "", applicant.lastName].filter(Boolean).join(" ") : "-"} />
                    <DetailRowStyled icon={<EmailIcon />} label="Email" value={applicant?.email || "-"} />
                    <DetailRowStyled icon={<HomeIcon />} label="Address" value={applicant?.address || "-"} />
                    <DetailRowStyled icon={<CakeIcon />} label="Date of Birth" value={applicant?.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "-"} />
                    <DetailRowStyled icon={<WcIcon />} label="Gender" value={applicant?.gender || "-"} />
                  </Stack>
                </AnimatedPaper>
              </Grid>
              <Grid item xs={12} md={9}>
                <Stack spacing={3} height="100%">
                  <AnimatedPaper elevation={3} sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                      <SchoolIcon sx={{ color: maroon.main }} />
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Course Applied For
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                    {selectedCourse ? (
                      <Box sx={{ bgcolor: alpha(gold.light, 0.3), p: 2, borderRadius: 2, borderLeft: `3px solid ${gold.main}` }}>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedCourse.courseName}
                        </Typography>
                        {selectedCourse.department && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Department: {selectedCourse.department.departmentName || "Not specified"}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No course selection available
                      </Typography>
                    )}
                  </AnimatedPaper>
                  <AnimatedPaper elevation={3} sx={{ p: 3, flex: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                      <DescriptionIcon sx={{ color: maroon.main }} />
                      <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                        Submitted Documents
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                    <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.3)}`, maxHeight: 'auto', overflow: 'visible', mx: -2 }}>
                      <List sx={{ p: 0 }}>
                        {documents.length === 0 ? (
                          <ListItem>
                            <ListItemText primary="No documents uploaded." />
                          </ListItem>
                        ) : (
                          documents.map((doc, index) => (
                            <ListItem
                              key={doc.documentId || index}
                              alignItems="flex-start"
                              sx={{
                                py: 3,
                                px: 3,
                                borderBottom:
                                  index < documents.length - 1
                                    ? `1px solid ${alpha(theme.palette.divider, 0.3)}`
                                    : 'none',
                                transition: 'background-color 0.2s ease',
                                '&:hover': { backgroundColor: alpha(gold.light, 0.15) },
                                display: 'flex',
                                width: '100%',
                              }}
                            >
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <ListItemText
                                  primary={doc.documentType || 'Unknown Document'}
                                  secondary={doc.fileName || doc.name || 'No file name'}
                                  primaryTypographyProps={{
                                    fontWeight: 600,
                                    variant: 'body2',
                                    color: 'text.primary',
                                    sx: { mb: 0.5 },
                                  }}
                                  secondaryTypographyProps={{
                                    variant: 'caption',
                                    sx: {
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                    },
                                  }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center', minWidth: 180 }}>
                                <Tooltip title="Preview Document">
                                  <IconButton
                                    edge="end"
                                    aria-label="preview"
                                    onClick={() => handlePreview(doc)}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                      },
                                      mr: 1.5
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Download Document">
                                  <IconButton
                                    edge="end"
                                    aria-label="download"
                                    onClick={() => handleDownload(doc.documentId)}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.grey[700], 0.1),
                                      color: theme.palette.grey[700],
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.grey[700], 0.2),
                                      },
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItem>
                          ))
                        )}
                      </List>   
                    </Box>
                  </AnimatedPaper>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicantDetailsModal;
