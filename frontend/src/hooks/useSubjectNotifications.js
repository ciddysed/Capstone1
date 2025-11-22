/**
 * Custom Hook for Subject Status Notifications
 * Provides real-time notification functionality for subject evaluation changes
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  initializeSubjectTracking,
  checkForStatusChanges,
  startStatusPolling,
  stopStatusPolling,
  getNotificationSummary
} from '../services/subjectNotificationService';
import toast from '../utils/toast';

/**
 * Hook to manage subject status notifications
 * 
 * @param {string} applicantId - The applicant's ID
 * @param {Array} subjects - Current list of subjects
 * @param {Function} fetchSubjects - Function to fetch latest subjects
 * @param {Object} options - Configuration options
 * @returns {Object} Notification state and controls
 */
const useSubjectNotifications = (
  applicantId,
  subjects,
  fetchSubjects,
  options = {}
) => {
  const {
    enablePolling = true,
    showToast = true,
    autoInitialize = true
  } = options;

  // Ensure subjects is an array even if caller omitted it
  subjects = subjects || [];

  const [isTracking, setIsTracking] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const pollingIntervalRef = useRef(null);
  const initializedRef = useRef(false);

  /**
   * Initialize tracking when subjects are loaded
   */
  const initializeTracking = useCallback(() => {
    if (!applicantId || subjects.length === 0) return;
    
    const success = initializeSubjectTracking(applicantId, subjects);
    if (success) {
      setIsTracking(true);
      initializedRef.current = true;
      console.log(`📊 Subject tracking initialized for applicant ${applicantId}`);
    }
  }, [applicantId, subjects]);

  /**
   * Handle new notifications
   */
  const handleNewNotifications = useCallback((notifications) => {
    setNotificationCount(prev => prev + notifications.length);
    
    if (showToast) {
      for (const notification of notifications) {
        // Show toast based on notification type
        switch (notification.type) {
          case 'success':
            toast.success(notification.message, { duration: 5000 });
            break;
          case 'error':
            toast.error(notification.message, { duration: 5000 });
            break;
          case 'warning':
            toast.warning(notification.message, { duration: 5000 });
            break;
          default:
            toast.info(notification.message, { duration: 5000 });
        }
      }
    }
    
    // Update summary
    const newSummary = getNotificationSummary(applicantId);
    setSummary(newSummary);
  }, [applicantId, showToast]);

  /**
   * Manually check for status changes
   */
  const checkNow = useCallback(async () => {
    if (!applicantId || !fetchSubjects) return;
    
    try {
      const latestSubjects = await fetchSubjects();
      const notifications = await checkForStatusChanges(applicantId, latestSubjects);
      
      if (notifications.length > 0) {
        handleNewNotifications(notifications);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error checking for notifications:', error);
      return [];
    }
  }, [applicantId, fetchSubjects, handleNewNotifications]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!applicantId || !fetchSubjects || !enablePolling) return;
    
    // Clear existing interval
    if (pollingIntervalRef.current) {
      stopStatusPolling(pollingIntervalRef.current);
    }
    
    // Start new polling
    pollingIntervalRef.current = startStatusPolling(
      applicantId,
      fetchSubjects,
      handleNewNotifications
    );
    
    console.log('🔔 Real-time notification polling started');
  }, [applicantId, fetchSubjects, enablePolling, handleNewNotifications]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      stopStatusPolling(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('🔕 Real-time notification polling stopped');
    }
  }, []);

  /**
   * Refresh notification summary
   */
  const refreshSummary = useCallback(() => {
    if (!applicantId) return;
    const newSummary = getNotificationSummary(applicantId);
    setSummary(newSummary);
  }, [applicantId]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (autoInitialize && !initializedRef.current && subjects.length > 0) {
      initializeTracking();
      refreshSummary();
    }
  }, [autoInitialize, subjects, initializeTracking, refreshSummary]);

  /**
   * Start polling when enabled
   */
  useEffect(() => {
    if (isTracking && enablePolling) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [isTracking, enablePolling, startPolling, stopPolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    isTracking,
    notificationCount,
    summary,
    
    // Actions
    initializeTracking,
    checkNow,
    startPolling,
    stopPolling,
    refreshSummary,
    
    // Utils
    resetCount: () => setNotificationCount(0)
  };
};

export default useSubjectNotifications;
