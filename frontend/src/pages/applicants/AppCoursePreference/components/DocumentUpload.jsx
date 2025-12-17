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
          {documentTypes.filter(docType => {
            const docTypeValue = String(docType.value).toLowerCase();
            return !files.some(file => String(file.documentType).toLowerCase() === docTypeValue);
          }).map((docType) => (
            <DocumentItem key={docType.value}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={400} sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                  {docType.label}
                </Typography>
              </Box>
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
            </DocumentItem>
          ))}
          {/* Show uploaded documents as a list below (no upload/replace option) */}
          {files.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Uploaded Documents</Typography>
              <Stack spacing={1}>
                {files.map((uploadedDoc, idx) => (
                  <Box key={uploadedDoc.documentType || idx} sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: alpha(maroon.light, 0.05), borderRadius: 1, border: `1px solid ${alpha(maroon.main, 0.15)}` }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: maroon.main, mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>{getDocumentTypeLabel ? getDocumentTypeLabel(uploadedDoc.documentType) : uploadedDoc.documentType}: {uploadedDoc.name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default DocumentUpload;
