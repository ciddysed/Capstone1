package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Subject;
import com.caps.eteeapp.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    @Autowired
    private SubjectRepository subjectRepository;

    public Subject createSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public List<Subject> getSubjectsBySemester(Long semesterId) {
        return subjectRepository.findBySemester_Id(semesterId);
    }
}
