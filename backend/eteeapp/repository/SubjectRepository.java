package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    List<Subject> findBySemester_Id(Long semesterId);
    
    Optional<Subject> findBySubjectCode(String subjectCode);
    
    List<Subject> findByDescriptiveTitleContainingIgnoreCase(String title);
    
    List<Subject> findBySemester_Curriculum_Id(Long curriculumId);
    
    List<Subject> findBySemester_YearLevel(Integer yearLevel);
}
