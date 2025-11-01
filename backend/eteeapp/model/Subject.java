package com.caps.eteeapp.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

@Data
@Entity
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String subjectCode;

    @Column(nullable = false)
    private String descriptiveTitle;

    @Column(nullable = false)
    private Integer lecHours;

    @Column(nullable = false)
    private Integer labHours;

    @Column(nullable = false)
    private Double units;

    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    @JsonBackReference
    private Semester semester;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String prerequisites;
}
