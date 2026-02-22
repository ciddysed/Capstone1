import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Paper, 
  Chip, 
  Rating, 
  IconButton,
  Grid,
  Alert,
  LinearProgress,
  alpha
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Grade as GradeIcon,
  Comment as CommentIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function EvaluationForm() {
  const navigate = useNavigate();
  const [evaluatorName, setEvaluatorName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  // Maroon and Gold theme
  const maroonTheme = {
    primary: {
      main: '#800000',
      light: '#A0001A',
      dark: '#600000'
    },
    secondary: {
      main: '#B8860B',
      light: '#FFD700',
      dark: '#8B6F00'
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const calculateProgress = () => {
    let completed = 0;
    if (evaluatorName) completed++;
    if (applicantName) completed++;
    if (score > 0) completed++;
    if (rating > 0) completed++;
    if (comments) completed++;
    return (completed / 5) * 100;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alpha('#B8860B', 0.05)} 0%, ${alpha('#FFD700', 0.03)} 100%)`,
      py: 4 
    }}>
      {/* Header with Back Button */}
      <Paper elevation={2} sx={{ 
        mb: 4, 
        background: `linear-gradient(135deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`,
        color: 'white'
      }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={handleBack}
            sx={{ 
              color: 'white', 
              bgcolor: alpha('#FFFFFF', 0.1),
              '&:hover': { bgcolor: alpha('#FFFFFF', 0.2) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <AssignmentIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Applicant Evaluation Form
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Complete the evaluation assessment below
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Progress Bar */}
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight="medium">Form Progress</Typography>
          <Typography variant="body2">{Math.round(calculateProgress())}% Complete</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: alpha(maroonTheme.secondary.light, 0.2),
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`
            }
          }} 
        />
      </Box>

      {/* Main Form */}
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        <Grid container spacing={3}>
          {/* Left Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ 
              border: `2px solid ${alpha(maroonTheme.secondary.light, 0.3)}`,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
              transition: 'all 0.3s ease'
            }}>
              <CardHeader
                avatar={<PersonIcon sx={{ color: maroonTheme.primary.main }} />}
                title="Personal Information"
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.1)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                  borderBottom: `1px solid ${alpha(maroonTheme.primary.main, 0.1)}`
                }}
              />
              <CardContent>
                <TextField 
                  label="Evaluator Name" 
                  fullWidth 
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  sx={{ mb: 3 }} 
                />
                <TextField 
                  label="Applicant Name" 
                  fullWidth 
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  sx={{ mb: 2 }} 
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="ETEEAP Program" color="primary" size="small" />
                  <Chip label="Evaluation Required" variant="outlined" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Section */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ 
              border: `2px solid ${alpha(maroonTheme.secondary.light, 0.3)}`,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
              transition: 'all 0.3s ease'
            }}>
              <CardHeader
                avatar={<GradeIcon sx={{ color: maroonTheme.primary.main }} />}
                title="Assessment Scores"
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.1)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                  borderBottom: `1px solid ${alpha(maroonTheme.primary.main, 0.1)}`
                }}
              />
              <CardContent>
                <TextField 
                  label="Numeric Score" 
                  type="number" 
                  fullWidth 
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  inputProps={{ min: 0, max: 100 }}
                  sx={{ mb: 3 }} 
                />
                <Box sx={{ mb: 3 }}>
                  <Typography component="legend" sx={{ mb: 1 }}>Overall Rating</Typography>
                  <Rating
                    size="large"
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                  />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color={maroonTheme.primary.main}>
                    {score || '0'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current Score
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Comments Section */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{ 
              border: `2px solid ${alpha(maroonTheme.secondary.light, 0.3)}`,
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
              transition: 'all 0.3s ease'
            }}>
              <CardHeader
                avatar={<CommentIcon sx={{ color: maroonTheme.primary.main }} />}
                title="Detailed Comments & Feedback"
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.1)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                  borderBottom: `1px solid ${alpha(maroonTheme.primary.main, 0.1)}`
                }}
              />
              <CardContent>
                <TextField 
                  label="Evaluation Comments" 
                  multiline 
                  rows={6} 
                  fullWidth 
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide detailed feedback about the applicant's qualifications, skills, and suitability for the ETEEAP program..."
                  sx={{ mb: 2 }}
                />
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please provide comprehensive feedback to help the admissions committee make an informed decision.
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ 
              p: 3, 
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.1)} 0%, ${alpha('#FFFFFF', 0.9)} 100%)`
            }}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<SaveIcon />}
                disabled={calculateProgress() < 100}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'medium',
                  background: `linear-gradient(135deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${maroonTheme.primary.dark} 0%, ${maroonTheme.secondary.dark} 100%)`,
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  },
                  '&:disabled': {
                    background: alpha(maroonTheme.primary.main, 0.3)
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Submit Evaluation
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {calculateProgress() < 100 ? 'Please complete all fields before submitting' : 'Ready to submit evaluation'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
