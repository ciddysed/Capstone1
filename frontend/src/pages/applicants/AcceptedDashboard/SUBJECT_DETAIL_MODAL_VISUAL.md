# Subject Detail Modal - Visual Guide

## 🎨 Modal Appearance

```
┌────────────────────────────────────────────────────────────────┐
│  🎓 Subject Evaluation Details                           [X]   │ ← Maroon Header
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Subject Code                                            │ │
│  │  IT101                                                   │ │ ← Large, Bold
│  │  Introduction to Computing                              │ │
│  │  This course covers fundamental concepts...             │ │
│  │                                    Units: 3             │ │
│  │                                    Grade: [A]           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Academic Period                                               │
│  [Year 1] [Semester 1]                                        │ ← Gold Chips
│                                                                │
│  ────────────────────────────────────────────────────────────│
│                                                                │
│  ℹ️ Evaluation Status                                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ✅ APPROVED                                             │ │ ← Green Box
│  │  This subject has been evaluated and accredited.        │ │
│  │  Credit will be given for this course.                  │ │
│  │  Recorded on: October 15, 2025, 2:30 PM                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  📄 Process of Accreditation                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  The subject was reviewed by the curriculum committee.  │ │
│  │  Course syllabus was compared with the current         │ │
│  │  curriculum requirements. All learning outcomes        │ │
│  │  match the expected competencies.                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  📄 Substantive Basis                                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Syllabus content covers 90% of required topics.       │ │
│  │  Laboratory exercises align with course objectives.     │ │
│  │  Grade of A demonstrates mastery of subject matter.    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Additional Course Information                                 │
│  Lecture Hours: 3 hours/week                                  │
│  Laboratory Hours: 0 hours/week                               │
│  Prerequisites: None                                           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                          [Close] │ ← Maroon Button
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Status Variations

### ✅ APPROVED Status
```
┌────────────────────────────────────────┐
│  ✅ APPROVED                           │ ← Green background
│  This subject has been evaluated and   │   Green border
│  accredited. Credit will be given.     │   Green icon
│  Recorded on: October 15, 2025         │
└────────────────────────────────────────┘
```

### ⏳ PENDING Status
```
┌────────────────────────────────────────┐
│  ⏳ PENDING                            │ ← Orange background
│  This subject is currently under       │   Orange border
│  evaluation. Please wait for review.   │   Orange icon
│  Recorded on: October 15, 2025         │
└────────────────────────────────────────┘
```

### ❌ REJECTED Status
```
┌────────────────────────────────────────┐
│  ❌ REJECTED                           │ ← Red background
│  This subject was not accredited. You  │   Red border
│  may need to take this course.         │   Red icon
│  Recorded on: October 15, 2025         │
└────────────────────────────────────────┘
│                                        │
│  ⚠️ Need Help?                        │ ← Orange help box
│  If you believe this evaluation is     │   (Only for REJECTED)
│  incorrect or would like to appeal,    │
│  please contact your program evaluator.│
└────────────────────────────────────────┘
```

---

## 🖱️ Interactive Elements

### Table Row (Before Click)
```
┌─────────┬─────────────────────┬───────┬──────────┐
│ IT101   │ Intro to Computing │  [A]  │ ✅ APPROVED │
└─────────┴─────────────────────┴───────┴──────────┘
```

### Table Row (On Hover)
```
┌─────────┬─────────────────────┬───────┬──────────┐
│ IT101   │ Intro to Computing │  [A]  │ ✅ APPROVED │ ← Light maroon background
└─────────┴─────────────────────┴───────┴──────────┘   Cursor changes to pointer
```

### Table Row (Clicked)
```
→ Modal opens with full details
```

---

## 📱 Responsive Behavior

### Desktop View (> 900px)
```
┌──────────────────────────────────────────────────┐
│  🎓 Subject Evaluation Details            [X]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────┬─────────────────┐  │
│  │ IT101                   │  Units: 3       │  │ ← Two columns
│  │ Intro to Computing      │  Grade: [A]     │  │
│  └─────────────────────────┴─────────────────┘  │
│                                                  │
│  [Rest of content...]                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Mobile View (< 600px)
```
┌─────────────────────────┐
│  🎓 Subject      [X]   │
├─────────────────────────┤
│                         │
│  IT101                  │ ← Single column
│  Intro to Computing     │   Stacked layout
│  Units: 3               │
│  Grade: [A]             │
│                         │
│  [Rest of content...]   │
│                         │
└─────────────────────────┘
```

---

## 🎨 Color Reference

### Header
- Background: `#6A0000` (Maroon)
- Text: `#FFFFFF` (White)
- Close button hover: `rgba(255,255,255,0.2)`

### Status Colors
- **Approved**: 
  - Icon: `#4caf50`
  - Background: `rgba(76,175,80,0.1)`
  - Border: `#4caf50`

- **Pending**: 
  - Icon: `#ff9800`
  - Background: `rgba(255,152,0,0.1)`
  - Border: `#ff9800`

