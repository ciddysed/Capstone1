import React, { useState, useEffect } from "react";
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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton as MuiIconButton
} from "@mui/material";
import {
  Description,
  Visibility,
  Download,
  UploadFile,
  Close,
  Error
} from "@mui/icons-material";
import {
  DocumentBadge,
  DocumentItem,
  UploadButton
} from "./styled";

// The fixed document handler component that handles both document listing and preview
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
  
  // State for preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewingDocument, setPreviewingDocument] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Get current documents based on tab
  const getCurrentDocuments = () => {
    switch(documentTab) {
      case 0: return documentsByType.all;
      case 1: return documentsByType.required;
      case 2: return documentsByType.other;
      default: return documentsByType.all;
    }
  };

  // Handle preview document with blob URL approach
  const handlePreviewDocument = async (doc) => {
    setPreviewingDocument(doc);
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(false);
  };

  // Handle document tab change
  const handleDocumentTabChange = (event, newValue) => {
    setDocumentTab(newValue);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewingDocument(null);
  };

  // Download document using File Saver approach
  const handleDownloadDocument = async (doc) => {
    try {
      // Show the document is being downloaded
      console.log(`Downloading ${doc.name}...`);
      
      // Create a direct download link with proper content disposition
      const downloadUrl = `${apiBaseUrl}${doc.downloadUrl}`;
      
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

  // Handle preview loaded
  const handlePreviewLoaded = () => {
    setPreviewLoading(false);
  };

  // Handle preview error
  const handlePreviewError = () => {
    setPreviewLoading(false);
    setPreviewError(true);
  };

  // Document Preview Modal Component (embedded)
  const DocumentPreviewModal = () => {
    const doc = previewingDocument;
    
    // Determine content type - using safer approach with blob URLs
    const renderPreviewContent = () => {
      if (!doc) return null;
      
      if (previewLoading) {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading preview...</Typography>
          </Box>
        );
      }
      
      if (previewError) {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <Error sx={{ fontSize: 48, color: "#C62828" }} />
            <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
              Unable to preview this document
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please download the file to view it
            </Typography>
            <Button 
              color="primary"
              variant="contained"
              onClick={() => handleDownloadDocument(doc)}
              sx={{ mt: 2 }}
              startIcon={<Download />}
            >
              Download
            </Button>
          </Box>
        );
      }
      
      if (doc.fileType === 'PDF') {
        // For PDF - use object tag instead of iframe for better reliability
        return (
          <object
            data={`${apiBaseUrl}${doc.previewUrl}`}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ minHeight: '500px' }}
            onLoad={handlePreviewLoaded}
            onError={handlePreviewError}
          >
            <Typography>
              PDF cannot be displayed. Please <Button onClick={() => handleDownloadDocument(doc)}>download</Button> to view.
            </Typography>
          </object>
        );
      } else if (doc.fileType === 'IMAGE') {
        return (
          <img
            src={`${apiBaseUrl}${doc.previewUrl}`}
            alt={doc.name}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            onLoad={handlePreviewLoaded}
            onError={handlePreviewError}
          />
        );
      } else {
        // For doc/docx - trigger error immediately
        setTimeout(handlePreviewError, 0);
        return null;
      }
    };

    return (
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        aria-labelledby="document-preview-dialog"
      >
        <DialogTitle id="document-preview-dialog" sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #eee',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {doc?.icon && doc.icon}
            <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
              {doc?.name}
            </Typography>
          </Box>
          <MuiIconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{ color: 'grey.500' }}
            size="small"
          >
            <Close />
          </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '70vh' }}>
          {renderPreviewContent()}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 2 }}>
          {doc && (
            <Typography variant="caption" color="text.secondary">
              Uploaded: {doc.uploadDate}
            </Typography>
          )}
          <Button 
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={() => doc && handleDownloadDocument(doc)}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    );
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

      {/* Embedded document preview modal */}
      <DocumentPreviewModal />
    </Stack>
  );
};

export default DocumentHandler;