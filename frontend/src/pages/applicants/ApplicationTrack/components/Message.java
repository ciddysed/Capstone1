package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @Enumerated(EnumType.STRING)
    private UserType senderType;

    @ManyToOne
    @JoinColumn(name = "sender_applicant_id")
    private Applicant senderApplicant;

    @ManyToOne
    @JoinColumn(name = "sender_evaluator_id")
    private Evaluator senderEvaluator;

    @ManyToOne
    @JoinColumn(name = "sender_admin_id")
    private ProgramAdmin senderAdmin;

    @Enumerated(EnumType.STRING)
    private UserType recipientType;

    @ManyToOne
    @JoinColumn(name = "recipient_applicant_id")
    private Applicant recipientApplicant;

    @ManyToOne
    @JoinColumn(name = "recipient_evaluator_id")
    private Evaluator recipientEvaluator;

    @ManyToOne
    @JoinColumn(name = "recipient_admin_id")
    private ProgramAdmin recipientAdmin;

    @Column(columnDefinition = "text")
    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date sentAt = new Date();

    public enum UserType {
        APPLICANT, PROGRAM_ADMIN, EVALUATOR
    }
}
