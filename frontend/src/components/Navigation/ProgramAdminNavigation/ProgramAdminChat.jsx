import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, Badge } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import ChatDrawer from "../../../pages/applicants/ApplicationTrack/components/ChatDrawer";
import axios from "axios";
import { BACKEND_URL } from "../../../config";
import { useWebSocket } from "../../../hooks/useWebSocket";

const defaultColors = {
  primary: { main: "#6A0000" },
  secondary: { main: "#FFC72C", light: "#FFD54F", dark: "#FFA000" },
  accent: { info: "#0288d1" },
  neutral: { 50: "#fafafa", 100: "#f5f3f0", 200: "#e8e4df", 300: "#d0d0d0", 400: "#999", 500: "#888", 600: "#666", 800: "#222" },
}

const ProgramAdminChat = forwardRef(({ programAdminId, colors }, ref) => {
  const [inboxOpen, setInboxOpen] = useState(false)
  const [chatList, setChatList] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [inboxLoading, setInboxLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const c = colors || defaultColors

  // Fetch chat list for program admin (defined first)
  const fetchChatList = useCallback(async () => {
    if (!programAdminId) return
    setInboxLoading(true)
    try {
      const response = await axios.get(`${BACKEND_URL}/api/messages/inbox/admin/chat-list`, {
        params: { adminId: programAdminId },
      })
      setChatList(response.data || [])
    } catch (error) {
      setChatList([])
      console.error("Failed to fetch chat list:", error)
    } finally {
      setInboxLoading(false)
    }
  }, [programAdminId])

  // WebSocket handlers (defined after fetchChatList)
  const handleMessageReceived = useCallback((message) => {
    console.log('Program Admin: New message received via WebSocket:', message);
    
    // Check if the message is for the currently open conversation
    if (selectedConversation) {
      // Message is for current conversation if:
      // 1. It's FROM the other participant (applicant/evaluator) TO the admin
      // 2. It's FROM the admin TO the other participant (echo)
      const isFromParticipant = 
        (message.senderType === selectedConversation.participantRole && 
         ((message.senderApplicant?.applicantId === selectedConversation.participantId) ||
          (message.senderEvaluator?.evaluatorId === selectedConversation.participantId)));
      
      const isToParticipant = 
        (message.senderType === 'PROGRAM_ADMIN' && 
         selectedConversation.participantRole === 'APPLICANT' &&
         message.recipientApplicant?.applicantId === selectedConversation.participantId) ||
        (message.senderType === 'PROGRAM_ADMIN' && 
         selectedConversation.participantRole === 'EVALUATOR' &&
         message.recipientEvaluator?.evaluatorId === selectedConversation.participantId);
      
      const isForCurrentConversation = isFromParticipant || isToParticipant;
      
      if (isForCurrentConversation) {
        // Add the new message ONLY if it doesn't already exist (prevent duplicates)
        setConversationMessages(prev => {
          // Use Map to ensure unique messageIds
          const messageMap = new Map(prev.map(msg => [msg.messageId, msg]));
          
          if (messageMap.has(message.messageId)) {
            console.log('Program Admin: Message already exists, skipping duplicate:', message.messageId);
            return prev; // Return exact same array reference to prevent re-render
          }
          
          messageMap.set(message.messageId, message);
          return Array.from(messageMap.values()).sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          );
        });
      }
    }
    
    // Refresh chat list to show new message preview
    fetchChatList();
  }, [selectedConversation, fetchChatList]);

  const handleStatusUpdate = useCallback((statusUpdate) => {
    console.log('Program Admin: Message status update received:', statusUpdate);
    
    // Update the message status in conversation
    setConversationMessages(prev => 
      prev.map(msg => 
        msg.messageId === statusUpdate.messageId 
          ? { ...msg, status: statusUpdate.status, seenAt: statusUpdate.seenAt }
          : msg
      )
    );
  }, []);

  // Initialize WebSocket connection
  useWebSocket(programAdminId, 'PROGRAM_ADMIN', handleMessageReceived, handleStatusUpdate);

  // Fetch conversation
  const fetchConversation = useCallback(
    async (participantId, participantRole) => {
      if (!programAdminId || !participantId) return
      setConversationLoading(true)
      try {
        let endpoint = ""
        let params = {}

        if (participantRole === "APPLICANT") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/applicant-admin`
          params = { applicantId: participantId, adminId: programAdminId }
        } else if (participantRole === "EVALUATOR") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/evaluator-admin`
          params = { evaluatorId: participantId, adminId: programAdminId }
        } else {
          console.error("Unknown participantRole:", participantRole)
          setConversationMessages([])
          setConversationLoading(false)
          return
        }

        const response = await axios.get(endpoint, { params })
        
        // Merge fetched messages with existing ones, removing duplicates
        const fetchedMessages = response.data || [];
        setConversationMessages(prev => {
          // Create a map of existing messages by messageId
          const existingMap = new Map(prev.map(msg => [msg.messageId, msg]));
          
          // Add or update messages from fetched data
          fetchedMessages.forEach(msg => {
            existingMap.set(msg.messageId, msg);
          });
          
          // Convert back to array and sort by timestamp
          return Array.from(existingMap.values()).sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          );
        });
        
        // Mark messages as seen
        try {
          await axios.post(`${BACKEND_URL}/api/messages/mark-seen`, {
            userId: Number(programAdminId),
            userType: "PROGRAM_ADMIN",
            participantId: Number(participantId),
            participantType: participantRole,
          })
        } catch (error) {
          console.error("Error marking messages as seen:", error)
        }
      } catch (error) {
        console.error("Failed to fetch conversation:", error)
        setConversationMessages([])
      } finally {
        setConversationLoading(false)
      }
    },
    [programAdminId],
  )

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !programAdminId) return

    const participantIdNum = Number(selectedConversation.participantId)
    if (Number.isNaN(participantIdNum)) {
      console.error("Invalid participant ID")
      return
    }

    setSendingMessage(true)
    try {
      const payload = {
        senderType: "PROGRAM_ADMIN",
        senderAdmin: { adminId: Number(programAdminId) },
        content: newMessage.trim(),
      }

      if (selectedConversation.participantRole === "APPLICANT") {
        payload.recipientType = "APPLICANT"
        payload.recipientApplicant = { applicantId: participantIdNum }
      } else if (selectedConversation.participantRole === "EVALUATOR") {
        payload.recipientType = "EVALUATOR"
        payload.recipientEvaluator = { evaluatorId: participantIdNum }
      }

      await axios.post(`${BACKEND_URL}/api/messages/send`, payload)
      setNewMessage("")
      await fetchConversation(selectedConversation.participantId, selectedConversation.participantRole)
      await fetchChatList() // Refresh chat list to update order
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, selectedConversation, programAdminId, fetchConversation, fetchChatList])

  // Open conversation
  const openConversation = useCallback((chat) => {
    if (!chat) return
    setSelectedConversation({
      participantId: chat.participantId,
      participantName: chat.participantName,
      participantRole: chat.participantRole,
    })
  }, [])

  // Close conversation
  const closeConversation = useCallback(() => {
    setSelectedConversation(null)
    setConversationMessages([])
    fetchChatList() // Refresh chat list when closing conversation to show latest messages
  }, [fetchChatList])

  // Fetch chat list when inbox opens
  useEffect(() => {
    if (inboxOpen) fetchChatList()
  }, [inboxOpen, fetchChatList])

  // Fetch conversation when selectedConversation changes
  useEffect(() => {
    if (selectedConversation?.participantId && selectedConversation?.participantRole) {
      fetchConversation(selectedConversation.participantId, selectedConversation.participantRole)
    }
  }, [selectedConversation, fetchConversation])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && conversationMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationMessages])

  // Count unread messages
  const unreadCount = chatList.filter((chat) => chat.unread).length

  const formatMessageTime = (ts) => {
    if (!ts) return ""
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    initiateChat: (applicantId, applicantName) => {
      setInboxOpen(true)
      setSelectedConversation({
        participantId: applicantId,
        participantName: applicantName,
        participantRole: 'APPLICANT',
      })
    }
  }), [])

  return (
    <>
      <Tooltip title="Messages">
        <IconButton onClick={() => setInboxOpen(true)}>
          <Badge badgeContent={unreadCount} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <ChatDrawer
        open={inboxOpen}
        onClose={() => setInboxOpen(false)}
        chatList={chatList}
        loading={inboxLoading}
        selectedConversation={selectedConversation}
        onSelectConversation={openConversation}
        onCloseConversation={closeConversation}
        conversationMessages={conversationMessages}
        conversationLoading={conversationLoading}
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={sendMessage}
        sendingMessage={sendingMessage}
        messagesEndRef={messagesEndRef}
        formatMessageTime={formatMessageTime}
        colors={c}
        currentUserType="PROGRAM_ADMIN"
      />
    </>
  )
})

ProgramAdminChat.displayName = 'ProgramAdminChat'

ProgramAdminChat.propTypes = {
  programAdminId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.object,
}

export default ProgramAdminChat
