import React, { useEffect, useState } from "react";
import {
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
import { useNavigate, useLocation } from "react-router-dom";
import AdviserNavigation from "../../../components/Navigation/AdviserNavigation";

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

const DOCUMENT_TYPE_LABELS = [
  "INFORMATIVE_COPY_OF_TOR",
  "CERTIFICATE_OF_EMPLOYMENT",
];

const formatDocumentType = (type) => {
  const formats = {
    "INFORMATIVE_COPY_OF_TOR": "Informative Copy of TOR",
    "CERTIFICATE_OF_EMPLOYMENT": "Certificate of Employment",
  };
  return formats[type] || type;
};

const AdviserViewApplicantPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const applicantId = location.state?.applicantId;
  
  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicantId) {
      navigate("/adviser/applicants");
      return;
    }

    const fetchApplicantData = async () => {
      try {
        setLoading(true);
        
        // Fetch applicant details
        const appRes = await fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`);
        const appData = await appRes.json();
        setApplicant(appData);

        // Fetch documents
        const docsRes = await fetch(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`);
        const docsData = docsRes.ok ? await docsRes.json() : [];
        setDocuments(docsData);

        // Fetch course info
        const courseId = location.state?.courseId;
        if (courseId) {
          const courseRes = await fetch(`https://eteeap-foth.onrender.com/api/courses/${courseId}`);
          const courseData = courseRes.ok ? await courseRes.json() : null;
          setSelectedCourse(courseData);
        }
      } catch (err) {
        console.error("Error fetching applicant data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantData();
  }, [applicantId, location.state?.courseId, navigate]);

  const handlePreview = (doc) => {
    const url = `https://eteeap-foth.onrender.com/api/documents/preview/${doc.documentId}`;
    window.open(url, "_blank");
  };

  const handleDownload = (docId) => {
    window.open(`https://eteeap-foth.onrender.com/api/documents/download/${docId}`, "_blank");
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <AdviserNavigation>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Typography>Loading applicant details...</Typography>
        </Box>
      </AdviserNavigation>
    );
  }

  return (
    <AdviserNavigation>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, mt: 1 }}>
          <IconButton
            onClick={() => navigate("/adviser/applicants")}
            sx={{ mr: 1 }}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold" color={maroon.dark} sx={{ 
            borderBottom: `2px solid ${gold.main}`,
            paddingBottom: 1,
            display: 'inline-block'
          }}>
            Applicant Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Applicant Profile Section */}
          <Grid item xs={12} md={3}>
            <AnimatedPaper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <StyledAvatar>
                  {applicant ? getInitials(
                    [applicant.firstName, applicant.lastName].filter(Boolean).join(" ")
                  ) : "??"}
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
                <DetailRowStyled 
                  icon={<PersonIcon />} 
                  label="Full Name" 
                  value={
                    applicant
                      ? [
                          applicant.firstName,
                          applicant.middleInitial
                            ? applicant.middleInitial + "."
                            : "",
                          applicant.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : "-"
                  }
                />
                <DetailRowStyled 
                  icon={<EmailIcon />} 
                  label="Email" 
                  value={applicant?.email || "-"} 
                />
                <DetailRowStyled 
                  icon={<HomeIcon />} 
                  label="Address" 
                  value={applicant?.address || "-"} 
                />
                <DetailRowStyled 
                  icon={<CakeIcon />} 
                  label="Date of Birth" 
                  value={
                    applicant?.dateOfBirth
                      ? new Date(applicant.dateOfBirth).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : "-"
                  }
                />
                <DetailRowStyled 
                  icon={<WcIcon />} 
                  label="Gender" 
                  value={applicant?.gender || "-"} 
                />
              </Stack>
            </AnimatedPaper>
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={9}>
            <Stack spacing={3} height="100%">
              {/* Applied Course */}
              <AnimatedPaper elevation={3} sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <SchoolIcon sx={{ color: maroon.main }} />
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Course Applied For
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2, borderColor: alpha(gold.main, 0.5) }} />
                
                {selectedCourse ? (
                  <Box 
                    sx={{ 
                      bgcolor: alpha(gold.light, 0.3), 
                      p: 2, 
                      borderRadius: 2, 
                      borderLeft: `3px solid ${gold.main}` 
                    }}
                  >
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

              {/* Uploaded Documents */}
              <AnimatedPaper elevation={3} sx={{ p: 3, flex: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <DescriptionIcon sx={{ color: maroon.main }} />
                  <Typography variant="h6" fontWeight="bold" color={maroon.main}>
                    Submitted Documents
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3, borderColor: alpha(gold.main, 0.5) }} />
                
                <Box sx={{ 
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  maxHeight: 'auto',
                  overflow: 'visible',
                  mx: -2
                }}>
                  <List sx={{ p: 0 }}>
                    {DOCUMENT_TYPE_LABELS.map((docType, index) => {
                      const doc = documents.find((d) => d.documentType === docType);
                      return (
                        <ListItem key={docType}
                          sx={{
                            py: 3,
                            px: 3,
                            borderBottom: index < DOCUMENT_TYPE_LABELS.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha(gold.light, 0.15),
                            },
                          }}
                          secondaryAction={
                            doc ? (
                              <Stack direction="row" spacing={1.5}>
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
                                      }
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
                                      }
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            ) : null
                          }
                        >
                          <ListItemText
                            primary={formatDocumentType(docType)}
                            secondary={doc ? (doc.fileName || doc.name) : "Not Provided"}
                            primaryTypographyProps={{
                              fontWeight: doc ? 600 : 400,
                              variant: 'body2',
                              color: doc ? 'text.primary' : 'text.secondary',
                              sx: { mb: doc ? 0.5 : 0 }
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              sx: { 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                              }
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </AnimatedPaper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </AdviserNavigation>
  );
};

export default AdviserViewApplicantPage;