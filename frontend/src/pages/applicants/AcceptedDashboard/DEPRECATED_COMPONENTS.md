# Deprecated Components

The following components are no longer used in the Accepted Dashboard and can be safely removed or archived:

## 1. EnrollmentTracker.jsx
**Status**: ❌ Deprecated  
**Reason**: Generic enrollment steps not tied to backend functionality. Replaced with curriculum-based progress tracking.

**Previous Purpose**: 
- Displayed generic enrollment steps (documents, payment, orientation, etc.)
- Not connected to actual backend enrollment data

**Replacement**: Curriculum Progress Summary with real backend data

---

## 2. CourseInformation.jsx
**Status**: ❌ Deprecated  
**Reason**: Hardcoded course information with mock curriculum data.

**Previous Purpose**:
- Showed program overview, subjects, and faculty
- Used mock data instead of real curriculum

**Replacement**: Subject Records organized by semester from backend API

---

## 3. InterviewScheduleModal.jsx
**Status**: ❌ Deprecated  
**Reason**: Interview scheduling is not part of the accepted applicant flow based on backend models.

**Previous Purpose**:
- Allowed applicants to schedule interviews
- No corresponding backend endpoint found

**Replacement**: None - feature removed as it doesn't align with backend functionality

---

## Recommendation

These files can be:
1. **Deleted** if not used elsewhere in the application
2. **Moved** to an `archived` or `deprecated` folder
3. **Kept** temporarily with clear deprecation warnings

## Files to Keep

These backend model files are correctly placed in the frontend directory (though they should ideally be in the backend):
- AcceptedApplicant.java
- ApplicantSubjectRecord.java
- Curriculum.java
- Semester.java
- Subject.java
- All corresponding Controller and Service files

**Note**: Consider moving Java files to the appropriate backend directory structure.
