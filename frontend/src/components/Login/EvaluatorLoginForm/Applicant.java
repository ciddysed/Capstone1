package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

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

    @Temporal(TemporalType.DATE)
    private Date dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
