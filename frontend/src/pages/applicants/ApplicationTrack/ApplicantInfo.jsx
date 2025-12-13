import React from "react";
import { Typography, Box, alpha, Grid, Avatar, Stack, Divider } from "@mui/material";
import { AccountCircle, Email } from "@mui/icons-material";
import PropTypes from "prop-types";

const ApplicantInfo = ({ userData, maroon, gold }) => {
  return (
    <Box>
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha('#000', 0.06)}` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: alpha(maroon.main, 0.1), 
            borderRadius: '50%', 
            p: 0.8,
            display: 'inline-flex' 
          }}>
            <AccountCircle sx={{ color: maroon.main, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" color={maroon.main}>
              Applicant Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Personal details associated with your application
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  width: 90, 
                  height: 90, 
                  bgcolor: maroon.main,
                  color: maroon.contrastText,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mb: 1,
                  boxShadow: `0 4px 10px ${alpha(maroon.main, 0.3)}`
                }}
              >
                {userData.initials}
              </Avatar>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Applicant
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={8} md={9}>
            <Stack spacing={2.5}>
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <AccountCircle sx={{ color: maroon.main, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="h6" fontWeight="500">
                      {userData.name || "Not specified"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Divider sx={{ borderStyle: 'dashed' }} />
              
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Email sx={{ color: maroon.main, mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {userData.email || "Not specified"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      All communication regarding your application will be sent to this email
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

ApplicantInfo.propTypes = {
  userData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    initials: PropTypes.string,
  }),
  maroon: PropTypes.object.isRequired,
  gold: PropTypes.object.isRequired,
};

ApplicantInfo.defaultProps = {
  userData: {
    name: "",
    email: "",
    initials: "",
  },
};

export default ApplicantInfo;