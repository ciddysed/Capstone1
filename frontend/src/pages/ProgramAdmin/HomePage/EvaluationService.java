package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.model.Course;
import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.ApplicationCoursePreferenceRepository;
import com.caps.eteeapp.repository.CourseRepository;
import com.caps.eteeapp.repository.DepartmentRepository;
import com.caps.eteeapp.repository.EvaluationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class EvaluationService {

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private ApplicationCoursePreferenceRepository preferenceRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private CourseRepository courseRepository;

    // Method to get all evaluations
    public List<Evaluation> getAllEvaluations() {
        return evaluationRepository.findAll();
    }
    
    // Method to get evaluations by evaluator ID
    public List<Evaluation> getEvaluationsByEvaluatorId(Long evaluatorId) {
        return evaluationRepository.findByEvaluator_EvaluatorId(evaluatorId);
    }

    // Method to get evaluations by applicant ID
    public List<Evaluation> getEvaluationsByApplicantId(Long applicantId) {
        return evaluationRepository.findByApplicant_ApplicantId(applicantId);
    }

    // Method to get pending evaluations
    public List<Evaluation> getPendingEvaluations() {
        return evaluationRepository.findByEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
    }
    
    // Find evaluation by ID
    public Optional<Evaluation> findEvaluationById(Long evaluationId) {
        return evaluationRepository.findById(evaluationId);
    }

    // Find existing evaluation by applicant, course, and evaluator
    public Optional<Evaluation> findExistingEvaluation(Long applicantId, Long courseId, Long evaluatorId) {
        return evaluationRepository.findByApplicant_ApplicantIdAndCourse_CourseIdAndEvaluator_EvaluatorId(
            applicantId, courseId, evaluatorId);
    }
    
    // Update evaluation status
    public Evaluation updateEvaluationStatus(Evaluation evaluation, Evaluation.EvaluationStatus status) {
        evaluation.setEvaluationStatus(status);
        evaluation.setDateEvaluated(new Date());
        return evaluationRepository.save(evaluation);
    }

    // Create a new evaluation
    public Evaluation createEvaluation(Evaluation evaluation) {
        evaluation.setDateEvaluated(new Date());
        return evaluationRepository.save(evaluation);
    }

    // Update an evaluation
    public Evaluation updateEvaluation(Evaluation existingEvaluation, Evaluation updatedEvaluation) {
        existingEvaluation.setEvaluationStatus(updatedEvaluation.getEvaluationStatus());
        existingEvaluation.setComments(updatedEvaluation.getComments());
        existingEvaluation.setDateEvaluated(new Date());
        existingEvaluation.setRecommendation(updatedEvaluation.getRecommendation());
        if (updatedEvaluation.getEvaluator() != null) {
            existingEvaluation.setEvaluator(updatedEvaluation.getEvaluator());
        }
        return evaluationRepository.save(existingEvaluation);
    }
    
    // Forward applicant to evaluation
    public List<Evaluation> forwardApplicant(Long applicantId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        
        if (!applicantOpt.isPresent()) {
            throw new RuntimeException("Applicant not found");
        }
        
        Applicant applicant = applicantOpt.get();
        
        // Get course preferences for the applicant
        List<ApplicationCoursePreference> preferences = 
            preferenceRepository.findByApplicant_ApplicantId(applicantId);
        
        // Create evaluations for each preference
        List<Evaluation> evaluations = new ArrayList<>();
        for (ApplicationCoursePreference preference : preferences) {
            Evaluation evaluation = new Evaluation();
            evaluation.setApplicant(applicant);
            evaluation.setCourse(preference.getCourse());
            evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
            evaluation.setDateEvaluated(new Date());
            
            // If the course has a department with a head evaluator, assign them
            Department department = preference.getCourse().getDepartment();
            if (department != null && department.getDepartmentHead() != null) {
                evaluation.setEvaluator(department.getDepartmentHead());
            }
            
            evaluations.add(evaluationRepository.save(evaluation));
        }
        
        return evaluations;
    }
    
    // Forward applicant to a specific department
    public List<Evaluation> forwardApplicantToDepartment(Long applicantId, Long departmentId) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        
        if (!applicantOpt.isPresent() || !departmentOpt.isPresent()) {
            throw new RuntimeException("Applicant or Department not found");
        }
        
        Applicant applicant = applicantOpt.get();
        Department department = departmentOpt.get();
        
        // Get course preferences for the applicant
        List<ApplicationCoursePreference> preferences = 
            preferenceRepository.findByApplicant_ApplicantId(applicant.getApplicantId());
        
        // Filter preferences by department
        List<ApplicationCoursePreference> departmentPreferences = new ArrayList<>();
        for (ApplicationCoursePreference preference : preferences) {
            if (preference.getCourse().getDepartment().getDepartmentId().equals(departmentId)) {
                departmentPreferences.add(preference);
            }
        }
        
        // If no preferences for this department, use all department courses
        if (departmentPreferences.isEmpty()) {
            List<Course> departmentCourses = courseRepository.findByDepartment_DepartmentId(departmentId);
            
            // Create evaluations for each course in the department
            List<Evaluation> evaluations = new ArrayList<>();
            for (Course course : departmentCourses) {
                Evaluation evaluation = new Evaluation();
                evaluation.setApplicant(applicant);
                evaluation.setCourse(course);
                evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                evaluation.setDateEvaluated(new Date());
                
                // If the department has a head evaluator, assign them
                if (department.getDepartmentHead() != null) {
                    evaluation.setEvaluator(department.getDepartmentHead());
                }
                
                evaluations.add(evaluationRepository.save(evaluation));
            }
            
            return evaluations;
        }
        
        // Create evaluations for each preference in the department
        List<Evaluation> evaluations = new ArrayList<>();
        for (ApplicationCoursePreference preference : departmentPreferences) {
            Evaluation evaluation = new Evaluation();
            evaluation.setApplicant(applicant);
            evaluation.setCourse(preference.getCourse());
            evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
            evaluation.setDateEvaluated(new Date());
            
            // If the department has a head evaluator, assign them
            if (department.getDepartmentHead() != null) {
                evaluation.setEvaluator(department.getDepartmentHead());
            }
            
            evaluations.add(evaluationRepository.save(evaluation));
        }
        
        return evaluations;
    }
}
