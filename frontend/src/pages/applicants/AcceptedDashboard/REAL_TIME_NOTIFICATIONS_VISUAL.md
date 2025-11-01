# Real-Time Notifications - Visual Guide

## 📱 Dashboard View with Notifications

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         ACCEPTED DASHBOARD                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🎉 Congratulations, John!                                           🏆        │
│ You have been accepted to BS Information Technology                          │
│ Your application has been approved on October 15, 2025                       │
│                                                            [View Application] │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔔  Real-Time Notifications Active              [3 Approved] [2 Pending]     │
│ [5] You'll be notified immediately when          [0 Rejected] [Check Now]    │
│     subject evaluations are completed                                         │
└──────────────────────────────────────────────────────────────────────────────┘
     ↑                                                 ↑              ↑
 Badge with                                      Summary Chips   Manual
 unread count                                                    Refresh

┌────────────────────────────────────────┬───────────────────────────────────┐
│  📊 Curriculum Progress Summary        │  📚 Acceptance Information        │
│  ─────────────────────────────────     │  ────────────────────────────     │
│  ● 15 subjects evaluated               │  Program: BS IT                   │
│  ● 12 approved (80%)                   │  Date: Oct 15, 2025               │
│  ● 2 pending (13%)                     │  Status: ACCEPTED                 │
│  ● 1 rejected (7%)                     │                                   │
└────────────────────────────────────────┴───────────────────────────────────┘
```

---

## 🎯 Toast Notification Examples

### When Subject is Approved

```
┌──────────────────────────────────────────────┐
│  ✅ Subject Approved!                        │
│                                              │
│  Great news! "IT101 - Introduction to       │
│  Computing" has been approved and            │
│  accredited.                                 │
│                                        [×]   │
└──────────────────────────────────────────────┘
     ↑                                    ↑
 Green checkmark                      Auto-dismiss
   Success                          in 5 seconds
```

### When Subject is Rejected

```
┌──────────────────────────────────────────────┐
│  ❌ Subject Not Approved                     │
│                                              │
│  "IT102 - Programming Fundamentals" was     │
│  not accredited. Please review the           │
│  evaluation details.                         │
│                                        [×]   │
└──────────────────────────────────────────────┘
     ↑                                    ↑
  Red X icon                         Click to
    Error                            dismiss
```

### When Subject Under Review

```
┌──────────────────────────────────────────────┐
│  ⏳ Subject Under Review                     │
│                                              │
│  "IT103 - Data Structures" is now under     │
│  evaluation. You will be notified of the    │
│  result.                                     │
│                                        [×]   │
└──────────────────────────────────────────────┘
     ↑
 Orange hourglass
   Warning
```

---

## 🔔 Notification Center Integration

### Bell Icon in Navigation

```
┌──────────────────────────────────────────────┐
│  ETEEAP System              👤 John  🔔[3]   │
│                                         ↑     │
└───────────────────────────────────────────── │
                               Badge shows 3
                               unread notifications
```

### Notification Center Dropdown

```
                        ┌────────────────────────────────────────┐
                        │  Notifications         [Mark all read] │
                        ├────────────────────────────────────────┤
                        │ ● ✅ Subject Approved!                 │
                        │   "IT101 - Intro to Computing"         │
                        │   2 minutes ago                        │
                        ├────────────────────────────────────────┤
                        │ ● ⏳ Subject Under Review              │
                        │   "IT102 - Programming Fund"           │
                        │   5 minutes ago                        │
                        ├────────────────────────────────────────┤
                        │ ○ ❌ Subject Not Approved             │
                        │   "IT103 - Data Structures"            │
                        │   1 hour ago                           │
                        └────────────────────────────────────────┘
                         ↑                        ↑
                    Unread (●)              Read (○)
                    notifications           notifications
