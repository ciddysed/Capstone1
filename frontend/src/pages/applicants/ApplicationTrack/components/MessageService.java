package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Message;
import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.model.ProgramAdmin;
import com.caps.eteeapp.repository.MessageRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getApplicantEvaluatorConversation(Applicant applicant, Evaluator evaluator) {
        return messageRepository.findApplicantEvaluatorConversation(applicant, evaluator);
    }

    public List<Message> getApplicantAdminConversation(Applicant applicant, ProgramAdmin admin) {
        return messageRepository.findApplicantAdminConversation(applicant, admin);
    }

    public List<Message> getEvaluatorAdminConversation(Evaluator evaluator, ProgramAdmin admin) {
        return messageRepository.findEvaluatorAdminConversation(evaluator, admin);
    }

    public List<Message> getApplicantInbox(Applicant applicant) {
        return messageRepository.findByRecipientApplicant(applicant);
    }

    public List<Message> getEvaluatorInbox(Evaluator evaluator) {
        return messageRepository.findByRecipientEvaluator(evaluator);
    }

    public List<Message> getAdminInbox(ProgramAdmin admin) {
        return messageRepository.findByRecipientAdmin(admin);
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}
