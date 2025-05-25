import { styled, alpha, createTheme } from "@mui/material";
import { Box, Button, Paper } from "@mui/material";

// Custom maroon and gold color palette
export const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

export const gold = {
  light: '#FFF0B9',
  main: '#FFC72C',
  dark: '#D4A500',
  contrastText: '#000000',
};

// Create a custom theme with maroon and gold
export const customTheme = createTheme({
  palette: {
    primary: maroon,
    secondary: gold,
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Styled components
export const AnimatedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  width: "100%",
  maxWidth: 800,
  boxShadow: '0 8px 40px -12px rgba(106, 0, 0, 0.2)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 45px -10px rgba(106, 0, 0, 0.25)',
  },
}));

export const CourseButton = styled(Button)(({ theme }) => ({
  backgroundColor: maroon.main,
  color: "white",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  padding: '8px 16px',
  transition: 'transform 0.2s, box-shadow 0.2s',
  "&:hover": {
    backgroundColor: maroon.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: maroon.main,
  color: "white",
  borderRadius: 24,
  padding: "10px 48px",
  fontSize: 16,
  fontWeight: 600,
  textTransform: "none",
  boxShadow: '0 4px 10px rgba(106, 0, 0, 0.2)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  "&:hover": {
    backgroundColor: maroon.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(106, 0, 0, 0.3)',
  },
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#222222",
  color: "white",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "#000000",
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  width: "100%",
  justifyContent: "flex-start",
  padding: "8px 16px",
  marginBottom: "8px",
  transition: 'transform 0.2s, box-shadow 0.2s',
  "&:hover": {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  }
}));

export const TrackButton = styled(Button)(({ theme }) => ({
  backgroundColor: gold.main,
  color: "black",
  borderRadius: 24,
  padding: "12px 36px",
  fontSize: 16,
  fontWeight: 700,
  textTransform: "none",
  boxShadow: '0 4px 12px rgba(230, 200, 0, 0.3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  "&:hover": {
    backgroundColor: gold.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 14px rgba(230, 200, 0, 0.4)',
  }
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  color: maroon.dark,
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: '40%',
    height: 3,
    backgroundColor: gold.main,
    borderRadius: 8,
  }
}));

export const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
}));

export const PreferenceBox = styled(Box)(({ theme, selected }) => ({
  display: "flex", 
  alignItems: "center",
  border: `1px solid ${selected ? maroon.main : '#e0e0e0'}`,
  borderRadius: 8,
  padding: theme.spacing(1.5),
  backgroundColor: selected ? alpha(maroon.light, 0.05) : "#f9f9f9",
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: selected ? maroon.main : gold.main,
    backgroundColor: selected ? alpha(maroon.light, 0.08) : alpha(gold.light, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  }
}));

export const DocumentItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha('#000000', 0.08)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 1),
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
  }
}));
