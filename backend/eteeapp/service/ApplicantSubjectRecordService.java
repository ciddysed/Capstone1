package com.caps.eteeapp.service;

import com.caps.eteeapp.model.ApplicantSubjectRecord;
import com.caps.eteeapp.model.Notification;
import com.caps.eteeapp.repository.ApplicantSubjectRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApplicantSubjectRecordService {

    @Autowired
    private ApplicantSubjectRecordRepository applicantSubjectRecordRepository;
    
    @Autowired
    private NotificationService notificationService;

    public List<ApplicantSubjectRecord> getRecordsByApplicantId(Long applicantId) {
        return applicantSubjectRecordRepository.findByApplicant_ApplicantId(applicantId);
    }

    public Map<String, List<ApplicantSubjectRecord>> getRecordsOrganizedBySemester(Long applicantId) {
        List<ApplicantSubjectRecord> records = getRecordsByApplicantId(applicantId);
        
        return records.stream()
                .sorted((r1, r2) -> {
                    // Sort by year level first, then by semester number
                    int yearComparison = r1.getSubject().getSemester().getYearLevel()
                            .compareTo(r2.getSubject().getSemester().getYearLevel());
                    if (yearComparison != 0) {
                        return yearComparison;
                    }
                    return r1.getSubject().getSemester().getSemesterNumber()
                            .compareTo(r2.getSubject().getSemester().getSemesterNumber());
                })
                .collect(Collectors.groupingBy(
                        record -> "Year " + record.getSubject().getSemester().getYearLevel() + 
                                 " - Semester " + record.getSubject().getSemester().getSemesterNumber(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));
    }

    public Map<String, List<Map<String, Object>>> getRecordsOrganizedBySemesterClean(Long applicantId) {
        List<ApplicantSubjectRecord> records = getRecordsByApplicantId(applicantId);
        
        return records.stream()
                .sorted((r1, r2) -> {
                    int yearComparison = r1.getSubject().getSemester().getYearLevel()
                            .compareTo(r2.getSubject().getSemester().getYearLevel());
                    if (yearComparison != 0) {
                        return yearComparison;
                    }
                    return r1.getSubject().getSemester().getSemesterNumber()
                            .compareTo(r2.getSubject().getSemester().getSemesterNumber());
                })
                .collect(Collectors.groupingBy(
                        record -> "Year " + record.getSubject().getSemester().getYearLevel() + 
                                 " - Semester " + record.getSubject().getSemester().getSemesterNumber(),
                        LinkedHashMap::new,
                        Collectors.mapping(this::convertToCleanMap, Collectors.toList())
                ));
    }

    private Map<String, Object> convertToCleanMap(ApplicantSubjectRecord record) {
        Map<String, Object> cleanRecord = new HashMap<>();
        cleanRecord.put("id", record.getId());
        cleanRecord.put("grade", record.getGrade());
        cleanRecord.put("processOfAccreditation", record.getProcessOfAccreditation());
        cleanRecord.put("substantiveBasis", record.getSubstantiveBasis());
        cleanRecord.put("status", record.getStatus());
        cleanRecord.put("recordDate", record.getRecordDate());
        
        // Add subject details without circular references
        Map<String, Object> subjectInfo = new HashMap<>();
        subjectInfo.put("id", record.getSubject().getId());
        subjectInfo.put("subjectCode", record.getSubject().getSubjectCode());
        subjectInfo.put("descriptiveTitle", record.getSubject().getDescriptiveTitle());
        subjectInfo.put("lecHours", record.getSubject().getLecHours());
        subjectInfo.put("labHours", record.getSubject().getLabHours());
        subjectInfo.put("units", record.getSubject().getUnits());
        subjectInfo.put("prerequisites", record.getSubject().getPrerequisites());
        
        cleanRecord.put("subject", subjectInfo);
        
        return cleanRecord;
    }

    public ApplicantSubjectRecord updateSubjectRecord(Long recordId, String grade, 
            String processOfAccreditation, String substantiveBasis, String status) {
        
        ApplicantSubjectRecord record = applicantSubjectRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Subject record not found with id " + recordId));

        if (grade != null) {
            record.setGrade(grade);
        }
        if (processOfAccreditation != null) {
            record.setProcessOfAccreditation(processOfAccreditation);
        }
        if (substantiveBasis != null) {
            record.setSubstantiveBasis(substantiveBasis);
        }
        if (status != null) {
            ApplicantSubjectRecord.RecordStatus oldStatus = record.getStatus();
            ApplicantSubjectRecord.RecordStatus newStatus = ApplicantSubjectRecord.RecordStatus.valueOf(status.toUpperCase());
            record.setStatus(newStatus);

            // If status changed, create a notification for the applicant
            if (oldStatus != null && newStatus != null && oldStatus != newStatus) {
                try {
                    Long applicantId = record.getApplicant() != null ? record.getApplicant().getApplicantId() : null;
                    if (applicantId != null && notificationService != null) {
                        String subjectName = record.getSubject() != null ?
                                (record.getSubject().getSubjectCode() + " - " + record.getSubject().getDescriptiveTitle()) : "Subject";
                        String title = "Subject Status Updated";
                        String message = String.format("%s status changed from %s to %s.", subjectName, oldStatus, newStatus);
                        Notification.NotificationType type = Notification.NotificationType.INFO;
                        if (newStatus == ApplicantSubjectRecord.RecordStatus.APPROVED) type = Notification.NotificationType.SUCCESS;
                        else if (newStatus == ApplicantSubjectRecord.RecordStatus.REJECTED) type = Notification.NotificationType.ERROR;
                        else if (newStatus == ApplicantSubjectRecord.RecordStatus.PENDING) type = Notification.NotificationType.WARNING;

                        // No clientTempId when server-created (originating from backend flow)
                        notificationService.createNotification(applicantId, title, message, type, null);
                    }
                } catch (Exception ex) {
                    // Don't block save on notification failure
                    System.err.println("Failed to create notification: " + ex.getMessage());
                }
            }
        }

        return applicantSubjectRecordRepository.save(record);
    }

    public Map<String, Object> getApplicantCurriculumSummary(Long applicantId) {
        List<ApplicantSubjectRecord> records = getRecordsByApplicantId(applicantId);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSubjects", records.size());
        summary.put("completedSubjects", records.stream()
                .mapToLong(r -> r.getGrade() != null && !r.getGrade().trim().isEmpty() ? 1 : 0)
                .sum());
        summary.put("totalUnits", records.stream()
                .mapToDouble(r -> r.getSubject().getUnits())
                .sum());
        summary.put("recordsByStatus", records.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().toString(),
                        Collectors.counting()
                )));
        
        return summary;
    }

    public List<ApplicantSubjectRecord> bulkUpdateSubjectRecords(List<Map<String, Object>> updates) {
        List<ApplicantSubjectRecord> updatedRecords = new ArrayList<>();
        
        for (Map<String, Object> update : updates) {
            Long recordId = Long.valueOf(update.get("recordId").toString());
            String grade = (String) update.get("grade");
            String processOfAccreditation = (String) update.get("processOfAccreditation");
            String substantiveBasis = (String) update.get("substantiveBasis");
            String status = (String) update.get("status");
            
            ApplicantSubjectRecord updatedRecord = updateSubjectRecord(recordId, grade, processOfAccreditation, substantiveBasis, status);
            updatedRecords.add(updatedRecord);
        }
        
        return updatedRecords;
    }
}
