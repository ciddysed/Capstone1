import { useEffect } from 'react';

/**
 * Polls applicant acceptance status every 10 seconds and calls fetchAcceptanceStatus(applicantId).
 * Usage: <AcceptanceStatusPoller applicantId={applicantId} fetchAcceptanceStatus={fetchAcceptanceStatus} />
 */
const AcceptanceStatusPoller = ({ applicantId, fetchAcceptanceStatus }) => {
  useEffect(() => {
    if (!applicantId || typeof fetchAcceptanceStatus !== 'function') return;
    let isMounted = true;
    const pollStatus = async () => {
      try {
        console.log('[AcceptanceStatusPoller] Polling for acceptance status update...');
        await fetchAcceptanceStatus(applicantId);
      } catch (err) {
        // Prevent uncaught errors from crashing the app
        console.error('Polling error (acceptance status):', err);
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
  }, [applicantId, fetchAcceptanceStatus]);
  return null; // This component does not render anything
};

export default AcceptanceStatusPoller;
