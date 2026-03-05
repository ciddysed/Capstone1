import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  alpha,
  useTheme,
  Paper,
  CircularProgress,
  Avatar,
  Stack,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GradeIcon from '@mui/icons-material/Grade';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

// API configuration
const API_BASE = "https://eteeap-foth.onrender.com/api";
const EVALUATOR_API = `${API_BASE}/evaluators`;

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
    fontSize: 12,
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
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(106, 0, 0, 0.18)',
  },
  border: '1px solid rgba(255,255,255,0.6)',
  borderTop: `3px solid ${maroon.main}`,
  overflow: 'hidden',
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  borderRadius: `${theme.shape.borderRadius * 2}px !important`,
  background: 'rgba(255,255,255,0.93)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 2px 12px rgba(106,0,0,0.09), 0 1px 3px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.6)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease',
  '&.Mui-expanded': {
    boxShadow: '0 6px 24px rgba(106,0,0,0.14)',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  background: `linear-gradient(90deg, ${alpha(maroon.main, 0.08)} 0%, ${alpha(maroon.main, 0.03)} 100%)`,
  '&.Mui-expanded': {
    background: `linear-gradient(90deg, ${alpha(maroon.main, 0.13)} 0%, ${alpha(maroon.main, 0.06)} 100%)`,
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
  },
}));

const DocumentPreviewContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255,255,255,0.93)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 24px rgba(106,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  border: '1px solid rgba(255,255,255,0.6)',
  borderTop: `3px solid ${maroon.main}`,
  overflow: 'hidden',
}));

// Helper functions
const getStatusBackgroundColor = (status, alphaValue = 0.1) => {
  if (status === "APPROVED") return alpha('#4caf50', alphaValue);
  if (status === "FOR_ENROLLMENT") return alpha('#2196f3', alphaValue);
  return alpha('#ff9800', alphaValue);
};

const getStatusTextColor = (status) => {
  if (status === "APPROVED") return '#2e7d32';
  if (status === "FOR_ENROLLMENT") return '#1565c0';
  return '#e65100';
};

