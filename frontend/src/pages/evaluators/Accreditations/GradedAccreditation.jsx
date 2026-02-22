import React, { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  Grow,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Autocomplete,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import axios from "axios";
import toast from "../../../utils/toast";
import { API_BASE } from '../../../config';

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


const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2),
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: alpha(maroon.main, 0.1),
  '&.Mui-expanded': {
    backgroundColor: alpha(maroon.main, 0.15),
  },
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
  },
}));

const DocumentPreviewContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderLeft: `3px solid ${maroon.main}`,
}));

// Helper functions to avoid nested ternaries
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

const getGradeStyles = (hasGrade) => ({
  fontWeight: hasGrade ? 600 : 400,
  color: hasGrade ? 'text.primary' : 'text.secondary'
});

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
    const isPdf = fileType.includes('pdf');
    const isWord = fileType.includes('wordprocessingml') || fileType.includes('msword');
    const isExcel = fileType.includes('spreadsheetml') || fileType.includes('excel');
    const isPowerPoint = fileType.includes('presentationml') || fileType.includes('powerpoint');
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Preview Header */}
        <Box sx={{ 
          p: fullScreenMode ? 2 : 1.5, 
          borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, 
          flexShrink: 0, 
          bgcolor: fullScreenMode ? alpha(maroon.main, 0.08) : alpha(maroon.main, 0.05) 
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography 
                variant={fullScreenMode ? "h6" : "subtitle2"} 
                fontWeight="600" 
                color={maroon.main} 
                noWrap
              >
                {document.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fullScreenMode ? 'Full Screen Preview - DocumentContainer' : 'Preview Mode'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {fullScreenMode ? (
                <Tooltip title="Exit Full Screen">
                  <IconButton
                    size="medium"
                    onClick={onCloseFullScreen}
                    sx={{
                      color: '#d32f2f',
                      bgcolor: 'rgba(211,47,47,0.1)',
                      '&:hover': { bgcolor: 'rgba(211,47,47,0.2)' },
                      borderRadius: 2,
                    }}
                  >
                    <CloseIcon fontSize="medium" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {!fullScreenMode && (
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Full Screen">
                    <IconButton
                      size="small"
                      onClick={onFullScreen}
                      sx={{
                        color: maroon.main,
                        '&:hover': { bgcolor: alpha(maroon.main, 0.1) },
                      }}
                    >
                      <FullscreenIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Document">
                    <IconButton
                      size="small"
                      onClick={() => onDownload(document.documentId)}
                      sx={{
                        color: maroon.main,
                        '&:hover': { bgcolor: alpha(maroon.main, 0.1) },
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Close Preview">
                    <IconButton
                      size="small"
                      onClick={onClosePreview}
                      sx={{
                        color: '#d32f2f',
                        '&:hover': { bgcolor: 'rgba(211,47,47,0.1)' },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Document Content */}
        <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
          {isImage ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              <img
                src={`https://eteeap-foth.onrender.com/api/documents/preview/${document.documentId}`}
                alt={document.fileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </Box>
          ) : isPdf || isWord || isExcel || isPowerPoint ? (
            <iframe
              src={`https://eteeap-foth.onrender.com/api/documents/preview/${document.documentId}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={document.fileName}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1, p: 3 }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }} />
              <Typography variant="h6" color="text.secondary" align="center">
                Preview not available
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                This file type ({fileType || 'unknown'}) cannot be previewed inline.
              </Typography>
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
                  mt: 2,
                }}
              >
                Download File
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Default view with action buttons
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Document Header */}
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, flexShrink: 0 }}>
        <Typography variant="subtitle2" fontWeight="600" color={maroon.main} noWrap>
          {document.fileName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Action Buttons */}
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

const GradedAccreditation = ({ applicantId, curriculumId, onClose, isOpen }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advisers, setAdvisers] = useState([]);
  const [selectedAdviser, setSelectedAdviser] = useState(null);
  const [existingAssignment, setExistingAssignment] = useState(null);
  const [savingAdviser, setSavingAdviser] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const saveTimers = useRef({});

  const flushTimers = () => {
    Object.values(saveTimers.current).forEach(clearTimeout);
    saveTimers.current = {};
  };

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
    setFullScreenMode(true);
    setPreviewMode(true);
  };

  // Handle closing full screen preview
  const handleCloseFullScreen = () => {
    setFullScreenMode(false);
    setPreviewMode(false);
  };

  // Handle document download
  const handleDownloadDocument = (documentId) => {
    const downloadUrl = `https://eteeap-foth.onrender.com/api/documents/download/${documentId}`;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  // debounce save helper (also saves empty strings to allow clearing)
  const queueSave = (recId, semester, field, value) => {
    const key = `${recId}-${field}`;
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);

    setRecords(prev => ({
      ...prev,
      [semester]: prev[semester].map(r =>
        r.id === recId ? { ...r, [field]: value } : r
      )
    }));

    saveTimers.current[key] = setTimeout(async () => {
      const params = new URLSearchParams();
      params.append(field, value ?? "");
      try {
        await axios.put(
          `${API_BASE}/applicant-subject-records/${recId}?${params.toString()}`,
          null,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
      } catch (err) {
        console.error(`Failed to save ${field}:`, err);
        toast.error(`Failed to save ${field}.`);
      } finally {
        delete saveTimers.current[key];
      }
    }, 350);
  };

  useEffect(() => {
    return () => flushTimers();
  }, []);

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

  useEffect(() => {
    if (!isOpen) {
      flushTimers();
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`)
      .then((res) => {
        setRecords(sortSemesterSubjects(res.data));
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [applicantId, isOpen]);

  // Fetch documents
  useEffect(() => {
    if (!applicantId || !isOpen) return;

    setDocumentsLoading(true);
    axios
      .get(`${API_BASE}/documents/applicant/${applicantId}`)
      .then((res) => {
        setDocuments(res.data || []);
        // Auto-select first document
        if (res.data && res.data.length > 0) {
          setSelectedDocument(res.data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch documents:", err);
        setDocuments([]);
      })
      .finally(() => setDocumentsLoading(false));
  }, [applicantId, isOpen]);

  // Get unique file types from documents
  const fileTypes = Array.from(
    new Set(documents.map(doc => doc.fileType).filter(Boolean))
  ).sort();

  // Filter documents by selected file type
  const filteredDocuments = selectedFileType
    ? documents.filter(doc => doc.fileType === selectedFileType)
    : documents;

  // Update selected document when filter changes
  useEffect(() => {
    if (filteredDocuments.length > 0 && !filteredDocuments.includes(selectedDocument)) {
      setSelectedDocument(filteredDocuments[0]);
    } else if (filteredDocuments.length === 0) {
      setSelectedDocument(null);
    }
  }, [selectedFileType, filteredDocuments]);

  // Fetch existing assignment for this applicant (only on mount or applicantId change)
  useEffect(() => {
    if (applicantId && advisers.length > 0 && isOpen) {
      axios
        .get(`${API_BASE}/assignments/applicant/${applicantId}`)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            const assignment = res.data[0]; // Get the first/latest assignment
            setExistingAssignment(assignment);
            // Find and set the assigned adviser only on initial load
            const assignedAdviser = advisers.find(
              (adv) => adv.evaluatorId === assignment.evaluator?.evaluatorId
            );
            if (assignedAdviser) {
              setSelectedAdviser(assignedAdviser);
            }
          } else {
            // No existing assignment
            setExistingAssignment(null);
            setSelectedAdviser(null);
          }
        })
        .catch((err) => {
          console.log("No existing assignment found or error:", err);
          setExistingAssignment(null);
          setSelectedAdviser(null);
        });
    }
  }, [applicantId, advisers, isOpen]);

  // Fetch all evaluators for adviser selection
  useEffect(() => {
    const fetchAdvisers = async () => {
      try {
        const res = await fetch(`${EVALUATOR_API}`);
        const data = await res.json();
        // Filter to only include evaluators with role 'adviser'
        const advisersOnly = data.filter(evaluator => 
          evaluator.role === 'adviser' || evaluator.role === 'ADVISER'
        );
        console.log("Fetched advisers:", advisersOnly);
        setAdvisers(advisersOnly);
      } catch (error) {
        console.error("Error fetching evaluators:", error);
        setAdvisers([]);
      }
    };
    fetchAdvisers();
  }, []);

  // Handle adviser selection and save to backend
  const handleAdviserChange = async (event, newValue) => {
    setSelectedAdviser(newValue);
    
    if (!newValue || !applicantId) return;

    setSavingAdviser(true);
    try {
      if (existingAssignment) {
        // Update existing assignment - backend only accepts notes in PUT
        const updateRes = await axios.put(`${API_BASE}/assignments/${existingAssignment.assignmentId}`, {
          notes: existingAssignment.notes || ""
        });
        console.log("Assignment updated successfully:", updateRes.data);
        toast.success("Adviser assignment updated successfully.");
        // Update the existing assignment state without re-selecting
        setExistingAssignment(updateRes.data);
      } else {
        // Create new assignment
        const createRes = await axios.post(`${API_BASE}/assignments`, {
          applicantId: applicantId,
          evaluatorId: newValue.evaluatorId,
          notes: ""
        });
        console.log("Assignment created successfully:", createRes.data);
        toast.success("Adviser assigned successfully.");
        // Set the newly created assignment
        if (createRes.data?.assignmentId) {
          setExistingAssignment(createRes.data);
        }
      }
    } catch (error) {
      console.error("Error saving adviser assignment:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to save adviser assignment. Please try again.");
      // Reset selected adviser on error
      setSelectedAdviser(null);
    } finally {
      setSavingAdviser(false);
    }
  };

  // Handle delete/clear adviser assignment
  const handleDeleteAssignment = async () => {
    if (!existingAssignment) {
      toast.info("No assignment to delete");
      return;
    }

    // Confirm deletion
    if (!globalThis.confirm("Are you sure you want to delete this adviser assignment?")) {
      return;
    }

    setSavingAdviser(true);
    try {
      await axios.delete(`${API_BASE}/assignments/${existingAssignment.assignmentId}`);
      console.log("Assignment deleted successfully");
      toast.success("Adviser assignment deleted successfully.");
      
      // Clear the selection
      setSelectedAdviser(null);
      setExistingAssignment(null);
    } catch (error) {
      console.error("Error deleting adviser assignment:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to delete adviser assignment. Please try again.");
    } finally {
      setSavingAdviser(false);
    }
  };

  // Accreditation function (bulk create records from curriculum)


  // Handle status change via PUT
  const handleStatusChange = async (rec, newStatus) => {
    try {
      const params = new URLSearchParams();
      params.append('status', newStatus);

      await axios.put(
        `${API_BASE}/applicant-subject-records/${rec.id}?${params.toString()}`,
        null,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const refreshed = await axios.get(
        `${API_BASE}/applicant-subject-records/applicant/${applicantId}/organized-clean`
      );
      setRecords(sortSemesterSubjects(refreshed.data));
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error("Failed to change status:", err);
      toast.error("Failed to change status.");
    }
  };

  const modalContent = (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* Header with Back Button */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: maroon.main,
            '&:hover': {
              backgroundColor: alpha(maroon.main, 0.1),
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <GradeIcon sx={{ color: maroon.main, fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold" color={maroon.dark}>
          Graded Accreditation Record
        </Typography>
      </Stack>

      {/* Main Content - Split Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 'calc(100vh - 140px)' }}>
        
        {/* Left Side: Subject Evaluation & Grading */}
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          
      {/* Compact Header Section */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#fff',
          borderRadius: 1.5,
          p: 1.5,
          mb: 2,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
        >
          {/* Left Side: Title + Description */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SchoolIcon sx={{ color: gold.main, fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
                Subject Evaluation & Grading
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Review and grade individual subjects for accreditation
              </Typography>
            </Box>
          </Stack>

          {/* Right Side: Adviser Selection */}
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon sx={{ color: maroon.main, fontSize: 20 }} />
            <Autocomplete
              options={advisers}
              value={selectedAdviser}
              onChange={handleAdviserChange}
              getOptionLabel={(option) =>
                option?.firstName
                  ? `${option.firstName} ${option.lastName}`
                  : option?.name || option?.email?.split("@")[0] || ""
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Adviser"
                  size="small"
                  sx={{ 
                    width: 200,
                    '& .MuiInputBase-root': {
                      fontSize: 13,
                    }
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {savingAdviser ? <CircularProgress size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              disabled={savingAdviser}
              noOptionsText="No evaluators found"
              sx={{
                '& .MuiAutocomplete-listbox': {
                  '& .MuiAutocomplete-option': {
                    fontSize: 13,
                    py: 0.75,
                  },
                },
              }}
            />

            {/* Delete Button */}
            {selectedAdviser && existingAssignment && (
              <Tooltip title="Delete assignment">
                <IconButton
                  size="small"
                  onClick={handleDeleteAssignment}
                  disabled={savingAdviser}
                  sx={{
                    color: '#d32f2f',
                    '&:hover': { bgcolor: 'rgba(211,47,47,0.1)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Box>
      
      {(() => {
        if (loading) {
          return (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ mt: 1.5 }}>Loading records...</Typography>
            </Box>
          );
        }
        
        if (Object.keys(records).length === 0) {
          return (
            <InfoCard>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No accreditation records found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No subject records have been created for this applicant yet.
                </Typography>
              </CardContent>
            </InfoCard>
          );
        }
        
        return (
          <Grow in={true} timeout={500}>
            <Box>
            {Object.keys(records).map((semester, index) => (
              <StyledAccordion key={semester} defaultExpanded={index === 0}>
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: maroon.main }} />}
                  sx={{ minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                    <BookIcon sx={{ color: maroon.main, fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="600" color={maroon.dark}>
                        {semester}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {records[semester].length} subjects
                      </Typography>
                    </Box>
                    <Chip
                      label={`${records[semester].filter(r => r.status === 'APPROVED').length} / ${records[semester].length} Approved`}
                      color={records[semester].every(r => r.status === 'APPROVED') ? 'success' : 'warning'}
                      size="small"
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </Stack>
                </StyledAccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ minWidth: 200 }}>Subject</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 80 }}>Grade</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 180 }}>Process of Accreditation</StyledTableCell>
                        <StyledTableCell sx={{ minWidth: 180 }}>Substantive Basis</StyledTableCell>
                        <StyledTableCell align="center" sx={{ minWidth: 100 }}>Status</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records[semester].map((rec) => {
                        const isEditable = rec.status === "PENDING";

                        return (
                          <StyledTableRow key={rec.id}>
                            <StyledTableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {rec.subject?.descriptiveTitle}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {rec.subject?.subjectCode}
                                </Typography>
                              </Box>
                            </StyledTableCell>

                            {/* Grade Cell */}
                            <StyledTableCell>
                              {isEditable ? (
                                <TextField
                                  size="small"
                                  value={rec.grade || ""}
                                  onChange={(e) => queueSave(rec.id, semester, "grade", e.target.value)}
                                  fullWidth
                                  placeholder="Grade"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 13,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="body2"
                                  {...getGradeStyles(rec.grade)}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    fontSize: 13,
                                  }}
                                >
                                  {rec.grade || "Not graded"}
                                </Typography>
                              )}
                            </StyledTableCell>

                            {/* Process of Accreditation Cell */}
                            <StyledTableCell>
                              {isEditable ? (
                                (() => {
                                  const allowedOptions = [
                                    "Self-Assessment",
                                    "TOR Accreditation",
                                    "Portfolio Review",
                                    "Remediation Class",
                                    "Home Reading Report",
                                    "One-on-One Tutorial",
                                    "Problem Solving",
                                    "Job Description Review"
                                  ];
                                  let value = (rec.processOfAccreditation || "").trim();
                                  if (!allowedOptions.includes(value)) value = "";
                                  return (
                                    <TextField
                                      select
                                      size="small"
                                      value={value}
                                      onChange={(e) => queueSave(rec.id, semester, "processOfAccreditation", e.target.value)}
                                      fullWidth
                                      placeholder="Select process"
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: 1,
                                          fontSize: 12,
                                        }
                                      }}
                                    >
                                      {/* Use MUI MenuItem instead of native option */}
                                      {React.createElement(require('@mui/material').MenuItem, {value: ""}, "Select process")}
                                      {allowedOptions.map(opt => (
                                        React.createElement(require('@mui/material').MenuItem, {key: opt, value: opt}, opt)
                                      ))}
                                    </TextField>
                                  );
                                })()
                              ) : (
                                <Typography
                                  variant="caption"
                                  color={rec.processOfAccreditation ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    display: 'block',
                                  }}
                                >
                                  {rec.processOfAccreditation || "Not specified"}
                                </Typography>
                              )}
                            </StyledTableCell>

                            {/* Substantive Basis Cell */}
                            <StyledTableCell>
                              {isEditable ? (
                                <TextField
                                  size="small"
                                  value={rec.substantiveBasis || ""}
                                  onChange={(e) => queueSave(rec.id, semester, "substantiveBasis", e.target.value)}
                                  fullWidth
                                  multiline
                                  rows={2}
                                  placeholder="Enter basis"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 12,
                                    }
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color={rec.substantiveBasis ? 'text.primary' : 'text.secondary'}
                                  sx={{
                                    backgroundColor: alpha(gold.light, 0.3),
                                    padding: 0.75,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(gold.main, 0.5)}`,
                                    display: 'block',
                                  }}
                                >
                                  {rec.substantiveBasis || "Not specified"}
                                </Typography>
                              )}
                            </StyledTableCell>

                            {/* Status Dropdown Cell */}
                            <StyledTableCell align="center">
                              <Tooltip
                                title={isEditable ? "" : "Change back to PENDING to update this record"}
                                placement="top"
                                arrow
                              >
                                <TextField
                                  select
                                  size="small"
                                  value={rec.status || "PENDING"}
                                  onChange={(e) => handleStatusChange(rec, e.target.value)}
                                  sx={{
                                    minWidth: 140,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      backgroundColor: getStatusBackgroundColor(rec.status, 0.1),
                                      color: getStatusTextColor(rec.status),
                                      '&:hover': {
                                        backgroundColor: getStatusBackgroundColor(rec.status, 0.2),
                                      }
                                    }
                                  }}
                                >
                                  <MenuItem value="PENDING">PENDING</MenuItem>
                                  <MenuItem value="APPROVED">APPROVED</MenuItem>
                                  <MenuItem value="FOR_ENROLLMENT">FOR_ENROLLMENT</MenuItem>
                                </TextField>
                              </Tooltip>
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </StyledAccordion>
            ))}
          </Box>
        </Grow>
        );
      })()}
        </Box>

        {/* Right Side: Documents Preview */}
        <DocumentPreviewContainer>
          {/* Header */}
          {!fullScreenMode && (
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}`, flexShrink: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <DescriptionIcon sx={{ color: maroon.main, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
                Documents Preview
              </Typography>
            </Stack>

            {/* File Type Filter */}
            <FormControl size="small" fullWidth>
              <InputLabel id="file-type-label" sx={{ fontSize: 12 }}>
                Filter by File Type
              </InputLabel>
              <Select
                labelId="file-type-label"
                id="file-type-select"
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                label="Filter by File Type"
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
                  <em>All Documents ({documents.length})</em>
                </MenuItem>
                {fileTypes.map(fileType => (
                  <MenuItem key={fileType} value={fileType}>
                    {fileType} ({documents.filter(d => d.fileType === fileType).length})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          )}

          {/* Document List */}
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

          {/* Preview Section */}
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
      </Box>
    );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', height: '100vh' }}>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};


GradedAccreditation.propTypes = {
  applicantId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  curriculumId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default GradedAccreditation;
