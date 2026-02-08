/**
 * Example implementation of Email Interface for Evaluators
 * 
 * This demonstrates how evaluators can use the email-style messaging
 * to communicate with applicants and program admins.
 */

import React, { useState } from "react"
import { Box, IconButton, Badge, Tooltip } from "@mui/material"
import { Mail as MailIcon } from "@mui/icons-material"
import EmailDrawer from "../../Email/EmailDrawer"
import useEmailMessaging from "../../../hooks/useEmailMessaging"

const EvaluatorEmailInterface = ({ evaluatorId, colors }) => {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false)

  // Use the email messaging hook with EVALUATOR type
  const {
    allMessages,
    inboxMessages,
    sentMessages,
    loading,
    sending,
    error,
    sendEmail,
    deleteEmail,
    fetchAllMessages,
  } = useEmailMessaging(evaluatorId, 'EVALUATOR')

  // Count unread messages
  const unreadCount = inboxMessages.filter(msg => !msg.isRead).length

  const handleSendEmail = async (recipientId, recipientType, subject, body) => {
    const result = await sendEmail(recipientId, recipientType, subject, body)
    return result !== null
  }

  const handleDeleteEmail = async (messageId) => {
    return await deleteEmail(messageId)
  }

  const handleRefresh = () => {
    fetchAllMessages()
  }

  return (
    <>
      {/* Mail Icon Button - Add this to evaluator navigation */}
      <Tooltip title="Messages">
        <IconButton
          onClick={() => setEmailDrawerOpen(true)}
          sx={{
            color: "white",
            opacity: 0.9,
            "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: colors?.secondary?.main || "#FFC72C",
                color: colors?.primary?.dark || "#000",
                fontWeight: 700,
                fontSize: 10,
              },
            }}
          >
            <MailIcon sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Email Drawer */}
      <EmailDrawer
        open={emailDrawerOpen}
        onClose={() => setEmailDrawerOpen(false)}
        allMessages={allMessages}
        loading={loading}
        onRefresh={handleRefresh}
        onSendEmail={handleSendEmail}
        onDeleteEmail={handleDeleteEmail}
        sending={sending}
        colors={colors}
        currentUserType="EVALUATOR"
      />
    </>
  )
}

export default EvaluatorEmailInterface


/**
 * INTEGRATION FOR EVALUATORS:
 * 
 * 1. In EvaluatorNavigation or Dashboard:
 *    import EvaluatorEmailInterface from './EvaluatorEmailInterface'
 * 
 * 2. Add to navigation bar:
 *    <EvaluatorEmailInterface evaluatorId={evaluatorId} colors={colors} />
 * 
 * 3. Replace existing EvaluatorChat.jsx usage with this component
 * 
 * EVALUATOR-SPECIFIC FEATURES:
 *    - Send emails to applicants being evaluated
 *    - Communicate with program admins
 *    - View all evaluation-related correspondence
 *    - Reply to applicant inquiries
 */
