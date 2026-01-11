package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Message;
import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.model.ProgramAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Applicant <-> Evaluator
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderApplicant = :user1 AND m.recipientEvaluator = :user2) OR " +
           "(m.senderEvaluator = :user2 AND m.recipientApplicant = :user1)")
    List<Message> findApplicantEvaluatorConversation(Applicant user1, Evaluator user2);

    // Applicant <-> ProgramAdmin
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderApplicant = :user1 AND m.recipientAdmin = :user2) OR " +
           "(m.senderAdmin = :user2 AND m.recipientApplicant = :user1)")
    List<Message> findApplicantAdminConversation(Applicant user1, ProgramAdmin user2);

    // Evaluator <-> ProgramAdmin
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderEvaluator = :user1 AND m.recipientAdmin = :user2) OR " +
           "(m.senderAdmin = :user2 AND m.recipientEvaluator = :user1)")
    List<Message> findEvaluatorAdminConversation(Evaluator user1, ProgramAdmin user2);

    // Inbox for Applicant
    List<Message> findByRecipientApplicant(Applicant recipientApplicant);

    // Inbox for Evaluator
    List<Message> findByRecipientEvaluator(Evaluator recipientEvaluator);

    // Inbox for ProgramAdmin
    List<Message> findByRecipientAdmin(ProgramAdmin recipientAdmin);
}
