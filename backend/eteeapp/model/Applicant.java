package com.caps.eteeapp.model;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
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

    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ApplicantSubjectRecord> subjectRecords;

    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
