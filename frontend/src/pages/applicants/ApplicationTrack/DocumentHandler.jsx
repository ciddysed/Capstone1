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
  Card,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper
} from "@mui/material";
import {
  UploadFile,
  Description,
  Visibility,
  Download
} from "@mui/icons-material";

// Import styles from AppCoursePreference for consistency
import { maroon, gold } from "../AppCoursePreference/styles";

const DocumentHandler = ({
  isLoading,
  documents,
  documentsByType,
  apiBaseUrl,
  uploadingFiles,
  handleFileUpload,
  handleFileChange,
  missingDocuments,
  handleMissingFileUpload,
  requiredDocuments,
}) => {
  // Helper function to get document type label
  const getDocumentTypeLabel = (type) => {
    const docType = requiredDocuments.find(doc => doc.value === type);
    return docType ? docType.label : type || "General Document";
  };

  return (
    <Box>
      {/* Documents List */}
      {isLoading ? (
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          py: 4,
          bgcolor: alpha('#FFFFFF', 0.7),
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
        }}>
          <CircularProgress size={28} sx={{ color: maroon.main, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading documents...
          </Typography>
        </Box>
      ) : documents.length > 0 ? (
        <List dense sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
          maxHeight: 300,
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
                            maxWidth: 200
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
                    <Box sx={{ ml: 2.2 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: maroon.main, 
                          fontWeight: 600,
                          display: 'block',
                          bgcolor: alpha(maroon.light, 0.08),
                          px: 1,
                          py: 0.2,
                          borderRadius: 1,
                          width: 'fit-content',
                          mb: 0.5
                        }}
                      >
                        {getDocumentTypeLabel(doc.type)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Uploaded: {doc.uploadDate}
                      </Typography>
                    </Box>
                  }
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
          <Typography variant="body2" color="text.secondary">
            No files uploaded yet
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please upload the required documents
          </Typography>
        </Box>
      )}

      {/* Missing Required Documents Section */}
      {missingDocuments && missingDocuments.length > 0 && (
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
  handleFileChange: PropTypes.func.isRequired,
  missingDocuments: PropTypes.array,
  handleMissingFileUpload: PropTypes.func,
  requiredDocuments: PropTypes.array,
};

export default DocumentHandler;