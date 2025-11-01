package com.caps.eteeapp.controller;

import com.caps.eteeapp.model.ApplicantSubjectRecord;
import com.caps.eteeapp.service.ApplicantSubjectRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applicant-subject-records")
public class ApplicantSubjectRecordController {

    @Autowired
    private ApplicantSubjectRecordService applicantSubjectRecordService;

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<List<ApplicantSubjectRecord>> getApplicantSubjectRecords(@PathVariable Long applicantId) {
        List<ApplicantSubjectRecord> records = applicantSubjectRecordService.getRecordsByApplicantId(applicantId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/applicant/{applicantId}/organized")
    public ResponseEntity<Map<String, List<ApplicantSubjectRecord>>> getApplicantSubjectRecordsOrganized(@PathVariable Long applicantId) {
        Map<String, List<ApplicantSubjectRecord>> organizedRecords = applicantSubjectRecordService.getRecordsOrganizedBySemester(applicantId);
        return ResponseEntity.ok(organizedRecords);
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<ApplicantSubjectRecord> updateSubjectRecord(
            @PathVariable Long recordId,
            @RequestParam(value = "grade", required = false) String grade,
            @RequestParam(value = "processOfAccreditation", required = false) String processOfAccreditation,
            @RequestParam(value = "substantiveBasis", required = false) String substantiveBasis,
            @RequestParam(value = "status", required = false) String status) {

        ApplicantSubjectRecord updatedRecord = applicantSubjectRecordService.updateSubjectRecord(
                recordId, grade, processOfAccreditation, substantiveBasis, status);
        return ResponseEntity.ok(updatedRecord);
    }

    @GetMapping("/applicant/{applicantId}/summary")
    public ResponseEntity<Map<String, Object>> getApplicantCurriculumSummary(@PathVariable Long applicantId) {
        Map<String, Object> summary = applicantSubjectRecordService.getApplicantCurriculumSummary(applicantId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/applicant/{applicantId}/organized-clean")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getApplicantSubjectRecordsOrganizedClean(@PathVariable Long applicantId) {
        Map<String, List<Map<String, Object>>> organizedRecords = applicantSubjectRecordService.getRecordsOrganizedBySemesterClean(applicantId);
        return ResponseEntity.ok(organizedRecords);
    }

    @PutMapping("/bulk-update")
    public ResponseEntity<List<ApplicantSubjectRecord>> bulkUpdateSubjectRecords(@RequestBody List<Map<String, Object>> updates) {
        List<ApplicantSubjectRecord> updatedRecords = applicantSubjectRecordService.bulkUpdateSubjectRecords(updates);
        return ResponseEntity.ok(updatedRecords);
    }
}
