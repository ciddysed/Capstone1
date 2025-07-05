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
  CloudUpload as UploadIcon,
  Description as FileTextIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  Warning as AlertCircleIcon,
  Add as PlusIcon,
  Close as XIcon,
  Visibility as EyeIcon,
} from "@mui/icons-material"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import useResponseHandler from "../../../utils/useResponseHandler"

// Document type definitions with user-friendly names
const documentTypes = [
  { value: "APPLICANTS_EVALUATION_SHEET", label: "Applicant's Evaluation Sheet" },
  { value: "INFORMATIVE_COPY_OF_TOR", label: "Informative Copy of TOR", required: true },
  { value: "PSA_AUTHENTICATED_BIRTH_CERTIFICATE", label: "PSA Birth Certificate" },
  { value: "CERTIFICATE_OF_TRANSFER_CREDENTIAL", label: "Certificate of Transfer Credential" },
  { value: "MARRIAGE_CERTIFICATE", label: "Marriage Certificate" },
  { value: "CERTIFICATE_OF_EMPLOYMENT", label: "Certificate of Employment" },
  { value: "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION", label: "Employer Certified Job Description" },
  { value: "EVIDENCE_OF_BUSINESS_OWNERSHIP", label: "Evidence of Business Ownership" },
]

const priorityOrders = ["FIRST", "SECOND", "THIRD"]

