# Email-Style Messaging System

## Overview

This is an **email-style messaging interface** built on top of your existing chat backend. It provides a more professional communication experience with **subject lines**, **inbox/sent folders**, and **email-like UI** - all without requiring any backend changes.

## ✨ Features

### What's Included:
- ✅ **Subject + Body fields** - Proper email structure
- ✅ **Email Composer** - Modal dialog for composing messages
- ✅ **Inbox View** - List of received messages
- ✅ **Sent View** - List of sent messages
- ✅ **Email Detail View** - Full message view with reply option
- ✅ **Reply functionality** - Auto-prefixes "Re:" to subject
- ✅ **Folder tabs** - Inbox, Sent, All Messages
- ✅ **Unread badges** - Visual indicators for new messages
- ✅ **Delete messages** - Remove unwanted emails
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Backend compatible** - Uses existing Message API

### What's NOT Included (Would need backend changes):
- ❌ Attachments (needs file upload API)
- ❌ CC/BCC (needs multiple recipients)
- ❌ Persistent read status (needs backend field)
- ❌ Draft saving (can use localStorage)
- ❌ Search (can add client-side)

---

## 🚀 Quick Start

### 1. Components Created

```
frontend/src/
├── components/
│   └── Email/
│       ├── EmailComposer.jsx      # Compose new messages
│       ├── EmailInboxView.jsx     # List view of messages
│       ├── EmailDetailView.jsx    # Full message display
│       ├── EmailDrawer.jsx        # Main drawer container
│       └── index.js               # Exports
├── hooks/
│   └── useEmailMessaging.js       # Message management hook
└── pages/
    ├── applicants/ApplicationTrack/components/
    │   └── ApplicantEmailExample.jsx
    ├── Navigation/EvaluatorNavigation/
    │   └── EvaluatorEmailInterface.jsx
    └── Navigation/ProgramAdminNavigation/
        └── ProgramAdminEmailInterface.jsx
```

---

## 📋 Integration Guide

### For Applicants

**File:** `src/pages/applicants/ApplicationTrack/index.jsx`

```jsx
// 1. Import the email interface
import ApplicantEmailExample from "./components/ApplicantEmailExample"

// 2. Replace the existing Mail icon and ChatDrawer with:
<ApplicantEmailExample 
  applicantId={applicantId} 
  colors={colors} 
/>
```

### For Evaluators

**File:** `src/components/Navigation/EvaluatorNavigation/index.jsx`

```jsx
// 1. Import
import EvaluatorEmailInterface from "./EvaluatorEmailInterface"

// 2. Add to navigation
<EvaluatorEmailInterface 
  evaluatorId={evaluatorId} 
  colors={colors} 
/>
```

### For Program Admins

**File:** `src/components/Navigation/ProgramAdminNavigation/index.jsx`

```jsx
// 1. Import
import ProgramAdminEmailInterface from "./ProgramAdminEmailInterface"

// 2. Add to navigation
<ProgramAdminEmailInterface 
  adminId={adminId} 
  colors={colors} 
/>
```

---

## 🔧 How It Works

### Message Format

The system stores emails as **JSON strings** in the existing `content` field:

```javascript
// Sent to backend
{
  content: '{"subject": "Application Inquiry", "body": "I have a question..."}'
}

// Parsed on frontend
{
  subject: "Application Inquiry",
  body: "I have a question..."
}
```

**Backward Compatibility**: Old messages without JSON structure will display as:
- Subject: `(No Subject)`
- Body: `<original content>`

### Hook Usage

```jsx
import useEmailMessaging from "../hooks/useEmailMessaging"

const {
  allMessages,        // All messages (sent + received)
  inboxMessages,      // Received messages only
  sentMessages,       // Sent messages only
  loading,            // Loading state
  sending,            // Sending state
  error,              // Error message
  sendEmail,          // Function to send email
  deleteEmail,        // Function to delete email
  fetchAllMessages,   // Function to refresh
} = useEmailMessaging(userId, userType)  // userType: 'APPLICANT', 'EVALUATOR', 'PROGRAM_ADMIN'
```

### Sending an Email

```jsx
const success = await sendEmail(
  recipientId,      // ID of recipient
  recipientType,    // 'APPLICANT', 'EVALUATOR', or 'PROGRAM_ADMIN'
  subject,          // Email subject
  body              // Email body
)
```

