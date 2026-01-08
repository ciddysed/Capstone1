import { useEffect } from 'react';

/**
 * Polls application status every 30 seconds and calls fetchApplicantData(applicantId).
 * Usage: <ApplicationStatusPoller applicantId={applicantId} fetchApplicantData={fetchApplicantData} />
 */
const ApplicationStatusPoller = ({ applicantId, fetchApplicantData }) => {
  useEffect(() => {
    if (!applicantId || typeof fetchApplicantData !== 'function') return;
    let isMounted = true;
    const pollStatus = async () => {
      try {
        console.log('[ApplicationStatusPoller] Polling for status update...');
        await fetchApplicantData(applicantId);
      } catch (err) {
        // Prevent uncaught errors from crashing the app
        console.error('Polling error:', err);
      }
    };
    const intervalId = setInterval(() => {
      if (isMounted) pollStatus();
    }, 10000); // Poll every 10 seconds
    // Initial fetch
    pollStatus();
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [applicantId, fetchApplicantData]);
  return null; // This component does not render anything
};

export default ApplicationStatusPoller;
