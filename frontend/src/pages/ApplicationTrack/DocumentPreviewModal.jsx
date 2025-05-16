import React from "react";
import { Typography, Box, Tooltip, IconButton, CircularProgress } from "@mui/material";
import { Download, Close, Error } from "@mui/icons-material";
import {
  PreviewModal,
  PreviewContainer,
  PreviewHeader,
  PreviewContent
} from "./styled";

// API base URL from parent component
const API_BASE_URL = "http://localhost:8080/api";

const DocumentPreviewModal = ({
  open,
  document: doc,
  onClose,
  onDownload,
  loading,
  error,
  onLoaded,
  onError
}) => {
  // Render document preview content based on file type
  const renderPreviewContent = () => {
    if (!doc) return null;
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>Loading preview...</Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Error sx={{ fontSize: 48, color: "#C62828" }} />
          <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
            Unable to preview this document
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This file type may not support in-browser preview
          </Typography>
          <IconButton 
            color="primary"
            onClick={() => onDownload(doc)}
            sx={{ mt: 2 }}
            aria-label="Download document"
          >
            <Download fontSize="large" />
          </IconButton>
        </Box>
      );
    }
    
    // Handle different file types
    if (doc.fileType === 'PDF') {
      // Use iframe with blob URL approach for PDFs
      return (
        <iframe
          src={`${API_BASE_URL}${doc.previewUrl}`}
          title={doc.name}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '500px' }}
          onLoad={onLoaded}
          onError={onError}
        />
      );
    } else if (doc.fileType === 'IMAGE') {
      return (
        <img
          src={`${API_BASE_URL}${doc.previewUrl}`}
          alt={doc.name}
          style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          onLoad={onLoaded}
          onError={onError}
        />
      );
    } else {
      // For doc/docx and other files that might not preview well
      setTimeout(onError, 500);
      return null;
    }
  };

  return (
    <PreviewModal
      open={open}
      onClose={onClose}
      aria-labelledby="document-preview-modal"
    >
      <PreviewContainer>
        <PreviewHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {doc?.icon}
            <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
              {doc?.name}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Download">
              <IconButton onClick={() => doc && onDownload(doc)} size="small">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </PreviewHeader>
        <PreviewContent>
          {renderPreviewContent()}
        </PreviewContent>
        {doc && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" color="text.secondary">
              Uploaded: {doc.uploadDate}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Document type: {doc.type}
            </Typography>
          </Box>
        )}
      </PreviewContainer>
    </PreviewModal>
  );
};

export default DocumentPreviewModal;