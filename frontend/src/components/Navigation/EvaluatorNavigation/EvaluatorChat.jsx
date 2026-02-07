import React, { useState, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { IconButton, Tooltip, Badge } from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import ChatDrawer from "../../../pages/applicants/ApplicationTrack/components/ChatDrawer";
import axios from "axios";
import { BACKEND_URL } from "../../../config";

const defaultColors = {
  primary: { main: "#6A0000", dark: "#450000" },
  secondary: { main: "#FFC72C", light: "#FFD54F", dark: "#FFA000" },
  accent: { info: "#0288d1" },
  neutral: { 50: "#fafafa", 100: "#f5f3f0", 200: "#e8e4df", 300: "#d0d0d0", 400: "#999", 500: "#888", 600: "#666", 800: "#222" },
}

const EvaluatorChat = ({ evaluatorId, colors }) => {
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

  // Fetch chat list for evaluator (conversations with applicants and admins)
  const fetchChatList = useCallback(async () => {
    if (!evaluatorId) {
      console.log("No evaluatorId provided, skipping chat list fetch")
      return
    }
    setInboxLoading(true)
    console.log("Fetching evaluator chat list for evaluatorId:", evaluatorId)
    
    try {
      // 1. Fetch existing message conversations
      let existingChats = []
      try {
        const chatResponse = await axios.get(`${BACKEND_URL}/api/messages/inbox/evaluator/chat-list`, {
          params: { evaluatorId: evaluatorId },
        })
        existingChats = chatResponse.data || []
        console.log("Existing chat conversations:", existingChats)
      } catch (error) {
        console.log("No existing chats or error fetching:", error.message)
      }
      
      // Track which participants we already have
      const existingParticipants = new Set(
        existingChats.map(chat => `${chat.participantRole}_${chat.participantId}`)
      )
      
      // 2. Fetch assigned applicants from evaluations
      let assignedApplicants = []
      try {
        const evalResponse = await axios.get(`${BACKEND_URL}/api/evaluations/evaluator/${evaluatorId}`)
        const evaluations = evalResponse.data || []
        console.log("Evaluations for evaluator:", evaluations)
        
        // Extract unique applicants from evaluations
        const seenApplicants = new Set()
        for (const evaluation of evaluations) {
          const applicant = evaluation.applicant
          if (applicant && !seenApplicants.has(applicant.applicantId)) {
            seenApplicants.add(applicant.applicantId)
            const key = `APPLICANT_${applicant.applicantId}`
            if (!existingParticipants.has(key)) {
              assignedApplicants.push({
                participantId: applicant.applicantId,
                participantName: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || 'Unknown Applicant',
                participantRole: 'APPLICANT',
                lastMessageContent: 'No messages yet - Assigned for evaluation',
                lastMessageTimestamp: null,
                unread: false,
              })
              existingParticipants.add(key)
            }
          }
        }
        console.log("Assigned applicants (no messages yet):", assignedApplicants)
      } catch (error) {
        console.log("Could not fetch evaluations:", error.message)
      }
      
      // 3. Fetch all program admins - try API first, fallback to hardcoded
      let programAdmins = []
      try {
        const adminResponse = await axios.get(`${BACKEND_URL}/api/program-admins`)
        const admins = adminResponse.data || []
        console.log("Program admins from API:", admins)
        
        // Handle both array response and single admin response
        const adminList = Array.isArray(admins) ? admins : (admins.adminId ? [admins] : [])
        
        for (const admin of adminList) {
          const adminId = admin.adminId || admin.id
          const key = `PROGRAM_ADMIN_${adminId}`
          if (adminId && !existingParticipants.has(key)) {
            programAdmins.push({
              participantId: adminId,
              participantName: admin.name || admin.firstName || 'Program Admin',
              participantRole: 'PROGRAM_ADMIN',
              lastMessageContent: 'No messages yet',
              lastMessageTimestamp: null,
              unread: false,
            })
            existingParticipants.add(key)
          }
        }
      } catch (error) {
        console.log("Could not fetch admins from API:", error.message)
      }
      
      // Fallback: Add hardcoded ETEEAP Coordinator if no admins found
      if (programAdmins.length === 0) {
        const key = `PROGRAM_ADMIN_1`
        if (!existingParticipants.has(key)) {
          programAdmins.push({
            participantId: 1,
            participantName: 'ETEEAP Coordinator',
            participantRole: 'PROGRAM_ADMIN',
            lastMessageContent: 'No messages yet',
            lastMessageTimestamp: null,
            unread: false,
          })
          existingParticipants.add(key)
          console.log("Added fallback ETEEAP Coordinator")
        }
      }
      console.log("Program admins (final):", programAdmins)
      
      // 4. Combine all and sort
      const allChats = [...existingChats, ...assignedApplicants, ...programAdmins]
      
      // Sort: conversations with messages first (by timestamp desc), then no-message entries alphabetically
      allChats.sort((a, b) => {
        const t1 = a.lastMessageTimestamp
        const t2 = b.lastMessageTimestamp
        if (t1 && t2) return new Date(t2) - new Date(t1)
        if (t1) return -1
        if (t2) return 1
        return (a.participantName || '').localeCompare(b.participantName || '')
      })
      
      console.log("Final combined chat list:", allChats)
      setChatList(allChats)
    } catch (error) {
      setChatList([])
      console.error("Failed to fetch evaluator chat list:", error)
    } finally {
      setInboxLoading(false)
    }
  }, [evaluatorId])

  // Fetch conversation
  const fetchConversation = useCallback(
    async (participantId, participantRole) => {
      if (!evaluatorId || !participantId) return
      setConversationLoading(true)
      try {
        let endpoint = ""
        let params = {}

        if (participantRole === "APPLICANT") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/applicant-evaluator`
          params = { applicantId: participantId, evaluatorId: evaluatorId }
        } else if (participantRole === "PROGRAM_ADMIN") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/evaluator-admin`
          params = { evaluatorId: evaluatorId, adminId: participantId }
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
          const existingMap = new Map(prev.map(msg => [msg.messageId, msg]));
          fetchedMessages.forEach(msg => {
            existingMap.set(msg.messageId, msg);
          });
          return Array.from(existingMap.values()).sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          );
        });
        
        // Mark messages as seen
        try {
          await axios.post(`${BACKEND_URL}/api/messages/mark-seen`, {
            userId: Number(evaluatorId),
            userType: "EVALUATOR",
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
    [evaluatorId],
  )

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !evaluatorId) return

    const participantIdNum = Number(selectedConversation.participantId)
    if (Number.isNaN(participantIdNum)) {
      console.error("Invalid participant ID")
      return
    }

    setSendingMessage(true)
    try {
      const payload = {
        senderType: "EVALUATOR",
        senderEvaluator: { evaluatorId: Number(evaluatorId) },
        content: newMessage.trim(),
      }

      if (selectedConversation.participantRole === "APPLICANT") {
        payload.recipientType = "APPLICANT"
        payload.recipientApplicant = { applicantId: participantIdNum }
      } else if (selectedConversation.participantRole === "PROGRAM_ADMIN") {
        payload.recipientType = "PROGRAM_ADMIN"
        payload.recipientAdmin = { adminId: participantIdNum }
      }

      await axios.post(`${BACKEND_URL}/api/messages/send`, payload)
      setNewMessage("")
      await fetchConversation(selectedConversation.participantId, selectedConversation.participantRole)
      await fetchChatList()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, selectedConversation, evaluatorId, fetchConversation, fetchChatList])

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
    fetchChatList()
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
        currentUserType="EVALUATOR"
        onRefreshChatList={fetchChatList}
      />
    </>
  )
}

EvaluatorChat.propTypes = {
  evaluatorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.object,
}

export default EvaluatorChat
