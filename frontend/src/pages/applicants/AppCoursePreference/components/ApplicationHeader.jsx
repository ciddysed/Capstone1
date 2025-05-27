import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  alpha, 
  Menu, 
  MenuItem, 
  IconButton 
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { maroon } from '../styles';
import logo from "../../../../assets/logo.png";
import useResponseHandler from '../../../../utils/useResponseHandler';

const ApplicationHeader = ({ userData }) => {
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const { handleSuccess } = useResponseHandler();

  const handleProfileMenuClick = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("applicantId");
    localStorage.removeItem("userType");
    handleSuccess("Logged out successfully!");
    navigate("/login");
    handleProfileMenuClose();
  };

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between", 
      width: "100%", 
      maxWidth: 800,
      backgroundColor: alpha(maroon.main, 0.9),
      borderRadius: '0 0 16px 16px', 
      padding: 2,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="white" sx={{ mr: 1 }}>
          {userData.email}
        </Typography>
        <IconButton
          onClick={handleProfileMenuClick}
          sx={{ p: 0 }}
        >
          <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: "50%", 
            bgcolor: "#FFFFFF",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: maroon.main,
            fontWeight: 'bold',
            fontSize: '0.9rem',
            cursor: 'pointer',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(255,255,255,0.3)',
            }
          }}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'A'}
          </Box>
        </IconButton>
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              borderRadius: 2,
              border: `1px solid ${alpha(maroon.main, 0.1)}`,
            }
          }}
        >
          <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${alpha(maroon.main, 0.1)}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: maroon.main }}>
              {userData.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {userData.email}
            </Typography>
          </Box>
          <MenuItem 
            onClick={handleLogout}
            sx={{
              py: 1.5,
              color: maroon.main,
              '&:hover': {
                bgcolor: alpha(maroon.main, 0.08),
              }
            }}
          >
            <Logout sx={{ mr: 2, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ApplicationHeader;
