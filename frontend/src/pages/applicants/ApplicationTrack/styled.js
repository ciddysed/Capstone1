import { Paper, Avatar, Chip, Box, Button, Card, styled, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Maroon and gold color palette for styling
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
};

const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
};

export const TrackingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0),
  borderRadius: theme.shape.borderRadius * 2,
  width: "100%",
  maxWidth: 850,
  transition: 'all 0.5s ease',
}));

export const AnimatedSection = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 20px -8px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    boxShadow: '0 6px 24px -6px rgba(106, 0, 0, 0.2)',
  },
  padding: 0,
}));

export const SectionHeading = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.6),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  fontWeight: 600,
  fontSize: '1.1rem',
  color: maroon.main,
  display: 'flex',
  alignItems: 'center',
}));

export const InfoSection = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(gold.light, 0.2),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  borderLeft: `4px solid ${gold.main}`,
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
  },
}));

export const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: maroon.main,
  width: 40,
  height: 40,
  color: "#FFFFFF",
  fontWeight: 600,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

export const CourseBox = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  borderLeft: `4px solid ${maroon.main}`,
  '&:hover': {
    boxShadow: `0 4px 20px ${alpha(maroon.main, 0.15)}`,
  },
  transition: 'all 0.3s ease'
}));

export const DocumentBadge = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: maroon.main,
  color: '#fff',
  borderRadius: '50%',
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
}));

export const DocumentItem = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    backgroundColor: alpha(gold.light, 0.3),
    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
    borderColor: alpha(gold.main, 0.5),
  }
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: maroon.main,
  color: '#fff',
  '&:hover': {
    backgroundColor: maroon.dark,
    boxShadow: '0 4px 12px rgba(106, 0, 0, 0.25)',
  },
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
}));

// Custom status chip that changes color based on status
export const StatusChip = styled(Chip)(({ theme, status }) => {
  const getChipColor = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: gold.light, color: gold.dark, border: gold.main };
      case "APPROVED":
        return { bg: "#e8f5e9", color: "#2e7d32", border: "#4caf50" };
      case "REJECTED":
        return { bg: "#ffebee", color: "#c62828", border: "#ef5350" };
      case "WAITLISTED":
        return { bg: "#e3f2fd", color: "#1565c0", border: "#42a5f5" };
      case "UNDER_REVIEW":
        return { bg: "#ede7f6", color: "#5e35b1", border: "#9575cd" };
      default:
        return { bg: "#f5f5f5", color: "#757575", border: "#9e9e9e" };
    }
  };

  const chipColor = getChipColor(status);

  return {
    fontWeight: 700,
    backgroundColor: chipColor.bg,
    color: chipColor.color,
    border: `2px solid ${chipColor.border}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
    '& .MuiChip-icon': {
      color: chipColor.color,
    },
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(1.5),
    },
    '&:hover': {
      backgroundColor: alpha(chipColor.bg, 0.8),
    },
  };
});

// For preferences
export const PreferenceStatusChip = styled(Chip)(({ theme, priority }) => {
  const getChipColor = (priority) => {
    switch (priority) {
      case "FIRST":
      case 1:
        return { bg: alpha(maroon.main, 0.1), color: maroon.main, border: maroon.main };
      case "SECOND":
      case 2:
        return { bg: alpha(gold.main, 0.1), color: gold.dark, border: gold.main };
      case "THIRD":
      case 3:
        return { bg: alpha('#2196f3', 0.1), color: '#1565c0', border: '#42a5f5' };
      default:
        return { bg: "#f5f5f5", color: "#757575", border: "#9e9e9e" };
    }
  };

  const chipColor = getChipColor(priority);

  return {
    fontWeight: 700,
    backgroundColor: chipColor.bg,
    color: chipColor.color,
    border: `2px solid ${chipColor.border}`,
    borderRadius: theme.shape.borderRadius * 1.5, 
    '& .MuiChip-icon': {
      color: chipColor.color,
    },
  };
});

// Tab styling for document tabs
export const StyledTab = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(1.2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  textAlign: 'center',
  fontWeight: 500,
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
  backgroundColor: active ? alpha(maroon.main, 0.1) : 'transparent',
  color: active ? maroon.main : theme.palette.text.secondary,
  border: active ? `1px solid ${alpha(maroon.main, 0.2)}` : `1px solid transparent`,
  '&:hover': {
    backgroundColor: active ? alpha(maroon.main, 0.15) : alpha(theme.palette.action.hover, 0.1),
  },
  flex: 1,
}));

// Document type badge
export const DocumentTypeBadge = styled(Chip)(({ theme, type }) => {
  const getTypeColor = () => {
    switch (type) {
      case 'Required':
        return { bg: alpha('#f44336', 0.1), color: '#d32f2f', border: '#f44336' };
      case 'Transcript':
        return { bg: alpha('#4caf50', 0.1), color: '#2e7d32', border: '#4caf50' };
      case 'ID':
        return { bg: alpha('#2196f3', 0.1), color: '#1565c0', border: '#2196f3' };
      default:
        return { bg: alpha('#757575', 0.1), color: '#616161', border: '#9e9e9e' };
    }
  };

  const typeColor = getTypeColor();

  return {
    height: 20,
    fontSize: '0.65rem',
    fontWeight: 600,
    backgroundColor: typeColor.bg,
    color: typeColor.color,
    border: `1px solid ${typeColor.border}`,
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});