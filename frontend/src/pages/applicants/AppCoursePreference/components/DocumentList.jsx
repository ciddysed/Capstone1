import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, alpha } from '@mui/material';
import { UploadFile } from "@mui/icons-material";
import { SectionTitle, maroon, gold } from '../styles';

const DocumentList = ({ files, getDocumentTypeLabel }) => {
  return (
    <Box>
      <SectionTitle variant="subtitle2" sx={{ mb: 1.5 }}>
        Files Uploaded ({files.length})
      </SectionTitle>
      {files.length > 0 ? (
        <List dense sx={{ 
          bgcolor: alpha('#FFFFFF', 0.7), 
          borderRadius: 2,
          border: `1px solid ${alpha(maroon.main, 0.1)}`,
          maxHeight: 200,
          overflow: "auto",
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.05)'
        }}>
          {files.map((file, index) => (
            <React.Fragment key={file.id}>
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
                        href={file.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: maroon.main, 
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        {file.name}
                      </a>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {getDocumentTypeLabel(file.documentType)}
                    </Typography>
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
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.03)'
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
    </Box>
  );
};

export default DocumentList;
