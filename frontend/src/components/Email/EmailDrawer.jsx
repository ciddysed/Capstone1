import React, { useState } from "react"
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
import EmailInboxView from "./EmailInboxView"
import EmailDetailView from "./EmailDetailView"
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
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [replyTo, setReplyTo] = useState(null)

  // Filter messages based on tab
  const getFilteredMessages = () => {
    switch (selectedTab) {
      case 0: // Inbox
        return allMessages.filter(msg => msg.recipientType === currentUserType)
      case 1: // Sent
        return allMessages.filter(msg => msg.senderType === currentUserType)
      case 2: // All
      default:
        return allMessages
    }
  }

  const filteredMessages = getFilteredMessages()
  const unreadCount = allMessages.filter(
    msg => msg.recipientType === currentUserType && !msg.isRead
  ).length

  const handleSelectEmail = (email) => {
    setSelectedEmail(email)
  }

  const handleBackToList = () => {
    setSelectedEmail(null)
  }

  const handleCompose = () => {
    setReplyTo(null)
    setComposerOpen(true)
  }

  const handleReply = () => {
    if (selectedEmail) {
      // Get the sender info to reply to
      let recipient = null
      
      if (selectedEmail.senderApplicant) {
        recipient = {
          id: selectedEmail.senderApplicant.applicantId,
          name: `${selectedEmail.senderApplicant.firstName} ${selectedEmail.senderApplicant.lastName}`,
          role: 'APPLICANT',
        }
      } else if (selectedEmail.senderEvaluator) {
        recipient = {
          id: selectedEmail.senderEvaluator.evaluatorId,
          name: selectedEmail.senderEvaluator.name,
          role: 'EVALUATOR',
        }
      } else if (selectedEmail.senderAdmin) {
        recipient = {
          id: selectedEmail.senderAdmin.adminId,
          name: selectedEmail.senderAdmin.name,
          role: 'PROGRAM_ADMIN',
        }
      }

      // Parse the original message subject
      let originalSubject = "(No Subject)"
      try {
        const parsed = JSON.parse(selectedEmail.content)
        originalSubject = parsed.subject || "(No Subject)"
      } catch {
        originalSubject = "(No Subject)"
      }

      setReplyTo({
        email: selectedEmail,
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

  const handleDelete = async () => {
    if (selectedEmail && onDeleteEmail) {
      const confirmed = window.confirm('Are you sure you want to delete this message?')
      if (confirmed) {
        const success = await onDeleteEmail(selectedEmail.messageId)
        if (success) {
          setSelectedEmail(null)
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
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 480, md: 600 },
            maxWidth: "100%",
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

            {!selectedEmail && onRefresh && (
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

            {!selectedEmail && (
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

          {/* Tabs - Only show when not viewing an email */}
          {!selectedEmail && (
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
            {selectedEmail ? (
              <EmailDetailView
                email={selectedEmail}
                onBack={handleBackToList}
                onReply={handleReply}
                onDelete={handleDelete}
                colors={colors}
                currentUserType={currentUserType}
              />
            ) : (
              <Box sx={{ flex: 1, overflow: "auto", bgcolor: "white" }}>
                <EmailInboxView
                  emails={filteredMessages}
                  loading={loading}
                  onSelectEmail={handleSelectEmail}
                  selectedEmailId={selectedEmail?.messageId}
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

export default EmailDrawer
