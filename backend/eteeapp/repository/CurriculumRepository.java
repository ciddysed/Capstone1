package com.caps.eteeapp.repository;

import com.caps.eteeapp.model.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
    
    List<Curriculum> findByIsActiveTrue();
    
    List<Curriculum> findByProgramNameContainingIgnoreCase(String programName);
    
    Optional<Curriculum> findByProgramNameAndYearStarted(String programName, Integer yearStarted);
    
    List<Curriculum> findByYearStarted(Integer yearStarted);
}
