package com.caps.eteeapp.service;

import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.model.Course;
import com.caps.eteeapp.model.Department;
import com.caps.eteeapp.model.Evaluation;
import com.caps.eteeapp.model.Evaluator;
import com.caps.eteeapp.model.ApplicantApplication;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.ApplicationCoursePreferenceRepository;
import com.caps.eteeapp.repository.CourseRepository;
import com.caps.eteeapp.repository.DepartmentRepository;
import com.caps.eteeapp.repository.EvaluationRepository;
import com.caps.eteeapp.repository.EvaluatorRepository;
import com.caps.eteeapp.repository.ApplicantApplicationRepository;

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

    @Autowired
    private EvaluatorRepository evaluatorRepository;

    @Autowired
    private ApplicantApplicationRepository applicationRepository;

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
        if (status != Evaluation.EvaluationStatus.PENDING) {
            evaluation.setDateEvaluated(new Date());
        }
        return evaluationRepository.save(evaluation);
    }

    // Create a new evaluation
    public Evaluation createEvaluation(Evaluation evaluation) {
        if (evaluation.getEvaluationStatus() == null) {
            evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
        }
        return evaluationRepository.save(evaluation);
    }

    // Update an evaluation
    public Evaluation updateEvaluation(Evaluation existingEvaluation, Evaluation updatedEvaluation) {
        existingEvaluation.setEvaluationStatus(updatedEvaluation.getEvaluationStatus());
        existingEvaluation.setComments(updatedEvaluation.getComments());
        existingEvaluation.setRecommendation(updatedEvaluation.getRecommendation());
        if (updatedEvaluation.getEvaluationStatus() != Evaluation.EvaluationStatus.PENDING) {
            existingEvaluation.setDateEvaluated(new Date());
        }
        if (updatedEvaluation.getEvaluator() != null) {
            existingEvaluation.setEvaluator(updatedEvaluation.getEvaluator());
        }
        return evaluationRepository.save(existingEvaluation);
    }

    // New method to forward all courses for evaluation
    public int forwardAllCoursesForEvaluation(Long applicantId, List<Long> courseIds, Long applicationId) {
        try {
            // Find the applicant
            Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
            if (!applicantOpt.isPresent()) {
                throw new RuntimeException("Applicant not found with ID: " + applicantId);
            }

            // Find the application (optional, for reference)
            Optional<ApplicantApplication> applicationOpt = applicationRepository.findById(applicationId);
            ApplicantApplication application = applicationOpt.orElse(null);

            Applicant applicant = applicantOpt.get();
            int forwardedCount = 0;

            // Process each course ID
            for (Long courseId : courseIds) {
                try {
                    // Find the course
                    Optional<Course> courseOpt = courseRepository.findById(courseId);
                    if (!courseOpt.isPresent()) {
                        System.err.println("Course not found with ID: " + courseId + ", skipping...");
                        continue;
                    }

                    Course course = courseOpt.get();
                    Department department = course.getDepartment();

                    if (department == null) {
                        System.err.println("Course " + courseId + " does not belong to any department, skipping...");
                        continue;
                    }

                    // Find evaluators for the course's department
                    List<Evaluator> evaluators = evaluatorRepository.findByDepartment_DepartmentId(
                        department.getDepartmentId());

                    // If no specific evaluators found, try to use department head
                    if (evaluators.isEmpty() && department.getDepartmentHead() != null) {
                        evaluators = List.of(department.getDepartmentHead());
                    }

                    if (evaluators.isEmpty()) {
                        System.err.println("No evaluators found for department: " + 
                            department.getDepartmentName() + ", skipping course " + courseId);
                        continue;
                    }

                    // Create evaluations for each evaluator in the department
                    boolean courseForwarded = false;
                    for (Evaluator evaluator : evaluators) {
                        // Check if evaluation already exists
                        Optional<Evaluation> existingEvaluation = findExistingEvaluation(
                            applicantId, courseId, evaluator.getEvaluatorId());

                        if (!existingEvaluation.isPresent()) {
                            Evaluation evaluation = new Evaluation();
                            evaluation.setApplicant(applicant);
                            evaluation.setCourse(course);
                            evaluation.setEvaluator(evaluator);
                            evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                            
                            // Set application reference if available
                            if (application != null) {
                                evaluation.setApplication(application);
                            }
                            
                            evaluationRepository.save(evaluation);
                            courseForwarded = true;
                        }
                    }

                    if (courseForwarded) {
                        forwardedCount++;
                    }

                } catch (Exception e) {
                    System.err.println("Error forwarding course " + courseId + " for applicant " + applicantId + ": " + e.getMessage());
                    // Continue with other courses even if one fails
                }
            }

            return forwardedCount;

        } catch (Exception e) {
            System.err.println("Error in forwardAllCoursesForEvaluation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to forward courses for evaluation: " + e.getMessage(), e);
        }
    }

    // New method to support forwarding to specific course
    public List<Evaluation> forwardApplicantToCourse(Long applicantId, Long courseId) {
        try {
            // Find the applicant
            Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
            if (!applicantOpt.isPresent()) {
                throw new RuntimeException("Applicant not found with ID: " + applicantId);
            }

            // Find the course
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (!courseOpt.isPresent()) {
                throw new RuntimeException("Course not found with ID: " + courseId);
            }

            Applicant applicant = applicantOpt.get();
            Course course = courseOpt.get();
            Department department = course.getDepartment();

            if (department == null) {
                throw new RuntimeException("Course does not belong to any department");
            }

            // Find evaluators for the course's department
            List<Evaluator> evaluators = evaluatorRepository.findByDepartment_DepartmentId(
                department.getDepartmentId());

            // If no specific evaluators found, try to use department head
            if (evaluators.isEmpty() && department.getDepartmentHead() != null) {
                evaluators = List.of(department.getDepartmentHead());
            }

            if (evaluators.isEmpty()) {
                throw new RuntimeException("No evaluators found for department: " + 
                    department.getDepartmentName());
            }

            List<Evaluation> createdEvaluations = new ArrayList<>();

            // Create evaluations for each evaluator in the department
            for (Evaluator evaluator : evaluators) {
                // Check if evaluation already exists
                Optional<Evaluation> existingEvaluation = findExistingEvaluation(
                    applicantId, courseId, evaluator.getEvaluatorId());

                if (!existingEvaluation.isPresent()) {
                    Evaluation evaluation = new Evaluation();
                    evaluation.setApplicant(applicant);
                    evaluation.setCourse(course);
                    evaluation.setEvaluator(evaluator);
                    evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                    
                    Evaluation savedEvaluation = evaluationRepository.save(evaluation);
                    createdEvaluations.add(savedEvaluation);
                } else {
                    createdEvaluations.add(existingEvaluation.get());
                }
            }

            return createdEvaluations;

        } catch (Exception e) {
            System.err.println("Error in forwardApplicantToCourse: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to forward applicant to course: " + e.getMessage(), e);
        }
    }
    
    // Forward applicant to evaluation
    public List<Evaluation> forwardApplicant(Long applicantId) {
        try {
            // Find the applicant
            Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
            if (!applicantOpt.isPresent()) {
                throw new RuntimeException("Applicant not found with ID: " + applicantId);
            }

            // Get course preferences for the applicant
            List<ApplicationCoursePreference> preferences = 
                preferenceRepository.findByApplicant_ApplicantId(applicantId);
            
            // Create evaluations for each preference
            List<Evaluation> evaluations = new ArrayList<>();
            Applicant applicant = applicantOpt.get();
            
            for (ApplicationCoursePreference preference : preferences) {
                Course course = preference.getCourse();
                Department department = course.getDepartment();
                
                // If the course has a department with a head evaluator, assign them
                if (department != null && department.getDepartmentHead() != null) {
                    // Check if evaluation already exists
                    Optional<Evaluation> existingEvaluation = findExistingEvaluation(
                        applicantId, course.getCourseId(), department.getDepartmentHead().getEvaluatorId());

                    if (!existingEvaluation.isPresent()) {
                        Evaluation evaluation = new Evaluation();
                        evaluation.setApplicant(applicant);
                        evaluation.setCourse(course);
                        evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                        evaluation.setEvaluator(department.getDepartmentHead());
                        
                        evaluations.add(evaluationRepository.save(evaluation));
                    } else {
                        evaluations.add(existingEvaluation.get());
                    }
                }
            }
            
            return evaluations;

        } catch (Exception e) {
            System.err.println("Error in forwardApplicant: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to forward applicant: " + e.getMessage(), e);
        }
    }
    
    // Forward applicant to a specific department
    public List<Evaluation> forwardApplicantToDepartment(Long applicantId, Long departmentId) {
        try {
            Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
            Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
            
            if (!applicantOpt.isPresent()) {
                throw new RuntimeException("Applicant not found with ID: " + applicantId);
            }
            if (!departmentOpt.isPresent()) {
                throw new RuntimeException("Department not found with ID: " + departmentId);
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
                    // Check if evaluation already exists for department head
                    if (department.getDepartmentHead() != null) {
                        Optional<Evaluation> existingEvaluation = findExistingEvaluation(
                            applicantId, course.getCourseId(), department.getDepartmentHead().getEvaluatorId());

                        if (!existingEvaluation.isPresent()) {
                            Evaluation evaluation = new Evaluation();
                            evaluation.setApplicant(applicant);
                            evaluation.setCourse(course);
                            evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                            evaluation.setEvaluator(department.getDepartmentHead());
                            
                            evaluations.add(evaluationRepository.save(evaluation));
                        } else {
                            evaluations.add(existingEvaluation.get());
                        }
                    }
                }
                
                return evaluations;
            }
            
            // Create evaluations for each preference in the department
            List<Evaluation> evaluations = new ArrayList<>();
            for (ApplicationCoursePreference preference : departmentPreferences) {
                // Check if evaluation already exists for department head
                if (department.getDepartmentHead() != null) {
                    Optional<Evaluation> existingEvaluation = findExistingEvaluation(
                        applicantId, preference.getCourse().getCourseId(), 
                        department.getDepartmentHead().getEvaluatorId());

                    if (!existingEvaluation.isPresent()) {
                        Evaluation evaluation = new Evaluation();
                        evaluation.setApplicant(applicant);
                        evaluation.setCourse(preference.getCourse());
                        evaluation.setEvaluationStatus(Evaluation.EvaluationStatus.PENDING);
                        evaluation.setEvaluator(department.getDepartmentHead());
                        
                        evaluations.add(evaluationRepository.save(evaluation));
                    } else {
                        evaluations.add(existingEvaluation.get());
                    }
                }
            }
            
            return evaluations;

        } catch (Exception e) {
            System.err.println("Error in forwardApplicantToDepartment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to forward applicant to department: " + e.getMessage(), e);
        }
    }
}
