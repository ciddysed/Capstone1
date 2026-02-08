/**
 * Example implementation of Email Interface for Program Admins
 * 
 * This demonstrates how program admins can use the email-style messaging
 * to communicate with applicants and evaluators.
 */

import React, { useState } from "react"
import { Box, IconButton, Badge, Tooltip } from "@mui/material"
import { Mail as MailIcon } from "@mui/icons-material"
import EmailDrawer from "../../Email/EmailDrawer"
import useEmailMessaging from "../../../hooks/useEmailMessaging"

const ProgramAdminEmailInterface = ({ adminId, colors }) => {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false)

  // Use the email messaging hook with PROGRAM_ADMIN type
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
  } = useEmailMessaging(adminId, 'PROGRAM_ADMIN')

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
      {/* Mail Icon Button - Add this to program admin navigation */}
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
        currentUserType="PROGRAM_ADMIN"
      />
    </>
  )
}

export default ProgramAdminEmailInterface


/**
 * INTEGRATION FOR PROGRAM ADMINS:
 * 
 * 1. In ProgramAdminNavigation or Dashboard:
 *    import ProgramAdminEmailInterface from './ProgramAdminEmailInterface'
 * 
 * 2. Add to navigation bar:
 *    <ProgramAdminEmailInterface adminId={adminId} colors={colors} />
 * 
 * 3. Replace existing ProgramAdminChat.jsx usage with this component
 * 
 * ADMIN-SPECIFIC FEATURES:
 *    - Send emails to applicants
 *    - Communicate with evaluators
 *    - Manage all program-related correspondence
 *    - Broadcast announcements (manually to multiple recipients)
 */
