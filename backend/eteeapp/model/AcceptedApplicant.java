package com.caps.eteeapp.model;

import jakarta.persistence.*;
import java.util.Date;
import lombok.Data;

@Data
@Entity
public class AcceptedApplicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long acceptedApplicantId;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

    @ManyToOne
    @JoinColumn(name = "final_course_id", nullable = false)
    private Course finalCourse;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AcceptanceStatus status = AcceptanceStatus.ACCEPTED;

    @Temporal(TemporalType.TIMESTAMP)
    private Date acceptanceDate = new Date();

    @Column(length = 1000)
    private String remarks;

    public enum AcceptanceStatus {
        ACCEPTED, ENROLLED, WITHDRAWN
    }
}
