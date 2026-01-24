import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// --- Design Tokens & Transitions ---

const maroon = {
  light: '#9e4751',
  main: '#6A0000',
  dark: '#3d0000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#ffe57f',
  main: '#FFC72C',
  dark: '#c79a00',
  contrastText: '#000000',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// --- Styled Components ---

const ProfileCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(106, 0, 0, 0.15)',
  position: 'relative',
  background: '#fff',
  animation: `${fadeIn} 0.5s ease-out`,
}));

const ProfileHeaderBg = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, ${maroon.main} 0%, ${maroon.dark} 50%, ${maroon.main} 100%)`,
  backgroundSize: '200% 200%',
  animation: `${shimmer} 8s linear infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h20v20H0z" fill="none"/%3E%3Cpath d="M0 0L20 20M20 0L0 20" stroke="rgba(255,255,255,0.03)" stroke-width="1"/%3E%3C/svg%3E")',
    opacity: 0.3,
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: '4px solid #fff',
  marginTop: -50,
  marginLeft: 'auto',
  marginRight: 'auto',
  background: `linear-gradient(135deg, ${gold.main} 0%, ${gold.light} 100%)`,
  color: maroon.dark,
  fontWeight: 800,
  fontSize: 36,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${alpha(gold.main, 0.3)}, transparent)`,
    zIndex: -1,
  }
}));

const InfoChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  background: alpha(maroon.main, 0.02),
  border: `1px solid ${alpha(maroon.main, 0.06)}`,
  transition: 'all 0.2s ease',
  marginBottom: theme.spacing(1),
  '&:hover': {
    background: alpha(maroon.main, 0.04),
    borderColor: alpha(maroon.main, 0.12),
    transform: 'translateX(3px)',
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${maroon.main}, ${maroon.dark})`,
  color: '#fff',
  boxShadow: '0 4px 12px rgba(106, 0, 0, 0.2)',
  flexShrink: 0,
}));

const CourseCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(gold.main, 0.06)} 0%, ${alpha(gold.light, 0.03)} 100%)`,
  border: `2px solid ${alpha(gold.main, 0.15)}`,
  boxShadow: '0 2px 12px rgba(255, 199, 44, 0.08)',
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.7s ease-out`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(gold.main, 0.1)}, transparent)`,
  }
}));

const DocumentCard = styled(Paper)(({ theme, uploaded }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  marginBottom: theme.spacing(1.5),
  background: '#fff',
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.2s ease',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    borderColor: alpha(maroon.main, 0.3),
    boxShadow: '0 4px 16px rgba(106, 0, 0, 0.08)',
    transform: 'translateY(-2px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    background: `linear-gradient(180deg, ${maroon.main}, ${maroon.dark})`,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  }
}));

const InfoRow = ({ icon, label, value }) => (
  <InfoChip>
    <IconWrapper sx={{ width: 36, height: 36, borderRadius: 10 }}>
      {icon}
    </IconWrapper>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography 
        variant="caption" 
        display="block" 
        color="text.secondary" 
        fontWeight={700} 
        textTransform="uppercase" 
        letterSpacing={0.8}
        sx={{ mb: 0.3 }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.primary" 
        fontWeight={600}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={value}
      >
        {value || "—"}
      </Typography>
    </Box>
  </InfoChip>
);

// --- Constants & Helpers ---

const DOCUMENT_TYPE_LABELS = [
  "INFORMATIVE_COPY_OF_TOR",
  "CERTIFICATE_OF_EMPLOYMENT",
];

const formatDocumentType = (type) => {
  const formats = {
    "INFORMATIVE_COPY_OF_TOR": "Informative Copy of TOR",
    "CERTIFICATE_OF_EMPLOYMENT": "Certificate of Employment",
  };
  return formats[type] || type.replace(/_/g, " ");
};

// --- Main Component ---

const ApplicantDetailsModal = ({ open, onClose, applicantId, courseId }) => {
  const theme = useTheme();
  
  const [applicant, setApplicant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !applicantId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Applicant
        const appRes = await fetch(`https://eteeap-foth.onrender.com/api/applicants/${applicantId}`);
        const appData = await appRes.json();
        setApplicant(appData);

        // 2. Fetch Documents
        const docsRes = await fetch(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`);
        const docsData = docsRes.ok ? await docsRes.json() : [];
        setDocuments(docsData);

        // 3. Fetch Course (if ID provided)
        // If courseId is missing from props, try to get it from applicant data if available
        const targetCourseId = courseId || appData.courseId; 
        if (targetCourseId) {
          const courseRes = await fetch(`https://eteeap-foth.onrender.com/api/courses/${targetCourseId}`);
          const courseData = courseRes.ok ? await courseRes.json() : null;
          setSelectedCourse(courseData);
        }
      } catch (err) {
        console.error("Error fetching modal data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicantId, courseId, open]);

  const handlePreview = (doc) => {
    const url = `https://eteeap-foth.onrender.com/api/documents/preview/${doc.documentId}`;
    window.open(url, "_blank");
  };

  const handleDownload = (docId) => {
    window.open(`https://eteeap-foth.onrender.com/api/documents/download/${docId}`, "_blank");
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          bgcolor: '#f8f9fa',
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <Box sx={{ 
        bgcolor: maroon.main, 
        color: '#fff',
        p: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}>
        <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ fontSize: 28 }} />
          Applicant Details
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: '#fff',
            '&:hover': { bgcolor: alpha('#fff', 0.1) }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, py: 6 }}>
            <Stack spacing={2} alignItems="center">
               <CircularProgress sx={{ color: maroon.main }} />
               <Typography variant="body2" color="text.secondary">Loading Profile...</Typography>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              
              {/* Left Column: Profile Card */}
              <Grid item xs={12} md={3.5}>
                <Box>
                  <ProfileCard>
                    <ProfileHeaderBg />
                    <ProfileAvatar>
                      {applicant ? getInitials(`${applicant.firstName} ${applicant.lastName}`) : "??"}
                    </ProfileAvatar>
                    
                    <Box sx={{ px: 2.5, pb: 3, pt: 1, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="700" sx={{ color: maroon.main, mb: 0.5 }}>
                        {applicant ? `${applicant.firstName} ${applicant.lastName}` : "Unknown"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontSize: '0.7rem' }}>
                        ID: {applicantId || "N/A"}
                      </Typography>
                      
                      <Chip 
                        label="Applicant" 
                        size="small" 
                        sx={{ bgcolor: alpha(gold.main, 0.15), color: gold.dark, fontWeight: 700, mb: 2.5, fontSize: '0.7rem' }} 
                      />

                      <Box sx={{ textAlign: 'left' }}>
                        <InfoRow 
                          icon={<EmailIcon fontSize="small" />} 
                          label="Email" 
                          value={applicant?.email} 
                        />
                        <InfoRow 
                          icon={<HomeIcon fontSize="small" />} 
                          label="Address" 
                          value={applicant?.address} 
                        />
                        <InfoRow 
                          icon={<CakeIcon fontSize="small" />} 
                          label="Birthday" 
                          value={applicant?.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString() : null} 
                        />
                        <InfoRow 
                          icon={<WcIcon fontSize="small" />} 
                          label="Gender" 
                          value={applicant?.gender} 
                        />
                      </Box>
                    </Box>
                  </ProfileCard>
                </Box>
              </Grid>

              {/* Right Column: Content */}
              <Grid item xs={12} md={8.5}>
                <Stack spacing={3}>
                  
                  {/* Course Selection Card */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${gold.main}, ${gold.dark})`,
                        boxShadow: '0 2px 8px rgba(255, 199, 44, 0.25)'
                      }}>
                        <SchoolIcon sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="700" sx={{ color: maroon.dark }}>
                        Academic Information
                      </Typography>
                    </Stack>
                    <CourseCard elevation={0}>
                      <Avatar sx={{ bgcolor: alpha(gold.main, 0.15), color: gold.dark, width: 52, height: 52 }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="700" textTransform="uppercase" letterSpacing={0.5} sx={{ mb: 0.5 }}>
                          Target Degree Program
                        </Typography>
                        {selectedCourse ? (
                          <>
                            <Typography variant="h6" fontWeight="700" color={maroon.main}>
                              {selectedCourse.courseName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                              {selectedCourse.department?.departmentName || "Department not specified"}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No course information available.
                          </Typography>
                        )}
                      </Box>
                    </CourseCard>
                  </Box>

                  {/* Documents Section */}
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${gold.main}, ${gold.dark})`,
                          boxShadow: '0 2px 8px rgba(255, 199, 44, 0.25)'
                        }}>
                          <DescriptionIcon sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" fontWeight="700" sx={{ color: maroon.dark }}>
                          Supporting Documents
                        </Typography>
                      </Stack>
                      <Chip 
                        label={`${documents.length} Document${documents.length !== 1 ? 's' : ''}`} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(maroon.main, 0.08), 
                          color: maroon.main, 
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      />
                    </Stack>

                    {documents.map((doc) => {
                      const isUploaded = true;

                      return (
                        <DocumentCard key={doc.documentId} elevation={0} uploaded={isUploaded}>
                          <Avatar 
                            variant="rounded" 
                            sx={{ 
                              bgcolor: isUploaded ? alpha(maroon.main, 0.1) : alpha(theme.palette.grey[400], 0.1),
                              color: isUploaded ? maroon.main : theme.palette.grey[400],
                              mr: 2
                            }}
                          >
                            <InsertDriveFileIcon />
                          </Avatar>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                              {formatDocumentType(doc.documentType)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.fileName || doc.name} • {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "Date N/A"}
                            </Typography>
                          </Box>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} 
                              label="Submitted" 
                              size="small" 
                              color="success" 
                              variant="outlined" 
                              sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
                            />
                            <Tooltip title="Preview">
                              <IconButton 
                                size="small" 
                                onClick={() => handlePreview(doc)}
                                sx={{ color: maroon.main, bgcolor: alpha(maroon.main, 0.05) }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownload(doc.documentId)}
                                sx={{ color: 'text.secondary', bgcolor: alpha(theme.palette.text.secondary, 0.05) }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </DocumentCard>
                      );
                    })}

                    {documents.length === 0 && (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6, 
                        px: 2,
                        border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.grey[50], 0.5)
                      }}>
                        <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No documents uploaded yet
                        </Typography>
                      </Box>
                    )}
                  </Box>

                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

ApplicantDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  courseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ApplicantDetailsModal;