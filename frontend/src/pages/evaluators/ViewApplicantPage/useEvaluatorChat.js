import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { BACKEND_URL } from '../../../config';

const useEvaluatorChat = (evaluatorId, applicantId) => {
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // WebSocket message handler - adds new messages in real-time
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Evaluator: WebSocket message received:', message);
    
    // Check if message is for this conversation (with this applicant)
    const isFromApplicant = 
      message.senderType === 'APPLICANT' && 
      message.senderApplicant?.applicantId === parseInt(applicantId);
    
    const isToApplicant = 
      message.senderType === 'EVALUATOR' && 
      message.recipientApplicant?.applicantId === parseInt(applicantId);
    
    if (isFromApplicant || isToApplicant) {
      setMessages(prev => {
        const messageMap = new Map(prev.map(msg => [msg.messageId, msg]));
        
        if (messageMap.has(message.messageId)) {
          console.log('Evaluator: Message already exists, skipping duplicate:', message.messageId);
          return prev;
        }
        
        messageMap.set(message.messageId, message);
        return Array.from(messageMap.values()).sort((a, b) => 
          new Date(a.sentAt) - new Date(b.sentAt)
        );
      });
    }
  }, [applicantId]);

  // WebSocket status update handler
  const handleStatusUpdate = useCallback((statusUpdate) => {
    console.log('Evaluator: Status update received:', statusUpdate);
    setMessages(prev => prev.map(msg => 
      msg.messageId === statusUpdate.messageId 
        ? { ...msg, status: statusUpdate.status, deliveredAt: statusUpdate.deliveredAt, seenAt: statusUpdate.seenAt }
        : msg
    ));
  }, []);

  // Initialize WebSocket connection
  useWebSocket(evaluatorId, 'EVALUATOR', handleWebSocketMessage, handleStatusUpdate);

  // Fetch conversation between evaluator and applicant
  const fetchConversation = useCallback(async () => {
    if (!evaluatorId || !applicantId) return;
    
    setChatLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/messages/conversation/applicant-evaluator?applicantId=${applicantId}&evaluatorId=${evaluatorId}`
      );
      
      // Merge with existing messages to avoid losing real-time updates
      const fetchedMessages = response.data || [];
      setMessages(prev => {
        const existingMap = new Map(prev.map(msg => [msg.messageId, msg]));
        fetchedMessages.forEach(msg => {
          existingMap.set(msg.messageId, msg);
        });
        return Array.from(existingMap.values()).sort((a, b) => 
          new Date(a.sentAt) - new Date(b.sentAt)
        );
      });
    } catch (error) {
      console.error('Error fetching evaluator chat:', error);
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  }, [evaluatorId, applicantId]);

  // Send a message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !evaluatorId || !applicantId) return;

    setSendingMessage(true);
    try {
      const payload = {
        senderType: 'EVALUATOR',
        senderEvaluator: { evaluatorId: parseInt(evaluatorId) },
        recipientType: 'APPLICANT',
        recipientApplicant: { applicantId: parseInt(applicantId) },
        content: newMessage.trim(),
      };

      const response = await axios.post(`${BACKEND_URL}/api/messages/send`, payload);
      
      // Add the new message to the list
      setMessages(prev => {
        const messageMap = new Map(prev.map(msg => [msg.messageId, msg]));
        messageMap.set(response.data.messageId, response.data);
        return Array.from(messageMap.values()).sort((a, b) => 
          new Date(a.sentAt) - new Date(b.sentAt)
        );
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, evaluatorId, applicantId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch conversation on mount
  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  return {
    messages,
    chatLoading,
    newMessage,
    setNewMessage,
    sendingMessage,
    handleSendMessage,
    messagesEndRef,
    fetchConversation,
  };
};

export default useEvaluatorChat;
