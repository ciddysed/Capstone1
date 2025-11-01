# Application Track Auto-Redirect Feature

## Problem Solved
Previously, when an applicant's application was accepted and graded by evaluators, they would remain on the Application Track page even though they should be viewing the Accepted Dashboard for enrollment procedures.

## Solution Implemented

### 1. **Automatic Acceptance Check on Page Load**
- When an applicant visits the Application Track page, the system immediately checks if they have been accepted
- If accepted, they are automatically redirected to the `/accepted-dashboard` page
- This prevents accepted applicants from seeing outdated application tracking information

### 2. **Real-time Status Monitoring**
- Added a background check that runs every 30 seconds
- Continuously monitors if the applicant's status changes to "accepted"
- If accepted status is detected, triggers automatic redirect
- This catches status changes that occur while the applicant is viewing the page

### 3. **User-Friendly Notification**
- When acceptance is detected, shows a success toast notification:
  ```
  "Congratulations! Your application has been accepted. 
   Redirecting to enrollment dashboard..."
  ```
- 2-second delay before redirect to allow user to read the message
- Uses the new toast notification system (matching maroon/gold theme)

## Technical Implementation

### File Modified
- `src/pages/applicants/ApplicationTrack/index.jsx`

### Key Functions Added

#### `checkAcceptanceStatus(applicantId)`
```javascript
// Checks if applicant exists in accepted-applicants table
// If yes: Shows success toast and redirects to /accepted-dashboard
// If no: Returns false and allows normal application tracking
```

### API Endpoint Used
```
GET /api/accepted-applicants/by-applicant/{applicantId}
```
- Returns accepted applicant data if exists
- Returns 404 if not yet accepted

## User Flow

### Before (Problem)
```
1. Applicant logs in
2. Views Application Track page
3. Gets accepted by program admin
4. ❌ Still sees Application Track page
5. ❌ Doesn't know they're accepted
6. ❌ Doesn't know about enrollment steps
```

### After (Solution)
```
1. Applicant logs in
2. System checks acceptance status
3a. NOT ACCEPTED:
    → Shows Application Track page normally
    → Periodic checks continue in background
    
3b. ACCEPTED:
    → Shows success toast notification
    → "Congratulations! Your application has been accepted..."
    → Automatic redirect after 2 seconds
    → Lands on Accepted Dashboard
    → Can begin enrollment procedures
```

## Features

### Immediate Detection
- ✅ Checks acceptance status on page load
- ✅ Prevents accepted applicants from viewing wrong page
- ✅ No manual navigation required

### Real-time Updates
- ✅ Polls every 30 seconds while on page
- ✅ Catches status changes in real-time
- ✅ Automatic redirect when accepted

### User Experience
- ✅ Congratulatory message
- ✅ Smooth transition
- ✅ Professional toast notification
- ✅ Themed with maroon/gold colors

### Performance
- ✅ Only checks when applicantId exists
- ✅ Uses existing API endpoint
- ✅ Minimal server load (30-second intervals)
- ✅ Cleanup on component unmount

## Testing Scenarios

### Scenario 1: Already Accepted
1. Admin accepts applicant in system
2. Applicant navigates to `/application-track`
3. ✅ Immediately redirected to `/accepted-dashboard`

### Scenario 2: Gets Accepted While Viewing
1. Applicant is on `/application-track` page
2. Admin accepts them in another window
3. Within 30 seconds: ✅ Toast appears
4. After 2 seconds: ✅ Redirected to `/accepted-dashboard`

### Scenario 3: Not Yet Accepted
1. Applicant logs in
2. Views `/application-track` page normally
3. ✅ Can see documents, preferences, status
4. ✅ Periodic checks continue in background

## Benefits

1. **Prevents Confusion**
   - Accepted applicants don't see outdated application status
   - Clear notification of acceptance

2. **Seamless Experience**
   - Automatic redirection
   - No manual steps required
   - Professional transition

3. **Real-time Updates**
   - No need to refresh page
   - Catches status changes automatically
   - Up-to-date information always

4. **Clear Communication**
   - Success message with context
   - Explains what's happening
   - Matches application theme

## Code Changes Summary

### Added Imports
```javascript
import toast from "../../../utils/toast";
```

### New Function
```javascript
const checkAcceptanceStatus = useCallback(async (applicantId) => {
  // Check accepted-applicants endpoint
  // Show toast if accepted
  // Redirect after 2 seconds
}, [api, navigate]);
```

### Modified useEffect
```javascript
// On component mount: check acceptance before loading data
// New periodic effect: check every 30 seconds
```

## Configuration

### Polling Interval
```javascript
30000 // 30 seconds (adjustable)
```

### Redirect Delay
```javascript
2000 // 2 seconds (time to read toast)
```

### API Endpoint
```javascript
/api/accepted-applicants/by-applicant/${applicantId}
```

## Future Enhancements

Possible improvements:
- [ ] Add WebSocket for instant notifications (no polling)
- [ ] Show acceptance details in toast (course, program)
- [ ] Add animation/confetti for acceptance
- [ ] Store acceptance notification in notification center
- [ ] Add "View Enrollment Dashboard" button option
- [ ] Email notification alongside redirect

## Notes

- Uses `replace: true` for navigation to prevent back button issues
- Cleans up interval on component unmount
- Gracefully handles API errors (treats as "not accepted")
- Works with existing authentication system
- Compatible with toast notification system

---

**Status**: ✅ **Complete and Tested**

Accepted applicants are now automatically redirected to the enrollment dashboard with a clear success message, preventing confusion and ensuring a smooth transition from application to enrollment.
