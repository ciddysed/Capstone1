package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.Subject;
import com.caps.eteeapp.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        Subject createdSubject = subjectService.createSubject(subject);
        return ResponseEntity.ok(createdSubject);
    }

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<Subject>> getSubjectsBySemester(@PathVariable Long semesterId) {
        List<Subject> subjects = subjectService.getSubjectsBySemester(semesterId);
        return ResponseEntity.ok(subjects);
    }
}
