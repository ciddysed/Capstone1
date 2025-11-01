package com.caps.eteeapp.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    private String courseName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Lob
    private String description;

    private int credits;

    @Enumerated(EnumType.STRING)
    private Category category;

    public enum Category {
        TECHNICAL, NON_TECHNICAL
    }

    // Getters and setters...
}
