package com.caps.eteeapp.service;

import com.caps.eteeapp.model.AcceptedApplicant;
import com.caps.eteeapp.model.Applicant;
import com.caps.eteeapp.model.Course;
import com.caps.eteeapp.repository.AcceptedApplicantRepository;
import com.caps.eteeapp.repository.ApplicantRepository;
import com.caps.eteeapp.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AcceptedApplicantService {

    @Autowired
    private AcceptedApplicantRepository acceptedApplicantRepository;

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private CourseRepository courseRepository;

    public AcceptedApplicant acceptApplicant(Long applicantId, Long finalCourseId, String remarks) {
        Optional<Applicant> applicantOpt = applicantRepository.findById(applicantId);
        if (!applicantOpt.isPresent()) {
            throw new RuntimeException("Applicant not found with id " + applicantId);
        }

        Optional<Course> courseOpt = courseRepository.findById(finalCourseId);
        if (!courseOpt.isPresent()) {
            throw new RuntimeException("Course not found with id " + finalCourseId);
        }

        // Check if applicant is already accepted
        if (acceptedApplicantRepository.existsByApplicant_ApplicantId(applicantId)) {
            throw new RuntimeException("Applicant is already accepted");
        }

        AcceptedApplicant acceptedApplicant = new AcceptedApplicant();
        acceptedApplicant.setApplicant(applicantOpt.get());
        acceptedApplicant.setFinalCourse(courseOpt.get());
        acceptedApplicant.setStatus(AcceptedApplicant.AcceptanceStatus.ACCEPTED);
        acceptedApplicant.setAcceptanceDate(new Date());
        acceptedApplicant.setRemarks(remarks);

        return acceptedApplicantRepository.save(acceptedApplicant);
    }

    public List<AcceptedApplicant> getAllAcceptedApplicants() {
        return acceptedApplicantRepository.findAll();
    }

    public List<AcceptedApplicant> getAcceptedApplicantsByStatus(AcceptedApplicant.AcceptanceStatus status) {
        return acceptedApplicantRepository.findByStatus(status);
    }

    public List<AcceptedApplicant> getAcceptedApplicantsByCourse(Long courseId) {
        return acceptedApplicantRepository.findByFinalCourse_CourseId(courseId);
    }

    public Optional<AcceptedApplicant> getAcceptedApplicantById(Long id) {
        return acceptedApplicantRepository.findById(id);
    }

    public Optional<AcceptedApplicant> getAcceptedApplicantByApplicantId(Long applicantId) {
        List<AcceptedApplicant> accepted = acceptedApplicantRepository.findByApplicant_ApplicantId(applicantId);
        return accepted.isEmpty() ? Optional.empty() : Optional.of(accepted.get(0));
    }

    public AcceptedApplicant updateAcceptedApplicantStatus(Long acceptedApplicantId, AcceptedApplicant.AcceptanceStatus status, String remarks) {
        AcceptedApplicant acceptedApplicant = acceptedApplicantRepository.findById(acceptedApplicantId)
                .orElseThrow(() -> new RuntimeException("Accepted applicant not found with id " + acceptedApplicantId));

        acceptedApplicant.setStatus(status);
        if (remarks != null) {
            acceptedApplicant.setRemarks(remarks);
        }

        return acceptedApplicantRepository.save(acceptedApplicant);
    }

    public AcceptedApplicant updateFinalCourse(Long acceptedApplicantId, Long newCourseId) {
        AcceptedApplicant acceptedApplicant = acceptedApplicantRepository.findById(acceptedApplicantId)
                .orElseThrow(() -> new RuntimeException("Accepted applicant not found with id " + acceptedApplicantId));

        Course newCourse = courseRepository.findById(newCourseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id " + newCourseId));

        acceptedApplicant.setFinalCourse(newCourse);
        return acceptedApplicantRepository.save(acceptedApplicant);
    }

    public void deleteAcceptedApplicant(Long acceptedApplicantId) {
        acceptedApplicantRepository.deleteById(acceptedApplicantId);
    }
}