// Maroon color palette
const maroonTheme = {
  primary: {
    main: '#800020', // Deep maroon
    light: '#A0002A', // Lighter maroon
    dark: '#600018', // Darker maroon
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#8B0000', // Dark red
    light: '#CD5C5C', // Indian red
    dark: '#4B0000'
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

  // Fetch applicant data
  const fetchApplicantData = useCallback(async (id) => {
    try {
      setLoading(prev => ({ ...prev, profile: true }))
      const response = await axios.get(`http://localhost:8080/api/applicants/${id}`)
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
  }, [handleError])

  // Fetch courses from backend
  const fetchCoursesFromBackend = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, courses: true }))
      const response = await axios.get("http://localhost:8080/api/courses")
      const processedCourses = response.data.map((course) => {
        let department = ""
        const deptId = course.department?.departmentId
        if (deptId === 1) {
          department = "College of Computer Studies"
        } else if (deptId === 2) {
          department = "College of Arts, Sciences, and Education"
        } else if (deptId === 3) {
          department = "College of Management, Business and Accountancy"
        } else if (deptId === 4) {
          department = "College of Engineering and Architecture"
        } else {
          department = "Other Programs"
        }

        // Log if description is present
        if (course.description) {
          console.log(`Course "${course.courseName}" has description: "${course.description}"`)
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
  }, [handleError])

  // Fetch uploaded documents
  const fetchUploadedDocuments = useCallback(async (applicantId) => {
    try {
      setLoading(prev => ({ ...prev, documents: true }))
      const response = await axios.get(`http://localhost:8080/api/documents/applicant/${applicantId}`)
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
  }, [handleError])

  // Fetch course preferences
  const fetchCoursePreferences = useCallback(async (applicantId) => {
    try {
      setLoading(prev => ({ ...prev, preferences: true }))
      const response = await axios.get(`http://localhost:8080/api/preferences/applicant/${applicantId}`)
      
      const priorityOrder = { "FIRST": 1, "SECOND": 2, "THIRD": 3 }
      const sortedPrefs = [...response.data].sort((a, b) => 
        priorityOrder[a.priorityOrder] - priorityOrder[b.priorityOrder]
      )
      
      setCoursePreferences(sortedPrefs)
    } catch (error) {
      console.error("Error fetching course preferences:", error)
      setCoursePreferences([])
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }))
    }
  }, [handleError])

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

  // Check if course is already selected
  const checkCourseAlreadySelected = (courseId) => {
    return coursePreferences.some(pref => pref.course.courseId === courseId)
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

  // Handle course selection
  const handleCourseSelection = async () => {
    if (!selectedCourse || currentPriorityIndex === null) {
      return
    }

    // Check if this course is already selected in another priority level
    const isDuplicate = coursePreferences.some(
      pref => pref.course.courseId === selectedCourse.courseId && 
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
        const updatedPreference = {
          preferenceId: existingPreference.preferenceId,
          applicant: { applicantId: applicantId },
          course: { courseId: selectedCourse.courseId },
          priorityOrder: priorityOrders[currentPriorityIndex],
          status: existingPreference.status || "PENDING"
        }

        const response = await axios.put(
          `http://localhost:8080/api/preferences/${existingPreference.preferenceId}`,
          updatedPreference
        )

        const updatedPreferences = coursePreferences.map((pref) =>
          pref.preferenceId === existingPreference.preferenceId ? response.data : pref
        )
        setCoursePreferences(updatedPreferences)
        handleSuccess("Course preference updated!")
      } else {
        // Create new preference
        const newPreference = {
          course: { courseId: selectedCourse.courseId },
          priorityOrder: priorityOrders[currentPriorityIndex],
        }

        const response = await axios.post(
          `http://localhost:8080/api/preferences/applicant/${applicantId}`,
          newPreference
        )

        const updatedPreferences = [...coursePreferences]
        const filteredPreferences = updatedPreferences.filter(
          (pref) => pref.priorityOrder !== priorityOrders[currentPriorityIndex]
        )
        filteredPreferences.push(response.data)

        setCoursePreferences(filteredPreferences)
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

    const formData = new FormData()
    formData.append("files", file)
    formData.append("applicantId", applicantId)
    formData.append("documentType", actualDocumentType)

    try {
      if (isReplacement && documentId) {
        // For replacement, use PUT request to update existing document
        const response = await axios.put(`http://localhost:8080/api/documents/${documentId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

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
        const response = await axios.post("http://localhost:8080/api/documents/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

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
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // Handle submit
  const handleSubmit = async () => {
    // Check if "INFORMATIVE_COPY_OF_TOR" is uploaded
    const hasTOR = files.some(file => file.documentType === "INFORMATIVE_COPY_OF_TOR")
    if (!hasTOR) {
      handleError('You must upload the "Informative Copy of TOR" before submitting your application.')
      return
    }

    try {
      setSubmitting(true)
      
      // Check if application already exists
      try {
        const response = await axios.get(`http://localhost:8080/api/applications/applicant/${applicantId}`)
        if (response.data && response.data.length > 0) {
          setSuccessModalOpen(true)
          setSubmitting(false)
          return
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("No existing application found. Proceeding to create a new application.")
        } else {
          console.error("Error checking existing application:", error)
          handleError("Failed to check existing application. Please try again.")
          setSubmitting(false)
          return
        }
      }

      // Create new application
      const newApplication = {
        status: "PENDING",
      }

      await axios.post(`http://localhost:8080/api/applications/applicant/${applicantId}`, newApplication, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      handleSuccess("Application submitted successfully!")
      setSubmitting(false)
      navigate("/ApplicationTrack")
    } catch (error) {
      console.error("Error submitting application:", error)
      handleError("Failed to submit application. Please try again.")
      setSubmitting(false)
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

  // Get course preference by priority order
  const getCoursePreferenceByPriority = (priorityIndex) => {
    return coursePreferences.find(pref => pref.priorityOrder === priorityOrders[priorityIndex])
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Header */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Box sx={{ maxWidth: "1200px", mx: "auto", px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: maroonTheme.primary.main,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCapIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  ETEEAP APPLICANT APPLICATION FORM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete your application for admission
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {userData.name || "Loading..."}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userData.email || "Loading..."}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: maroonTheme.primary.light,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon sx={{ color: maroonTheme.primary.main, fontSize: 16 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Progress Bar */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
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
              '& .MuiLinearProgress-bar': {
                backgroundColor: maroonTheme.primary.main
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
          <Box sx={{ maxWidth: "1400px", mx: "auto", px: 3, py: 4 }}>
            <Grid container spacing={3}>
              {/* Left Column - Personal Info & Course Preferences */}
              <Grid item xs={12} lg={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Personal Information */}
                  <Card elevation={1}>
                    <CardHeader
                      title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <UserIcon sx={{ color: maroonTheme.primary.main, fontSize: 20 }} />
                          <Typography variant="h6">Personal Information</Typography>
                        </Box>
                      }
                      sx={{ pb: 2 }}
                    />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium" color="text.primary">
                              Full Name
                            </Typography>
                          </Box>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
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
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                            <Typography color="text.primary">{userData.email}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Course Preferences */}
                  <Card elevation={1}>
                    <CardHeader
                      title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <GraduationCapIcon sx={{ color: maroonTheme.primary.main, fontSize: 20 }} />
                          <Typography variant="h6">Course Preferences</Typography>
                        </Box>
                      }
                      subheader="Select up to 3 courses in order of preference"
                      sx={{ pb: 2 }}
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
                                sx={{ minWidth: 80 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                {preference ? (
                                  <Box>
                                    <Typography fontWeight="medium" color="text.primary">
                                      {preference.course.courseName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {preference.course.department?.departmentName || "Department"}
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
              <Grid item xs={12} lg={6}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* Three Document Cards in Horizontal Row */}
                  <Grid container spacing={2}>
                    {/* Document Upload Card */}
                    <Grid item xs={12} md={4}>
                      <Card elevation={1} sx={{ height: 'fit-content' }}>
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <UploadIcon sx={{ color: maroonTheme.primary.main, fontSize: 18 }} />
                              <Typography variant="subtitle1" fontSize="0.95rem">Upload Documents</Typography>
                            </Box>
                          }
                          subheader="Upload required documents"
                          sx={{ pb: 1 }}
                        />
                        <CardContent sx={{ pt: 1 }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {documentTypes.slice(0, 2).map((docType) => (
                              <Box key={docType.value} sx={{ position: "relative" }}>
                                <input
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  style={{ display: "none" }}
                                  id={docType.value}
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, docType.value)}
                                />
                                <label htmlFor={docType.value}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      border: "2px dashed",
                                      borderColor: "grey.300",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                      minHeight: 60,
                                      "&:hover": {
                                        borderColor: maroonTheme.primary.main,
                                        bgcolor: maroonTheme.primary.light,
                                        opacity: 0.1,
                                      },
                                    }}
                                  >
                                    <Box sx={{ textAlign: "center" }}>
                                      <PlusIcon sx={{ color: "grey.400", fontSize: 16, mb: 0.5 }} />
                                      <Typography variant="caption" fontWeight="medium" color="text.primary" sx={{ display: 'block' }}>
                                        {docType.label}
                                        {docType.required && (
                                          <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                                            *
                                          </Typography>
                                        )}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </label>
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setDocumentsDialogOpen(true)}
                              sx={{ mt: 1, fontSize: '0.7rem' }}
                            >
                              View All Document Types
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Uploaded Files Card */}
                    <Grid item xs={12} md={4}>
                      <Card elevation={1} sx={{ height: 'fit-content' }}>
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FileTextIcon sx={{ color: maroonTheme.primary.main, fontSize: 18 }} />
                                <Typography variant="subtitle1" fontSize="0.95rem">Uploaded Files</Typography>
                              </Box>
                              <Chip label={files.length} size="small" variant="outlined" />
                            </Box>
                          }
                          sx={{ pb: 1 }}
                        />
                        <CardContent sx={{ pt: 1 }}>
                          {files.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 2 }}>
                              <FileTextIcon sx={{ fontSize: 32, color: "grey.300", mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                No files uploaded yet
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 200, overflow: 'auto' }}>
                              {files.slice(0, 4).map((file) => (
                                <Paper
                                  key={file.id}
                                  variant="outlined"
                                  sx={{ p: 1.5, bgcolor: "grey.50", display: "flex", flexDirection: "column", gap: 0.5 }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <FileTextIcon sx={{ color: maroonTheme.primary.main, fontSize: 14, flexShrink: 0 }} />
                                    <Typography
                                      variant="caption"
                                      fontWeight="medium"
                                      color="text.primary"
                                      sx={{ wordBreak: "break-all", flex: 1 }}
                                    >
                                      {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      sx={{ color: "error.main", p: 0.25 }}
                                      onClick={() => removeFile(file.id)}
                                    >
                                      <XIcon sx={{ fontSize: 10 }} />
                                    </IconButton>
                                  </Box>
                                  <Box sx={{ ml: 2.5 }}>
                                    <Typography variant="caption" color={maroonTheme.primary.main} sx={{ fontWeight: 'medium', display: 'block' }}>
                                      {getDocumentTypeLabel(file.documentType)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      {formatFileSize(file.size)} • {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : 'Unknown date'}
                                    </Typography>
                                  </Box>
                                </Paper>
                              ))}
                              {files.length > 4 && (
                                <Button
                                  variant="text"
                                  size="small"
                                  sx={{ fontSize: '0.7rem', mt: 0.5 }}
                                  onClick={() => {
                                    // You can add a "View All Files" dialog here if needed
                                    console.log('View all files clicked')
                                  }}
                                >
                                  View All {files.length} Files
                                </Button>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Requirements Card */}
                    <Grid item xs={12} md={4}>
                      <Card elevation={1} sx={{ height: 'fit-content' }}>
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CheckCircleIcon sx={{ color: maroonTheme.secondary.main, fontSize: 18 }} />
                              <Typography variant="subtitle1" fontSize="0.95rem">Requirements</Typography>
                            </Box>
                          }
                          sx={{ pb: 1 }}
                        />
                        <CardContent sx={{ pt: 1 }}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR") ? (
                                <CheckCircleIcon sx={{ color: "success.main", fontSize: 14 }} />
                              ) : (
                                <AlertCircleIcon sx={{ color: "error.main", fontSize: 14 }} />
                              )}
                              <Typography variant="caption">TOR Required</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {coursePreferences.length > 0 ? (
                                <CheckCircleIcon sx={{ color: "success.main", fontSize: 14 }} />
                              ) : (
                                <ClockIcon sx={{ color: "warning.main", fontSize: 14 }} />
                              )}
                              <Typography variant="caption">Course Selected</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {files.length >= 3 ? (
                                <CheckCircleIcon sx={{ color: "success.main", fontSize: 14 }} />
                              ) : (
                                <ClockIcon sx={{ color: "warning.main", fontSize: 14 }} />
                              )}
                              <Typography variant="caption">Min 3 Documents</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Submit Section */}
            <Box sx={{ mt: 4 }}>
              <Card elevation={1}>
                <CardContent sx={{ pt: 3 }}>
                  <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Ready to Submit?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Please review all information before submitting your application
                      </Typography>
                    </Box>

                    {!files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR") && (
                      <Alert severity="warning" sx={{ maxWidth: 400, mx: "auto" }}>
                        Please upload the required Informative Copy of TOR before submitting.
                      </Alert>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !files.some((f) => f.documentType === "INFORMATIVE_COPY_OF_TOR")}
                      size="large"
                      variant="contained"
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: "1rem", 
                        fontWeight: "medium",
                        backgroundColor: maroonTheme.primary.main,
                        '&:hover': {
                          backgroundColor: maroonTheme.primary.dark
                        }
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
        <DialogTitle>
          Select Course for {currentPriorityIndex !== null ? getPriorityLabel(currentPriorityIndex) : ""}
        </DialogTitle>
        <DialogContent>
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
                      selectedCourse?.courseId === course.courseId ? maroonTheme.primary.main : "grey.200",
                    bgcolor:
                      selectedCourse?.courseId === course.courseId ? maroonTheme.primary.light : "transparent",
                    "&:hover": {
                      borderColor: "grey.300",
                      bgcolor: selectedCourse?.courseId === course.courseId ? maroonTheme.primary.light : "grey.50",
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
  )
}
