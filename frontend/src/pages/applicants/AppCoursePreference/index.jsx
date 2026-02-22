import { useState, useEffect, useCallback } from "react"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  LinearProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Box,
  Grid,
  Paper,
  IconButton,
  CircularProgress,
  alpha,
} from "@mui/material"
import {
  Person as UserIcon,
  School as GraduationCapIcon,
  Description as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  Warning as AlertCircleIcon,
  Add as PlusIcon,
  Close as XIcon,
} from "@mui/icons-material"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import useResponseHandler from "../../../utils/useResponseHandler"
import DashboardLink from '../../../components/DashboardLink';

// Document type definitions with user-friendly names
const documentTypes = [
  { value: "INFORMATIVE_COPY_OF_TOR", label: "Informative Copy of TOR", required: true },
  { value: "PSA_AUTHENTICATED_BIRTH_CERTIFICATE", label: "PSA Birth Certificate" },
  { value: "CERTIFICATE_OF_TRANSFER_CREDENTIAL", label: "Certificate of Transfer Credential" },
  { value: "MARRIAGE_CERTIFICATE", label: "Marriage Certificate" },
  { value: "CERTIFICATE_OF_EMPLOYMENT", label: "Certificate of Employment" },
  { value: "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION", label: "Employer Certified Job Description" },
  { value: "EVIDENCE_OF_BUSINESS_OWNERSHIP", label: "Evidence of Business Ownership" },
]

const priorityOrders = ["FIRST", "SECOND", "THIRD"]

// Maroon and Gold color palette
const maroonTheme = {
  primary: {
    main: '#800000', // Deep maroon
    light: '#A0001A', // Lighter maroon
    dark: '#600000', // Darker maroon
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#B8860B', // Dark goldenrod
    light: '#FFD700', // Gold
    dark: '#8B6F00' // Darker gold
  }
}

