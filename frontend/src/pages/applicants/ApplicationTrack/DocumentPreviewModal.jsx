import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { DownloadOutlined, ArrowBack } from '@mui/icons-material';

// Document preview page component
const DocumentPreviewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  
  // Extract document information from state if available
  const docInfo = location.state?.docInfo || { name: 'Document' };
  
  // API base URL should match your main app
  const API_BASE_URL = "http://localhost:8080/api";
  
  // Handle download
  const handleDownload = () => {
    const downloadUrl = `${API_BASE_URL}/documents/download/${id}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', docInfo.name);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };
  
  // Determine content type and display appropriate preview
  const renderPreview = () => {
    const previewUrl = `${API_BASE_URL}/documents/preview/${id}`;
    
    // Check file type from name if available
    const fileName = docInfo.name?.toLowerCase() || '';
    
    if (fileName.endsWith('.pdf')) {
      // For PDFs, use object tag for better browser support
      return (
        <object
          data={previewUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          style={{ minHeight: '75vh' }}
        >
          <Typography variant="body1" align="center" sx={{ py: 4 }}>
            Your browser cannot display this PDF. Please download to view.
          </Typography>
        </object>
      );
    } else if (
      fileName.endsWith('.jpg') || 
      fileName.endsWith('.jpeg') || 
      fileName.endsWith('.png') || 
      fileName.endsWith('.gif')
    ) {
      // For images, use img tag
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <img 
            src={previewUrl} 
            alt={docInfo.name} 
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
          />
        </Box>
      );
    } else {
      // For other file types (like docx, etc), show download prompt
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            This file type cannot be previewed directly
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please download the file to view its contents
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={handleDownload}
            sx={{ mt: 2 }}
          >
            Download Document
          </Button>
        </Box>
      );
    }
  };
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      p: { xs: 1, sm: 3 }
    }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {docInfo.name || 'Document Preview'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {docInfo.uploadDate && `Uploaded: ${docInfo.uploadDate}`}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => window.close()}
              sx={{ mr: 1 }}
            >
              Close Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
        {!id ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">Document ID is missing</Typography>
          </Box>
        ) : renderPreview()}
      </Paper>
    </Box>
  );
};

export default DocumentPreviewPage;