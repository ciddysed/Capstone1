# Toast Notification Migration Guide

This document lists all files that need to be updated to replace alert() calls with the new toast notification system.

## Files Updated:

### System Admin
- ✅ `src/pages/SystemAdmin/EvaluatorManagement/index.jsx`
- ✅ `src/pages/SystemAdmin/EvaluatorManagement/EvaluatorManagementContent.jsx`

### Program Admin
- `src/pages/ProgramAdmin/HomePage/components/AcceptedStudentsTab.jsx`
- `src/pages/ProgramAdmin/HomePage/components/ApplicationDetailsDialog.jsx`

### Evaluators
- `src/pages/evaluators/Accreditations/Accreditations.jsx`
- `src/pages/evaluators/Accreditations/GradedAccreditation.jsx`

### Shared Components
- `src/components/shared/DocumentHandler/index.jsx`

## How to use toast:

### Import
```javascript
import toast from '../path/to/utils/toast';
```

### Usage
```javascript
// Success
toast.success('Operation completed successfully!');

// Error
toast.error('An error occurred. Please try again.');

// Warning
toast.warning('Please check your input.');

// Info
toast.info('New notification available.');
```

### Replace patterns:
- `alert('message')` → `toast.info('message')` (for general messages)
- `alert('Success...')` → `toast.success('Success...')`
- `alert('Error...')` or `alert('Failed...')` → `toast.error('Error...')`
- `alert('Please...')` → `toast.warning('Please...')` (for validation messages)
