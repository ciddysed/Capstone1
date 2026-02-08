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
  const [allProgramAdmins, setAllProgramAdmins] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [inboxLoading, setInboxLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const c = colors || defaultColors

  // Fetch all program admins
  const fetchAllProgramAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/messages/program-admins/all`)
      setAllProgramAdmins(response.data || [])
    } catch (error) {
      console.error("Failed to fetch program admins:", error)
      setAllProgramAdmins([])
    }
  }, [])

  // Helper function to fetch existing chats
  const fetchExistingChats = async () => {
    try {
      const chatResponse = await axios.get(`${BACKEND_URL}/api/messages/inbox/evaluator/chat-list`, {
        params: { evaluatorId: evaluatorId },
      })
      const chats = chatResponse.data || []
      console.log("Existing chat conversations:", chats)
      return chats
    } catch (error) {
      console.log("No existing chats or error fetching:", error.message)
      return []
    }
  }

  // Helper function to fetch assigned applicants (from evaluations)
  const fetchAssignedApplicants = async (existingParticipants) => {
    try {
      const evaluationsResponse = await axios.get(`${BACKEND_URL}/api/evaluations/evaluator/${evaluatorId}`)
      const evaluations = evaluationsResponse.data || []
      
      // Get unique applicants from evaluations
      const applicantMap = new Map()
      evaluations.forEach(evaluation => {
        if (evaluation.applicant) {
          const applicantId = evaluation.applicant.applicantId
          if (!applicantMap.has(applicantId)) {
            applicantMap.set(applicantId, evaluation.applicant)
          }
        }
      })
      
      // Map applicants to chat items, filtering out those with existing conversations
      const assignedApplicants = Array.from(applicantMap.values())
        .filter(applicant => {
          const key = `APPLICANT_${applicant.applicantId}`
          return !existingParticipants.has(key)
        })
        .map(applicant => ({
          participantId: applicant.applicantId,
          participantName: `${applicant.firstName} ${applicant.lastName}`,
          participantRole: "APPLICANT",
          lastMessageContent: null,
          lastMessageTimestamp: null,
          unread: false,
          isAssigned: true, // Flag to indicate this is an assigned applicant (show by default)
        }))
      
      return assignedApplicants
    } catch (error) {
      console.error("Error fetching assigned applicants:", error)
      return []
    }
  }

  // Helper function to normalize admin list response
  const normalizeAdminList = (admins) => {
    if (Array.isArray(admins)) return admins
    if (admins && admins.adminId) return [admins]
    return []
  }

  // Helper function to fetch program admins
  const fetchProgramAdmins = async (existingParticipants) => {
    // No longer showing program admins without messages
    // Only show admins with actual message history
    return []
  }

  // Helper function to add fallback admin
  const addFallbackAdmin = (programAdmins, existingParticipants) => {
    // No longer adding fallback admin without messages
    return programAdmins
  }

  // Helper function to sort chats
  const sortChats = (chats) => {
    return chats.sort((a, b) => {
      const t1 = a.lastMessageTimestamp
      const t2 = b.lastMessageTimestamp
      if (t1 && t2) return new Date(t2) - new Date(t1)
      if (t1) return -1
      if (t2) return 1
      return (a.participantName || '').localeCompare(b.participantName || '')
    })
  }

  // Fetch chat list for evaluator (conversations with applicants and admins)
  const fetchChatList = useCallback(async () => {
    if (!evaluatorId) {
      console.log("No evaluatorId provided, skipping chat list fetch")
      return
    }
    
    setInboxLoading(true)
    try {
      // Fetch existing conversations
      const existingChats = await fetchExistingChats()
      
      // Track which participants we already have
      const existingParticipants = new Set(
        existingChats.map(chat => `${chat.participantRole}_${chat.participantId}`)
      )
      
      // Fetch assigned applicants and program admins
      const assignedApplicants = await fetchAssignedApplicants(existingParticipants)
      let programAdmins = await fetchProgramAdmins(existingParticipants)
      programAdmins = addFallbackAdmin(programAdmins, existingParticipants)
      
      // Combine and sort all chats
      const allChats = [...existingChats, ...assignedApplicants, ...programAdmins]
      const sortedChats = sortChats(allChats)
      

      setChatList(sortedChats)
    } catch (error) {
      setChatList([])
      console.error("Failed to fetch evaluator chat list:", error)
    } finally {
      setInboxLoading(false)
    }
  }, [evaluatorId])

  // Fetch conversation
  const fetchConversation = useCallback(
    async (participantId, participantRole, signal) => {
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

        const response = await axios.get(endpoint, { params, signal })
        
        // Replace messages with fetched conversation (don't merge with previous conversation)
        const fetchedMessages = response.data || [];
        setConversationMessages(
          fetchedMessages.sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          )
        );
        
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
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          console.log('Fetch conversation cancelled')
          return
        }
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
      await fetchConversation(selectedConversation.participantId, selectedConversation.participantRole, undefined)
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
    setConversationMessages([]) // Clear previous messages
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

  // Fetch program admins and chat list when inbox opens
  useEffect(() => {
    if (inboxOpen) {
      fetchAllProgramAdmins()
      fetchChatList()
    }
  }, [inboxOpen, fetchAllProgramAdmins, fetchChatList])

  // Fetch conversation when selectedConversation changes
  useEffect(() => {
    if (selectedConversation?.participantId && selectedConversation?.participantRole) {
      const abortController = new AbortController()
      fetchConversation(selectedConversation.participantId, selectedConversation.participantRole, abortController.signal)
      return () => abortController.abort() // Cleanup on unmount or conversation change
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
        onClose={() => {
          setInboxOpen(false)
          closeConversation()
        }}
        chatList={chatList}
        allProgramAdmins={allProgramAdmins}
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
