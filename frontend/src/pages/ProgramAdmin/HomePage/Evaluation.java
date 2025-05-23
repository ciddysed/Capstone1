package com.caps.eteeapp.model;

import jakarta.persistence.*;
import java.util.Date;
import lombok.Data;

@Data

@Entity
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long evaluationId;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private ApplicantApplication application;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "evaluator_id")
    private Evaluator evaluator;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @Enumerated(EnumType.STRING)
    private EvaluationStatus evaluationStatus;

    @Lob
    private String comments;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateEvaluated;

    @Lob
    private String recommendation;

    // Getters and setters...

    public enum EvaluationStatus {
        PENDING, APPROVED, REJECTED, UNDER_REVIEW
    }
}
