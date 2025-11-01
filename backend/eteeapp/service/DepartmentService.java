package com.caps.eteeapp.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentService.class);

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrue();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Optional<Department> findByDepartmentName(String departmentName) {
        logger.info("=== DEPARTMENT SERVICE: findByDepartmentName START ===");
        logger.info("Looking for department with name: '{}'", departmentName);
        
        try {
            Optional<Department> department = departmentRepository.findByDepartmentName(departmentName);
            
            if (department.isPresent()) {
                logger.info("Department found - ID: {}, Name: {}", 
                           department.get().getDepartmentId(), 
                           department.get().getDepartmentName());
            } else {
                logger.warn("No department found with name: '{}'", departmentName);
                
                // Log all available departments for debugging
                List<Department> allDepartments = departmentRepository.findAll();
                logger.info("Available departments:");
                for (Department dept : allDepartments) {
                    logger.info("  - ID: {}, Name: '{}'", dept.getDepartmentId(), dept.getDepartmentName());
                }
            }
            
            logger.info("=== DEPARTMENT SERVICE: findByDepartmentName END ===");
            return department;
        } catch (Exception e) {
            logger.error("=== DEPARTMENT SERVICE: findByDepartmentName END - ERROR ===");
            logger.error("Exception details:", e);
            throw e;
        }
    }

    public Department updateDepartment(Long id, Department updatedDepartment) {
        return departmentRepository.findById(id).map(department -> {
            department.setDepartmentName(updatedDepartment.getDepartmentName());
            department.setDescription(updatedDepartment.getDescription());
            department.setIsActive(updatedDepartment.getIsActive());
            return departmentRepository.save(department);
        }).orElseThrow(() -> new RuntimeException("Department not found with id " + id));
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public List<Department> searchByDepartmentName(String departmentName) {
        return departmentRepository.findByDepartmentNameContainingIgnoreCase(departmentName);
    }
}