---

## 🎨 Customization

### Colors

All components accept a `colors` prop with this structure:

```javascript
const colors = {
  primary: { main: "#800000", dark: "#5c0000" },
  secondary: { main: "#d4af37" },
  neutral: {
    50: "#faf9f7",
    100: "#f5f3f0",
    // ... up to 900
  },
  accent: {
    info: "#1565c0",
    error: "#c62828"
  }
}
```

### Component Props

#### EmailDrawer
```jsx
<EmailDrawer
  open={boolean}              // Control visibility
  onClose={function}          // Close handler
  allMessages={array}         // All messages
  loading={boolean}           // Loading state
  onRefresh={function}        // Refresh handler
  onSendEmail={function}      // Send handler (recipientId, recipientType, subject, body) => Promise<boolean>
  onDeleteEmail={function}    // Delete handler (messageId) => Promise<boolean>
  sending={boolean}           // Sending state
  colors={object}             // Theme colors
  currentUserType={string}    // 'APPLICANT', 'EVALUATOR', 'PROGRAM_ADMIN'
/>
```

---

## 🔄 Migration from Chat

### Step-by-Step Migration

1. **Keep both systems** during transition
2. **Add email components** alongside chat
3. **Test thoroughly** with all user types
4. **Switch users gradually** (optional feature flag)
5. **Remove chat components** when ready

### Before (Chat)
```jsx
<ChatDrawer
  open={inboxOpen}
  onClose={handleInboxClose}
  chatList={chatList}
  // ... many props
/>
```

### After (Email)
```jsx
<ApplicantEmailExample 
  applicantId={applicantId} 
  colors={colors} 
/>
```

Much simpler! The hook handles all state management internally.

---

## 🐛 Troubleshooting

### Issue: Messages not showing subject

**Cause**: Old messages stored as plain text  
**Solution**: Components auto-detect and show "(No Subject)"

### Issue: Unread count not persisting

**Cause**: No backend `isRead` field  
**Solution**: Currently tracked only in session. To persist, add `isRead` boolean to backend Message model.

### Issue: Can't send to multiple recipients

**Cause**: Backend only supports 1:1 conversations  
**Solution**: Send multiple individual emails (loop through recipients)

### Issue: No attachments option

**Cause**: Backend has no file upload for messages  
**Solution**: Would need to implement file upload API endpoint

---

## 📈 Future Enhancements

### Possible Additions (Client-side only):

1. **Local Drafts** - Save to localStorage
2. **Client-side Search** - Filter messages by keyword
3. **Sorting** - By date, sender, subject
4. **Bulk Actions** - Select multiple for deletion
5. **Export** - Download messages as PDF/CSV
6. **Keyboard Shortcuts** - Navigate with keys
7. **Rich Text Editor** - Format message body

### Requires Backend Changes:

1. **File Attachments** - Add file upload endpoints
2. **Read Status** - Add `isRead` field to Message model
3. **CC/BCC** - Modify to support multiple recipients
4. **Server-side Search** - Add search endpoint
5. **Priority Levels** - Add priority field
6. **Labels/Folders** - Add categorization system

---

## 🧪 Testing

### Test Scenarios

1. **Send Email**: Compose and send to different user types
2. **Reply**: Reply to received emails
3. **View Folders**: Switch between Inbox, Sent, All
4. **Delete**: Remove messages
5. **Unread Count**: Badge updates correctly
6. **Backward Compat**: Old messages display properly
7. **Responsive**: Test on mobile, tablet, desktop

---

## 📞 Support

For questions or issues with the email system:

1. Check this README
2. Review component comments
3. Inspect browser console for errors
4. Verify backend API is responding

---

## ✅ Summary

You now have a **fully functional email-style messaging system** that:

- Uses your existing backend without modifications
- Provides a professional email interface
- Supports subject lines and proper formatting
- Works for all user types (Applicants, Evaluators, Admins)
- Is easy to integrate and customize

**Next Steps:**
1. Choose a page to integrate first (recommend: Applicants)
2. Import and add the appropriate email interface component
3. Test send/receive/reply functionality
4. Roll out to other user types
5. Remove old chat components when ready

Enjoy your new email system! 📧
