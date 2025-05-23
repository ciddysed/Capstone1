package com.caps.eteeapp.model;

import jakarta.persistence.*;
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

    private boolean isAdmin;

    // Getters and setters...
}
