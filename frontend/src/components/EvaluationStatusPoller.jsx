import { useEffect } from 'react';

/**
 * Polls evaluation status every 10 seconds and calls fetchEvaluations(applicantId).
 * Usage: <EvaluationStatusPoller applicantId={applicantId} fetchEvaluations={fetchEvaluations} />
 */
const EvaluationStatusPoller = ({ applicantId, fetchEvaluations }) => {
  useEffect(() => {
    if (!applicantId || typeof fetchEvaluations !== 'function') return;
    let isMounted = true;
    const pollStatus = async () => {
      try {
        console.log('[EvaluationStatusPoller] Polling for evaluation status update...');
        await fetchEvaluations(applicantId);
      } catch (err) {
        // Prevent uncaught errors from crashing the app
        console.error('Polling error (evaluation status):', err);
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
  }, [applicantId, fetchEvaluations]);
  return null; // This component does not render anything
};

export default EvaluationStatusPoller;