const getFileIcon = (fileType, size = 'small') => {
  if (!fileType) return <DescriptionIcon fontSize={size === 'small' ? 'small' : 'large'} />;
  const type = fileType.toLowerCase();
  const iconSize = size === 'small' ? 'small' : 'large';
  const iconStyle = size === 64 ? { fontSize: 64 } : {};
  
  if (type.includes('pdf')) {
    return <PictureAsPdfIcon fontSize={iconSize} sx={{ color: '#d32f2f', ...iconStyle }} />;
  }
  if (type.includes('image') || type.includes('jpg') || type.includes('png') || type.includes('gif')) {
    return <ImageIcon fontSize={iconSize} sx={{ color: '#1976d2', ...iconStyle }} />;
  }
  return <DescriptionIcon fontSize={iconSize} sx={iconStyle} />;
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

const getGradeStyles = (hasGrade) => ({
  fontWeight: hasGrade ? 600 : 400,
  color: hasGrade ? '#000000' : '#666666'
});

const DocumentPreview = ({ document, onPreview, onDownload, previewMode, onClosePreview, fullScreenMode, onFullScreen, onCloseFullScreen }) => {
  if (!document) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1, p: 2 }}>
        <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          Select a document to preview
        </Typography>
      </Box>
    );
  }

  // If in preview mode, show the actual document
  if (previewMode) {
    const fileType = document.fileType?.toLowerCase() || '';
    const isImage = fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png') || fileType.includes('gif');
    
    return (
      <DocumentPreviewContainer>
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(maroon.main, 0.1)}` }}>
          <Typography variant="subtitle2" fontWeight="600" color={maroon.main} noWrap>
            {document.fileName}
          </Typography>
          <IconButton size="small" onClick={onClosePreview}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {isImage ? (
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: alpha('#000', 0.02)
            }}>
              <img
                src={`https://eteeap-foth.onrender.com/api/documents/preview/${document.documentId}`}
                alt={document.fileName}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: 8
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Box sx={{ 
                display: 'none', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                flexDirection: 'column',
                gap: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  Unable to preview image
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => onDownload(document.documentId)}
                  size="small"
                >
                  Download to view
                </Button>
              </Box>
            </Box>
          ) : (
            <iframe
              src={`https://eteeap-foth.onrender.com/api/documents/preview/${document.documentId}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={document.fileName}
            />
          )}
        </Box>
      </DocumentPreviewContainer>
    );
  }

  // Default view with action buttons
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, flexShrink: 0 }}>
        <Typography variant="subtitle2" fontWeight="600" color={maroon.main} noWrap>
          {document.fileName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
        </Typography>
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, p: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {getFileIcon(document.fileType, 64)}
          <Typography variant="h6" color={maroon.main} sx={{ mt: 1, fontWeight: 600 }}>
            {document.fileName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {document.fileType} • {(document.fileSize / 1024).toFixed(0)} KB
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={() => onPreview(document.documentId)}
            sx={{
              bgcolor: maroon.main,
              '&:hover': { bgcolor: maroon.dark },
              borderRadius: 2,
              px: 3,
            }}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<FullscreenIcon />}
            onClick={onFullScreen}
            sx={{
              borderColor: maroon.main,
              color: maroon.main,
              '&:hover': {
                borderColor: maroon.dark,
                bgcolor: alpha(maroon.main, 0.05),
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Full Screen
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload(document.documentId)}
            sx={{
              borderColor: maroon.main,
              color: maroon.main,
              '&:hover': {
                borderColor: maroon.dark,
                bgcolor: alpha(maroon.main, 0.05),
              },
              borderRadius: 2,
              px: 3,
            }}
          >
            Download
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

const FinalCapix = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { applicantId, applicantName, finalCourse } = location.state || {};
  
  // State management
  const [records, setRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [applicantData, setApplicantData] = useState(null);

  // Handle document preview inline
  const handlePreviewDocument = (documentId) => {
    setPreviewMode(true);
  };

  // Handle closing preview
  const handleClosePreview = () => {
    setPreviewMode(false);
  };

  // Handle full screen preview
  const handleFullScreenPreview = () => {
    setPreviewMode(false);
    setFullScreenMode(true);
  };

  // Handle closing full screen preview
  const handleCloseFullScreen = () => {
    setFullScreenMode(false);
  };

  // Handle document download
  const handleDownloadDocument = (documentId) => {
    const downloadUrl = `https://eteeap-foth.onrender.com/api/documents/download/${documentId}`;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to sort and deduplicate subjects in each semester
  const sortSemesterSubjects = (data) => {
    if (!data || typeof data !== 'object') return data;
    const sorted = {};
    Object.keys(data).forEach((semester) => {
      // Sort first
      let arr = [...data[semester]].sort((a, b) => {
        const codeA = a.subject?.subjectCode || '';
        const codeB = b.subject?.subjectCode || '';
        if (codeA && codeB) return codeA.localeCompare(codeB);
        // fallback to id if no code
        return (a.subject?.subjectId || a.id || 0) - (b.subject?.subjectId || b.id || 0);
      });
      // Deduplicate by subjectId (or subjectCode as fallback)
      const seen = new Set();
      arr = arr.filter((item) => {
        const key = item.subject?.subjectId || item.subject?.subjectCode || item.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      sorted[semester] = arr;
    });
    return sorted;
  };

  // Fetch applicant data and records
  useEffect(() => {
    if (!applicantId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch accreditation records (using the same endpoint as GradedAccreditation)
        const recordsResponse = await axios.get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`);
        setRecords(sortSemesterSubjects(recordsResponse.data));

        // Fetch applicant details
        const applicantResponse = await axios.get(`${API_BASE}/applicants/${applicantId}`);
        setApplicantData(applicantResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicantId]);

  // Fetch documents
  useEffect(() => {
    if (!applicantId) return;

    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/documents/applicant/${applicantId}`);
        // Map documents to match the expected structure
        const mappedDocuments = (response.data || []).map((doc) => ({
          ...doc,
          name: doc.fileName,
          id: doc.documentId,
          downloadUrl: doc.downloadUrl,
          documentType: doc.documentType,
        }));
        setDocuments(mappedDocuments);
        // Auto-select first document
        if (mappedDocuments.length > 0) {
          setSelectedDocument(mappedDocuments[0]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchDocuments();
  }, [applicantId]);

  // Get unique document types from documents
  const documentTypes = Array.from(
    new Set(documents.map(doc => doc.documentType).filter(Boolean))
  ).sort();

  // Filter documents by document type
  const filteredDocuments = documents.filter(doc => {
    return selectedDocumentType === '' || doc.documentType === selectedDocumentType;
  });

  // Update selected document when filter changes
  useEffect(() => {
    if (filteredDocuments.length > 0 && !selectedDocument) {
      setSelectedDocument(filteredDocuments[0]);
    } else if (filteredDocuments.length === 0) {
      setSelectedDocument(null);
    } else if (selectedDocument && !filteredDocuments.find(doc => doc.documentId === selectedDocument.documentId)) {
      setSelectedDocument(filteredDocuments[0]);
    }
  }, [selectedDocumentType, filteredDocuments, selectedDocument]);

  // Group records by semester (records are already processed in fetch)
  const semesterGroups = records;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading applicant data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: 'linear-gradient(135deg, #1a0000 0%, #3d0000 40%, #6A0000 100%)' }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${maroon.dark} 0%, ${maroon.main} 60%, ${maroon.light} 100%)`,
          borderRadius: 3,
          px: 3, py: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          boxShadow: '0 4px 20px rgba(106,0,0,0.25)',
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{
            color: alpha('#fff', 0.85),
            bgcolor: alpha('#fff', 0.1),
            border: `1px solid ${alpha('#fff', 0.2)}`,
            '&:hover': { bgcolor: alpha('#fff', 0.2), color: '#fff' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: alpha('#fff', 0.15), border: `2px solid ${alpha('#fff', 0.3)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GradeIcon sx={{ color: gold.main, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="white" sx={{ lineHeight: 1.2 }}>
            Final Accreditation Record
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#fff', 0.75) }}>
            Read-only view of approved accreditation details
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, flex: 1, minHeight: 0 }}>
        
        {/* Left Side - Subject Records */}
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          
          {/* Subject Evaluation Header */}
          <Box
            sx={{
              width: '100%',
              background: 'rgba(255,255,255,0.93)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              boxShadow: '0 2px 12px rgba(106,0,0,0.09)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderTop: `3px solid ${maroon.main}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={1.5}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: alpha(maroon.main, 0.1), border: `1.5px solid ${alpha(maroon.main, 0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SchoolIcon sx={{ color: maroon.main, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color={maroon.main}>
                    Subject Accreditation Records
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Final approved subjects and grades for {applicantName || 'Unknown Applicant'}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label="APPROVED"
                  color="success"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 12, fontWeight: 600 }}
                />
                {finalCourse && (
                  <Chip
                    label={finalCourse.courseName}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(maroon.main, 0.1), 
                      color: maroon.main,
                      fontWeight: 600 
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Box>
          
          {/* Records Display */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                <CircularProgress sx={{ color: '#fff' }} />
                <Typography variant="body1" color="white">Loading accreditation records...</Typography>
              </Box>
            ) : Object.keys(semesterGroups).length > 0 ? (
              Object.entries(semesterGroups).map(([semester, subjects]) => (
                <StyledAccordion key={semester} defaultExpanded>
                  <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                      <GradeIcon sx={{ color: maroon.main }} />
                      <Typography variant="h6" fontWeight="600">
                        {semester}
                      </Typography>
                      <Chip 
                        label={`${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`} 
                        size="small" 
                        sx={{ ml: 'auto', bgcolor: alpha(maroon.main, 0.1), color: maroon.main }}
                      />
                    </Stack>
                  </StyledAccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <StyledTableCell>Subject Code</StyledTableCell>
                            <StyledTableCell>Subject Name</StyledTableCell>
                            <StyledTableCell>Units</StyledTableCell>
                            <StyledTableCell>Grade</StyledTableCell>
                            <StyledTableCell>Status</StyledTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subjects.map((record, index) => (
                            <StyledTableRow key={record.id || index}>
                              <TableCell sx={{ fontWeight: 500 }}>
                                {record.subject?.subjectCode || record.subjectCode || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {record.subject?.descriptiveTitle || record.subjectName || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {record.subject?.units || record.units || 'N/A'}
                              </TableCell>
                              <TableCell sx={getGradeStyles(record.grade)}>
                                {record.grade || 'No Grade'}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={record.status || 'APPROVED'} 
                                  size="small"
                                  style={{
                                    backgroundColor: getStatusBackgroundColor(record.status || 'APPROVED'),
                                    color: getStatusTextColor(record.status || 'APPROVED'),
                                    fontWeight: 600,
                                    fontSize: 11
                                  }}
                                />
                              </TableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </StyledAccordion>
              ))
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6, 
                background: 'rgba(255,255,255,0.93)', 
                backdropFilter: 'blur(12px)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.6)'
              }}>
                <GradeIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No accreditation records found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No subject records are available for this applicant.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right Side - Documents Panel */}
        <DocumentPreviewContainer>
          {!fullScreenMode && (
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, flexShrink: 0, background: `linear-gradient(90deg, ${alpha(maroon.main, 0.05)} 0%, transparent 100%)` }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: alpha(maroon.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DescriptionIcon sx={{ color: maroon.main, fontSize: 16 }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color={maroon.main}>
                  Documents Preview
                </Typography>
              </Stack>

              {/* Document Type Filter */}
              <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                <InputLabel id="document-type-label" sx={{ fontSize: 12 }}>
                  Filter by Document Type
                </InputLabel>
                <Select
                  labelId="document-type-label"
                  id="document-type-select"
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  label="Filter by Document Type"
                  sx={{
                    borderRadius: 1,
                    backgroundColor: alpha(gold.light, 0.1),
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(maroon.main, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(maroon.main, 0.4),
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Document Types ({documents.length})</em>
                  </MenuItem>
                  {documentTypes.map(docType => (
                    <MenuItem key={docType} value={docType}>
                      {docType} ({documents.filter(d => d.documentType === docType).length})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Documents List and Preview */}
          {!fullScreenMode && (documentsLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredDocuments.length > 0 ? (
            <Box sx={{ overflow: 'auto', p: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 1.5 }}>
                {filteredDocuments.map(doc => (
                  <Box
                    key={doc.documentId}
                    onClick={() => setSelectedDocument(doc)}
                    sx={{
                      p: 1.25,
                      mb: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      backgroundColor: selectedDocument?.documentId === doc.documentId 
                        ? alpha(maroon.main, 0.1) 
                        : 'transparent',
                      border: selectedDocument?.documentId === doc.documentId
                        ? `2px solid ${maroon.main}`
                        : `1px solid ${alpha(maroon.main, 0.1)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(maroon.main, 0.05),
                        borderColor: maroon.main,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box sx={{ mt: 0.5, display: 'flex' }}>
                        {getFileIcon(doc.fileType)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          fontWeight={selectedDocument?.documentId === doc.documentId ? 600 : 500}
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {doc.fileName}
                        </Typography>
                        
                        {doc.documentType && (
                          <Typography variant="caption" color={maroon.main} sx={{ fontWeight: 500, display: 'block' }}>
                            {doc.documentType}
                          </Typography>
                        )}
                        
                        <Typography variant="caption" color="text.secondary">
                          {(doc.fileSize / 1024).toFixed(0)} KB
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 1, p: 2 }}>
              <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="body2" color="text.secondary" align="center">
                {documents.length === 0 ? 'No documents uploaded' : 'No documents match the selected filter'}
              </Typography>
            </Box>
          ))}

          {!fullScreenMode && <Divider />}

          {/* Document Preview */}
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DocumentPreview 
              document={selectedDocument} 
              onPreview={handlePreviewDocument}
              onDownload={handleDownloadDocument}
              previewMode={previewMode}
              onClosePreview={handleClosePreview}
              fullScreenMode={fullScreenMode}
              onFullScreen={handleFullScreenPreview}
              onCloseFullScreen={handleCloseFullScreen}
            />
          </Box>
        </DocumentPreviewContainer>
      </Box>

      {/* Full Screen Document Preview Dialog */}
      <Dialog 
        open={fullScreenMode} 
        onClose={handleCloseFullScreen}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: '90vh', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ p: 2, bgcolor: maroon.main, color: 'white' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedDocument?.fileName}</Typography>
            <IconButton onClick={handleCloseFullScreen} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {selectedDocument && (
            <>
              {selectedDocument.fileType?.toLowerCase().includes('image') ? (
                <Box sx={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: alpha('#000', 0.02)
                }}>
                  <img
                    src={`https://eteeap-foth.onrender.com/api/documents/preview/${selectedDocument.documentId}`}
                    alt={selectedDocument.fileName}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ) : (
                <iframe
                  src={`https://eteeap-foth.onrender.com/api/documents/preview/${selectedDocument.documentId}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={selectedDocument.fileName}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FinalCapix;
