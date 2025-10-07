import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Badge, Menu, MenuItem, IconButton, 
  List, ListItem, ListItemText, Divider, CircularProgress, 
  Avatar, alpha, Tooltip
} from '@mui/material';
import { Notifications as NotificationsIcon, Circle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import * as localNotificationService from '../../services/localNotificationService';

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

// Styled components
const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: read ? 'inherit' : alpha(maroon.light, 0.08),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const NotificationCenter = ({ userType, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch notifications from localStorage
  const fetchNotifications = () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get notifications from localStorage
      const userNotifications = localNotificationService.getNotifications(userType, userId);
      setNotifications(userNotifications || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications (every minute in development)
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [userId, userType]);

  // Menu handlers
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = (notificationId) => {
    // Mark notification as read in localStorage
    localNotificationService.markAsRead(notificationId);
    
    // Update state
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
  };
  
  const handleMarkAllAsRead = () => {
    // Mark all notifications as read in localStorage
    localNotificationService.markAllAsRead(userType, userId);
    
    // Update state
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 7) {
      return date.toLocaleDateString();
    } else if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get icon color based on notification type
  const getIconColor = (type) => {
    switch (type) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      case 'info': default: return '#2196f3';
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Box>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpenMenu} color="inherit">
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#f44336',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { 
            width: 360, 
            maxHeight: 400, 
            overflow: 'auto',
            mt: 1.5,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: maroon.main }}>
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', fontWeight: 500 }}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} sx={{ color: maroon.main }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : notifications.length > 0 ? (
          <List disablePadding>
            {notifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                onClick={() => handleMarkAsRead(notification.id)}
                read={notification.read}
              >
                <Box sx={{ pr: 2, display: 'flex', alignItems: 'center' }}>
                  {notification.read ? (
                    <Avatar sx={{ 
                      width: 10, 
                      height: 10, 
                      bgcolor: 'transparent',
                      border: `1px solid ${alpha(getIconColor(notification.type), 0.5)}`
                    }} />
                  ) : (
                    <Circle sx={{ 
                      width: 10, 
                      height: 10, 
                      color: getIconColor(notification.type)
                    }} />
                  )}
                </Box>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography 
                        variant="body2" 
                        component="p"
                        sx={{ 
                          color: notification.read ? 'text.secondary' : 'text.primary',
                          mb: 0.5 
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        component="p" 
                        sx={{ color: 'text.disabled' }}
                      >
                        {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </NotificationItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationCenter;
                     