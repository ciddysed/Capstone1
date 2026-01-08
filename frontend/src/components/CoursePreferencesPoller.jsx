import { useEffect } from 'react';

/**
 * Polls course preferences every 10 seconds and calls fetchCoursePreferences(applicantId).
 * Usage: <CoursePreferencesPoller applicantId={applicantId} fetchCoursePreferences={fetchCoursePreferences} />
 */
const CoursePreferencesPoller = ({ applicantId, fetchCoursePreferences }) => {
  useEffect(() => {
    if (!applicantId || typeof fetchCoursePreferences !== 'function') return;
    let isMounted = true;
    const pollPreferences = async () => {
      try {
        console.log('[CoursePreferencesPoller] Polling for course preferences update...');
        await fetchCoursePreferences(applicantId);
      } catch (err) {
        // Prevent uncaught errors from crashing the app
        console.error('Polling error (course preferences):', err);
      }
    };
    const intervalId = setInterval(() => {
      if (isMounted) pollPreferences();
    }, 10000); // Poll every 10 seconds
    // Initial fetch
    pollPreferences();
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [applicantId, fetchCoursePreferences]);
  return null; // This component does not render anything
};

export default CoursePreferencesPoller;
