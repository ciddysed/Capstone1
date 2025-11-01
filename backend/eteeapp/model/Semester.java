package com.caps.eteeapp.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;

@Data
@Entity
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer yearLevel;

    @Column(nullable = false)
    private Integer semesterNumber;

    @ManyToOne
    @JoinColumn(name = "curriculum_id", nullable = false)
    @JsonBackReference
    private Curriculum curriculum;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Subject> subjects;

    @Column(length = 500)
    private String description;
}
