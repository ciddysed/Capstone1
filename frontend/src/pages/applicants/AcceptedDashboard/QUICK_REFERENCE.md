# Accepted Dashboard - Quick Reference Guide

## Dashboard Overview

The Accepted Dashboard is designed for applicants who have been officially accepted to a program. It displays their curriculum evaluation progress and acceptance details.

## Main Sections

### 1. Congratulations Banner (Top)
- Welcome message with applicant's name
- Program name they've been accepted to
- Acceptance date
- Trophy icon and "View Application" button

### 2. Left Column (Main Content - 8 columns wide)

#### A. Curriculum Progress Summary
Shows 4 key metrics:
- **Approved** (Green): Subjects that have been accredited
- **Pending** (Orange): Subjects under evaluation
- **Rejected** (Red): Subjects not accredited
- **Total**: Total number of subjects in curriculum
- **Progress Bar**: Visual representation of completion

#### B. Subject Records by Semester
- Organized accordion display by Year and Semester
- Each accordion shows:
  - Semester label (e.g., "Year 1 - Semester 1")
  - Number of subjects in that semester
- When expanded, shows a table with:
  - **Subject Code**: e.g., "IT101"
  - **Description**: Full subject title
  - **Grade**: Letter grade or N/A
  - **Status**: APPROVED, PENDING, or REJECTED with icon

### 3. Right Column (Sidebar - 4 columns wide)

#### A. Acceptance Details Card
- **Status**: Current acceptance status (ACCEPTED/ENROLLED/WITHDRAWN)
- **Acceptance Date**: When the applicant was accepted
- **Program**: Full program name
- **Course Code**: Program code (e.g., "BSIT")
- **Remarks**: Any notes from admissions

#### B. Action Required Alert (if applicable)
Shown only if there are pending subjects:
- Number of subjects pending evaluation
- Message to wait for evaluator review

#### C. Attention Needed Alert (if applicable)
Shown only if there are rejected subjects:
- Number of subjects not accredited
- Advice to contact program evaluator
- "View Rejected Subjects" button

## Data Flow

```
User Login → Get applicantId from localStorage
    ↓
Fetch Applicant Profile
    ↓
Fetch Acceptance Data
    ↓
Fetch Subject Records by Semester
    ↓
Fetch Curriculum Summary
    ↓
Display Dashboard
```

## API Endpoints Used

```javascript
// Base URL: http://localhost:8080/api

// Get applicant profile
GET /applicants/{applicantId}

// Get acceptance details
GET /accepted-applicants/applicant/{applicantId}

// Get subject records organized by semester
GET /applicant-subject-records/applicant/{applicantId}/organized

// Get curriculum summary statistics
GET /applicant-subject-records/applicant/{applicantId}/summary
```

## Subject Status Meanings

### ✅ APPROVED
- Subject has been evaluated and accredited
- Credit will be given for this subject
- No need to retake

### ⏳ PENDING
- Subject is currently under evaluation
- Waiting for evaluator review
- Status will be updated soon

### ❌ REJECTED
- Subject was not accredited
- May need to take this subject in the program
- Contact evaluator for more details

## User Actions Available

1. **View Application**: Navigate to application tracking page
2. **Expand/Collapse Semesters**: View subjects per semester
3. **View Rejected Subjects**: (If available) See which subjects were not accredited

## Conditional Display Logic

### When to Show Pending Alert
```javascript
if (curriculumSummary.pendingCount > 0) {
  // Show orange alert card
}
```

### When to Show Rejected Alert
```javascript
if (curriculumSummary.rejectedCount > 0) {
  // Show red alert card
}
```

### When No Subject Records Exist
```javascript
if (Object.keys(subjectRecords).length === 0) {
  // Show "No subject records available" message
  // Display warning icon
}
```

## Color Scheme

### Primary Colors
- **Maroon**: `#6A0000` (University primary color)
- **Gold**: `#FFC72C` (University secondary color)

### Status Colors
- **Green**: `#4caf50` (Approved/Success)
- **Orange**: `#ff9800` (Pending/Warning)
- **Red**: `#f44336` (Rejected/Error)
- **Blue**: `#2e7d32` (Information)

## Responsive Behavior

- **Desktop (md+)**: 2-column layout (8-4 split)
- **Mobile**: Single column, stacked layout
- Cards adapt to screen size
- Tables scroll horizontally if needed

## Loading States

While fetching data:
- Shows centered CircularProgress spinner
- Message: "Loading your acceptance information..."
- Maroon-colored loader

## Error Handling

### Not Logged In
- Redirects to `/login`
- Shows error toast: "Please login to continue"

### Not Accepted
- Redirects to `/ApplicantHomePage`
- Shows error toast: "You have not been accepted yet."

### API Errors
- Shows error toast with message
- Logs error to console
- Prevents crash with graceful degradation

## Dependencies

### Material-UI Components
- Box, Typography, Stack, Paper, Grid, Card, CardContent
- Button, Divider, Chip, CircularProgress, Avatar
- Table, TableBody, TableCell, TableContainer, TableHead, TableRow
- Accordion, AccordionSummary, AccordionDetails, LinearProgress

### Material-UI Icons
- School, Assignment, Celebration, AccountBalance, EmojiEvents
- ArrowForward, CheckCircle, Cancel, HourglassEmpty
- ExpandMore, Warning

### Other Dependencies
- axios (HTTP requests)
- react-router-dom (Navigation)
- useResponseHandler (Custom hook for notifications)

## Best Practices for Maintenance

1. **Always sync with backend models**: If backend changes, update frontend
2. **Test with real data**: Don't rely on mock data
3. **Handle null/undefined**: Always provide fallbacks
4. **Keep API endpoints consistent**: Use environment variables for base URL
5. **Log errors properly**: Help with debugging
6. **Update loading states**: Keep users informed
7. **Validate data before display**: Prevent render errors

## Troubleshooting

### Dashboard shows "No subject records available"
- Check if `/applicant-subject-records/applicant/{id}/organized` returns data
- Verify applicant has subject records in database

### Summary counts are wrong
- Check `/applicant-subject-records/applicant/{id}/summary` endpoint
- Verify backend calculation logic

### Redirect loop
- Check localStorage for valid `applicantId`
- Verify acceptance record exists in database

### Semester not expanding
- Check `handleAccordionChange` function
- Verify `expandedSemester` state updates

## Testing Checklist

- [ ] Login with accepted applicant
- [ ] Verify all acceptance details display
- [ ] Check curriculum summary calculations
- [ ] Expand/collapse semester accordions
- [ ] Verify subject status icons
- [ ] Test with 0 subjects
- [ ] Test with all pending subjects
- [ ] Test with all approved subjects
- [ ] Test with mixed statuses
- [ ] Test responsive layout
- [ ] Test navigation buttons
- [ ] Test error scenarios
- [ ] Test loading states
