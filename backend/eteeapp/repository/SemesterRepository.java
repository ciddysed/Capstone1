package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    
    List<Semester> findByCurriculum_Id(Long curriculumId);
    
    List<Semester> findByYearLevel(Integer yearLevel);
    
    List<Semester> findByCurriculum_IdAndYearLevel(Long curriculumId, Integer yearLevel);
    
    List<Semester> findByCurriculum_IdOrderByYearLevelAscSemesterNumberAsc(Long curriculumId);
}
