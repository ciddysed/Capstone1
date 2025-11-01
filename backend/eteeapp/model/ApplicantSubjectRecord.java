package com.caps.eteeapp.model;

import jakarta.persistence.*;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

@Data
@Entity
public class ApplicantSubjectRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    @JsonBackReference
    private Applicant applicant;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(length = 10)
    private String grade;

    @Column(length = 500)
    private String processOfAccreditation;

    @Column(length = 1000)
    private String substantiveBasis;

    @Temporal(TemporalType.TIMESTAMP)
    private Date recordDate = new Date();

    @Enumerated(EnumType.STRING)
    private RecordStatus status = RecordStatus.PENDING;

    public enum RecordStatus {
        PENDING, APPROVED, REJECTED
    }
}
