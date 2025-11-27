import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  alpha,
  Stack,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import axios from "axios";

// Import the core curriculum management functionality
import CurriculumRouterContent from "./CurriculumRouterContent";

const API_BASE = "https://eteeap-foth.onrender.com/api";

// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

export default function CurriculumRouterModal({ open, onClose, curriculumId }) {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch curriculum details when the modal opens
  useEffect(() => {
    if (open && curriculumId) {
      setLoading(true);
      axios.get(`${API_BASE}/curriculums/${curriculumId}`)
        .then(res => {
          setCurriculum(res.data);
        })
        .catch(err => {
          console.error("Error fetching curriculum details:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, curriculumId]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xl"
      PaperProps={{
        sx: { 
          borderRadius: 2,
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: maroon.main, 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between' 
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SchoolIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6">
            {curriculum ? `Manage ${curriculum.programName} Curriculum` : 'Loading Curriculum...'}
          </Typography>
        </Stack>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, bgcolor: alpha('#f5f5f5', 0.5) }}>
        {/* Embed the curriculum router content */}
        <CurriculumRouterContent 
          curriculumId={curriculumId}
          curriculum={curriculum}
          loading={loading}
          inModal={true} 
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: alpha(gold.light, 0.3) }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: maroon.main, color: maroon.main }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
