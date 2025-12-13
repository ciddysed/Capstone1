# Application Track Auto-Redirect - Visual Flow

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  APPLICANT LOGS IN                                          │
│  Stored: applicantId in localStorage                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  NAVIGATES TO /application-track                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CHECK ACCEPTANCE STATUS                                    │
│  API: GET /api/accepted-applicants/by-applicant/{id}       │
└────────────┬────────────────┬───────────────────────────────┘
             │                │
    ┌────────┘                └────────┐
    │ NOT ACCEPTED                     │ ACCEPTED ✓
    ▼                                  ▼
┌─────────────────────┐      ┌──────────────────────────┐
│ LOAD APPLICATION    │      │ SHOW SUCCESS TOAST       │
│ TRACK NORMALLY      │      │ "Congratulations! Your   │
│                     │      │  application has been    │
│ • Fetch documents   │      │  accepted..."            │
│ • Fetch preferences │      └───────────┬──────────────┘
│ • Fetch courses     │                  │
│ • Show status       │                  │ Wait 2 seconds
└──────────┬──────────┘                  ▼
           │                   ┌──────────────────────────┐
           │                   │ REDIRECT                 │
           │                   │ navigate('/accepted-     │
           │                   │   dashboard')            │
           │                   │ { replace: true }        │
           │                   └──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  START BACKGROUND MONITORING                                │
│  Poll every 30 seconds                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Every 30s    │
         │  Check Status │
         └───────┬───────┘
                 │
        ┌────────┴────────┐
        │  Still Not      │  Status Changed
        │  Accepted?      │  to Accepted?
        └────────┬────────┘
                 │            │
        ┌────────┘            └──────────┐
        │                                │
        ▼                                ▼
   Continue                    Trigger Redirect
   Monitoring                  (Same as above)
```

## Timeline View

```
TIME: 0s
┌────────────────────────────────────┐
│ User arrives at /application-track │
└────────────────────────────────────┘
                 ↓
TIME: 0.5s
┌────────────────────────────────────┐
│ Acceptance check initiated         │
└────────────────────────────────────┘
                 ↓
┌─────────── BRANCH ──────────────┐
│                                 │
│ NOT ACCEPTED    │    ACCEPTED   │
│                                 │
TIME: 1s                     TIME: 1s
┌──────────────┐           ┌──────────────┐
│ Load page    │           │ Show toast   │
│ content      │           │ ✓ Success!   │
└──────────────┘           └──────────────┘
       ↓                          ↓
TIME: 30s                   TIME: 3s
┌──────────────┐           ┌──────────────┐
│ Check again  │           │ Redirect to  │
│ (background) │           │ /accepted-   │
└──────────────┘           │  dashboard   │
       ↓                   └──────────────┘
TIME: 60s
┌──────────────┐
│ Check again  │
│ (continues)  │
└──────────────┘
```

## State Transition Diagram

```
                    ┌──────────────┐
                    │   PENDING    │
                    │  APPLICATION │
                    └──────┬───────┘
                           │
                           │ Admin approves
                           │ and accepts
                           ▼
                    ┌──────────────┐
                    │   APPROVED   │◄────── Application status
                    └──────┬───────┘
                           │
                           │ Recorded in
                           │ accepted_applicants
                           ▼
            ┌──────────────────────────────┐
            │      ACCEPTED STATUS         │
            │  (Entry in accepted table)   │
            └───────────┬──────────────────┘
                        │
        ┌───────────────┴──────────────┐
        │                              │
        │ Applicant on                 │ Applicant elsewhere
        │ /application-track            │ or logged out
        ▼                              ▼
┌────────────────┐            ┌────────────────┐
│ Auto-detect    │            │ Next login     │
│ within 30s     │            │ redirects      │
│ → Show toast   │            │ immediately    │
│ → Redirect     │            └────────────────┘
└────────────────┘
        │
        ▼
┌────────────────┐
│  /accepted-    │
│   dashboard    │
└────────────────┘
```

## Component Lifecycle

```
┌───────────────────────────────────────────────────────┐
│  ApplicationTrack Component Mounted                   │
└─────────────────┬─────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────┐
│  useEffect #1: Get applicantId from localStorage      │
└─────────────────┬─────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────┐
│  useEffect #2: Check acceptance → Load data           │
│  ├─ checkAcceptanceStatus(applicantId)                │
│  │  ├─ ACCEPTED: Toast + Redirect                     │
│  │  └─ NOT ACCEPTED: Continue ↓                       │
│  ├─ fetchApplicantData(applicantId)                   │
│  ├─ fetchCourses()                                    │
│  ├─ fetchCoursePreferences(applicantId)               │
│  └─ fetchDocuments(applicantId)                       │
└─────────────────┬─────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────┐
│  useEffect #3: Start 30-second interval               │
│  setInterval(() => {                                  │
│    checkAcceptanceStatus(applicantId)                 │
│  }, 30000)                                            │
└─────────────────┬─────────────────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────────────────┐
│  Component Unmounted                                  │
│  clearInterval() - cleanup                            │
└───────────────────────────────────────────────────────┘
```

## User Experience Flow

```
╔═══════════════════════════════════════════════════════╗
║  SCENARIO 1: Already Accepted                        ║
╚═══════════════════════════════════════════════════════╝

User                     System                   Backend
  │                         │                        │
  │  Click "Track App"      │                        │
  ├────────────────────────>│                        │
  │                         │  Check acceptance      │
  │                         ├───────────────────────>│
  │                         │  ← Found in table      │
  │                         │<───────────────────────┤
  │  🎉 Toast appears!      │                        │
  │<────────────────────────┤                        │
  │  "Congratulations..."   │                        │
  │                         │                        │
  │  [2 second delay]       │                        │
  │                         │                        │
  │  Auto redirect ➜        │                        │
  │<────────────────────────┤                        │
  │                         │                        │
  │  Now on /accepted-      │                        │
  │  dashboard              │                        │
  

╔═══════════════════════════════════════════════════════╗
║  SCENARIO 2: Gets Accepted While Viewing             ║
╚═══════════════════════════════════════════════════════╝

User                     System                   Backend
  │                         │                        │
  │  Viewing app track      │                        │
  │  for 2 minutes          │                        │
  │                         │                        │
  │                         │  [Background check]    │
  │                         │  30s poll              │
  │                         ├───────────────────────>│
  │                         │  ← Not accepted yet    │
  │                         │<───────────────────────┤
  │                         │                        │
                   [Admin accepts in another window]
                              │                        │
                              │  Admin clicks          │
                              │  "Accept Applicant"    │
                              │  ─────────────────────>│
                              │  ← Record created      │
                              │<───────────────────────┤
  │                         │                        │
  │                         │  [Next 30s check]      │
  │                         ├───────────────────────>│
  │                         │  ← FOUND! Accepted     │
  │                         │<───────────────────────┤
  │  🎉 Toast appears!      │                        │
  │<────────────────────────┤                        │
  │  "Congratulations..."   │                        │
  │                         │                        │
  │  [2 second delay]       │                        │
  │                         │                        │
  │  Auto redirect ➜        │                        │
  │<────────────────────────┤                        │
```

## Toast Notification Design

```
┌────────────────────────────────────────────┐
│  ✓  Congratulations!                       │ ← Success icon (green)
│     Your application has been accepted.    │
│     Redirecting to enrollment dashboard... │
│                                      [×]   │ ← Close button
└────────────────────────────────────────────┘
     ↑ Appears top-right
     ↑ Maroon/Gold themed
     ↑ Auto-dismisses in 4s (but redirect in 2s)
```

## API Integration

```
┌─────────────────────────────────────────────────┐
│  ENDPOINT: /api/accepted-applicants/            │
│            by-applicant/{applicantId}           │
├─────────────────────────────────────────────────┤
│  METHOD: GET                                    │
├─────────────────────────────────────────────────┤
│  RESPONSES:                                     │
│  ┌───────────────────────────────────────────┐ │
│  │ 200 OK                                    │ │
│  │ {                                         │ │
│  │   "acceptedApplicantId": 123,             │ │
│  │   "applicant": {...},                     │ │
│  │   "finalCourse": {...},                   │ │
│  │   "remarks": "...",                       │ │
│  │   "status": "ACCEPTED"                    │ │
│  │ }                                         │ │
│  │ → Applicant IS accepted                  │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │ 404 NOT FOUND                             │ │
│  │ No content                                │ │
│  │ → Applicant NOT accepted yet              │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

**Visual Summary**: The system now intelligently detects when an applicant has been accepted and automatically guides them to the appropriate page with a congratulatory message!
