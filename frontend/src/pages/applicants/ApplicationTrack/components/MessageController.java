package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Message;
import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.model.ProgramAdmin;
import com.caps.eteeapp.service.MessageService;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.EvaluatorRepository;
import com.caps.eteeapp.repository.ProgramAdminRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final ApplicantRepository applicantRepository;
    private final EvaluatorRepository evaluatorRepository;
    private final ProgramAdminRepository programAdminRepository;

    public MessageController(
        MessageService messageService,
        ApplicantRepository applicantRepository,
        EvaluatorRepository evaluatorRepository,
        ProgramAdminRepository programAdminRepository
    ) {
        this.messageService = messageService;
        this.applicantRepository = applicantRepository;
        this.evaluatorRepository = evaluatorRepository;
        this.programAdminRepository = programAdminRepository;
    }

    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        // Resolve sender entities
        if (message.getSenderAdmin() != null && message.getSenderAdmin().getAdminId() != null) {
            ProgramAdmin admin = programAdminRepository.findById(message.getSenderAdmin().getAdminId()).orElse(null);
            message.setSenderAdmin(admin);
        }
        if (message.getSenderApplicant() != null && message.getSenderApplicant().getApplicantId() != null) {
            Applicant applicant = applicantRepository.findById(message.getSenderApplicant().getApplicantId()).orElse(null);
            message.setSenderApplicant(applicant);
        }
        if (message.getSenderEvaluator() != null && message.getSenderEvaluator().getEvaluatorId() != null) {
            Evaluator evaluator = evaluatorRepository.findById(message.getSenderEvaluator().getEvaluatorId()).orElse(null);
            message.setSenderEvaluator(evaluator);
        }

        // Resolve recipient entities
        if (message.getRecipientAdmin() != null && message.getRecipientAdmin().getAdminId() != null) {
            ProgramAdmin admin = programAdminRepository.findById(message.getRecipientAdmin().getAdminId()).orElse(null);
            message.setRecipientAdmin(admin);
        }
        if (message.getRecipientApplicant() != null && message.getRecipientApplicant().getApplicantId() != null) {
            Applicant applicant = applicantRepository.findById(message.getRecipientApplicant().getApplicantId()).orElse(null);
            message.setRecipientApplicant(applicant);
        }
        if (message.getRecipientEvaluator() != null && message.getRecipientEvaluator().getEvaluatorId() != null) {
            Evaluator evaluator = evaluatorRepository.findById(message.getRecipientEvaluator().getEvaluatorId()).orElse(null);
            message.setRecipientEvaluator(evaluator);
        }

        // Now save with managed entities
        return messageService.sendMessage(message);
    }

    @GetMapping("/conversation/applicant-evaluator")
    public List<Message> getApplicantEvaluatorConversation(
        @RequestParam Long applicantId,
        @RequestParam Long evaluatorId
    ) {
        Applicant applicant = applicantRepository.findById(applicantId).orElse(null);
        Evaluator evaluator = evaluatorRepository.findById(evaluatorId).orElse(null);
        return messageService.getApplicantEvaluatorConversation(applicant, evaluator);
    }

    @GetMapping("/conversation/applicant-admin")
    public List<Message> getApplicantAdminConversation(
        @RequestParam Long applicantId,
        @RequestParam Long adminId
    ) {
        Applicant applicant = applicantRepository.findById(applicantId).orElse(null);
        ProgramAdmin admin = programAdminRepository.findById(adminId).orElse(null);
        return messageService.getApplicantAdminConversation(applicant, admin);
    }

    @GetMapping("/conversation/evaluator-admin")
    public List<Message> getEvaluatorAdminConversation(
        @RequestParam Long evaluatorId,
        @RequestParam Long adminId
    ) {
        Evaluator evaluator = evaluatorRepository.findById(evaluatorId).orElse(null);
        ProgramAdmin admin = programAdminRepository.findById(adminId).orElse(null);
        return messageService.getEvaluatorAdminConversation(evaluator, admin);
    }

    @GetMapping("/inbox/applicant")
    public List<Message> getApplicantInbox(@RequestParam Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId).orElse(null);
        return messageService.getApplicantInbox(applicant);
    }

    @GetMapping("/inbox/evaluator")
    public List<Message> getEvaluatorInbox(@RequestParam Long evaluatorId) {
        Evaluator evaluator = evaluatorRepository.findById(evaluatorId).orElse(null);
        return messageService.getEvaluatorInbox(evaluator);
    }

    @GetMapping("/inbox/admin")
    public List<Message> getAdminInbox(@RequestParam Long adminId) {
        ProgramAdmin admin = programAdminRepository.findById(adminId).orElse(null);
        return messageService.getAdminInbox(admin);
    }

    @DeleteMapping("/{messageId}")
    public void deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
    }

    @GetMapping("/inbox/applicant/chat-list")
    public ResponseEntity<List<Map<String, Object>>> getApplicantChatList(@RequestParam Long applicantId) {
        Applicant applicant = applicantRepository.findById(applicantId).orElse(null);
        if (applicant == null) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(messageService.getApplicantInbox(applicant));
        allMessages.addAll(messageService.getApplicantAdminConversation(applicant, null)); // fallback for admin-initiated
        allMessages.addAll(messageService.getApplicantEvaluatorConversation(applicant, null)); // fallback for evaluator-initiated

        // Collect all messages where applicant is either sender or recipient
        allMessages = allMessages.stream()
            .filter(m -> (m.getSenderApplicant() != null && m.getSenderApplicant().getApplicantId().equals(applicantId)) ||
                         (m.getRecipientApplicant() != null && m.getRecipientApplicant().getApplicantId().equals(applicantId)))
            .collect(Collectors.toList());

        // Group by conversation partner (evaluator or admin)
        Map<String, List<Message>> conversationMap = new HashMap<>();
        for (Message m : allMessages) {
            String key = null;
            String role = null;
            String name = null;
            if (m.getSenderApplicant() != null && m.getSenderApplicant().getApplicantId().equals(applicantId)) {
                // applicant is sender, so group by recipient
                if (m.getRecipientEvaluator() != null) {
                    key = "EVALUATOR_" + m.getRecipientEvaluator().getEvaluatorId();
                    role = "EVALUATOR";
                    name = m.getRecipientEvaluator().getName();
                } else if (m.getRecipientAdmin() != null) {
                    key = "ADMIN_" + m.getRecipientAdmin().getAdminId();
                    role = "PROGRAM_ADMIN";
                    name = m.getRecipientAdmin().getName();
                }
            } else {
                // applicant is recipient, so group by sender
                if (m.getSenderEvaluator() != null) {
                    key = "EVALUATOR_" + m.getSenderEvaluator().getEvaluatorId();
                    role = "EVALUATOR";
                    name = m.getSenderEvaluator().getName();
                } else if (m.getSenderAdmin() != null) {
                    key = "ADMIN_" + m.getSenderAdmin().getAdminId();
                    role = "PROGRAM_ADMIN";
                    name = m.getSenderAdmin().getName();
                }
            }
            if (key != null) {
                conversationMap.computeIfAbsent(key, k -> new ArrayList<>()).add(m);
            }
        }

        List<Map<String, Object>> chatList = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : conversationMap.entrySet()) {
            List<Message> messages = entry.getValue();
            messages.sort(Comparator.comparing(Message::getSentAt).reversed());
            Message lastMessage = messages.get(0);

            String role = null;
            String name = null;
            if (lastMessage.getSenderApplicant() != null && lastMessage.getSenderApplicant().getApplicantId().equals(applicantId)) {
                if (lastMessage.getRecipientEvaluator() != null) {
                    role = "EVALUATOR";
                    name = lastMessage.getRecipientEvaluator().getName();
                } else if (lastMessage.getRecipientAdmin() != null) {
                    role = "PROGRAM_ADMIN";
                    name = lastMessage.getRecipientAdmin().getName();
                }
            } else {
                if (lastMessage.getSenderEvaluator() != null) {
                    role = "EVALUATOR";
                    name = lastMessage.getSenderEvaluator().getName();
                } else if (lastMessage.getSenderAdmin() != null) {
                    role = "PROGRAM_ADMIN";
                    name = lastMessage.getSenderAdmin().getName();
                }
            }

            // Unread: any message in this conversation where applicant is recipient and (optionally) you can add a 'read' flag to Message
            boolean unread = messages.stream().anyMatch(m ->
                m.getRecipientApplicant() != null &&
                m.getRecipientApplicant().getApplicantId().equals(applicantId)
                // && !Boolean.TRUE.equals(m.getRead()) // Uncomment if you add a 'read' field
            );

            Map<String, Object> chatItem = new HashMap<>();
            chatItem.put("participantName", name);
            chatItem.put("participantRole", role);
            chatItem.put("lastMessageContent", lastMessage.getContent());
            chatItem.put("lastMessageTimestamp", lastMessage.getSentAt());
            chatItem.put("unread", unread);

            chatList.add(chatItem);
        }

        // Sort by last message timestamp descending
        chatList.sort((a, b) -> {
            Object t1 = a.get("lastMessageTimestamp");
            Object t2 = b.get("lastMessageTimestamp");
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return ((Comparable) t2).compareTo(t1);
        });

        return ResponseEntity.ok(chatList);
    }

    @GetMapping("/inbox/evaluator/chat-list")
    public ResponseEntity<List<Map<String, Object>>> getEvaluatorChatList(@RequestParam Long evaluatorId) {
        Evaluator evaluator = evaluatorRepository.findById(evaluatorId).orElse(null);
        if (evaluator == null) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(messageService.getEvaluatorInbox(evaluator));
        allMessages.addAll(messageService.getApplicantEvaluatorConversation(null, evaluator)); // fallback for applicant-initiated
        allMessages.addAll(messageService.getEvaluatorAdminConversation(evaluator, null)); // fallback for admin-initiated

        // Collect all messages where evaluator is either sender or recipient
        allMessages = allMessages.stream()
            .filter(m -> (m.getSenderEvaluator() != null && m.getSenderEvaluator().getEvaluatorId().equals(evaluatorId)) ||
                         (m.getRecipientEvaluator() != null && m.getRecipientEvaluator().getEvaluatorId().equals(evaluatorId)))
            .collect(Collectors.toList());

        // Group by conversation partner (applicant or admin)
        Map<String, List<Message>> conversationMap = new HashMap<>();
        for (Message m : allMessages) {
            String key = null;
            String role = null;
            String name = null;
            if (m.getSenderEvaluator() != null && m.getSenderEvaluator().getEvaluatorId().equals(evaluatorId)) {
                // evaluator is sender, so group by recipient
                if (m.getRecipientApplicant() != null) {
                    key = "APPLICANT_" + m.getRecipientApplicant().getApplicantId();
                    role = "APPLICANT";
                    name = m.getRecipientApplicant().getFirstName() + " " + m.getRecipientApplicant().getLastName();
                } else if (m.getRecipientAdmin() != null) {
                    key = "ADMIN_" + m.getRecipientAdmin().getAdminId();
                    role = "PROGRAM_ADMIN";
                    name = m.getRecipientAdmin().getName();
                }
            } else {
                // evaluator is recipient, so group by sender
                if (m.getSenderApplicant() != null) {
                    key = "APPLICANT_" + m.getSenderApplicant().getApplicantId();
                    role = "APPLICANT";
                    name = m.getSenderApplicant().getFirstName() + " " + m.getSenderApplicant().getLastName();
                } else if (m.getSenderAdmin() != null) {
                    key = "ADMIN_" + m.getSenderAdmin().getAdminId();
                    role = "PROGRAM_ADMIN";
                    name = m.getSenderAdmin().getName();
                }
            }
            if (key != null) {
                conversationMap.computeIfAbsent(key, k -> new ArrayList<>()).add(m);
            }
        }

        List<Map<String, Object>> chatList = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : conversationMap.entrySet()) {
            List<Message> messages = entry.getValue();
            messages.sort(Comparator.comparing(Message::getSentAt).reversed());
            Message lastMessage = messages.get(0);

            String role = null;
            String name = null;
            if (lastMessage.getSenderEvaluator() != null && lastMessage.getSenderEvaluator().getEvaluatorId().equals(evaluatorId)) {
                if (lastMessage.getRecipientApplicant() != null) {
                    role = "APPLICANT";
                    name = lastMessage.getRecipientApplicant().getFirstName() + " " + lastMessage.getRecipientApplicant().getLastName();
                } else if (lastMessage.getRecipientAdmin() != null) {
                    role = "PROGRAM_ADMIN";
                    name = lastMessage.getRecipientAdmin().getName();
                }
            } else {
                if (lastMessage.getSenderApplicant() != null) {
                    role = "APPLICANT";
                    name = lastMessage.getSenderApplicant().getFirstName() + " " + lastMessage.getSenderApplicant().getLastName();
                } else if (lastMessage.getSenderAdmin() != null) {
                    role = "PROGRAM_ADMIN";
                    name = lastMessage.getSenderAdmin().getName();
                }
            }

            // Unread: any message in this conversation where evaluator is recipient
            boolean unread = messages.stream().anyMatch(m ->
                m.getRecipientEvaluator() != null &&
                m.getRecipientEvaluator().getEvaluatorId().equals(evaluatorId)
                // && !Boolean.TRUE.equals(m.getRead()) // Uncomment if you add a 'read' field
            );

            Map<String, Object> chatItem = new HashMap<>();
            chatItem.put("participantName", name);
            chatItem.put("participantRole", role);
            chatItem.put("lastMessageContent", lastMessage.getContent());
            chatItem.put("lastMessageTimestamp", lastMessage.getSentAt());
            chatItem.put("unread", unread);

            chatList.add(chatItem);
        }

        // Sort by last message timestamp descending
        chatList.sort((a, b) -> {
            Object t1 = a.get("lastMessageTimestamp");
            Object t2 = b.get("lastMessageTimestamp");
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return ((Comparable) t2).compareTo(t1);
        });

        return ResponseEntity.ok(chatList);
    }

    @GetMapping("/inbox/admin/chat-list")
    public ResponseEntity<List<Map<String, Object>>> getAdminChatList(@RequestParam Long adminId) {
        ProgramAdmin admin = programAdminRepository.findById(adminId).orElse(null);
        if (admin == null) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        List<Message> allMessages = new ArrayList<>();
        allMessages.addAll(messageService.getAdminInbox(admin));
        allMessages.addAll(messageService.getApplicantAdminConversation(null, admin)); // fallback for applicant-initiated
        allMessages.addAll(messageService.getEvaluatorAdminConversation(null, admin)); // fallback for evaluator-initiated

        // Collect all messages where admin is either sender or recipient
        allMessages = allMessages.stream()
            .filter(m -> (m.getSenderAdmin() != null && m.getSenderAdmin().getAdminId().equals(adminId)) ||
                         (m.getRecipientAdmin() != null && m.getRecipientAdmin().getAdminId().equals(adminId)))
            .collect(Collectors.toList());

        // Group by conversation partner (applicant or evaluator)
        Map<String, List<Message>> conversationMap = new HashMap<>();
        for (Message m : allMessages) {
            String key = null;
            String role = null;
            String name = null;
            if (m.getSenderAdmin() != null && m.getSenderAdmin().getAdminId().equals(adminId)) {
                // admin is sender, so group by recipient
                if (m.getRecipientApplicant() != null) {
                    key = "APPLICANT_" + m.getRecipientApplicant().getApplicantId();
                    role = "APPLICANT";
                    name = m.getRecipientApplicant().getFirstName() + " " + m.getRecipientApplicant().getLastName();
                } else if (m.getRecipientEvaluator() != null) {
                    key = "EVALUATOR_" + m.getRecipientEvaluator().getEvaluatorId();
                    role = "EVALUATOR";
                    name = m.getRecipientEvaluator().getName();
                }
            } else {
                // admin is recipient, so group by sender
                if (m.getSenderApplicant() != null) {
                    key = "APPLICANT_" + m.getSenderApplicant().getApplicantId();
                    role = "APPLICANT";
                    name = m.getSenderApplicant().getFirstName() + " " + m.getSenderApplicant().getLastName();
                } else if (m.getSenderEvaluator() != null) {
                    key = "EVALUATOR_" + m.getSenderEvaluator().getEvaluatorId();
                    role = "EVALUATOR";
                    name = m.getSenderEvaluator().getName();
                }
            }
            if (key != null) {
                conversationMap.computeIfAbsent(key, k -> new ArrayList<>()).add(m);
            }
        }

        List<Map<String, Object>> chatList = new ArrayList<>();
        for (Map.Entry<String, List<Message>> entry : conversationMap.entrySet()) {
            List<Message> messages = entry.getValue();
            messages.sort(Comparator.comparing(Message::getSentAt).reversed());
            Message lastMessage = messages.get(0);

            String role = null;
            String name = null;
            if (lastMessage.getSenderAdmin() != null && lastMessage.getSenderAdmin().getAdminId().equals(adminId)) {
                if (lastMessage.getRecipientApplicant() != null) {
                    role = "APPLICANT";
                    name = lastMessage.getRecipientApplicant().getFirstName() + " " + lastMessage.getRecipientApplicant().getLastName();
                } else if (lastMessage.getRecipientEvaluator() != null) {
                    role = "EVALUATOR";
                    name = lastMessage.getRecipientEvaluator().getName();
                }
            } else {
                if (lastMessage.getSenderApplicant() != null) {
                    role = "APPLICANT";
                    name = lastMessage.getSenderApplicant().getFirstName() + " " + lastMessage.getSenderApplicant().getLastName();
                } else if (lastMessage.getSenderEvaluator() != null) {
                    role = "EVALUATOR";
                    name = lastMessage.getSenderEvaluator().getName();
                }
            }

            // Unread: any message in this conversation where admin is recipient
            boolean unread = messages.stream().anyMatch(m ->
                m.getRecipientAdmin() != null &&
                m.getRecipientAdmin().getAdminId().equals(adminId)
                // && !Boolean.TRUE.equals(m.getRead()) // Uncomment if you add a 'read' field
            );

            Map<String, Object> chatItem = new HashMap<>();
            chatItem.put("participantName", name);
            chatItem.put("participantRole", role);
            chatItem.put("lastMessageContent", lastMessage.getContent());
            chatItem.put("lastMessageTimestamp", lastMessage.getSentAt());
            chatItem.put("unread", unread);

            chatList.add(chatItem);
        }

        // Sort by last message timestamp descending
        chatList.sort((a, b) -> {
            Object t1 = a.get("lastMessageTimestamp");
            Object t2 = b.get("lastMessageTimestamp");
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return ((Comparable) t2).compareTo(t1);
        });

        return ResponseEntity.ok(chatList);
    }

    // To use this endpoint in Postman:

    // 1. Set the method to GET.
    // 2. Use the URL (replace with your actual port and IDs):
    //    http://localhost:{port}/api/messages/conversation/applicant-admin?applicantId={applicantId}&adminId={adminId}
    //    Example:
    //    http://localhost:8080/api/messages/conversation/applicant-admin?applicantId=102&adminId=1
    // 3. No request body is needed.
    // 4. Click "Send".
    // 5. The response will be a JSON array of messages between the applicant and the program admin.

    // To test the evaluator chat list endpoint in Postman:

    // 1. Set the method to GET.
    // 2. Use the URL (replace with your actual port and evaluatorId):
    //    http://localhost:{port}/api/messages/inbox/evaluator/chat-list?evaluatorId={evaluatorId}
    //    Example:
    //    http://localhost:8080/api/messages/inbox/evaluator/chat-list?evaluatorId=1
    // 3. No request body is needed.
    // 4. Click "Send".
    // 5. The response will be a JSON array of chat list items for the evaluator, each containing:
    //    - participantName
    //    - participantRole
    //    - lastMessageContent
    //    - lastMessageTimestamp
    //    - unread
}
