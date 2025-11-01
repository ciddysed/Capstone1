package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Semester;
import com.caps.eteeapp.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemesterService {

    @Autowired
    private SemesterRepository semesterRepository;

    public Semester createSemester(Semester semester) {
        return semesterRepository.save(semester);
    }

    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    public List<Semester> getSemestersByCurriculum(Long curriculumId) {
        return semesterRepository.findByCurriculum_IdOrderByYearLevelAscSemesterNumberAsc(curriculumId);
    }
}
