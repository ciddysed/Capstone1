import React, { useState } from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  IconButton,
  List,
  Chip,
  CircularProgress,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Description,
  Visibility,
  Download,
  UploadFile
} from "@mui/icons-material";
import {
  DocumentBadge,
  DocumentItem,
  UploadButton
} from "./styled";

// The improved document handler component that uses a new tab approach for previewing
const DocumentHandler = ({
  isLoading,
  documents,
  documentsByType,
  apiBaseUrl,
  uploadingFiles,
  handleFileUpload
}) => {
  // State for document tabs
  const [documentTab, setDocumentTab] = useState(0);

  // Get current documents based on tab
  const getCurrentDocuments = () => {
    switch(documentTab) {
      case 0: return documentsByType.all;
      case 1: return documentsByType.required;
      case 2: return documentsByType.other;
      default: return documentsByType.all;
    }
  };

  // Handle previewing document in a new tab
  const handlePreviewDocument = (doc) => {
    // Create a preview URL
    const previewUrl = `${apiBaseUrl}/documents/preview/${doc.id}`;
    
    // Open in a new tab
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle document tab change
  const handleDocumentTabChange = (event, newValue) => {
    setDocumentTab(newValue);
  };

  // Download document using direct URL approach
  const handleDownloadDocument = (doc) => {
    try {
      // Create a direct download link
      const downloadUrl = `${apiBaseUrl}/documents/download/${doc.id}`;
      
      // Create a hidden anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', doc.name); // Set download attribute with filename
      link.setAttribute('target', '_blank'); // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      
      // Remove the link after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download ${doc.name}. Please try again later.`);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Application Documents
        </Typography>
        <DocumentBadge badgeContent={documents.length} color="primary" showZero>
          <Description sx={{ color: "#555" }} />
        </DocumentBadge>
      </Box>
      <Tabs 
        value={documentTab} 
        onChange={handleDocumentTabChange}
        variant="fullWidth"
        sx={{ 
          minHeight: '36px',
          '& .MuiTabs-indicator': { height: 3 },
          '& .MuiTab-root': { minHeight: '36px', py: 0.5 }
        }}
      >
        <Tab label={`All (${documentsByType.all.length})`} />
        <Tab label={`Required (${documentsByType.required.length})`} />
        <Tab label={`Other (${documentsByType.other.length})`} />
      </Tabs>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : getCurrentDocuments().length > 0 ? (
        <List sx={{ 
          bgcolor: "#f8f8f8", 
          borderRadius: 2,
          p: 1,
          maxHeight: "300px",
          overflowY: "auto"
        }}>
          {getCurrentDocuments().map((doc, index) => (
            <DocumentItem 
              key={doc.id || index}
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon>
                {doc.icon}
              </ListItemIcon>
              <ListItemText 
                primary={doc.name}
                secondary={
                  // Use Box as the wrapper to avoid <div> inside <p>
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                    <Typography variant="caption" component="span">
                      Uploaded: {doc.uploadDate}
                    </Typography>
                    {doc.type !== "General" && (
                      <Chip
                        label={doc.type}
                        size="small"
                        sx={{ ml: 1, height: 18, fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                }
                primaryTypographyProps={{
                  style: { fontWeight: 500, fontSize: '0.9rem' }
                }}
              />
              <Stack direction="row" spacing={1}>
                <Tooltip title="Preview Document">
                  <IconButton 
                    size="small" 
                    onClick={() => handlePreviewDocument(doc)}
                    sx={{ color: '#1976d2' }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download Document">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDownloadDocument(doc)}
                    sx={{ color: '#333' }}
                  >
                    <Download fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </DocumentItem>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          bgcolor: "#f8f8f8", 
          borderRadius: 2, 
          p: 3,
          textAlign: "center" 
        }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            No documents {documentTab > 0 ? "in this category" : "uploaded yet"}
          </Typography>
        </Box>
      )}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {documents.length > 0 ? "Upload Additional Documents" : "Upload Required Documents"}
        </Typography>
        <UploadButton
          variant="contained"
          component="label"
          startIcon={uploadingFiles ? <CircularProgress size={16} color="inherit" /> : <UploadFile />}
          size="medium"
          disabled={uploadingFiles}
        >
          {uploadingFiles ? "Uploading..." : "Upload Files"}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            aria-label="Upload application documents"
          />
        </UploadButton>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Accepted formats: PDF, Word, JPEG, PNG
        </Typography>
      </Box>
    </Stack>
  );
};

export default DocumentHandler;