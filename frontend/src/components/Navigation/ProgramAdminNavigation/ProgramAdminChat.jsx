"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import {
  IconButton,
  Tooltip,
  Badge,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material"
import MailIcon from "@mui/icons-material/Mail"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SendIcon from "@mui/icons-material/Send"
import CloseIcon from "@mui/icons-material/Close"
import axios from "axios"

const BACKEND_URL = "http://localhost:8080"

const defaultColors = {
  primary: { main: "#6A0000" },
  secondary: { main: "#FFC72C" },
  accent: { info: "#0288d1" },
  neutral: { 200: "#e8e4df", 100: "#f5f3f0" },
}

// ChatDrawer component (inline)
const ChatDrawer = ({
  open,
  onClose,
  chatList,
  loading,
  selectedConversation,
  onSelectConversation,
  onCloseConversation,
  conversationMessages,
  conversationLoading,
  newMessage,
  onMessageChange,
  onSendMessage,
  sendingMessage,
  messagesEndRef,
  formatMessageTime,
  colors,
}) => {
  const c = colors || defaultColors

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 370, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: c.primary.main,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {selectedConversation ? (
            <IconButton size="small" onClick={onCloseConversation} sx={{ color: "#fff" }}>
              <ArrowBackIcon />
            </IconButton>
          ) : null}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {selectedConversation ? selectedConversation.participantName : "Inbox"}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        {!selectedConversation ? (
          // Inbox list view
          <Box sx={{ flexGrow: 1, overflow: "auto", bgcolor: c.neutral[100] }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : chatList.length === 0 ? (
              <Typography sx={{ p: 3, textAlign: "center", color: "#888" }}>No conversations yet.</Typography>
            ) : (
              <List disablePadding>
                {chatList.map((chat, idx) => (
                  <ListItem
                    key={chat.participantId || idx}
                    button
                    onClick={() => onSelectConversation(chat)}
                    sx={{
                      borderBottom: `1px solid ${c.neutral[200]}`,
                      bgcolor: chat.unread ? c.neutral[200] : "transparent",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: c.secondary.main, color: c.primary.main }}>
                        {chat.participantName?.[0]?.toUpperCase() || "?"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span style={{ fontWeight: chat.unread ? 700 : 400 }}>{chat.participantName}</span>
                          <Typography
                            variant="caption"
                            sx={{
                              ml: "auto",
                              color: "#888",
                              fontSize: 11,
                            }}
                          >
                            {chat.participantRole}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 220,
                          }}
                        >
                          {chat.lastMessageContent || "No messages yet"}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ) : (
          // Conversation view
          <>
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                p: 2,
                bgcolor: c.neutral[100],
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {conversationLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : conversationMessages.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "#888", mt: 4 }}>
                  No messages yet. Start the conversation!
                </Typography>
              ) : (
                conversationMessages.map((msg, idx) => {
                  const isMe = msg.senderType === "PROGRAM_ADMIN"
                  return (
                    <Box
                      key={msg.messageId || idx}
                      sx={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        bgcolor: isMe ? c.primary.main : "#fff",
                        color: isMe ? "#fff" : "#222",
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: "80%",
                        boxShadow: 1,
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", textAlign: "right", mt: 0.5, opacity: 0.7 }}
                      >
                        {formatMessageTime(msg.sentAt)}
                      </Typography>
                    </Box>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message input */}
            <Box
              sx={{
                p: 1.5,
                borderTop: `1px solid ${c.neutral[200]}`,
                display: "flex",
                gap: 1,
                bgcolor: "#fff",
              }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSendMessage()
                  }
                }}
                disabled={sendingMessage}
              />
              <Button
                variant="contained"
                onClick={onSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                sx={{ bgcolor: c.primary.main, minWidth: 48 }}
              >
                {sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  )
}

// Main ProgramAdminChat component
const ProgramAdminChat = ({ programAdminId, colors }) => {
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

  // Fetch chat list for program admin
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
        setConversationMessages(response.data || [])
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
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, selectedConversation, programAdminId, fetchConversation])

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
  }, [])

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
      />
    </>
  )
}

ProgramAdminChat.propTypes = {
  programAdminId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.object,
}

export default ProgramAdminChat
