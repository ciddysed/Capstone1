import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';
import { 
  Box, Typography, Badge, Menu, IconButton, 
  List, ListItem, ListItemText, Divider, CircularProgress, 
  Avatar, alpha, Tooltip, Button
} from '@mui/material';
import { Notifications as NotificationsIcon, Circle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import * as localNotificationService from '../../services/localNotificationService';
import notificationService from '../../services/notificationService';


// Custom maroon and gold color palette
const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

// gold color removed (unused)

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

  // Modal state for Yes/No prompt
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch notifications from backend or localStorage (fallback)
  const fetchNotifications = useCallback(() => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    // Try backend first, fallback to localStorage on error
    notificationService.getNotifications(userType, userId)
      .then(data => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Notification API unavailable, falling back to localStorage', err);
        const userNotifications = localNotificationService.getNotifications(userType, userId);
        setNotifications(userNotifications || []);
        setLoading(false);
      });
  }, [userId, userType]);
  
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications (every minute in development)
    const intervalId = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    // Listen for notification updates dispatched elsewhere (optimistic create reconciliation)
    const handler = (e) => {
      const detail = e?.detail || {};
      // If detail contains userType/userId, only refresh for that user
      if (detail.userType && detail.userId) {
        if (String(detail.userType) !== String(userType) || String(detail.userId) !== String(userId)) {
          return;
        }
      }
      fetchNotifications();
    };

    const eventTarget = window;

    if (eventTarget && typeof eventTarget.addEventListener === 'function') {
      eventTarget.addEventListener('notifications:updated', handler);
    }

    return () => {
      clearInterval(intervalId);
      if (eventTarget && typeof eventTarget.removeEventListener === 'function') {
        eventTarget.removeEventListener('notifications:updated', handler);
      }
    };
  }, [fetchNotifications, userType, userId]);


  // Menu handlers
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = (notificationId) => {
    // Try backend first
    notificationService.markAsRead(notificationId)
      .then(ok => {
        if (!ok) throw new Error('API markAsRead failed');
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ));
      })
      .catch(() => {
        // Fallback to localStorage
        localNotificationService.markAsRead(notificationId);
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ));
      });
  };
  
  const handleMarkAllAsRead = () => {
    // Try backend first
    notificationService.markAllAsRead(userType, userId)
      .then(ok => {
        if (!ok) throw new Error('API markAllAsRead failed');
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      })
      .catch(() => {
        // Fallback to localStorage
        localNotificationService.markAllAsRead(userType, userId);
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      });
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
    <>
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
          slotProps={{
            paper: {
              sx: {
                width: 360,
                maxHeight: 400,
                overflow: 'auto',
                mt: 1.5,
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                borderRadius: 2,
              }
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
          {(() => {
            if (loading) {
              return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} sx={{ color: maroon.main }} />
                </Box>
              );
            }
            if (error) {
              return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                </Box>
              );
            }
            if (notifications.length > 0) {
              return (
                <List disablePadding>
                  {notifications.map(notification => {
                    let actionObj;
                    try {
                      actionObj = typeof notification.action === 'string'
                        ? JSON.parse(notification.action)
                        : notification.action;
                    } catch {
                      actionObj = null;
                    }
                    return (
                      <NotificationItem 
                        key={notification.id} 
                        onClick={() => {
                          setPendingNotification({ notification, action: actionObj });
                          setModalOpen(true);
                        }}
                        read={notification.read}
                        sx={{ cursor: 'pointer' }}
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
                            <>
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
                            </>
                          }
                        />
                      </NotificationItem>
                    );
                  })}
                </List>
              );
            }
            return (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            );
          })()}
        </Menu>
      </Box>
      {/* Modal for notification details */}
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setPendingNotification(null); }}>
        <DialogTitle>{pendingNotification?.notification?.title || 'Notification Details'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {pendingNotification?.notification?.message}
          </Typography>
          {pendingNotification?.action?.label && pendingNotification?.action?.target && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleMarkAsRead(pendingNotification.notification.id);
                setModalOpen(false);
                setPendingNotification(null);
                navigate(pendingNotification.action.target);
              }}
              sx={{ mt: 1 }}
            >
              {pendingNotification.action.label}
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setModalOpen(false); setPendingNotification(null); }} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
NotificationCenter.propTypes = {
  userType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default NotificationCenter;
                     