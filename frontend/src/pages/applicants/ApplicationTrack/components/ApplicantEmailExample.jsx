/**
 * Example implementation of Email Interface for Applicants
 * 
 * This demonstrates how to integrate the email-style messaging
 * into any applicant page using the existing backend API.
 * 
 * Simply replace ChatDrawer imports with EmailDrawer and use
 * the useEmailMessaging hook instead of manual chat state management.
 */

import React, { useState } from "react"
import { Box, IconButton, Badge, Tooltip } from "@mui/material"
import { Mail as MailIcon } from "@mui/icons-material"
import EmailDrawer from "../../../../components/Email/EmailDrawer"
import useEmailMessaging from "../../../../hooks/useEmailMessaging"

const ApplicantEmailExample = ({ applicantId, colors }) => {
  const [emailDrawerOpen, setEmailDrawerOpen] = useState(false)

  // Use the email messaging hook
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
  } = useEmailMessaging(applicantId, 'APPLICANT')

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

  // Always render the icon, even if applicantId isn't ready yet
  return (
    <>
      {/* Mail Icon Button - Add this to your navigation/header */}
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
        currentUserType="APPLICANT"
      />
    </>
  )
}

export default ApplicantEmailExample


/**
 * INTEGRATION GUIDE:
 * 
 * 1. For Applicants (ApplicationTrack/index.jsx):
 *    - Import: import ApplicantEmailExample from './components/ApplicantEmailExample'
 *    - Replace the Mail icon and ChatDrawer with: 
 *      <ApplicantEmailExample applicantId={applicantId} colors={colors} />
 * 
 * 2. For Evaluators:
 *    - Use useEmailMessaging(evaluatorId, 'EVALUATOR')
 *    - Same component structure, just change userType
 * 
 * 3. For Program Admins:
 *    - Use useEmailMessaging(adminId, 'PROGRAM_ADMIN')
 *    - Same component structure, just change userType
 * 
 * MESSAGE FORMAT:
 *    - Backend stores messages as JSON: {"subject": "...", "body": "..."}
 *    - Components automatically parse and display correctly
 *    - Old messages without subject will show "(No Subject)"
 * 
 * FEATURES INCLUDED:
 *    ✅ Subject + Body fields
 *    ✅ Email-style inbox view
 *    ✅ Full email detail view
 *    ✅ Reply functionality
 *    ✅ Inbox/Sent/All folders
 *    ✅ Unread count badge
 *    ✅ Delete messages
 *    ✅ Search (client-side filtering)
 *    ✅ Timestamp formatting
 *    ✅ Responsive design
 * 
 * BACKEND COMPATIBILITY:
 *    - Uses existing /api/messages endpoints
 *    - No backend changes required
 *    - Content field stores JSON string
 *    - Backward compatible with old messages
 */