```

---

## 🎨 Status Bar States

### Active Tracking (Default)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔔  Real-Time Notifications Active        [3 Approved] [2 Pending]      │
│ [5] You'll be notified immediately        [0 Rejected] [Check Now]      │
│     when subject evaluations complete                                    │
└──────────────────────────────────────────────────────────────────────────┘
```
**Colors**:
- Background: Light blue (#2196f3 with 5% opacity)
- Border: Medium blue (#2196f3 with 20% opacity)
- Text: Dark blue (#2196f3)

### After Manual Check

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔔  Real-Time Notifications Active        [3 Approved] [2 Pending]      │
│ [0] ✓ All caught up! No new updates      [0 Rejected] [Check Now]      │
└──────────────────────────────────────────────────────────────────────────┘
    ↑
Badge count
resets to 0
```

### With Rejected Subjects

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔔  Real-Time Notifications Active        [8 Approved] [1 Pending]      │
│ [2] New updates available!                [2 Rejected] [Check Now]      │
│                                                ↑                          │
└────────────────────────────────────────────────────────────────────────┘
                                          Red chip appears
                                          when subjects rejected
```

---

## 📊 Notification Flow Diagram

```
╔════════════════════════════════════════════════════════════╗
║                    USER OPENS DASHBOARD                     ║
╚════════════════════════════════════════════════════════════╝
                            ↓
        ╔══════════════════════════════════════╗
        ║  Initialize Subject Tracking         ║
        ║  • Store initial subject status     ║
        ║  • Setup localStorage tracking      ║
        ╚══════════════════════════════════════╝
                            ↓
        ╔══════════════════════════════════════╗
        ║  Start Automatic Polling (30s)       ║
        ╚══════════════════════════════════════╝
                            ↓
    ┌───────────────────────────────────────────┐
    │                                           │
    │  ╔════════════════════════════════╗      │
    │  ║  Every 30 Seconds:             ║      │
    │  ║  1. Fetch latest subjects      ║      │
    │  ║  2. Compare with tracked       ║      │
    │  ║  3. Detect changes             ║      │
    │  ╚════════════════════════════════╝      │
    │               ↓                           │
    │    Status Changed?                        │
    │      YES ↓         NO ↓                   │
    │   ╔═══════╗    ╔═══════╗                 │
    │   ║ Show  ║    ║ Wait  ║                 │
    │   ║ Toast ║    ║ 30s   ║                 │
    │   ╚═══════╝    ╚═══════╝                 │
    │       ↓             ↓                     │
    └───────┴─────────────┴─────────────────────┘
            ↓             ↓
    ╔═══════════╗   ╔═══════════╗
    ║ Update    ║   ║ Continue  ║
    ║ Dashboard ║   ║ Polling   ║
    ╚═══════════╝   ╚═══════════╝
```

---

## 🎯 Status Change Examples

### Scenario 1: Subject Approved

```
Before (Tracked Status):
┌─────────────────────────────────────┐
│ IT101 - Intro to Computing          │
│ Status: PENDING ⏳                  │
│ Last Check: 10:30 AM                │
└─────────────────────────────────────┘

After (Current Status):
┌─────────────────────────────────────┐
│ IT101 - Intro to Computing          │
│ Status: APPROVED ✅                 │
│ Last Check: 10:31 AM                │
└─────────────────────────────────────┘

Action Taken:
✅ Toast: "Subject Approved!"
📧 Notification added to center
🔄 Dashboard updates automatically
🔢 Badge count increases by 1
```

### Scenario 2: Multiple Changes

```
Subject 1: PENDING → APPROVED ✅
Subject 2: PENDING → APPROVED ✅
Subject 3: PENDING → REJECTED ❌

Actions:
1. Three separate toast notifications
2. Three entries in notification center
3. Badge shows [3] new notifications
4. Summary chips update:
   - Approved: +2
   - Rejected: +1
   - Pending: -3
5. Dashboard automatically refreshes
```

---

## 💡 User Interaction Points

### Click on "Check Now" Button

```
Before Click:
┌─────────────────────────────────────┐
│ [Check Now]  ← User clicks          │
└─────────────────────────────────────┘

Action Sequence:
1. Fetch latest subjects immediately
2. Compare with tracked status
3. Show any new changes
4. Update summary display
5. Reset badge to [0]

After Click:
┌─────────────────────────────────────┐
│ [0] ✓ All caught up!                │
└─────────────────────────────────────┘
```

### Click on Toast Notification

```
Toast Appears:
┌──────────────────────────────────────┐
│  ✅ Subject Approved!           [×]  │ ← User can click X
│  "IT101 - Intro to Computing"        │    to dismiss
└──────────────────────────────────────┘

Auto-Dismiss Timer:
[████████████────────────] 5 seconds
```

---

## 🔄 Lifecycle Management

### Component Mount

```
Dashboard Opens
     ↓
Initialize Tracking
     ↓
Load Subjects
     ↓
Start Polling
     ↓
Show Status Bar
```

### Component Unmount

```
User Leaves Dashboard
     ↓
Stop Polling
     ↓
Clear Intervals
     ↓
Save Tracking State
     ↓
Cleanup Memory
```

### Page Refresh

```
Browser Refreshes
     ↓
Load Tracked Status from localStorage
     ↓
Compare with current status
     ↓
No duplicate notifications
     ↓
Continue tracking
```

---

## 📱 Mobile View

```
┌─────────────────────────────┐
│ ACCEPTED DASHBOARD          │
├─────────────────────────────┤
│ 🎉 Congratulations!         │
│ You're accepted to BS IT    │
│             [View App]      │
├─────────────────────────────┤
│ 🔔 Real-Time Active   [5]   │
│ [3 Approved]                │
│ [2 Pending]                 │
│ [Check Now]                 │
├─────────────────────────────┤
│ 📊 Curriculum Progress      │
│ • 15 subjects               │
│ • 12 approved (80%)         │
└─────────────────────────────┘
    ↑
Stacks vertically
on small screens
```

---

## 🎨 Color Legend

### Status Colors

| Status    | Color         | Hex Code | Usage                |
|-----------|---------------|----------|----------------------|
| APPROVED  | Green         | #4caf50  | Success states       |
| PENDING   | Orange        | #ff9800  | Warning states       |
| REJECTED  | Red           | #f44336  | Error states         |
| INFO      | Blue          | #2196f3  | Informational        |
| MAROON    | Dark Red      | #6A0000  | Brand primary        |
| GOLD      | Yellow        | #FFC72C  | Brand secondary      |

### Element Colors

```
Status Bar:
  Background: rgba(33, 150, 243, 0.05)
  Border:     rgba(33, 150, 243, 0.2)
  Text:       #2196f3

Toast - Success:
  Background: #4caf50
  Text:       white

Toast - Error:
  Background: #f44336
  Text:       white

Toast - Warning:
  Background: #ff9800
  Text:       white

Badge:
  Background: #f44336
  Text:       white
  Font:       600 (bold)
```

---

## ✨ Animation Effects

### Toast Slide In (Right)

```
     [Hidden]
         ↓
    [Sliding...]
         ↓
     [Visible]
         ↓
    (5 seconds)
         ↓
    [Sliding...]
         ↓
     [Hidden]
```

### Badge Pulse

```
When new notification arrives:

[3] → [3] → [3] → [3]
 ↓     ↓     ↓     ↓
Big  Small  Big  Normal
```

### Status Bar Fade In

```
Page Load:
  Opacity: 0 → 0.5 → 1.0
  Duration: 500ms
```

---

## 🎉 Success Indicators

✅ **System is Working When You See**:
- Blue notification bar at top of dashboard
- Badge count increases when status changes
- Toast messages slide in from right
- Summary chips update automatically
- "Check Now" button is interactive
- Bell icon in navigation shows badge

❌ **System Issues If**:
- No blue bar appears
- Toast never shows
- Badge stays at 0
- "Check Now" has no effect
- Console shows errors

---

## 📚 Quick Reference

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| Status Bar | Shows real-time tracking status | Top of dashboard |
| Toast | Pop-up notifications | Bottom-right corner |
| Bell Icon | Notification center access | Navigation bar |
| Badge | Unread count | On bell icon |
| Check Now | Manual refresh | Status bar right side |

### Timing

| Action | Interval | Configurable? |
|--------|----------|---------------|
| Auto-poll | 30 seconds | Yes |
| Toast duration | 5 seconds | Yes |
| Badge reset | On "Check Now" | N/A |

---

This visual guide helps understand how the real-time notification system works and appears to users! 🎉
