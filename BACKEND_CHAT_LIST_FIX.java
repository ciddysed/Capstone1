/**
 * BACKEND FIX REQUIRED
 * ====================
 * 
 * The chat-list API endpoint needs to be updated to include participant IDs.
 * 
 * Current Response (INCOMPLETE):
 * [
 *   {
 *     "participantName": "Rea V San",
 *     "participantRole": "EVALUATOR",
 *     "lastMessageContent": "Hello!",
 *     "lastMessageTimestamp": "2026-01-10T23:02:24.563+00:00",
 *     "unread": true
 *   }
 * ]
 * 
 * Required Response (COMPLETE):
 * [
 *   {
 *     "participantId": 5,              // <-- ADD THIS
 *     "participantName": "Rea V San",
 *     "participantRole": "EVALUATOR",
 *     "lastMessageContent": "Hello!",
 *     "lastMessageTimestamp": "2026-01-10T23:02:24.563+00:00",
 *     "unread": true
 *   }
 * ]
 * 
 * Backend Java Example:
 * 
 * @GetMapping("/api/messages/inbox/applicant/chat-list")
 * public ResponseEntity<List<ChatListItem>> getChatList(@RequestParam Long applicantId) {
 *     List<ChatListItem> chatList = new ArrayList<>();
 *     
 *     // Get all messages for this applicant
 *     List<Message> messages = messageRepository.findByApplicantId(applicantId);
 *     
 *     // Group by participant and get latest message
 *     Map<String, Message> latestMessages = new HashMap<>();
 *     
 *     for (Message msg : messages) {
 *         String key;
 *         Long participantId;
 *         String participantName;
 *         String participantRole;
 *         
 *         if (msg.getSenderType().equals("EVALUATOR")) {
 *             participantId = msg.getSenderEvaluator().getEvaluatorId();  // IMPORTANT!
 *             participantName = msg.getSenderEvaluator().getName();
 *             participantRole = "EVALUATOR";
 *             key = "EVALUATOR_" + participantId;
 *         } else if (msg.getSenderType().equals("PROGRAM_ADMIN")) {
 *             participantId = msg.getSenderAdmin().getAdminId();  // IMPORTANT!
 *             participantName = msg.getSenderAdmin().getName();
 *             participantRole = "PROGRAM_ADMIN";
 *             key = "ADMIN_" + participantId;
 *         } else {
 *             continue; // Skip applicant's own messages
 *         }
 *         
 *         if (!latestMessages.containsKey(key) || 
 *             msg.getSentAt().after(latestMessages.get(key).getSentAt())) {
 *             latestMessages.put(key, msg);
 *         }
 *         
 *         ChatListItem item = new ChatListItem();
 *         item.setParticipantId(participantId);  // <-- CRUCIAL LINE
 *         item.setParticipantName(participantName);
 *         item.setParticipantRole(participantRole);
 *         item.setLastMessageContent(msg.getContent());
 *         item.setLastMessageTimestamp(msg.getSentAt());
 *         item.setUnread(determineIfUnread(msg, applicantId));
 *         
 *         chatList.add(item);
 *     }
 *     
 *     return ResponseEntity.ok(chatList);
 * }
 * 
 * ChatListItem DTO:
 * 
 * public class ChatListItem {
 *     private Long participantId;        // <-- ADD THIS FIELD
 *     private String participantName;
 *     private String participantRole;
 *     private String lastMessageContent;
 *     private Date lastMessageTimestamp;
 *     private Boolean unread;
 *     
 *     // Getters and setters...
 * }
 */