export default function ApplicationForm() {
  const navigate = useNavigate()
  const { handleSuccess, handleError, snackbar } = useResponseHandler()

  const [applicantId, setApplicantId] = useState(null)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  })
  const [coursePreferences, setCoursePreferences] = useState([])
  const [files, setFiles] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [loading, setLoading] = useState({
    profile: true,
    courses: true,
    documents: true,
    preferences: true
  })

  // Get priority label with ordinal suffix
  const getPriorityLabel = (index) => {
    return `${index + 1}${getOrdinalSuffix(index + 1)} Choice`
  }

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num) => {
    const number = Number(num)
    if (isNaN(number)) return ''

    if (number % 100 >= 11 && number % 100 <= 13) {
      return 'th'
    }

    switch (number % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  // --- NEW: auth helper to attach Authorization header if token exists ---
  const getAuthToken = () => {
    // check common localStorage keys used for tokens
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt") ||
      null
    )
  }

  const getAuthConfig = (extra = {}) => {
    const token = getAuthToken()
    const headers = { ...(extra.headers || {}) }
    if (token) headers.Authorization = `Bearer ${token}`
    return { headers, ...extra }
  }
  // --- end auth helper ---

  // Fetch applicant data
  const fetchApplicantData = useCallback(async (id) => {
    try {
      setLoading(prev => ({ ...prev, profile: true }))
      const response = await axios.get(`https://eteeap-foth.onrender.com/api/applicants/${id}`, getAuthConfig())
      setUserData({
        name: `${response.data.firstName} ${response.data.lastName}`,
        email: response.data.email,
      })
    } catch (error) {
      console.error("Error fetching applicant data:", error)
      handleError("Failed to load applicant data")
    } finally {
      setLoading(prev => ({ ...prev, profile: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch courses from backend
  const fetchCoursesFromBackend = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }))
      const response = await axios.get("https://eteeap-foth.onrender.com/api/courses", getAuthConfig())
      const processedCourses = response.data.map((course) => {
        let department = ""
        const deptId = course.department?.departmentId
        if (deptId === 1) {
          department = "College of Arts, Sciences, and Education "
        } else if (deptId === 2) {
          department = "College of Computer Studies"
        } else if (deptId === 3) {
          department = "College of Management, Business and Accountancy"
        } else if (deptId === 4) {
          department = "College of Engineering and Architecture"
        } else {
          department = "Other Programs"
        }

        // Log if description is present
        if (course.description) {
          console.log(`Course "${course.courseName}"`)
        } else {
          console.log(`Course "${course.courseName}" has NO description.`)
        }

        const displayName = course.description

        return {
          ...course,
          department: department,
          courseCode: course.courseCode || displayName,
        }
      })
      setAvailableCourses(processedCourses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      handleError("Failed to load courses")
    } finally {
      setLoading(prev => ({ ...prev, courses: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch uploaded documents
  const fetchUploadedDocuments = useCallback(async (applicantId) => {
    try {
      setLoading(prev => ({ ...prev, documents: true }))
      const response = await axios.get(`https://eteeap-foth.onrender.com/api/documents/applicant/${applicantId}`, getAuthConfig())
      const documents = response.data.map((doc) => ({
        name: doc.fileName,
        id: doc.documentId,
        downloadUrl: doc.downloadUrl,
        documentType: doc.documentType,
        size: doc.fileSize || 0,
        uploadDate: new Date(doc.uploadDate)
      }))
      setFiles(documents)
    } catch (error) {
      console.error("Error fetching uploaded documents:", error)
      handleError("Failed to load uploaded documents")
    } finally {
      setLoading(prev => ({ ...prev, documents: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- NEW helpers: normalize preference + localStorage cache keys ---
  const prefCacheKey = (id) => `coursePreferences_applicant_${id}`

  const priorityStringMap = {
    1: "FIRST",
    2: "SECOND",
    3: "THIRD",
    FIRST: "FIRST",
    SECOND: "SECOND",
    THIRD: "THIRD",
    first: "FIRST",
    second: "SECOND",
    third: "THIRD",
  }

  const normalizePreference = (pref = {}) => {
    const rawPriority = pref.priorityOrder ?? pref.preferenceOrder
    const normalizedPriority = priorityStringMap[rawPriority] || String(rawPriority ?? "").toUpperCase()
    const courseObj = pref.course || {}
    const courseId = Number(courseObj.courseId ?? pref.courseId ?? courseObj.id)
    return {
      ...pref,
      // keep backend ids if present
      preferenceId: pref.preferenceId ?? pref.id ?? pref.preferenceId,
      priorityOrder: normalizedPriority,
      course: {
        ...courseObj,
        courseId: Number.isNaN(courseId) ? courseObj.courseId : courseId
      }
    }
  }

  const sortPreferences = (prefs) => {
    const order = { FIRST: 1, SECOND: 2, THIRD: 3 }
    return [...prefs].sort((a, b) => (order[a.priorityOrder] || 99) - (order[b.priorityOrder] || 99))
  }

  const cachePreferences = (appId, prefs) => {
    try {
      localStorage.setItem(prefCacheKey(appId), JSON.stringify(prefs))
    } catch (e) {
      console.warn("Failed to cache preferences", e)
    }
  }

  const loadCachedPreferences = (appId) => {
    const raw = localStorage.getItem(prefCacheKey(appId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // ensure normalization
    return (parsed || []).map(normalizePreference)
  }
  // --- end new helpers ---

  // Fetch course preferences
  const fetchCoursePreferences = useCallback(async (applicantId) => {
    try {
      setLoading(prev => ({ ...prev, preferences: true }))

      // Try to show cached preferences immediately (so progress reflects selection on reload)
      const cached = loadCachedPreferences(applicantId)
      if (cached && cached.length > 0) {
        setCoursePreferences(sortPreferences(cached))
      }

      const response = await axios.get(`https://eteeap-foth.onrender.com/api/preferences/applicant/${applicantId}`, getAuthConfig())

      // normalize and sort
      const normalized = (response.data || []).map(normalizePreference)
      const sortedPrefs = sortPreferences(normalized)

      setCoursePreferences(sortedPrefs)
      cachePreferences(applicantId, sortedPrefs)
    } catch (error) {
      console.error("Error fetching course preferences:", error)
      // keep whatever cached prefs we might have shown; if none, clear state
      const cached = loadCachedPreferences(applicantId)
      if (!cached) setCoursePreferences([])
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize component
  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId")

    if (!storedApplicantId) {
      handleError("Please login to continue")
      navigate("/login")
      return
    }

    setApplicantId(storedApplicantId)
  }, [navigate, handleError])

  // Fetch data after applicantId is set
  useEffect(() => {
    if (applicantId) {
      fetchApplicantData(applicantId)
      fetchCoursesFromBackend()
      fetchUploadedDocuments(applicantId)
      fetchCoursePreferences(applicantId)
    }
  }, [applicantId, fetchApplicantData, fetchCoursesFromBackend, fetchUploadedDocuments, fetchCoursePreferences])

  // Check if course is already selected (use numeric compare)
  const checkCourseAlreadySelected = (courseId) => {
    const idNum = Number(courseId)
    return coursePreferences.some(pref => Number(pref.course?.courseId) === idNum)
  }

  // Calculate completion progress
  const calculateProgress = () => {
    let completed = 0
    const total = 4 // Personal info, preferences, required docs, submission

    if (userData.name && userData.email) completed++
    if (coursePreferences.length > 0) completed++
    if (files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR")) completed++
    if (files.length >= 3) completed++

    return (completed / total) * 100
  }

  // Open course dialog
  const openCourseDialog = (priorityIndex) => {
    setCurrentPriorityIndex(priorityIndex)
    setCourseDialogOpen(true)
  }

  // Get course preference by priority order
  const getCoursePreferenceByPriority = (priorityIndex) => {
    const target = priorityOrders[priorityIndex]
    return coursePreferences.find(pref => pref.priorityOrder === target)
  }

  // Handle course selection
  const handleCourseSelection = async () => {
    if (!selectedCourse || currentPriorityIndex === null) {
      return
    }

    // Check if this course is already selected in another priority level (use numeric compare)
    const isDuplicate = coursePreferences.some(
      pref => Number(pref.course?.courseId) === Number(selectedCourse.courseId) &&
        pref.priorityOrder !== priorityOrders[currentPriorityIndex]
    )

    if (isDuplicate) {
      handleError("This course is already selected in another priority level. Each course can only be selected once.")
      return
    }

    // Find if a preference for this priority already exists
    const existingPreference = coursePreferences.find(
      (pref) => pref.priorityOrder === priorityOrders[currentPriorityIndex]
    )

    try {
      if (existingPreference) {
        // Update existing preference
        const preferenceId = existingPreference.preferenceId ?? existingPreference.id
        const updatedPreferencePayload = {
          preferenceId: preferenceId,
          applicant: { applicantId: Number(applicantId) },
          course: { courseId: Number(selectedCourse.courseId) },
          priorityOrder: priorityOrders[currentPriorityIndex],
          status: existingPreference.status || "PENDING"
        }

        const response = await axios.put(
          `https://eteeap-foth.onrender.com/api/preferences/${preferenceId}`,
          updatedPreferencePayload,
          getAuthConfig({ headers: { "Content-Type": "application/json" } })
        )

        const normalizedResponse = normalizePreference(response.data)
        const updatedPreferences = coursePreferences.map((pref) =>
          (pref.preferenceId ?? pref.id) === (normalizedResponse.preferenceId ?? normalizedResponse.id) ? normalizedResponse : pref
        )
        const sorted = sortPreferences(updatedPreferences)
        setCoursePreferences(sorted)
        cachePreferences(applicantId, sorted)
        handleSuccess("Course preference updated!")
      } else {
        // Create new preference
        const newPreference = {
          course: { courseId: Number(selectedCourse.courseId) },
          priorityOrder: priorityOrders[currentPriorityIndex],
        }

        const response = await axios.post(
          `https://eteeap-foth.onrender.com/api/preferences/applicant/${applicantId}`,
          newPreference,
          getAuthConfig({ headers: { "Content-Type": "application/json" } })
        )

        const normalizedResponse = normalizePreference(response.data)

        // Replace any preference that has the same priority (avoid duplicates) and keep others
        const updatedPreferences = [
          ...coursePreferences.filter(pref => pref.priorityOrder !== normalizedResponse.priorityOrder),
          normalizedResponse
        ]
        const sorted = sortPreferences(updatedPreferences)
        setCoursePreferences(sorted)
        cachePreferences(applicantId, sorted)
        handleSuccess("Course preference added!")
      }
    } catch (error) {
      console.error("Error saving course preference:", error)
      handleError("Failed to save course preference")
    }

    setCourseDialogOpen(false)
    setSelectedCourse(null)
  }

  // Handle file upload
  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0]

    if (!file) {
      handleError("No file selected for upload.")
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB")
      return
    }

    // Check if this is a replacement (documentType is an object with document info)
    const isReplacement = typeof documentType === 'object' && documentType.documentType
    const actualDocumentType = isReplacement ? documentType.documentType : documentType
    const documentId = isReplacement ? documentType.id : null

    // Prevent duplicate upload for the same document type
    if (!isReplacement) {
      const alreadyUploaded = files.some(f => String(f.documentType).toLowerCase() === String(actualDocumentType).toLowerCase());
      if (alreadyUploaded) {
        handleError("You have already uploaded a file for this document type. Please remove or replace it if you want to upload a new one.");
        return;
      }
    }

    const formData = new FormData()
    formData.append("files", file)
    formData.append("applicantId", applicantId)
    formData.append("documentType", actualDocumentType)

    try {
      if (isReplacement && documentId) {
        // For replacement, use PUT request to update existing document
        const response = await axios.put(`https://eteeap-foth.onrender.com/api/documents/${documentId}`, formData, getAuthConfig({
          headers: { "Content-Type": "multipart/form-data" }
        }))

        handleSuccess(`${getDocumentTypeLabel(actualDocumentType)} replaced successfully!`)

        // Update the specific file in the files array
        setFiles((prevFiles) =>
          prevFiles.map(prevFile =>
            prevFile.id === documentId
              ? {
                name: response.data.fileName,
                id: response.data.documentId,
                downloadUrl: response.data.downloadUrl,
                documentType: actualDocumentType,
                size: response.data.fileSize || 0,
                uploadDate: new Date(response.data.uploadDate)
              }
              : prevFile
          )
        )
      } else {
        // For new upload, use POST request
        const response = await axios.post("https://eteeap-foth.onrender.com/api/documents/upload", formData, getAuthConfig({
          headers: { "Content-Type": "multipart/form-data" }
        }))

        handleSuccess(`${getDocumentTypeLabel(actualDocumentType)} uploaded successfully!`)

        const uploadedFile = {
          name: response.data.fileName,
          id: response.data.documentId,
          downloadUrl: response.data.downloadUrl,
          documentType: actualDocumentType,
          size: response.data.fileSize || 0,
          uploadDate: new Date(response.data.uploadDate)
        }

        setFiles((prevFiles) => [...prevFiles, uploadedFile])
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      if (error.response && error.response.data) {
        handleError(`Failed to upload: ${error.response.data}`)
      } else {
        handleError("Failed to upload file. Please try again.")
      }
    }
  }

  // Helper function to get document type label
  const getDocumentTypeLabel = (value) => {
    const docType = documentTypes.find(type => type.value === value)
    return docType ? docType.label : value
  }

  // Remove file
  const removeFile = async (fileId) => {
    // Optimistically remove from UI
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    try {
      await axios.delete(`https://eteeap-foth.onrender.com/api/documents/${fileId}`, getAuthConfig());
      handleSuccess('File removed successfully.');
    } catch (error) {
      console.error('Error deleting file:', error);
      handleError('Failed to remove file from server. Please refresh and try again.');
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validation: Must have TOR, COE, and at least 3 files (TOR, COE, and any other)
    const hasTOR = files.some(file => file.documentType === "INFORMATIVE_COPY_OF_TOR");
    const hasCOE = files.some(file => file.documentType === "CERTIFICATE_OF_EMPLOYMENT");
    if (!hasTOR) {
      handleError('You must upload the "Transcript of Records" before submitting your application.');
      return;
    }
    if (!hasCOE) {
      handleError('You must upload the "Certificate of Employment" before submitting your application.');
      return;
    }
    if (files.length < 3) {
      handleError('You must upload a minimum of 3 documents: Transcript of Records, Certificate of Employment, and at least one other required document.');
      return;
    }

    try {
      setSubmitting(true);
      // Check if application already exists
      try {
        const response = await axios.get(`https://eteeap-foth.onrender.com/api/applications/applicant/${applicantId}`, getAuthConfig());
        if (response.data && response.data.length > 0) {
          setSuccessModalOpen(true);
          setSubmitting(false);
          return;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No existing application found. Proceeding to create a new application.");
        } else {
          console.error("Error checking existing application:", error);
          handleError("Failed to check existing application. Please try again.");
          setSubmitting(false);
          return;
        }
      }
      // Create new application
      const newApplication = {
        status: "PENDING",
      };
      await axios.post(`https://eteeap-foth.onrender.com/api/applications/applicant/${applicantId}`, newApplication, getAuthConfig({
        headers: { "Content-Type": "application/json" }
      }));
      handleSuccess("Application submitted successfully!");
      setSubmitting(false);
      navigate("/ApplicationTrack");
    } catch (error) {
      console.error("Error submitting application:", error);
      handleError("Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  }

  // Handle track application
  const handleTrackApplication = () => {
    setSuccessModalOpen(false)
    navigate("/ApplicationTrack")
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Check if all data has finished loading
  const isLoading = loading.profile || loading.courses || loading.documents || loading.preferences

  const RequirementRow = ({ ok, label }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {ok ? (
        <CheckCircleIcon sx={{ color: "success.main", fontSize: 14 }} />
      ) : (
        <AlertCircleIcon sx={{ color: "error.main", fontSize: 14 }} />
      )}
      <Typography variant="caption">{label}</Typography>
    </Box>
  );


  return (
    <>
      {/* Removed duplicate DashboardLink above header */}
      <Box sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha('#B8860B', 0.05)} 0%, ${alpha('#FFD700', 0.03)} 100%)`,
        bgcolor: "grey.50"
      }}>
        {/* Header */}
        <Paper elevation={1} sx={{ borderRadius: 0, bgcolor: maroonTheme.primary.main }}>
          <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "white",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCapIcon sx={{ color: maroonTheme.primary.main, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    ETEEAP APPLICANT APPLICATION FORM
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Complete your application for admission
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight="medium" color="white">
                    {userData.name || "Loading..."}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.8)">
                    {userData.email || "Loading..."}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserIcon sx={{ color: maroonTheme.primary.main, fontSize: 16 }} />
                </Box>
                <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
                  <DashboardLink />
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Progress Bar */}
        <Paper elevation={1} sx={{ borderRadius: 0, background: `linear-gradient(135deg, ${alpha('#FFD700', 0.1)} 0%, ${alpha('#B8860B', 0.08)} 100%)` }}>
          <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight="medium" color="text.primary">
                Application Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(calculateProgress())}% Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateProgress()}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha('#FFD700', 0.2),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`
                }
              }}
            />
          </Box>
        </Paper>

        {/* Loading State */}
        {isLoading ? (
          <Box sx={{
            display: "flex",
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: "center",
            my: 6,
            backgroundColor: alpha('#FFFFFF', 0.9),
            p: 4,
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: 400,
            mx: "auto"
          }}>
            <CircularProgress size={60} sx={{ color: maroonTheme.primary.main, mb: 3 }} />
            <Typography variant="h6" sx={{ color: maroonTheme.primary.main, fontWeight: 600 }}>
              Loading Application Data
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Please wait while we prepare your application...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Main Content */}
            <Box sx={{ maxWidth: "1700px", mx: "auto", px: 3, py: 3 }}>
              <Grid container spacing={3} alignItems="stretch">
                {/* Left Column - Personal Info & Course Preferences */}
                <Grid item xs={12} lg={6} size={6} sx={{display: "flex"}}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3, flex: 1}}>
                    {/* Personal Information */}
                    <Card elevation={2} sx={{
                      border: `2px solid ${alpha(maroonTheme.secondary.light, 0.2)}`,
                      '&:hover': {
                        boxShadow: `0 8px 32px ${alpha(maroonTheme.primary.main, 0.12)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardHeader
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <UserIcon sx={{ color: maroonTheme.primary.main, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: maroonTheme.primary.main, fontWeight: 600 }}>Personal Information</Typography>
                          </Box>
                        }
                        sx={{
                          py: 1,
                          px: 1,
                          background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.08)} 0%, ${alpha(maroonTheme.primary.main, 0.05)} 100%)`
                        }}
                      />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                Full Name
                              </Typography>
                            </Box>
                            <Paper variant="outlined" sx={{
                              p: 2,
                              background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                              border: `1px solid ${alpha(maroonTheme.secondary.main, 0.2)}`
                            }}>
                              <Typography fontWeight="medium" color="text.primary">
                                {userData.name}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight="medium" color="text.primary">
                                Email Address
                              </Typography>
                            </Box>
                            <Paper variant="outlined" sx={{
                              p: 2,
                              background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.8)} 100%)`,
                              border: `1px solid ${alpha(maroonTheme.secondary.main, 0.2)}`
                            }}>
                              <Typography color="text.primary">{userData.email}</Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Course Preferences */}
                    <Card elevation={2} sx={{
                      border: `2px solid ${alpha(maroonTheme.secondary.light, 0.2)}`,
                      maxHeight: files.length === 0 ? 176 : 317,
                      overflowY: 'auto',
                      '&:hover': {
                        boxShadow: `0 8px 32px ${alpha(maroonTheme.primary.main, 0.12)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',

                    }}>
                      <CardHeader
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <GraduationCapIcon sx={{ color: maroonTheme.primary.main, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: maroonTheme.primary.main, fontWeight: 600 }}>Your Course Preferences</Typography>
                          </Box>
                        }
                        subheader="Select up to 3 courses in order of preferences"
                        sx={{
                          py: 1,
                          px: 1,
                          background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.08)} 0%, ${alpha(maroonTheme.primary.main, 0.05)} 100%)`
                        }}
                      />
                      <CardContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {[0, 1, 2].map((index) => {
                            const preference = getCoursePreferenceByPriority(index)
                            return (
                              <Paper
                                key={index}
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  "&:hover": { bgcolor: "grey.50" },
                                  transition: "background-color 0.2s",
                                }}
                              >
                                <Chip
                                  label={getPriorityLabel(index)}
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    minWidth: 80,
                                    backgroundColor: index % 2 === 0 ? maroonTheme.primary.main : maroonTheme.secondary.main,
                                    color: 'white',
                                    borderColor: index % 2 === 0 ? maroonTheme.primary.main : maroonTheme.secondary.main,
                                    '&:hover': {
                                      backgroundColor: index % 2 === 0 ? maroonTheme.primary.dark : maroonTheme.secondary.dark
                                    }
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  {preference ? (
                                    <Box>
                                      <Typography fontWeight="medium" color="text.primary">
                                        {preference.course.courseName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {(() => {
                                          // Try to find the matching course in availableCourses to get the processed department
                                          const matchingCourse = availableCourses.find(c => c.courseId === preference.course.courseId)
                                          if (matchingCourse) {
                                            return matchingCourse.department
                                          }
                                          // Fallback to original logic
                                          return preference.course.department?.departmentName ||
                                            preference.course.department ||
                                            "Department"
                                        })()}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {preference.course.description || preference.course.courseCode}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography color="text.secondary" fontStyle="italic">
                                      No course selected
                                    </Typography>
                                  )}
                                </Box>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => openCourseDialog(index)}
                                  sx={{
                                    borderColor: maroonTheme.primary.main,
                                    color: maroonTheme.primary.main,
                                    '&:hover': {
                                      borderColor: maroonTheme.primary.dark,
                                      backgroundColor: alpha(maroonTheme.primary.main, 0.1),
                                      color: maroonTheme.primary.dark
                                    }
                                  }}
                                >
                                  {preference ? "Change" : "Select"}
                                </Button>
                              </Paper>
                            )
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>

                {/* Right Section - Documents in Horizontal Row */}
                <Grid item xs={12} lg={6} size={6} >
                  <Card
                    elevation={2}
                    sx={{
                      border: `2px solid ${alpha(maroonTheme.secondary.light, 0.2)}`,
                      transition: "all 0.3s ease",
                      width: "100%",
                      maxHeight: 520,
                      minWidth: 520,
                      '&:hover': {
                        boxShadow: `0 8px 32px ${alpha(maroonTheme.primary.main, 0.12)}`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {/* HEADER */}
                    <CardHeader
                      title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FileTextIcon sx={{ color: maroonTheme.primary.main, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: maroonTheme.primary.main, fontWeight: 600 }}>Documents & Requirements</Typography>
                          </Box>
                      }
                      sx={{
                        px: 1,
                        py: 1,
                        background: `linear-gradient(135deg,
                        ${alpha(maroonTheme.secondary.light, 0.08)} 0%,
                        ${alpha(maroonTheme.primary.main, 0.05)} 100%)`,
                      }}
                    />

                    {/* CONTENT */}
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* ================= LEFT SIDE ================= */}
                        <Grid item xs={12} md={7} width={450}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, fontWeight: 600, color: maroonTheme.primary.main }}
                          >
                            Upload Documents
                          </Typography>

                          {/* Uploaded Files */}
                          {files.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 2 }}>
                              <FileTextIcon sx={{ fontSize: 32, color: "grey.300", mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                No files uploaded yet
                              </Typography>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                maxHeight: 220,
                                maxWidth: 500,
                                overflow: "auto",
                                width: '100%'
                              }}
                            >
                              {files.map((file) => (
                                <Paper
                                  key={file.id}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <FileTextIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption" sx={{ flex: 1 }}>
                                      {file.name}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => removeFile(file.id)}
                                      sx={{ color: "error.main" }}
                                    >
                                      <XIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {getDocumentTypeLabel(file.documentType)} •{" "}
                                    {formatFileSize(file.size)}
                                  </Typography>
                                </Paper>
                              ))}
                            </Box>
                          )}

                          {/* Upload Buttons */}
                          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                            {documentTypes.slice(0, 2).map((docType) => (
                              <Box key={docType.value}>
                                <input
                                  hidden
                                  id={docType.value}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(e, docType.value)}
                                />
                                <label htmlFor={docType.value}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      border: "2px dashed",
                                      textAlign: "center",
                                      cursor: "pointer",
                                      "&:hover": {
                                        borderColor: maroonTheme.primary.main,
                                        backgroundColor: alpha(
                                          maroonTheme.secondary.light,
                                          0.1
                                        ),
                                      },
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, }}>
                                      <PlusIcon sx={{ fontSize: 16 }} />
                                      <Typography variant="caption">
                                        {docType.label}
                                        {docType.required && (
                                          <Typography component="span" color="error">
                                            *
                                          </Typography>
                                        )}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </label>
                              </Box>
                            ))}

                          </Box>
                        </Grid>

                        {/* ================= RIGHT SIDE ================= */}
                        <Grid item xs={12} md={5}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, fontWeight: 600, color: maroonTheme.primary.main }}
                          >
                            Requirements
                          </Typography>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <RequirementRow
                              ok={files.some(
                                (f) => f.documentType === "INFORMATIVE_COPY_OF_TOR"
                              )}
                              label="Transcript of Records Required"
                            />
                            <RequirementRow
                              ok={files.some(
                                (f) => f.documentType === "CERTIFICATE_OF_EMPLOYMENT"
                              )}
                              label="Certificate of Employment Required"
                            />

                            <RequirementRow
                              ok={files.some(
                                (f) => f.documentType === "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION"
                              )}
                              label="Employer Certified Job Description"
                            />
                            <RequirementRow
                              ok={files.length >= 3}
                              label="Minimum of 3 Documents"
                            />
                            <RequirementRow
                              ok={coursePreferences.length > 0}
                              label="Course Selected"
                            />
                          </Box>
                        </Grid>
                      </Grid>

                    </CardContent>
                    <Grid item xs={12} style={{ display: "flex", justifyContent: "center", padding: "10px", marginBottom: "10px", }}>

                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%',  ml: -30 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setDocumentsDialogOpen(true)}
                          sx={{ color: maroonTheme.primary.main, borderColor: maroonTheme.primary.main, fontSize: "12px", fontWeight: "bold", minWidth: 120, padding: '4px 12px', }}
                        >
                          View All Document Types
                        </Button>
                      </Box>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>

              {/* Submit Section */}
              <Box sx={{ mt: 4 }}>
                <Card elevation={3} sx={{
                  border: `2px solid ${alpha(maroonTheme.secondary.light, 0.3)}`,
                  background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.05)} 0%, ${alpha('#FFFFFF', 0.95)} 100%)`,
                  '&:hover': {
                    boxShadow: `0 12px 40px ${alpha(maroonTheme.primary.main, 0.15)}`,
                    transform: 'translateY(-3px)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ pt: 3 }}>
                    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="600" sx={{ color: maroonTheme.primary.main }}>
                          Ready to Submit?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Please review all information before submitting your application
                        </Typography>
                      </Box>

                      {!files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR") && (
                        <Alert
                          severity="warning"
                          sx={{
                            mx: "auto",
                            backgroundColor: alpha('#FFD700', 0.1),
                            color: maroonTheme.primary.dark,
                            '& .MuiAlert-icon': {
                              color: maroonTheme.secondary.main
                            }
                          }}
                        >
                          Please upload the required Informative Copy of TOR before submitting.
                        </Alert>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={
                          submitting ||
                          !files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR") ||
                          !files.some((f) => f.documentType === "CERTIFICATE_OF_EMPLOYMENT") ||
                          files.length < 3 ||
                          coursePreferences.length === 0
                        }
                        size="large"
                        variant="contained"
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: "1rem",
                          fontWeight: "medium",
                          background: `linear-gradient(135deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`,
                          color: 'white',
                          boxShadow: `0 4px 20px ${alpha(maroonTheme.primary.main, 0.3)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${maroonTheme.primary.dark} 0%, ${maroonTheme.secondary.dark} 100%)`,
                            boxShadow: `0 6px 25px ${alpha(maroonTheme.primary.main, 0.4)}`,
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            background: alpha(maroonTheme.primary.main, 0.3),
                            color: alpha('#FFFFFF', 0.6)
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {submitting ? (
                          <>
                            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                            Submitting Application...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </>
        )}

        {/* Course Selection Dialog */}
        <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{
            background: `linear-gradient(135deg, ${maroonTheme.primary.main} 0%, ${maroonTheme.secondary.main} 100%)`,
            color: 'white',
            fontWeight: 600
          }}>
            Select Course for {currentPriorityIndex !== null ? getPriorityLabel(currentPriorityIndex) : ""}
          </DialogTitle>
          <DialogContent sx={{ background: `linear-gradient(135deg, ${alpha(maroonTheme.secondary.light, 0.03)} 0%, ${alpha('#FFFFFF', 0.98)} 100%)` }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Box sx={{ maxHeight: 400, overflow: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
                {availableCourses.map((course) => (
                  <Paper
                    key={course.courseId}
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: selectedCourse?.courseId === course.courseId ? 2 : 1,
                      borderColor:
                        selectedCourse?.courseId === course.courseId ? maroonTheme.primary.main : alpha(maroonTheme.secondary.main, 0.3),
                      bgcolor:
                        selectedCourse?.courseId === course.courseId ? alpha(maroonTheme.secondary.light, 0.1) : "transparent",
                      "&:hover": {
                        borderColor: maroonTheme.primary.main,
                        bgcolor: selectedCourse?.courseId === course.courseId ? alpha(maroonTheme.secondary.light, 0.15) : alpha(maroonTheme.secondary.light, 0.05),
                      },
                      opacity: checkCourseAlreadySelected(course.courseId) ? 0.5 : 1,
                    }}
                    onClick={() => !checkCourseAlreadySelected(course.courseId) && setSelectedCourse(course)}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium" color="text.primary">
                        {course.courseName}
                        {checkCourseAlreadySelected(course.courseId) && (
                          <Chip
                            label="Already Selected"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.department}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.description || course.courseCode}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 2, borderTop: 1, borderColor: "grey.200" }}>
                <Button variant="outlined" onClick={() => setCourseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleCourseSelection} disabled={!selectedCourse} sx={{
                  backgroundColor: maroonTheme.primary.main,
                  '&:hover': { backgroundColor: maroonTheme.primary.dark }
                }}>
                  Select Course
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Documents Upload Dialog */}
        <Dialog open={documentsDialogOpen} onClose={() => setDocumentsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Upload required documents (Max 15MB each). Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {documentTypes.map((docType) => (
                  <Box key={docType.value} sx={{ position: "relative" }}>
                    <input
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      id={`dialog-${docType.value}`}
                      type="file"
                      onChange={(e) => handleFileUpload(e, docType.value)}
                    />
                    <label htmlFor={`dialog-${docType.value}`}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          border: "2px dashed",
                          borderColor: "grey.300",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: maroonTheme.primary.main,
                            bgcolor: maroonTheme.primary.light,
                            opacity: 0.1,
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <FileTextIcon sx={{ color: "grey.400", fontSize: 16 }} />
                          <Box>
                            <Typography variant="body2" fontWeight="medium" color="text.primary">
                              {docType.label}
                              {docType.required && (
                                <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                  *
                                </Typography>
                              )}
                            </Typography>
                          </Box>
                        </Box>
                        <PlusIcon sx={{ color: "grey.400", fontSize: 16 }} />
                      </Paper>
                    </label>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2, borderTop: 1, borderColor: "grey.200" }}>
                <Button variant="outlined" onClick={() => setDocumentsDialogOpen(false)}>
                  Close
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onClose={() => setSuccessModalOpen(false)} maxWidth="sm">
          <DialogContent>
            <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "success.light",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 32, color: "success.main" }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Application Already Submitted!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Your application has already been submitted. You can track your application status below.
                </Typography>
              </Box>
              <Button onClick={handleTrackApplication} variant="contained" fullWidth sx={{
                backgroundColor: maroonTheme.primary.main,
                '&:hover': { backgroundColor: maroonTheme.primary.dark }
              }}>
                Track Application
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Snackbar for notifications */}
        {snackbar}
      </Box>
    </>
  )
}
