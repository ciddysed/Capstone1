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
  showSimpleList = false,
  apiBaseUrl,
  SectionTitle,
  UploadButton
}) => {

  // Get document type label from value
  const getDocumentTypeLabel = (value) => {
    if (!requiredDocuments.length) return value;
    const docType = requiredDocuments.find(type => type.value === value);
    return docType ? docType.label : value;
  };

  return (
    <Box>
      {/* Header */}
      <SectionTitle variant="subtitle1" sx={{ mb: 2 }}>
        {documents.length > 0 ? `Files Uploaded (${documents.length})` : "Application Documents"}
      </SectionTitle>
      
      {/* Simple List View (for AppCoursePreference) */}
      {showSimpleList && documents.length > 0 ? (
        <List dense sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
        }}>
          {documents.map((doc, index) => (
            <React.Fragment key={doc.id}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: maroon.main,
                          mr: 1 
                        }} 
                      />
                      <a 
                        href={doc.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: maroon.main, 
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        {doc.name}
                      </a>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {getDocumentTypeLabel(doc.documentType)}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : !showSimpleList && documents.length > 0 ? (
        /* Detailed List View (for ApplicationTrack) */
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
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: maroon.main,
                            mr: 1 
                          }} 
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: maroon.main, 
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 180
                          }}
                        >
                          {doc.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Replace Document">
                          <IconButton 
                            size="small" 
                            component="label"
                            sx={{ color: maroon.main }}
                          >
                            <UploadFile fontSize="small" />
                            <input
                              type="file"
                              hidden
                              onChange={(e) => handleFileChange(e, doc)}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Type: {getDocumentTypeLabel(doc.documentType)}
                    </Typography>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : (
        /* Empty State */
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
          <Typography variant="body2" color="text.secondary">
            No files uploaded yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please upload the required documents
          </Typography>
        </Box>
      )}

      {/* Missing Required Documents Section - For ApplicationTrack */}
      {missingDocuments && missingDocuments.length > 0 && !showSimpleList && (
        <Box sx={{ 
          mb: 3,
          bgcolor: alpha('#fff3e0', 0.5),
          border: `2px solid ${alpha('#f44336', 0.3)}`,
          borderRadius: 2,
          p: 2
        }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#f44336', fontWeight: 600 }}>
            Missing Required Documents ({missingDocuments.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#f44336' }}>
                    {docType.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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
                    minWidth: 80
                  }}
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleMissingFileUpload(e, docType.value)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* General Upload Button */}
      {UploadButton && handleFileUpload && (
        <>
          <SectionTitle variant="subtitle2" sx={{ mb: 1.5 }}>
            {documents.length > 0 ? "Upload Additional Documents" : "Upload Documents"}
          </SectionTitle>
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
              multiple={!showSimpleList}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              aria-label="Upload application documents"
            />
          </UploadButton>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
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
  maroon: PropTypes.object,
  gold: PropTypes.object,
  showPreviewDownload: PropTypes.bool,
  showSimpleList: PropTypes.bool,
  apiBaseUrl: PropTypes.string,
  SectionTitle: PropTypes.elementType,
  UploadButton: PropTypes.elementType
};

export default DocumentHandler;
