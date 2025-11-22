import React from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  
  Tooltip,
  IconButton,
  List,
  ListItem,
  Chip,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  
  alpha,
  Button,
  useTheme,
  ListItemSecondaryAction
} from "@mui/material";
import { Description as DocumentIcon, Visibility as VisibilityIcon, DownloadForOffline as DownloadIcon, CheckCircleOutline as VerifiedIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";

// Maroon and Gold theme colors
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

const DocumentList = ({
  isLoading = false,
  documents = [],
  documentsByType = { all: [], required: [], other: [] },
  documentTab = 0,
  handleDocumentTabChange = () => {},
  handlePreviewDocument = () => {},
  handleDownloadDocument = () => {},
  uploadingFiles = false,
  handleFileUpload = () => {},
  onUploadClick = () => {}
}) => {
  const theme = useTheme();

  // Function to format document type for display
  const formatDocumentType = (type) => {
    if (!type) return "Unknown Document";
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get current documents based on selected tab
  const getCurrentDocuments = () => {
    switch (documentTab) {
      case 0: return documentsByType?.all || [];
      case 1: return documentsByType?.required || [];
      case 2: return documentsByType?.other || [];
      default: return documentsByType?.all || [];
    }
  };

  // Ensure documents is always treated as an array, even if it's undefined or null
  const currentDocuments = getCurrentDocuments();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={30} sx={{ color: maroon.main }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Document tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={documentTab} 
          onChange={handleDocumentTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="document tabs"
        >
          <Tab label={`All (${documentsByType?.all?.length || 0})`} />
          <Tab label={`Required (${documentsByType?.required?.length || 0})`} />
          <Tab label={`Other (${documentsByType?.other?.length || 0})`} />
        </Tabs>
      </Box>
      
      {/* Document list */}
      {currentDocuments.length > 0 ? (
        <List disablePadding>
          {currentDocuments.map((document) => (
            <ListItem 
              key={document.documentId || `doc-${Math.random()}`} 
              sx={{ 
                py: 1.5, 
                px: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&:last-child': { borderBottom: 'none' },
                '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.5) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DocumentIcon color="primary" />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {document.fileName || 'Unnamed Document'}
                    </Typography>
                    {document.verified && (
                      <Tooltip title="Verified">
                        <VerifiedIcon color="success" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={formatDocumentType(document.documentType)}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 24,
                        borderColor: alpha(maroon.main, 0.5),
                        color: maroon.main
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Preview">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handlePreviewDocument(document)}
                      sx={{ 
                        color: maroon.main, 
                        bgcolor: alpha(maroon.light, 0.1),
                        '&:hover': {
                          bgcolor: alpha(maroon.light, 0.2),
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleDownloadDocument(document)}
                      sx={{ 
                        color: gold.dark, 
                        bgcolor: alpha(gold.light, 0.3),
                        '&:hover': {
                          bgcolor: alpha(gold.light, 0.5),
                        }
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No documents found
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileUploadIcon />}
            onClick={onUploadClick}
            sx={{
              borderColor: maroon.main,
              color: maroon.main,
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: alpha(maroon.main, 0.1),
                borderColor: maroon.dark,
              }
            }}
          >
            Upload Document
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DocumentList;