package com.caps.eteeapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class ApplicationCoursePreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long preferenceId;

    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false) // Reference applicantId instead of applicationId
    private Applicant applicant;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PriorityOrder priorityOrder;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum PriorityOrder {
        FIRST, SECOND, THIRD
    }

    public enum Status {
        PENDING, REVIEWED, ACCEPTED, REJECTED
    }
}
