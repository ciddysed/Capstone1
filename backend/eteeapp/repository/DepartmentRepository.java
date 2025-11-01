package com.caps.eteeapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.caps.eteeapp.model.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    List<Department> findByIsActiveTrue();
    
    List<Department> findByDepartmentNameContainingIgnoreCase(String departmentName);
    
    Optional<Department> findByDepartmentName(String departmentName);
}


