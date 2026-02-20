import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Polls assigned evaluations every 10 seconds and calls fetchEvaluations().
 * Usage: <EvaluatorAssignedEvaluationsPoller evaluatorId={evaluatorId} fetchEvaluations={fetchEvaluations} />
 */
const EvaluatorAssignedEvaluationsPoller = ({ evaluatorId, fetchEvaluations }) => {
  useEffect(() => {
    if (!evaluatorId || typeof fetchEvaluations !== 'function') return;
    let isMounted = true;
    const pollEvaluations = async () => {
      try {
        console.log('[EvaluatorAssignedEvaluationsPoller] Polling for evaluation updates...');
        await fetchEvaluations();
      } catch (err) {
        // Prevent uncaught errors from crashing the app
        console.error('Polling error (evaluator assigned evaluations):', err);
      }
    };
    const intervalId = setInterval(() => {
      if (isMounted) pollEvaluations();
    }, 10000); // Poll every 10 seconds
    // Initial fetch is handled by the parent component
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [evaluatorId, fetchEvaluations]);
  return null; // This component does not render anything
};

EvaluatorAssignedEvaluationsPoller.propTypes = {
  evaluatorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fetchEvaluations: PropTypes.func.isRequired,
};

export default EvaluatorAssignedEvaluationsPoller;
