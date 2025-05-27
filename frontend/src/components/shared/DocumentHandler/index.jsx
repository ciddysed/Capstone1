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
  Button,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import {
  UploadFile,
  Visibility,
  Download
} from "@mui/icons-material";

const DocumentHandler = ({
  documents = [],
  uploadingFiles = false,
  handleFileUpload,
  handleFileChange,
  missingDocuments = [],
  handleMissingFileUpload,
  requiredDocuments = [],
  maroon,
  gold,
  showPreviewDownload = false,
  apiBaseUrl = "",
  SectionTitle,
  UploadButton,
  showSimpleList = false // New prop to control display mode
}) => {
  // Truncate long filenames for better display
  const truncateFilename = useCallback((filename, maxLength = 25) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    
    return `${truncatedName}.${extension}`;
  }, []);

  // Handle document preview
  const handlePreviewDocument = useCallback((doc) => {
    const previewUrl = `${apiBaseUrl}/documents/preview/${doc.id}`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  }, [apiBaseUrl]);

  // Handle document download
  const handleDownloadDocument = useCallback((doc) => {
    try {
      const downloadUrl = `${apiBaseUrl}/documents/download/${doc.id}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', doc.name);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download ${doc.name}. Please try again later.`);
    }
  }, [apiBaseUrl]);

  return (
    <Box>
      <SectionTitle variant="subtitle1" sx={{ mb: 2 }}>
        Application Documents
      </SectionTitle>
      
      {/* Documents List */}
      {documents.length > 0 ? (
        <List dense sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
          maxHeight: 200,
          overflow: "auto",
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
          mb: 3
        }}>
          {documents.map((doc, index) => (
            <React.Fragment key={doc.id || index}>
              {index > 0 && <Divider component="li" sx={{ borderColor: alpha(maroon.main, 0.1) }} />}
              <ListItem sx={{ 
                py: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: alpha(gold.light, 0.3)
                }
              }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                        <Box 
                          sx={{ 
                            width: 18, 
                            height: 18, 
                            borderRadius: '50%', 
                            bgcolor: 'success.main',
                            mr: 1,
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} 
                        >
                          <Typography sx={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            ✓
                          </Typography>
                        </Box>
                        <Tooltip title={doc.name} placement="top">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: maroon.main, 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.875rem',
                              fontFamily: "'Roboto', 'Arial', sans-serif"
                            }}
                          >
                            {truncateFilename(doc.name)}
                          </Typography>
                        </Tooltip>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
                        {showPreviewDownload && (
                          <>
                            <Tooltip title="Preview Document">
                              <IconButton 
                                size="small" 
                                onClick={() => handlePreviewDocument(doc)}
                                sx={{ color: '#1976d2', p: 0.5 }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Document">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownloadDocument(doc)}
                                sx={{ color: '#333', p: 0.5 }}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Replace Document">
                          <IconButton 
                            size="small" 
                            component="label"
                            sx={{ color: maroon.main, p: 0.5 }}
                          >
                            <UploadFile fontSize="small" />
                            <input
                              type="file"
                              hidden
                              onChange={(e) => handleFileChange && handleFileChange(e, doc)}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  }
                  secondary={!showSimpleList && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary', 
                        fontSize: '0.75rem',
                        fontFamily: "'Roboto', 'Arial', sans-serif"
                      }}
                    >
                      Uploaded: {doc.uploadDate} • Type: {doc.type}
                    </Typography>
                  )}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          p: 3, 
          borderRadius: 2,
          border: `1px dashed ${alpha(maroon.main, 0.3)}`,
          textAlign: "center",
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.03)',
          mb: 3
        }}>
          <UploadFile sx={{ fontSize: 40, color: alpha(maroon.main, 0.3), mb: 1 }} />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}
          >
            No files uploaded yet
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}
          >
            Please upload the required documents
          </Typography>
        </Box>
      )}

      {!showSimpleList && (
        <>
          <SectionTitle variant="subtitle2" sx={{ mb: 1.5 }}>
            {documents.length > 0 ? "Upload Additional Documents" : "Upload Required Documents"}
          </SectionTitle>

          {/* Missing Required Documents Section */}
          {missingDocuments.length > 0 && (
            <Box sx={{ 
              mb: 3,
              bgcolor: alpha('#fff3e0', 0.5),
              border: `2px solid ${alpha('#f44336', 0.3)}`,
              borderRadius: 2,
              p: 2
            }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 2, 
                  color: '#f44336', 
                  fontWeight: 600,
                  fontFamily: "'Roboto', 'Arial', sans-serif"
                }}
              >
                Missing Required Documents ({missingDocuments.length})
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  fontFamily: "'Roboto', 'Arial', sans-serif"
                }}
              >
                Please upload the following required documents:
              </Typography>
              <Stack spacing={1}>
                {missingDocuments.map((docType) => (
                  <Box
                    key={docType.value}
                    sx={{
                      p: 2,
                      border: `1px dashed ${alpha('#f44336', 0.3)}`,
                      borderRadius: 1,
                      backgroundColor: alpha('#fff', 0.8),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500, 
                          color: '#f44336',
                          fontFamily: "'Roboto', 'Arial', sans-serif"
                        }}
                      >
                        {docType.label}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontFamily: "'Roboto', 'Arial', sans-serif" }}
                      >
                        Required for application completion
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      component="label"
                      size="small"
                      disabled={uploadingFiles}
                      sx={{
                        backgroundColor: maroon.main,
                        '&:hover': { backgroundColor: maroon.dark },
                        minWidth: 80,
                        fontFamily: "'Roboto', 'Arial', sans-serif"
                      }}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleMissingFileUpload && handleMissingFileUpload(e, docType.value)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* General Upload Button */}
          <UploadButton
            variant="contained"
            component="label"
            startIcon={uploadingFiles ? <CircularProgress size={18} color="inherit" /> : <UploadFile />}
            size="small"
            disabled={uploadingFiles}
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
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: "block", 
              mt: 1,
              fontFamily: "'Roboto', 'Arial', sans-serif"
            }}
          >
            Accepted formats: PDF, Word documents, JPEG, PNG images
          </Typography>
        </>
      )}
    </Box>
  );
};

DocumentHandler.propTypes = {
  documents: PropTypes.array,
  uploadingFiles: PropTypes.bool,
  handleFileUpload: PropTypes.func,
  handleFileChange: PropTypes.func,
  missingDocuments: PropTypes.array,
  handleMissingFileUpload: PropTypes.func,
  requiredDocuments: PropTypes.array,
  maroon: PropTypes.object.isRequired,
  gold: PropTypes.object.isRequired,
  showPreviewDownload: PropTypes.bool,
  apiBaseUrl: PropTypes.string,
  SectionTitle: PropTypes.elementType.isRequired,
  UploadButton: PropTypes.elementType.isRequired,
  showSimpleList: PropTypes.bool
};

export default DocumentHandler;
