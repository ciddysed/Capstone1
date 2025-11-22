import axios from 'axios';
import * as localNotificationService from './localNotificationService';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/notifications`;

const notificationService = {
  // Get all notifications for a user
  getNotifications: async (userType, userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userType}/${userId}`);
      return response.data;
    } catch (error) {
      console.log('API notifications unavailable, falling back to local storage:', error.message || error);
      // Fall back to persisted local notifications (no random mocks)
      try {
        return localNotificationService.getNotifications(userType, userId);
      } catch (e) {
        console.warn('Failed to read local notifications as fallback:', e);
        return [];
      }
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.put(`${API_URL}/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (userType, userId) => {
    try {
      await axios.put(`${API_URL}/${userType}/${userId}/read-all`);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },
  
  // Create a new notification (for admin use)
  createNotification: async (notification) => {
    try {
      const response = await axios.post(API_URL, notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
};

export default notificationService;
