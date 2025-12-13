import { styled, alpha } from "@mui/material/styles";
import { Box, Card, Button, TextField } from "@mui/material";

// Add Playfair Display font - add this to your index.html or import via @fontsource
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

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

export const LoginContainer = styled(Box)({
  minHeight: '100vh',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  overflow: 'hidden',
  boxSizing: 'border-box',
});

export const LoginCard = styled(Card)({
  width: '100%',
  maxWidth: 500,
  padding: '40px',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  border: '1px solid #e0e0e0',
  backgroundColor: '#ffffff',
});

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f8f8f8',
    fontSize: '1rem',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#8D323C',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6A0000',
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '16px 14px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6A0000',
  },
});

export const LoginButton = styled(Button)({
  padding: '14px 24px',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: '#6A0000',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#450000',
  },
  '&:disabled': {
    backgroundColor: '#cccccc',
    color: '#666666',
  },
});

export const SecondaryButton = styled(Button)({
  padding: '14px 24px',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#6A0000',
  borderColor: '#6A0000',
  borderWidth: '2px',
  '&:hover': {
    borderColor: '#450000',
    backgroundColor: 'rgba(106, 0, 0, 0.08)',
    borderWidth: '2px',
  },
});

export const GoldAccent = styled(Box)({
  width: 80,
  height: 4,
  background: 'linear-gradient(90deg, #FFC72C, #D4A500)',
  borderRadius: 2,
  margin: '0 auto 24px auto',
});

// Global style for Playfair Display font - add to your global CSS or theme
export const playfairFont = {
  fontFamily: "'Playfair Display', serif",
};
