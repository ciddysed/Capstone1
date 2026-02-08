import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

/**
 * Hook for email-style messaging with subject + body format
 * Uses existing backend message API but formats content as JSON
 */
const useEmailMessaging = (currentUserId, currentUserType) => {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all messages (inbox + sent)
  const fetchAllMessages = useCallback(async () => {
    if (!currentUserId || !currentUserType) return;

    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let paramName = '';

      switch (currentUserType) {
        case 'APPLICANT':
          endpoint = '/api/messages/inbox/applicant/chat-list';
          paramName = 'applicantId';
          break;
        case 'EVALUATOR':
          endpoint = '/api/messages/inbox/evaluator/chat-list';
          paramName = 'evaluatorId';
          break;
        case 'PROGRAM_ADMIN':
          endpoint = '/api/messages/inbox/admin/chat-list';
          paramName = 'adminId';
          break;
        default:
          throw new Error('Invalid user type');
      }

      const response = await axios.get(`${BACKEND_URL}${endpoint}?${paramName}=${currentUserId}`);
      
      // The chat-list endpoint returns summary, we need full messages
      // Let's also fetch individual conversations
      const chatList = response.data || [];
      
      // Fetch full message history for all conversations
      const messagePromises = chatList.map(async (chat) => {
        let conversationEndpoint = '';
        
        if (chat.participantRole === 'EVALUATOR' && currentUserType === 'APPLICANT') {
          conversationEndpoint = `/api/messages/conversation/applicant-evaluator?applicantId=${currentUserId}&evaluatorId=${chat.participantId}`;
        } else if (chat.participantRole === 'APPLICANT' && currentUserType === 'EVALUATOR') {
          conversationEndpoint = `/api/messages/conversation/applicant-evaluator?applicantId=${chat.participantId}&evaluatorId=${currentUserId}`;
        } else if (chat.participantRole === 'PROGRAM_ADMIN' && currentUserType === 'APPLICANT') {
          conversationEndpoint = `/api/messages/conversation/applicant-admin?applicantId=${currentUserId}&adminId=${chat.participantId}`;
        } else if (chat.participantRole === 'APPLICANT' && currentUserType === 'PROGRAM_ADMIN') {
          conversationEndpoint = `/api/messages/conversation/applicant-admin?applicantId=${chat.participantId}&adminId=${currentUserId}`;
        } else if (chat.participantRole === 'EVALUATOR' && currentUserType === 'PROGRAM_ADMIN') {
          conversationEndpoint = `/api/messages/conversation/evaluator-admin?evaluatorId=${chat.participantId}&adminId=${currentUserId}`;
        } else if (chat.participantRole === 'PROGRAM_ADMIN' && currentUserType === 'EVALUATOR') {
          conversationEndpoint = `/api/messages/conversation/evaluator-admin?evaluatorId=${currentUserId}&adminId=${chat.participantId}`;
        }

        if (conversationEndpoint) {
          const convResponse = await axios.get(`${BACKEND_URL}${conversationEndpoint}`);
          return convResponse.data || [];
        }
        return [];
      });

      const allConversations = await Promise.all(messagePromises);
      const flatMessages = allConversations.flat();

      // Remove duplicates and sort
      const uniqueMessages = Array.from(
        new Map(flatMessages.map(msg => [msg.messageId, msg])).values()
      ).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      setAllMessages(uniqueMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      setAllMessages([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserType]);

  // Fetch conversation with specific user
  const fetchConversation = useCallback(async (participantId, participantType) => {
    if (!currentUserId || !participantId) return [];

    try {
      let endpoint = '';

      if (currentUserType === 'APPLICANT' && participantType === 'EVALUATOR') {
        endpoint = `/api/messages/conversation/applicant-evaluator?applicantId=${currentUserId}&evaluatorId=${participantId}`;
      } else if (currentUserType === 'EVALUATOR' && participantType === 'APPLICANT') {
        endpoint = `/api/messages/conversation/applicant-evaluator?applicantId=${participantId}&evaluatorId=${currentUserId}`;
      } else if (currentUserType === 'APPLICANT' && participantType === 'PROGRAM_ADMIN') {
        endpoint = `/api/messages/conversation/applicant-admin?applicantId=${currentUserId}&adminId=${participantId}`;
      } else if (currentUserType === 'PROGRAM_ADMIN' && participantType === 'APPLICANT') {
        endpoint = `/api/messages/conversation/applicant-admin?applicantId=${participantId}&adminId=${currentUserId}`;
      } else if (currentUserType === 'EVALUATOR' && participantType === 'PROGRAM_ADMIN') {
        endpoint = `/api/messages/conversation/evaluator-admin?evaluatorId=${currentUserId}&adminId=${participantId}`;
      } else if (currentUserType === 'PROGRAM_ADMIN' && participantType === 'EVALUATOR') {
        endpoint = `/api/messages/conversation/evaluator-admin?evaluatorId=${participantId}&adminId=${currentUserId}`;
      }

      const response = await axios.get(`${BACKEND_URL}${endpoint}`);
      return response.data || [];
    } catch (err) {
      console.error('Error fetching conversation:', err);
      return [];
    }
  }, [currentUserId, currentUserType]);

  // Send email-style message
  const sendEmail = useCallback(async (recipientId, recipientType, subject, body) => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and body are required');
      return null;
    }

    setSending(true);
    setError(null);

    try {
      // Format content as JSON with subject and body
      const content = JSON.stringify({ subject, body });

      // Build payload based on sender and recipient types
      const payload = {
        senderType: currentUserType,
        recipientType: recipientType,
        content: content,
      };

      // Add sender reference
      switch (currentUserType) {
        case 'APPLICANT':
          payload.senderApplicant = { applicantId: parseInt(currentUserId) };
          break;
        case 'EVALUATOR':
          payload.senderEvaluator = { evaluatorId: parseInt(currentUserId) };
          break;
        case 'PROGRAM_ADMIN':
          payload.senderAdmin = { adminId: parseInt(currentUserId) };
          break;
      }

      // Add recipient reference
      switch (recipientType) {
        case 'APPLICANT':
          payload.recipientApplicant = { applicantId: parseInt(recipientId) };
          break;
        case 'EVALUATOR':
          payload.recipientEvaluator = { evaluatorId: parseInt(recipientId) };
          break;
        case 'PROGRAM_ADMIN':
          payload.recipientAdmin = { adminId: parseInt(recipientId) };
          break;
      }

      const response = await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      
      // Add to local state
      setAllMessages(prev => {
        const messageMap = new Map(prev.map(msg => [msg.messageId, msg]));
        messageMap.set(response.data.messageId, response.data);
        return Array.from(messageMap.values()).sort((a, b) => 
          new Date(b.sentAt) - new Date(a.sentAt)
        );
      });

      return response.data;
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message);
      return null;
    } finally {
      setSending(false);
    }
  }, [currentUserId, currentUserType]);

  // Delete message
  const deleteEmail = useCallback(async (messageId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/messages/${messageId}`);
      
      // Remove from local state
      setAllMessages(prev => prev.filter(msg => msg.messageId !== messageId));
      
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Filter messages
  const getInboxMessages = useCallback(() => {
    return allMessages.filter(msg => msg.recipientType === currentUserType);
  }, [allMessages, currentUserType]);

  const getSentMessages = useCallback(() => {
    return allMessages.filter(msg => msg.senderType === currentUserType);
  }, [allMessages, currentUserType]);

  // Load messages on mount
  useEffect(() => {
    fetchAllMessages();
  }, [fetchAllMessages]);

  return {
    allMessages,
    inboxMessages: getInboxMessages(),
    sentMessages: getSentMessages(),
    loading,
    sending,
    error,
    sendEmail,
    deleteEmail,
    fetchAllMessages,
    fetchConversation,
  };
};

export default useEmailMessaging;
