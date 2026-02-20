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

const maroon = {
  light: '#8D323C',
  main: '#6A0000',
  dark: '#450000',
  contrastText: '#FFFFFF',
};

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

const ProgramAdminNotificationCenter = ({ programAdminId }) => {
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingNotification, setPendingNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
    // Handle notification action
    const handleNotificationAction = async (notification) => {
      if (!notification.action) return;
      setActionLoading(true);
      try {
      const actionObj = notification.action;
      if (actionObj.type === 'navigate' && actionObj.target) {
        navigate(actionObj.target);
      } else if (actionObj.type === 'api' && actionObj.endpoint) {
        await fetch(actionObj.endpoint, { method: actionObj.method || 'POST' });
      }
      handleMarkAsRead(notification.id);
      setModalOpen(false);
      setPendingNotification(null);
      } catch (err) {
        console.error('Error executing notification action:', err);
      }
      setActionLoading(false);
    };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);

  // Fetch notifications from backend or localStorage (fallback)
  const fetchNotifications = useCallback(() => {
    if (!programAdminId) return;
    setLoading(true);
    setError(null);

    // Try backend first, fallback to localStorage on error
    notificationService.getNotifications('program-admin', programAdminId)
      .then(data => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Notification API unavailable, falling back to localStorage', err);
        const userNotifications = localNotificationService.getNotifications('program-admin', programAdminId);
        setNotifications(userNotifications || []);
        setError('Failed to load notifications');
        setLoading(false);
      });
  }, [programAdminId]);

  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications (standardized to 10 seconds)
    const intervalId = setInterval(fetchNotifications, 10000); // Poll every 10 seconds

    // Listen for notification updates dispatched elsewhere (optimistic create reconciliation)
    const handler = (e) => {
      const detail = e?.detail || {};
      console.log('[ProgramAdminNotificationCenter] Event received:', detail);
      console.log('[ProgramAdminNotificationCenter] Current programAdminId:', programAdminId);
      // If detail contains userType/userId, only refresh for that user
      if (detail.userType && detail.userId) {
        console.log('[ProgramAdminNotificationCenter] Checking match:', {
          detailUserType: detail.userType,
          detailUserId: String(detail.userId),
          programAdminUserType: 'program-admin',
          programAdminId: String(programAdminId)
        });
        if (String(detail.userType) !== 'program-admin' || String(detail.userId) !== String(programAdminId)) {
          console.log('[ProgramAdminNotificationCenter] Event not for this admin, ignoring');
          return;
        }
        console.log('[ProgramAdminNotificationCenter] Event matched! Fetching notifications...');
      }
      fetchNotifications();
    };

    const eventTarget = globalThis;

    if (eventTarget?.addEventListener) {
      eventTarget.addEventListener('notifications:updated', handler);
    }

    return () => {
      clearInterval(intervalId);
      if (eventTarget && typeof eventTarget.removeEventListener === 'function') {
        eventTarget.removeEventListener('notifications:updated', handler);
      }
    };
  }, [fetchNotifications, programAdminId]);

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
    notificationService.markAllAsRead('program-admin', programAdminId)
      .then(ok => {
        if (!ok) throw new Error('API markAllAsRead failed');
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      })
      .catch(() => {
        // Fallback to localStorage
        localNotificationService.markAllAsRead('program-admin', programAdminId);
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      });
  };

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

  const getIconColor = (type) => {
    switch (type) {
      case 'SUCCESS': return '#4caf50';
      case 'WARNING': return '#ff9800';
      case 'ERROR': return '#f44336';
      case 'INFO': default: return '#2196f3';
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
                  {notifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      onClick={() => {
                        setPendingNotification(notification);
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
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                              {notification.title}
                            </Typography>
                            {notification.category && (
                              <Typography variant="caption" sx={{ ml: 1, color: 'primary.main', fontWeight: 500 }}>
                                {notification.category}
                              </Typography>
                            )}
                          </Box>
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
                  ))}
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
        <DialogTitle>{pendingNotification?.title || 'Notification Details'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {pendingNotification?.message}
          </Typography>
          {pendingNotification?.category && (
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Category: {pendingNotification.category}
            </Typography>
          )}
          {pendingNotification?.action && (() => {
            let actionObj;
            try {
              actionObj = typeof pendingNotification.action === 'string'
                ? JSON.parse(pendingNotification.action)
                : pendingNotification.action;
            } catch {
              actionObj = null;
            }
            return actionObj ? (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={actionLoading}
                  onClick={() => handleNotificationAction({ ...pendingNotification, action: actionObj })}
                >
                  {actionObj.label || 'Take Action'}
                </Button>
              </Box>
            ) : null;
          })()}
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

ProgramAdminNotificationCenter.propTypes = {
  programAdminId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ProgramAdminNotificationCenter;
