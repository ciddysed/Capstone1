package com.caps.eteeapp.model;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import lombok.Data;

@Data
@Entity
public class ApplicantApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @OneToOne
    @JoinColumn(name = "applicant_id", unique = true)
    private Applicant applicant;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateSubmitted;

    // Add upload_date field to fix date display issues
    @Temporal(TemporalType.TIMESTAMP)
    private Date uploadDate;

    private String status;

    @ManyToOne
    @JoinColumn(name = "final_course_id")
    private Course finalCourse;

    private int totalCoursesSelected;

    @Lob
    private String applicationNotes;

    // Add transient fields to hold related data that won't be persisted in this table
    @Transient
    private List<ApplicationCoursePreference> coursePreferences;

    @Transient
    private List<Document> documents;

    // Pre-persist hook to ensure uploadDate is set when creating new applications
    @PrePersist
    protected void onCreate() {
        if (uploadDate == null) {
            uploadDate = new Date();
        }
        if (dateSubmitted == null) {
            dateSubmitted = uploadDate;
        }
    }
}
