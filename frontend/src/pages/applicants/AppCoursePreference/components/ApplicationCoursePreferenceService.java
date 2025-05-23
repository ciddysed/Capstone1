package com.caps.eteeapp.service;

import com.caps.eteeapp.model.ApplicationCoursePreference;
import com.caps.eteeapp.repository.ApplicationCoursePreferenceRepository;
import com.caps.eteeapp.model.Applicant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationCoursePreferenceService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationCoursePreferenceService.class);

    @Autowired
    private ApplicationCoursePreferenceRepository preferenceRepository;

    @Autowired
    private ApplicantService applicantService;

    public ApplicationCoursePreference createPreference(ApplicationCoursePreference preference) {
        return preferenceRepository.save(preference);
    }

    public Optional<ApplicationCoursePreference> getPreferenceById(Long id) {
        return preferenceRepository.findById(id);
    }

    public void deletePreference(Long id) {
        preferenceRepository.deleteById(id);
    }

    public ApplicationCoursePreference updatePreferenceStatus(ApplicationCoursePreference preference, ApplicationCoursePreference.Status status) {
        preference.setStatus(status);
        return preferenceRepository.save(preference);
    }

    public ApplicationCoursePreference createPreferenceForApplicant(Long applicantId, ApplicationCoursePreference preference) {
        logger.info("Creating preference for applicantId: {}", applicantId);
        Applicant applicant = applicantService.findApplicantById(applicantId)
                .orElseThrow(() -> {
                    logger.error("Applicant not found with id: {}", applicantId);
                    return new RuntimeException("Applicant not found");
                });
        logger.info("Applicant found: {}", applicant);

        if (preference.getCourse() == null || preference.getCourse().getCourseId() == null) {
            logger.error("Course is missing in the request");
            throw new RuntimeException("Course is required");
        }

        logger.info("Fetching course with id: {}", preference.getCourse().getCourseId());
        // Add logic to validate the course if necessary

        preference.setApplicant(applicant);
        ApplicationCoursePreference savedPreference = preferenceRepository.save(preference);
        logger.info("Preference created successfully with id: {}", savedPreference.getPreferenceId());
        return savedPreference;
    }

    public List<ApplicationCoursePreference> getPreferencesByApplicantId(Long applicantId) {
        return preferenceRepository.findByApplicant_ApplicantId(applicantId);
    }
}
