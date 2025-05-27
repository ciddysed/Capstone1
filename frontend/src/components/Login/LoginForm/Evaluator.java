package com.caps.eteeapp.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Evaluator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long evaluatorId;

    private String name;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(unique = true)
    private String email;

    private String contactNumber;

    private String role;

    private String password;

    private String passwordResetToken;

    @Temporal(TemporalType.TIMESTAMP)
    private Date passwordResetTokenExpiry;

    private boolean isAdmin;

    // Getters and setters...
}
