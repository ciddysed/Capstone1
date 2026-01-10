# Chat Notification Integration Guide

## How Chat Notifications Work

When you click a chat notification, it will now automatically:
1. ✅ Open the inbox drawer
2. ✅ Load the chat list
3. ✅ Open the specific conversation
4. ✅ Mark the notification as read

## Chat Notification Format

For a notification to trigger the chat feature, the notification action must have this structure:

```json
{
  "type": "OPEN_CHAT",
  "chatData": {
    "participantId": 123,
    "participantName": "John Doe",
    "participantRole": "EVALUATOR"  // or "PROGRAM_ADMIN"
  }
}
```

### Alternative Detection

The system will also detect chat notifications if:
- `notification.type === 'chat'`
- `notification.title` contains "message" or "Message"

## Backend Integration

When creating a chat notification in your backend, use this format:

```java
// Example: Creating a notification when a new message is received
Notification notification = new Notification();
notification.setTitle("New message from " + senderName);
notification.setMessage(messageContent);
notification.setType("chat"); // or "info", "success", etc.

// IMPORTANT: Set the action field
Map<String, Object> chatData = new HashMap<>();
chatData.put("participantId", senderId);
chatData.put("participantName", senderName);
chatData.put("participantRole", senderRole); // "EVALUATOR" or "PROGRAM_ADMIN"

Map<String, Object> action = new HashMap<>();
action.put("type", "OPEN_CHAT");
action.put("chatData", chatData);

notification.setAction(objectMapper.writeValueAsString(action));
```

## Testing in Browser Console

To test the chat opening functionality manually, open your browser console and run:

```javascript
// Test opening a conversation with an evaluator
window.applicantOpenConversation({
  participantId: 1,
  participantName: "Test Evaluator",
  participantRole: "EVALUATOR"
});

// Or dispatch the custom event
window.dispatchEvent(new CustomEvent('applicant:openConversation', {
  detail: {
    participantId: 1,
    participantName: "Test Admin",
    participantRole: "PROGRAM_ADMIN"
  }
}));
```

## Example Chat Notification from API

```json
{
  "id": 123,
  "title": "New message from Rea V San",
  "message": "Hello, Applicant!",
  "type": "chat",
  "read": false,
  "createdAt": "2026-01-11T10:30:00Z",
  "action": "{\"type\":\"OPEN_CHAT\",\"chatData\":{\"participantId\":5,\"participantName\":\"Rea V San\",\"participantRole\":\"EVALUATOR\"}}"
}
```

## Troubleshooting

### Notification doesn't open chat
1. Check browser console for logs: "Opening conversation: {object}"
2. Verify the notification action has the correct structure
3. Make sure you're on the ApplicationTrack page
4. Check that `window.applicantOpenConversation` exists in console

### Chat opens but no conversation shows
1. Verify the participantId is correct
2. Check network tab for API calls to conversation endpoints
3. Ensure BACKEND_URL is configured correctly
4. Verify the conversation API returns data

### Need to debug?
Add these console logs in your code:
```javascript
console.log("Notification clicked:", notification);
console.log("Action object:", actionObj);
console.log("Is chat notification:", isChatNotification);
```
