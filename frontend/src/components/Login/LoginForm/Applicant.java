package com.caps.eteeapp.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Data
@Entity
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicantId;

    private String firstName;

    private String middleInitial;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String contactNumber;

    @Lob
    private String address;

    @Lob
    private String profileDetails;

    private String password;

    private String passwordResetToken;

    @Temporal(TemporalType.TIMESTAMP)
    private Date passwordResetTokenExpiry;

    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
