import React from 'react';
import { Box, Typography, Button, alpha, Stack } from '@mui/material';
import { UploadFile } from "@mui/icons-material";
import { SectionTitle, DocumentItem, UploadButton, maroon } from '../styles';

const DocumentUpload = ({ documentTypes, files, handleFileUpload, getDocumentTypeLabel }) => {
  return (
    <Box>
      <SectionTitle variant="subtitle1" sx={{ mb: 2 }}>Required Documents</SectionTitle>
      <Box sx={{ 
        border: `1px solid ${alpha(maroon.main, 0.1)}`,
        borderRadius: 2, 
        p: 2,
        backgroundColor: alpha('#FFFFFF', 0.7),
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
      }}>
        <Stack spacing={1.5}>
          {documentTypes.map((docType) => {
            const uploadedDoc = files.find(file => file.documentType === docType.value);
            
            return (
              <DocumentItem key={docType.value}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={uploadedDoc ? 600 : 400} sx={{ 
                    color: uploadedDoc ? maroon.main : 'text.primary',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {docType.label}
                    {uploadedDoc && 
                      <Box component="span" sx={{ 
                        ml: 1, 
                        color: "success.main",
                        bgcolor: alpha('#4caf50', 0.1),
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}>
                        ✓
                      </Box>
                    }
                  </Typography>
                </Box>
                
                {uploadedDoc ? (
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: alpha(maroon.light, 0.05), 
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      border: `1px solid ${alpha(maroon.main, 0.15)}`,
                    }}
                  >
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
                      href={uploadedDoc.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: maroon.main, 
                        textDecoration: 'none',
                        fontWeight: 500,
                        flexGrow: 1,
                        fontSize: '0.85rem'
                      }}
                    >
                      {uploadedDoc.name}
                    </a>
                    <Button
                      size="small"
                      variant="text"
                      color="primary"
                      component="label"
                      sx={{ minWidth: "auto", fontWeight: 600 }}
                    >
                      Change
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileUpload(e, uploadedDoc)}
                      />
                    </Button>
                  </Box>
                ) : (
                  <UploadButton
                    variant="contained"
                    component="label"
                    startIcon={<UploadFile />}
                    size="small"
                  >
                    Upload {docType.label}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(e, docType.value)}
                    />
                  </UploadButton>
                )}
              </DocumentItem>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};

export default DocumentUpload;
