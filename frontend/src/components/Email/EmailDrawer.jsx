import React, { useState, useMemo } from "react"
import PropTypes from "prop-types"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Badge,
  alpha,
} from "@mui/material"
import {
  Close as CloseIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Mail as MailIcon,
  Edit as ComposeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import ConversationListView from "./ConversationListView"
import ConversationDetailView from "./ConversationDetailView"
import EmailComposer from "./EmailComposer"

const EmailDrawer = ({
  open,
  onClose,
  allMessages = [],
  loading = false,
  onRefresh,
  onSendEmail,
  onDeleteEmail,
  sending = false,
  colors,
  currentUserType = "APPLICANT",
}) => {
  const [selectedTab, setSelectedTab] = useState(0) // 0: Inbox, 1: Sent, 2: All
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  // Helper function to get participant info from a message
  const getParticipantFromMessage = (message, asRecipient = false) => {
    if (asRecipient) {
      // Get recipient info
      if (message.recipientApplicant) {
        return {
          id: message.recipientApplicant.applicantId,
          name: `${message.recipientApplicant.firstName} ${message.recipientApplicant.lastName}`,
          role: message.recipientType,
        }
      } else if (message.recipientEvaluator) {
        return {
          id: message.recipientEvaluator.evaluatorId,
          name: message.recipientEvaluator.name,
          role: message.recipientType,
        }
      } else if (message.recipientAdmin) {
        return {
          id: message.recipientAdmin.adminId,
          name: message.recipientAdmin.name,
          role: message.recipientType,
        }
      }
    } else if (message.senderApplicant) {
      // Get sender info
      return {
        id: message.senderApplicant.applicantId,
        name: `${message.senderApplicant.firstName} ${message.senderApplicant.lastName}`,
        role: message.senderType,
      }
    } else if (message.senderEvaluator) {
      return {
        id: message.senderEvaluator.evaluatorId,
        name: message.senderEvaluator.name,
        role: message.senderType,
      }
    } else if (message.senderAdmin) {
      return {
        id: message.senderAdmin.adminId,
        name: message.senderAdmin.name,
        role: message.senderType,
      }
    }
    return null
  }

  // Group messages into conversations by participant
  const groupMessagesByConversation = (messages) => {
    const conversationMap = new Map()

    messages.forEach((message) => {
      // Determine the "other" participant (not current user)
      let participant = null
      const isSent = message.senderType === currentUserType
      
      if (isSent) {
        // If sent, the other person is the recipient
        participant = getParticipantFromMessage(message, true)
      } else {
        // If received, the other person is the sender
        participant = getParticipantFromMessage(message, false)
      }

      if (!participant) return

      const conversationKey = `${participant.id}-${participant.role}`

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          participantId: participant.id,
          participantName: participant.name,
          participantRole: participant.role,
          messages: [],
          lastMessage: message,
          messageCount: 0,
          unreadCount: 0,
        })
      }

      const conversation = conversationMap.get(conversationKey)
      conversation.messages.push(message)
      conversation.messageCount++
      
      // Update last message if this message is newer
      if (new Date(message.sentAt) > new Date(conversation.lastMessage.sentAt)) {
        conversation.lastMessage = message
      }

      // Count unread messages (received and not read)
      if (message.recipientType === currentUserType && !message.isRead) {
        conversation.unreadCount++
      }
    })

    // Sort messages within each conversation by date
    conversationMap.forEach((conversation) => {
      conversation.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
    })

    // Convert to array and sort by last message time
    return Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt)
    )
  }

  // Get filtered conversations based on tab
  const conversations = useMemo(() => {
    let filteredMessages = []
    
    switch (selectedTab) {
      case 0: // Inbox
        filteredMessages = allMessages.filter(msg => msg.recipientType === currentUserType)
        break
      case 1: // Sent
        filteredMessages = allMessages.filter(msg => msg.senderType === currentUserType)
        break
      case 2: // All
      default:
        filteredMessages = allMessages
        break
    }

    return groupMessagesByConversation(filteredMessages)
  }, [allMessages, selectedTab, currentUserType])

  const unreadCount = allMessages.filter(
    msg => msg.recipientType === currentUserType && !msg.isRead
  ).length

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  const handleCompose = () => {
    setReplyTo(null)
    setComposerOpen(true)
  }

  const handleReply = () => {
    if (selectedConversation) {
      const recipient = {
        id: selectedConversation.participantId,
        name: selectedConversation.participantName,
        role: selectedConversation.participantRole,
      }

      // Get last message subject for context
      let originalSubject = "(No Subject)"
      try {
        const lastMessage = selectedConversation.lastMessage
        const parsed = JSON.parse(lastMessage.content)
        originalSubject = parsed.subject || "(No Subject)"
      } catch {
        originalSubject = "(No Subject)"
      }

      setReplyTo({
        recipient: recipient,
        subject: originalSubject,
      })
      setComposerOpen(true)
    }
  }

  const handleSendFromComposer = async ({ subject, body }) => {
    const recipient = replyTo ? replyTo.recipient : null
    
    if (!recipient) {
      console.error('No recipient selected')
      return
    }

    const success = await onSendEmail(recipient.id, recipient.role, subject, body)
    
    if (success) {
      setComposerOpen(false)
      setReplyTo(null)
      if (onRefresh) {
        onRefresh()
      }
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (onDeleteEmail) {
      const confirmed = globalThis.confirm('Are you sure you want to delete this message?')
      if (confirmed) {
        const success = await onDeleteEmail(messageId)
        if (success) {
          // Check if there are any messages left in this conversation
          const updatedConversation = {
            ...selectedConversation,
            messages: selectedConversation.messages.filter(msg => msg.messageId !== messageId)
          }
          
          if (updatedConversation.messages.length === 0) {
            // No more messages, go back to list
            setSelectedConversation(null)
          } else {
            // Update the selected conversation
            setSelectedConversation(updatedConversation)
          }
          
          if (onRefresh) {
            onRefresh()
          }
        }
      }
    }
  }

  const handleCloseComposer = () => {
    setComposerOpen(false)
    setReplyTo(null)
  }

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 480, md: 600 },
              maxWidth: "100%",
            },
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: colors?.neutral?.[50] || "#f9f9f9",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
              bgcolor: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            <MailIcon sx={{ color: colors?.primary?.main || "#6A0000", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} color={colors?.neutral?.[800]} sx={{ flex: 1 }}>
              Messages
            </Typography>

            {!selectedConversation && onRefresh && (
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                sx={{
                  color: colors?.neutral?.[600],
                  "&:hover": { color: colors?.primary?.main },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}

            {!selectedConversation && (
              <IconButton
                size="small"
                onClick={handleCompose}
                sx={{
                  color: colors?.primary?.main,
                  bgcolor: alpha(colors?.primary?.main || "#6A0000", 0.1),
                  "&:hover": {
                    bgcolor: alpha(colors?.primary?.main || "#6A0000", 0.2),
                  },
                }}
              >
                <ComposeIcon fontSize="small" />
              </IconButton>
            )}

            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs - Only show when not viewing a conversation */}
          {!selectedConversation && (
            <Box
              sx={{
                borderBottom: `1px solid ${colors?.neutral?.[200] || "#eee"}`,
                bgcolor: "white",
                flexShrink: 0,
              }}
            >
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
                sx={{
                  minHeight: 48,
                  "& .MuiTab-root": {
                    minHeight: 48,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 13,
                  },
                }}
              >
                <Tab
                  icon={<InboxIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label={
                    <Badge
                      badgeContent={unreadCount}
                      color="secondary"
                      sx={{
                        "& .MuiBadge-badge": {
                          bgcolor: colors?.secondary?.main || "#FFC72C",
                          color: colors?.neutral?.[900] || "#000",
                        },
                      }}
                    >
                      <span style={{ marginRight: unreadCount > 0 ? 16 : 0 }}>Inbox</span>
                    </Badge>
                  }
                />
                <Tab
                  icon={<SendIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label="Sent"
                />
                <Tab
                  icon={<MailIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label="All"
                />
              </Tabs>
            </Box>
          )}

          {/* Content Area */}
          <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {selectedConversation ? (
              <ConversationDetailView
                conversation={selectedConversation}
                messages={selectedConversation.messages}
                loading={false}
                onBack={handleBackToList}
                onReply={handleReply}
                onDeleteMessage={handleDeleteMessage}
                colors={colors}
                currentUserType={currentUserType}
              />
            ) : (
              <Box sx={{ flex: 1, overflow: "auto", bgcolor: "white" }}>
                <ConversationListView
                  conversations={conversations}
                  loading={loading}
                  onSelectConversation={handleSelectConversation}
                  selectedParticipantId={selectedConversation ? `${selectedConversation.participantId}-${selectedConversation.participantRole}` : null}
                  colors={colors}
                  currentUserType={currentUserType}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Email Composer Modal */}
      {composerOpen && replyTo && (
        <EmailComposer
          open={composerOpen}
          onClose={handleCloseComposer}
          recipient={replyTo.recipient}
          onSend={handleSendFromComposer}
          sending={sending}
          colors={colors}
          replyTo={replyTo}
        />
      )}
    </>
  )
}

EmailDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  allMessages: PropTypes.arrayOf(
    PropTypes.shape({
      messageId: PropTypes.number,
      senderType: PropTypes.string,
      recipientType: PropTypes.string,
      content: PropTypes.string,
      sentAt: PropTypes.string,
      isRead: PropTypes.bool,
      senderApplicant: PropTypes.object,
      senderEvaluator: PropTypes.object,
      senderAdmin: PropTypes.object,
      recipientApplicant: PropTypes.object,
      recipientEvaluator: PropTypes.object,
      recipientAdmin: PropTypes.object,
    })
  ),
  loading: PropTypes.bool,
  onRefresh: PropTypes.func,
  onSendEmail: PropTypes.func,
  onDeleteEmail: PropTypes.func,
  sending: PropTypes.bool,
  colors: PropTypes.shape({
    primary: PropTypes.shape({
      main: PropTypes.string,
    }),
    secondary: PropTypes.shape({
      main: PropTypes.string,
    }),
    neutral: PropTypes.objectOf(PropTypes.string),
  }),
  currentUserType: PropTypes.string,
}

export default EmailDrawer
