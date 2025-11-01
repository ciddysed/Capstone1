package com.caps.eteeapp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.caps.eteeapp.model.Curriculum;
import com.caps.eteeapp.service.CurriculumService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/curriculums")
public class CurriculumController {

    @Autowired
    private CurriculumService curriculumService;

    @PostMapping
    public ResponseEntity<Curriculum> createCurriculum(@RequestBody Curriculum curriculum) {
        Curriculum createdCurriculum = curriculumService.createCurriculum(curriculum);
        return ResponseEntity.ok(createdCurriculum);
    }

    @GetMapping
    public ResponseEntity<List<Curriculum>> getAllCurriculums() {
        List<Curriculum> curriculums = curriculumService.getAllCurriculums();
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Curriculum>> getActiveCurriculums() {
        List<Curriculum> activeCurriculums = curriculumService.getActiveCurriculums();
        return ResponseEntity.ok(activeCurriculums);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curriculum> getCurriculumById(@PathVariable Long id) {
        Optional<Curriculum> curriculum = curriculumService.getCurriculumById(id);
        return curriculum.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Curriculum> updateCurriculum(@PathVariable Long id, @RequestBody Curriculum curriculum) {
        try {
            Curriculum updatedCurriculum = curriculumService.updateCurriculum(id, curriculum);
            return ResponseEntity.ok(updatedCurriculum);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable Long id) {
        curriculumService.deleteCurriculum(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Curriculum>> searchCurriculums(@RequestParam String programName) {
        List<Curriculum> curriculums = curriculumService.searchByProgramName(programName);
        return ResponseEntity.ok(curriculums);
    }
}
