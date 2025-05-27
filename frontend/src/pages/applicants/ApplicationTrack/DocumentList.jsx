import React from "react";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  IconButton,
  List,
  ListItem,
  Chip,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha
} from "@mui/material";
import { Description, Visibility, Download, UploadFile } from "@mui/icons-material";
import {
  DocumentBadge,
  DocumentItem,
  UploadButton
} from "./styled";
import { getDocumentTypeLabel } from "./utils";
import { maroon, gold } from "../AppCoursePreference/styles";

const DocumentList = ({
  isLoading,
  documents,
  documentsByType,
  documentTab,
  handleDocumentTabChange,
  handlePreviewDocument,
  handleDownloadDocument,
  uploadingFiles,
  handleFileUpload
}) => {
  // Get current documents based on tab
  const getCurrentDocuments = () => {
    switch(documentTab) {
      case 0: return documentsByType.all;
      case 1: return documentsByType.required;
      case 2: return documentsByType.other;
      default: return documentsByType.all;
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
        <List dense sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)',
          p: 0.5,
          maxHeight: "300px",
          overflowY: "auto"
        }}>
          {getCurrentDocuments().map((doc, index) => {
            const documentTypeLabel = getDocumentTypeLabel(doc.type);
            
            return (
              <React.Fragment key={doc.id || index}>
                {index > 0 && <Divider component="li" sx={{ borderColor: alpha(maroon.main, 0.1) }} />}
                <ListItem sx={{ 
                  py: 1,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(gold.light, 0.3)
                  }
                }}>
                  <ListItemIcon>
                    {doc.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack spacing={0.2}>
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
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {doc.name}
                          </Typography>
                        </Box>
                        
                        {/* Document type label with emphasis */}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: maroon.main, 
                            fontWeight: 600,
                            ml: 2.2,
                            display: 'block',
                            bgcolor: alpha(maroon.light, 0.08),
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            width: 'fit-content'
                          }}
                        >
                          {documentTypeLabel}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary', 
                          fontSize: '0.75rem', 
                          ml: 2.2,
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        Uploaded: {doc.uploadDate}
                      </Typography>
                    }
                    disableTypography
                  />
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Preview Document">
                      <IconButton 
                        size="small" 
                        onClick={() => handlePreviewDocument(doc)}
                        sx={{ color: maroon.main }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Document">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadDocument(doc)}
                        sx={{ color: maroon.dark }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      ) : (
        <Box sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          p: 3, 
          borderRadius: 2,
          border: `1px dashed ${alpha(maroon.main, 0.3)}`,
          textAlign: "center",
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.03)'
        }}>
          <UploadFile sx={{ fontSize: 40, color: alpha(maroon.main, 0.3), mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No documents {documentTab > 0 ? "in this category" : "uploaded yet"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please upload the required documents
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

export default DocumentList;