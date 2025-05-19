import React, { useCallback } from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Box,
  Stack,
  Tooltip,
  IconButton,
  CircularProgress,
  Divider,
  alpha,
  Grid,
  Card
} from "@mui/material";
import {
  Description,
  Visibility,
  Download,
  UploadFile,
  Article
} from "@mui/icons-material";
import {
  UploadButton,
  DocumentTypeBadge
} from "./styled";

// The improved document handler component with enhanced styling
const DocumentHandler = ({
  isLoading,
  documents,
  documentsByType,
  apiBaseUrl,
  uploadingFiles,
  handleFileUpload,
  maroon,
  gold
}) => {
  // Handle previewing document in a new tab
  const handlePreviewDocument = useCallback((doc) => {
    // Create a preview URL
    const previewUrl = `${apiBaseUrl}/documents/preview/${doc.id}`;
    
    // Open in a new tab
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }, [apiBaseUrl]);

  // Download document using direct URL approach
  const handleDownloadDocument = useCallback((doc) => {
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
  }, [apiBaseUrl]);

  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha('#000', 0.06)}` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: alpha(maroon.main, 0.1), 
            borderRadius: '50%', 
            p: 0.8,
            display: 'inline-flex' 
          }}>
            <Article sx={{ color: maroon.main, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
              Application Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access and manage all documents related to your application
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: maroon.main }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading documents...
            </Typography>
          </Box>
        ) : documents.length > 0 ? (
          <Stack spacing={1}>
            {documents.map((doc, index) => (
              <Card
                key={doc.id || index}
                sx={{ 
                  p: 0, 
                  boxShadow: 'none', 
                  border: `1px solid ${alpha('#000', 0.08)}`,
                  borderRadius: 1, 
                  overflow: 'hidden',
                  transition: 'background-color 0.2s',
                  '&:hover': { 
                    backgroundColor: alpha('#f5f5f5', 0.5) 
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {/* Document icon and left border */}
                  <Box sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${doc.type === 'Required' ? maroon.main : gold.light}`,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 58
                  }}>
                    {doc.icon}
                  </Box>
                  
                  {/* Document info */}
                  <Box sx={{ 
                    py: 2,
                    pl: 0,
                    pr: 2,
                    flexGrow: 1,
                    overflow: 'hidden',
                    maxWidth: 'calc(100% - 130px)'
                  }}>
                    <Typography 
                      variant="body1" 
                      fontWeight={500} 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {doc.name}
                    </Typography>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      mt: 0.5, 
                      gap: 1
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded: {doc.uploadDate}
                      </Typography>
                      {doc.type !== "General" && (
                        <DocumentTypeBadge
                          label={doc.type}
                          size="small"
                          type={doc.type}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {/* Actions */}
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    p: 2,
                    ml: 'auto',
                    minWidth: 100
                  }}>
                    <Tooltip title="Preview Document">
                      <IconButton 
                        size="small" 
                        onClick={() => handlePreviewDocument(doc)}
                        sx={{ 
                          color: '#1976d2',
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Document">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadDocument(doc)}
                        sx={{ 
                          color: '#333',
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ 
            p: 4,
            textAlign: "center",
            border: `1px dashed ${alpha(gold.main, 0.5)}`,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            backgroundColor: alpha('#f8f8f8', 0.5)
          }}>
            <Box sx={{ 
              bgcolor: alpha(gold.light, 0.3), 
              borderRadius: '50%', 
              p: 1.5,
              display: 'inline-flex',
              mb: 1
            }}>
              <Description sx={{ color: gold.dark, fontSize: 30 }} />
            </Box>
            <Typography variant="subtitle1" color={maroon.main} fontWeight="500" gutterBottom>
              No documents uploaded yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload your documents below to complete your application.
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />
      
      <Box sx={{ p: 2.5, borderTop: `1px solid ${alpha('#000', 0.06)}` }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom color={maroon.main}>
          {documents.length > 0 ? "Upload Additional Documents" : "Upload Required Documents"}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload official transcripts and other required documentation for your application.
        </Typography>
        <UploadButton
          variant="contained"
          component="label"
          startIcon={uploadingFiles ? <CircularProgress size={18} color="inherit" /> : <UploadFile />}
          size="medium"
          disabled={uploadingFiles}
          sx={{ 
            fontWeight: 600,
            boxShadow: 'none',
          }}
          disableElevation
        >
          {uploadingFiles ? "Uploading Files..." : "Upload Documents"}
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            aria-label="Upload application documents"
          />
        </UploadButton>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Accepted formats: PDF, Word documents, JPEG, PNG images
        </Typography>
      </Box>
    </Box>
  );
};

DocumentHandler.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  documents: PropTypes.array.isRequired,
  documentsByType: PropTypes.object.isRequired,
  apiBaseUrl: PropTypes.string.isRequired,
  uploadingFiles: PropTypes.bool.isRequired,
  handleFileUpload: PropTypes.func.isRequired,
  maroon: PropTypes.object.isRequired,
  gold: PropTypes.object.isRequired
};

export default DocumentHandler;