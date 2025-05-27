package com.caps.eteeapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.model.Evaluator;

@Repository
public interface EvaluatorRepository extends JpaRepository<Evaluator, Long> {

    // Find evaluator by email
    Optional<Evaluator> findByEmail(String email);
    
    // Find evaluators by department ID
    List<Evaluator> findByDepartment_DepartmentId(Long departmentId);
    
    // Find evaluators by department name
    List<Evaluator> findByDepartment_DepartmentName(String departmentName);
    
    // Find evaluators who are admins
    List<Evaluator> findByIsAdminTrue();
    
    // Find evaluators who are not admins
    List<Evaluator> findByIsAdminFalse();
    
    // Check if evaluator exists by email
    boolean existsByEmail(String email);
    
    // Find evaluator by password reset token
    Optional<Evaluator> findByPasswordResetToken(String token);
    
    // Department filtering query for evaluations only
    @Query("SELECT e FROM Evaluation e JOIN e.course c WHERE c.department = :department")
    List<Evaluation> findEvaluationsByCourseDepartment(@Param("department") Department department);
}