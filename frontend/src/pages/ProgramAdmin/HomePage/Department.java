package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data

@Entity
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    private String departmentName;

    @OneToOne
    @JoinColumn(name = "department_head_id")
    private Evaluator departmentHead;

    @Lob
    private String contactInfo;

    // Getters and setters...
}
