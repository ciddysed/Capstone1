package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "applicant_id")
    private Applicant applicant;

    @Column(length = 200)
    private String title;

    @Column(length = 2000)
    private String message;

    @Column(length = 128)
    private String clientTempId;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt = new Date();

    private boolean read = false;

    public enum NotificationType {
        SUCCESS, INFO, WARNING, ERROR
    }
}
