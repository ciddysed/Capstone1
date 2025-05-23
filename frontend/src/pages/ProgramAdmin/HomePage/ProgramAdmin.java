package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data

@Entity
public class ProgramAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    private String name;

    @Column(unique = true)
    private String email;

    private String contactNumber;

    private String role;

    private String password;

    // Getters and setters...
}