- **Rejected**: 
  - Icon: `#f44336`
  - Background: `rgba(244,67,54,0.1)`
  - Border: `#f44336`

### Content Sections
- Background: `rgba(245,245,245,0.5)`
- Border: `rgba(0,0,0,0.1)`
- Text: Default MUI text colors

### Academic Period Chips
- Border: `#FFC72C` (Gold)
- Text: `#D4A500` (Dark Gold)

---

## 🔄 Animation & Transitions

### Modal Open
```
Fade in: 225ms
Slide down: 195ms
Ease-out timing
```

### Modal Close
```
Fade out: 195ms
Slide up: 195ms
Ease-in timing
```

### Row Hover
```
Background transition: 200ms
Color change: smooth
```

---

## 📊 Information Hierarchy

### Level 1 (Most Important)
```
1. Subject Code (IT101) ← Largest, boldest
2. Evaluation Status ← Color-coded, with icon
```

### Level 2 (Important)
```
3. Subject Title
4. Units & Grade
5. Academic Period
```

### Level 3 (Supporting Details)
```
6. Description
7. Process of Accreditation
8. Substantive Basis
9. Course hours & prerequisites
```

### Level 4 (Contextual Help)
```
10. Help text (for rejected subjects)
11. Record date
```

---

## 🎭 User Flow Diagram

```
User Dashboard
       ↓
   [View Subject List]
       ↓
   Hover over row
       ↓
   Row highlights ← Visual feedback
       ↓
   Click on row
       ↓
   Modal opens with animation
       ↓
   View all details
       ↓
   ┌─────────────────────┐
   │                     │
   ↓                     ↓
[Close Button]    [Click Outside]
   │                     │
   └──────────┬──────────┘
              ↓
        Modal closes
              ↓
     Back to dashboard
```

---

## 🖼️ Section Layout Examples

### Subject Information Section
```
┌───────────────────────────────────────────────┐
│  Subject Code                                 │ ← Label
│  IT101                                        │ ← Large display
│  Introduction to Computing                    │ ← Title
│  Description text here...                     │ ← Body text
│                                        Units: 3│ ← Right-aligned
│                                      Grade: [A]│
└───────────────────────────────────────────────┘
```

### Academic Period Section
```
Academic Period                    ← Label
[Year 1] [Semester 1]             ← Chips (horizontal)
```

### Evaluation Status Section
```
ℹ️ Evaluation Status               ← Label with icon

┌───────────────────────────────────────────────┐
│  ✅ APPROVED                                  │ ← Icon + status
│  Detailed explanation text...                 │ ← Description
│  Recorded on: October 15, 2025, 2:30 PM      │ ← Timestamp
└───────────────────────────────────────────────┘
```

### Text Block Section
```
📄 Process of Accreditation        ← Label with icon

┌───────────────────────────────────────────────┐
│  Multi-line text content goes here.           │
│  Can span multiple lines.                     │
│  Preserves formatting.                        │
└───────────────────────────────────────────────┘
```

### Grid Information Section
```
Additional Course Information      ← Label

Lecture Hours: 3 hours/week       ← Left column
Laboratory Hours: 0 hours/week    ← Right column
Prerequisites: None                ← Full width
```

---

## ✨ Special Features

### 1. Smart Content Display
```
If processOfAccreditation exists:
  ✓ Show section

If processOfAccreditation is null/empty:
  ✗ Hide section entirely
```

### 2. Help Text Conditional
```
If status === 'REJECTED':
  ✓ Show orange help box

If status !== 'REJECTED':
  ✗ Hide help box
```

### 3. Date Formatting
```
Input:  "2025-10-15T14:30:00.000Z"
Output: "October 15, 2025, 2:30 PM"
```

### 4. Fallback Values
```
If grade is null:  Display "N/A"
If units is null:  Display "N/A"
If prerequisite is null: Hide section
```

---

## 🎪 Example Scenarios

### Scenario 1: Fully Approved Subject
```
✓ All fields populated
✓ Green status indicator
✓ Positive messaging
✓ No help text needed
```

### Scenario 2: Pending Evaluation
```
✓ Basic info shown
⏳ Orange status indicator
⏳ "Please wait" message
✗ No accreditation details yet
```

### Scenario 3: Rejected Subject
```
✓ All fields populated
❌ Red status indicator
❌ Explanation of rejection
✓ Help box with guidance
✓ Process and basis details
```

### Scenario 4: Minimal Data
```
✓ Subject code and title
✓ Status indicator
✗ No description
✗ No accreditation details
✗ Only core information
```

---

## 💡 Pro Tips

### For Developers
1. Always null-check before displaying
2. Use optional chaining (`?.`)
3. Provide fallback values
4. Test with incomplete data
5. Check all status types

### For Designers
1. Maintain color consistency
2. Use adequate spacing
3. Keep text readable
4. Ensure sufficient contrast
5. Test on mobile devices

### For Users
1. Click any subject row to view details
2. Look for color-coded status
3. Read the help text for rejected subjects
4. Check the record date
5. Close with button, Esc, or click outside

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
