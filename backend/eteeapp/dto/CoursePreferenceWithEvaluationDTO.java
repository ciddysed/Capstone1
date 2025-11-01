package com.caps.eteeapp.dto;

import com.caps.eteeapp.model.Course;
import com.caps.eteeapp.model.ApplicationCoursePreference.PriorityOrder;
import com.caps.eteeapp.model.ApplicationCoursePreference.Status;
import com.caps.eteeapp.model.Evaluation.EvaluationStatus;

public class CoursePreferenceWithEvaluationDTO {
    private Long preferenceId;
    private Course course;
    private PriorityOrder priorityOrder;
    private Status status; // from ApplicationCoursePreference
    private EvaluationStatus evaluationStatus; // from Evaluation

    // Constructors
    public CoursePreferenceWithEvaluationDTO() {}

    public CoursePreferenceWithEvaluationDTO(Long preferenceId, Course course, PriorityOrder priorityOrder, Status status, EvaluationStatus evaluationStatus) {
        this.preferenceId = preferenceId;
        this.course = course;
        this.priorityOrder = priorityOrder;
        this.status = status;
        this.evaluationStatus = evaluationStatus;
    }

    // Getters and setters
    public Long getPreferenceId() { return preferenceId; }
    public void setPreferenceId(Long preferenceId) { this.preferenceId = preferenceId; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public PriorityOrder getPriorityOrder() { return priorityOrder; }
    public void setPriorityOrder(PriorityOrder priorityOrder) { this.priorityOrder = priorityOrder; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public EvaluationStatus getEvaluationStatus() { return evaluationStatus; }
    public void setEvaluationStatus(EvaluationStatus evaluationStatus) { this.evaluationStatus = evaluationStatus; }
}
