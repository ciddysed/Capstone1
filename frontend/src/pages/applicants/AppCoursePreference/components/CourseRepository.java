package com.caps.eteeapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.caps.eteeapp.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Find courses by department ID using correct method naming
    List<Course> findByDepartment_DepartmentId(Long departmentId);
}
