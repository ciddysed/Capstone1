package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Semester;
import com.caps.eteeapp.service.SemesterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    @Autowired
    private SemesterService semesterService;

    @PostMapping
    public ResponseEntity<Semester> createSemester(@RequestBody Semester semester) {
        Semester createdSemester = semesterService.createSemester(semester);
        return ResponseEntity.ok(createdSemester);
    }

    @GetMapping
    public ResponseEntity<List<Semester>> getAllSemesters() {
        List<Semester> semesters = semesterService.getAllSemesters();
        return ResponseEntity.ok(semesters);
    }

    @GetMapping("/curriculum/{curriculumId}")
    public ResponseEntity<List<Semester>> getSemestersByCurriculum(@PathVariable Long curriculumId) {
        List<Semester> semesters = semesterService.getSemestersByCurriculum(curriculumId);
        return ResponseEntity.ok(semesters);
    }
}
