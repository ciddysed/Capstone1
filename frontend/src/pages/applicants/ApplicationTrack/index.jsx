"use client"

import {
  Assignment,
  Logout,
  Person as UserIcon,
  School as GraduationCapIcon,
  Description as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ClockIcon,
  Warning as AlertCircleIcon,
  VerifiedUser as VerifiedIcon,
  AutorenewRounded as ProcessingIcon,
  InfoOutlined as InfoIcon,
  Mail as MailIcon,
} from "@mui/icons-material"
import {
  Typography,
  Box,
  ThemeProvider,
  alpha,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Popover,
  LinearProgress,
  Chip,
  createTheme,
  Tooltip,
  IconButton,
  Badge,
  Avatar,
  CircularProgress,
} from "@mui/material"
import axios from "axios"
import { API_BASE, BACKEND_URL } from "../../../config"
import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useResponseHandler from "../../../utils/useResponseHandler"
import toast from "../../../utils/toast"

import DocumentHandler from "./DocumentHandler"
import CoursePreferences from "./CoursePreferences"
import NotificationCenter from "../../../components/Notifications/NotificationCenter"
import DashboardLink from "../../../components/DashboardLink"
import useSubjectNotifications from "../../../hooks/useSubjectNotifications"
import ApplicationStatusPoller from "../../../components/ApplicationStatusPoller"
import CoursePreferencesPoller from "../../../components/CoursePreferencesPoller"
import EvaluationStatusPoller from "../../../components/EvaluationStatusPoller"
import ChatDrawer from "./components/ChatDrawer"


import { APPLICATION_STATUS, DOCUMENT_TYPES, PRIORITY_ORDER } from "./utils"

const colors = {
  primary: {
    main: "#800000", // Maroon
    light: "#a52a2a", // Lighter maroon
    dark: "#5c0000", // Darker maroon
  },
  secondary: {
    main: "#d4af37", // Gold
    light: "#e6c55a", // Lighter gold
    dark: "#b8960c", // Darker gold
  },
  accent: {
    main: "#2e7d32", // Green for success
    light: "#4caf50",
    warning: "#f9a825", // Amber warning
    error: "#c62828", // Red error
    info: "#1565c0",
  },
  neutral: {
    50: "#faf9f7", // Warm off-white
    100: "#f5f3f0",
    200: "#e8e4df",
    300: "#d4cfc7",
    400: "#a09890",
    500: "#706860",
    600: "#4a4540",
    700: "#2d2a27",
    800: "#1a1816",
    900: "#0d0c0b",
  },
}

const customTheme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.015em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: "-0.005em",
    },
    body2: {
      letterSpacing: "-0.005em",
    },
    caption: {
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.neutral[200]}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          letterSpacing: "-0.005em",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.01em",
        },
      },
    },
  },
})

const API_BASE_URL = API_BASE

const REQUIRED_DOCUMENTS = [
  { value: "APPLICANTS_EVALUATION_SHEET", label: "Applicant's Evaluation Sheet" },
  { value: "INFORMATIVE_COPY_OF_TOR", label: "Informative Copy of TOR" },
  { value: "PSA_AUTHENTICATED_BIRTH_CERTIFICATE", label: "PSA Birth Certificate" },
  { value: "CERTIFICATE_OF_TRANSFER_CREDENTIAL", label: "Certificate of Transfer Credential" },
  { value: "MARRIAGE_CERTIFICATE", label: "Marriage Certificate" },
  { value: "CERTIFICATE_OF_EMPLOYMENT", label: "Certificate of Employment" },
  { value: "EMPLOYER_CERTIFIED_DETAILED_JOB_DESCRIPTION", label: "Employer Certified Job Description" },
  { value: "EVIDENCE_OF_BUSINESS_OWNERSHIP", label: "Evidence of Business Ownership" },
]

const StatusBadge = ({ status, size = "medium" }) => {
  const statusConfig = {
    PENDING: {
      bg: `linear-gradient(135deg, ${alpha("#f9a825", 0.15)} 0%, ${alpha("#f9a825", 0.08)} 100%)`,
      border: alpha("#f9a825", 0.3),
      color: "#92400e",
      icon: ClockIcon,
      label: "Pending Review",
    },
    APPROVED: {
      bg: `linear-gradient(135deg, ${alpha("#2e7d32", 0.15)} 0%, ${alpha("#2e7d32", 0.08)} 100%)`,
      border: alpha("#2e7d32", 0.3),
      color: "#065f46",
      icon: VerifiedIcon,
      label: "Approved",
    },
    REJECTED: {
      bg: `linear-gradient(135deg, ${alpha("#c62828", 0.12)} 0%, ${alpha("#c62828", 0.06)} 100%)`,
      border: alpha("#c62828", 0.25),
      color: "#991b1b",
      icon: AlertCircleIcon,
      label: "Needs Attention",
    },
    UNDER_REVIEW: {
      bg: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.12)} 0%, ${alpha(colors.primary.main, 0.06)} 100%)`,
      border: alpha(colors.primary.main, 0.25),
      color: colors.primary.main,
      icon: ProcessingIcon,
      label: "Under Review",
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon
  const isSmall = size === "small"

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? 0.5 : 0.75,
        px: isSmall ? 1.25 : 1.75,
        py: isSmall ? 0.5 : 0.625,
        borderRadius: "100px",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      <Icon sx={{ fontSize: isSmall ? 12 : 14 }} />
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontSize: isSmall ? 10 : 11,
          lineHeight: 1,
        }}
      >
        {config.label}
      </Typography>
    </Box>
  )
}

const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2, flexShrink: 0 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.12)} 0%, ${alpha(colors.primary.main, 0.06)} 100%)`,
          border: `1px solid ${alpha(colors.primary.main, 0.15)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ color: colors.primary.main, fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={700} color={colors.neutral[800]} sx={{ lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color={colors.neutral[500]} sx={{ fontSize: 11 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {action}
  </Box>
)

const ProgressStep = ({ completed, label, icon: Icon }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      py: 0.75,
      px: 1,
      borderRadius: 1.5,
      bgcolor: completed ? alpha(colors.accent.main, 0.04) : "transparent",
      transition: "background-color 0.2s ease",
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: completed ? colors.accent.main : colors.neutral[100],
        border: completed ? "none" : `2px solid ${colors.neutral[300]}`,
        color: completed ? "white" : colors.neutral[400],
        transition: "all 0.2s ease",
        boxShadow: completed ? `0 2px 8px ${alpha(colors.accent.main, 0.3)}` : "none",
      }}
    >
      {completed ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <Icon sx={{ fontSize: 12 }} />}
    </Box>
    <Typography
      variant="body2"
      sx={{
        color: completed ? colors.neutral[800] : colors.neutral[500],
        fontWeight: completed ? 600 : 400,
        fontSize: 13,
      }}
    >
      {label}
    </Typography>
  </Box>
)

const InfoField = ({ label, value, icon: Icon }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: colors.neutral[50],
      border: `1px solid ${colors.neutral[200]}`,
      transition: "border-color 0.2s ease",
      "&:hover": {
        borderColor: colors.neutral[300],
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
      {Icon && <Icon sx={{ fontSize: 12, color: colors.neutral[400] }} />}
      <Typography
        variant="caption"
        color={colors.neutral[500]}
        fontWeight={500}
        sx={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}
      >
        {label}
      </Typography>
    </Box>
    <Typography variant="body2" fontWeight={600} color={colors.neutral[800]} noWrap>
      {value || "—"}
    </Typography>
  </Box>
)

const ApplicationTracking = () => {
  const { handleSuccess, handleError, snackbar } = useResponseHandler()
  const navigate = useNavigate()
  const [applicantId, setApplicantId] = useState(null)
  const [isAccepted, setIsAccepted] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    initials: "",
  })
  const [applicationStatus, setApplicationStatus] = useState(APPLICATION_STATUS.PENDING)
  const [coursePreferences, setCoursePreferences] = useState([])
  const [documents, setDocuments] = useState([])
  const [subjectsList, setSubjectsList] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState({
    profile: true,
    courses: true,
    preferences: true,
    documents: true,
  })
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [missingDocuments, setMissingDocuments] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const userType = localStorage.getItem("userType")
  const [applicationNotes, setApplicationNotes] = useState("")
  const [notesLoading, setNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState("")

  // Inbox state
  const [chatList, setChatList] = useState([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)

  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([])
  const [conversationLoading, setConversationLoading] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef(null)

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClosePopover = () => setAnchorEl(null)
  const open = Boolean(anchorEl)

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    })

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 404 && error.config.url?.includes("/accepted-applicants/applicant/")) {
          return Promise.reject(error)
        }
        const errorMessage = error.response?.data?.message || "An error occurred while communicating with the server"
        handleError(errorMessage)
        return Promise.reject(error)
      },
    )
    return instance
  }, [handleError])

  const getInitials = useCallback((name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [])

  const getDocumentType = useCallback((filename) => {
    const extension = filename.split(".").pop().toLowerCase()
    if (extension === "pdf") return "PDF"
    if (["doc", "docx"].includes(extension)) return extension === "doc" ? "DOC" : "DOCX"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) return "IMAGE"
    return "OTHER"
  }, [])

  const checkMissingDocuments = useCallback((documents) => {
    const uploadedTypes = new Set(documents.map((doc) => doc.type))
    const missing = REQUIRED_DOCUMENTS.filter((reqDoc) => !uploadedTypes.has(reqDoc.value))
    setMissingDocuments(missing)
  }, [])

  const fetchApplicantData = useCallback(
    async (id) => {
      if (!id) return
      try {
        setLoading((prev) => ({ ...prev, profile: true }))
        const profileResponse = await api.get(`/applicants/${id}`)
        const applicantData = profileResponse.data
        const fullName = `${applicantData.firstName} ${applicantData.middleInitial ? applicantData.middleInitial + "." : ""} ${applicantData.lastName}`
        setUserData({
          name: fullName,
          email: applicantData.email,
          initials: getInitials(fullName),
        })

        const applicationsResponse = await api.get(`/applications/applicant/${id}`)
        if (applicationsResponse.data && applicationsResponse.data.length > 0) {
          setApplicationStatus(applicationsResponse.data[0].status)
          setNotesLoading(true)
          setNotesError("")
          try {
            const remarksRes = await api.get(
              `/applications/${applicationsResponse.data[0].applicationId || applicationsResponse.data[0].id}`,
            )
            setApplicationNotes(remarksRes.data.applicationNotes || "")
          } catch {
            setNotesError("Failed to load application remarks.")
            setApplicationNotes("")
          } finally {
            setNotesLoading(false)
          }
        } else {
          handleError("No application found")
        }
      } catch (error) {
        console.error("Error fetching applicant data:", error)
      } finally {
        setLoading((prev) => ({ ...prev, profile: false }))
      }
    },
    [api, getInitials, handleError],
  )

  const fetchAllSubjects = useCallback(async () => {
    const id = localStorage.getItem("applicantId")
    if (!id) return []
    try {
      const response = await api.get(`/applicant-subject-records/applicant/${id}/organized-clean`)
      const allSubjects = []
      Object.values(response.data).forEach((semesterSubjects) => {
        allSubjects.push(...semesterSubjects)
      })
      setSubjectsList(allSubjects)
      return allSubjects
    } catch {
      setSubjectsList([])
      return []
    }
  }, [api])

  const fetchDocuments = useCallback(
    async (applicantId) => {
      if (!applicantId) return
      try {
        setLoading((prev) => ({ ...prev, documents: true }))
        const response = await api.get(`/documents/applicant/${applicantId}`)
        const documents = response.data.map((doc) => {
          const fileType = getDocumentType(doc.fileName)
          return {
            id: doc.documentId,
            name: doc.fileName,
            type: doc.documentType || "GENERAL",
            fileType: fileType,
            icon: DOCUMENT_TYPES[fileType]?.icon || DOCUMENT_TYPES.OTHER.icon,
            mimeType: DOCUMENT_TYPES[fileType]?.mimeType || DOCUMENT_TYPES.OTHER.mimeType,
            downloadUrl: `/documents/download/${doc.documentId}`,
            previewUrl: `/documents/preview/${doc.documentId}`,
            uploadDate: new Date(doc.uploadDate || Date.now()).toLocaleDateString(),
            size: doc.fileSize || "Unknown",
          }
        })
        setDocuments(documents)
        checkMissingDocuments(documents)
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading((prev) => ({ ...prev, documents: false }))
      }
    },
    [api, getDocumentType, checkMissingDocuments],
  )

  const fetchCourses = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, courses: true }))
      const response = await api.get("/courses")
      setAvailableCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }))
    }
  }, [api])

  // Fetch inbox messages
  const fetchChatList = useCallback(
    async (id) => {
      if (!id) return
      try {
        setInboxLoading(true)
        const response = await api.get(`${BACKEND_URL}/api/messages/inbox/applicant/chat-list?applicantId=${id}`)
        setChatList(response.data || [])
      } catch (error) {
        console.error("Error fetching chat list:", error)
        setChatList([])
      } finally {
        setInboxLoading(false)
      }
    },
    [api],
  )

  const fetchConversation = useCallback(
    async (participantId, participantRole) => {
      if (!applicantId || !participantId) return
      
      try {
        setConversationLoading(true)
        let endpoint = ""
        if (participantRole === "EVALUATOR") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/applicant-evaluator?applicantId=${applicantId}&evaluatorId=${participantId}`
        } else if (participantRole === "PROGRAM_ADMIN") {
          endpoint = `${BACKEND_URL}/api/messages/conversation/applicant-admin?applicantId=${applicantId}&adminId=${participantId}`
        } else {
          setConversationMessages([])
          setConversationLoading(false)
          return
        }
        const response = await api.get(endpoint)
        
        const fetchedMessages = response.data || [];
        setConversationMessages(prev => {
          const existingMap = new Map(prev.map(msg => [msg.messageId, msg]));
          fetchedMessages.forEach(msg => {
            existingMap.set(msg.messageId, msg);
          });
          return Array.from(existingMap.values()).sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          );
        });
        
        try {
          await api.post(`${BACKEND_URL}/api/messages/mark-seen`, {
            userId: Number.parseInt(applicantId),
            userType: "APPLICANT",
            participantId: participantId,
            participantType: participantRole,
          })
        } catch (error) {
          console.error("Error marking messages as seen:", error)
        }
      } catch (error) {
        console.error("Error fetching conversation:", error)
        setConversationMessages([])
      } finally {
        setConversationLoading(false)
      }
    },
    [api, applicantId],
  )

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation || !applicantId) return

    try {
      setSendingMessage(true)
      const messagePayload = {
        senderType: "APPLICANT",
        senderApplicant: { applicantId: Number.parseInt(applicantId) },
        recipientType: selectedConversation.participantRole,
        content: newMessage.trim(),
      }

      if (selectedConversation.participantRole === "EVALUATOR") {
        messagePayload.recipientEvaluator = { evaluatorId: selectedConversation.participantId }
      } else if (selectedConversation.participantRole === "PROGRAM_ADMIN") {
        messagePayload.recipientAdmin = { adminId: selectedConversation.participantId }
      }

      await api.post(`${BACKEND_URL}/api/messages/send`, messagePayload)
      setNewMessage("")
      await fetchConversation(selectedConversation.participantId, selectedConversation.participantRole)
      await fetchChatList(applicantId)
    } catch (error) {
      console.error("Error sending message:", error)
      handleError("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }, [api, applicantId, selectedConversation, newMessage, fetchConversation, fetchChatList, handleError])

  const openConversation = useCallback(
    async (chat) => {
      if (!applicantId) return
      
      setInboxOpen(true)
      
      let participantId = chat.participantId || 
                         chat.evaluatorId || 
                         chat.adminId ||
                         chat.programAdminId
      
      const participantRole = chat.participantRole
      const participantName = chat.participantName
      
      if (!participantId && participantName && participantRole) {
        const knownParticipants = {
          'ETEEAP Coordinator_PROGRAM_ADMIN': 1,
          'Rea V San_EVALUATOR': 5,
        }
        
        const lookupKey = `${participantName}_${participantRole}`
        if (knownParticipants[lookupKey]) {
          participantId = knownParticipants[lookupKey]
        }
        
        if (!participantId) {
          try {
            const response = await api.get(`${BACKEND_URL}/api/messages/inbox/applicant/chat-list?applicantId=${applicantId}`)
            const chatListData = response.data || []
            
            const matchingChat = chatListData.find(c => 
              c.participantName === participantName && 
              c.participantRole === participantRole
            )
            
            if (matchingChat) {
              participantId = matchingChat.participantId || 
                             matchingChat.evaluatorId || 
                             matchingChat.adminId ||
                             matchingChat.programAdminId
              
              setChatList(chatListData)
            }
          } catch (error) {
            console.error("Error fetching chat list:", error)
          }
        }
      }
      
      if (!participantId) {
        alert("Cannot open conversation: Missing participant ID. Please try clicking the conversation from the Messages list.")
        return
      }
      
      if (!participantRole) {
        return
      }
      
      setSelectedConversation({
        participantId,
        participantName,
        participantRole,
      })
    },
    [applicantId, api],
  )

  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation.participantId &&
      selectedConversation.participantRole
    ) {
      fetchConversation(selectedConversation.participantId, selectedConversation.participantRole)
    }
  }, [selectedConversation, fetchConversation])

  useEffect(() => {
    if (messagesEndRef.current && conversationMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversationMessages])

  useSubjectNotifications(localStorage.getItem("applicantId"), subjectsList, fetchAllSubjects, {
    enablePolling: true,
    pollingInterval: 30000,
    showToast: true,
    autoInitialize: true,
  })

  const fetchCoursePreferences = useCallback(
    async (applicantId) => {
      if (!applicantId) return
      try {
        setLoading((prev) => ({ ...prev, preferences: true }))
        const response = await api.get(`/preferences/applicant/${applicantId}/with-evaluation`)
        const priorityOrder = {
          [PRIORITY_ORDER.FIRST]: 1,
          [PRIORITY_ORDER.SECOND]: 2,
          [PRIORITY_ORDER.THIRD]: 3,
        }
        const sortedPrefs = [...response.data].sort(
          (a, b) => priorityOrder[a.priorityOrder] - priorityOrder[b.priorityOrder],
        )
        setCoursePreferences(sortedPrefs)
      } catch {
        setCoursePreferences([])
      } finally {
        setLoading((prev) => ({ ...prev, preferences: false }))
      }
    },
    [api],
  )

  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId")
    if (!storedApplicantId) {
      handleError("Please login to continue")
      return
    }
    setApplicantId(storedApplicantId)
  }, [handleError])

  const checkAcceptedApplicant = useCallback(
    async (applicantId) => {
      if (isAccepted) return true
      try {
        const response = await api.get(`/accepted-applicants/applicant/${applicantId}`)
        if (response.data && response.status === 200) {
          setIsAccepted(true)
          toast.success("Congratulations! Your application has been accepted.", { duration: 6000 })
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [api, isAccepted],
  )

  useEffect(() => {
    const storedApplicantId = localStorage.getItem("applicantId")
    if (storedApplicantId) {
      setApplicantId(storedApplicantId)
      fetchApplicantData(storedApplicantId)
      fetchDocuments(storedApplicantId)
      fetchCoursePreferences(storedApplicantId)
      fetchAllSubjects()
      checkAcceptedApplicant(storedApplicantId)
      fetchChatList(storedApplicantId)
    } else if (userType !== "applicant") {
      navigate("/login")
    }
    fetchCourses()
  }, [
    fetchApplicantData,
    fetchDocuments,
    fetchCoursePreferences,
    fetchCourses,
    fetchAllSubjects,
    navigate,
    userType,
    checkAcceptedApplicant,
    fetchChatList,
  ])

  useEffect(() => {
    if (!applicantId || isAccepted) return
    const intervalId = setInterval(() => checkAcceptedApplicant(applicantId), 30000)
    return () => clearInterval(intervalId)
  }, [applicantId, isAccepted, checkAcceptedApplicant])

  useEffect(() => {
    window.applicantOpenConversation = openConversation
    
    const handleOpenConversationEvent = (event) => {
      const chatData = event.detail
      if (chatData) {
        openConversation(chatData)
      }
    }
    
    window.addEventListener('applicant:openConversation', handleOpenConversationEvent)
    
    return () => {
      delete window.applicantOpenConversation
      window.removeEventListener('applicant:openConversation', handleOpenConversationEvent)
    }
  }, [openConversation])

  const handleFileUpload = async (event) => {
    const fileList = Array.from(event.target.files)
    if (fileList.length === 0 || !applicantId) return

    const formData = new FormData()
    fileList.forEach((file) => formData.append("files", file))
    formData.append("applicantId", applicantId)
    formData.append("documentType", "General")

    setUploadingFiles(true)
    try {
      await api.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      handleSuccess(`${fileList.length} ${fileList.length === 1 ? "file" : "files"} uploaded successfully!`)
      fetchDocuments(applicantId)
    } catch (error) {
      console.error("Error uploading files:", error)
    } finally {
      setUploadingFiles(false)
      event.target.value = null
    }
  }

  const handleMissingFileUpload = async (event, documentType) => {
    const file = event.target.files[0]
    if (!file || !applicantId) return
    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB")
      return
    }

    const formData = new FormData()
    formData.append("files", file)
    formData.append("applicantId", applicantId)
    formData.append("documentType", documentType)

    setUploadingFiles(true)
    try {
      await api.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      const docLabel = REQUIRED_DOCUMENTS.find((doc) => doc.value === documentType)?.label || documentType
      handleSuccess(`${docLabel} uploaded successfully!`)
      fetchDocuments(applicantId)
    } catch (error) {
      handleError(
        error.response?.data ? `Failed to upload: ${error.response.data}` : "Failed to upload file. Please try again.",
      )
    } finally {
      setUploadingFiles(false)
      event.target.value = null
    }
  }

  const handleFileChange = async (event, documentToReplace) => {
    const file = event.target.files[0]
    if (!file || !applicantId) return
    if (file.size > 15 * 1024 * 1024) {
      handleError("File size exceeds the limit of 15MB")
      return
    }

    setUploadingFiles(true)
    try {
      const formData = new FormData()
      formData.append("files", file)
      const response = await api.put(`/documents/${documentToReplace.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      handleSuccess(`Document replaced successfully!`)
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === documentToReplace.id
            ? {
                ...doc,
                name: response.data.fileName,
                uploadDate: new Date().toLocaleDateString(),
                size: response.data.fileSize || "Unknown",
              }
            : doc,
        ),
      )
    } catch (error) {
      handleError(
        error.response?.data
          ? `Failed to replace file: ${error.response.data}`
          : "Failed to replace file. Please try again.",
      )
    } finally {
      setUploadingFiles(false)
      event.target.value = null
    }
  }

  const getCourseName = useCallback(
    (courseId) => {
      const course = availableCourses.find((c) => c.courseId === courseId)
      return course ? course.courseName : "Course not found"
    },
    [availableCourses],
  )

  const formatPriority = useCallback((priority) => {
    const formats = {
      [PRIORITY_ORDER.FIRST]: "1st Choice",
      [PRIORITY_ORDER.SECOND]: "2nd Choice",
      [PRIORITY_ORDER.THIRD]: "3rd Choice",
    }
    return formats[priority] || priority
  }, [])

  const documentsByType = useMemo(
    () => ({
      all: documents,
      required: documents.filter((doc) => doc.type && doc.type !== "GENERAL" && doc.type !== "General"),
      other: documents.filter((doc) => !doc.type || doc.type === "GENERAL" || doc.type === "General"),
    }),
    [documents],
  )

  const calculateProgress = () => {
    let completed = 0
    const total = 4
    if (userData.name && userData.email) completed++
    if (coursePreferences.length > 0) completed++
    if (documents.some((f) => f.type === "INFORMATIVE_COPY_OF_TOR")) completed++
    if (documents.length >= 3) completed++
    return (completed / total) * 100
  }

  const handleLogout = () => {
    localStorage.removeItem("applicantId")
    localStorage.removeItem("evaluatorId")
    localStorage.removeItem("userType")
    handleSuccess("Logged out successfully!")
    setTimeout(() => {
      if (userType === "applicant") navigate("/login", { replace: true })
      else if (userType === "evaluator") navigate("/evaluator/login", { replace: true })
      else if (userType === "admin") navigate("/admin/login", { replace: true })
      else navigate("/login", { replace: true })
    }, 0)
  }

  const unreadCount = useMemo(() => {
    return chatList.filter((msg) => msg.unread).length
  }, [chatList])

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const progress = calculateProgress()

  const closeConversation = useCallback(() => {
    setSelectedConversation(null)
    setConversationMessages([])
    setNewMessage("")
    if (applicantId) {
      fetchChatList(applicantId)
    }
  }, [applicantId, fetchChatList])

  const handleInboxOpen = useCallback(() => {
    setInboxOpen(true)
    if (applicantId) {
      fetchChatList(applicantId)
    }
  }, [applicantId, fetchChatList])

  const handleInboxClose = useCallback(() => {
    setInboxOpen(false)
    closeConversation()
  }, [closeConversation])

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          height: "100vh",
          bgcolor: colors.neutral[100],
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
            color: "white",
            py: 1.5,
            px: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            flexShrink: 0,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${colors.secondary.main} 0%, ${colors.secondary.light} 50%, ${colors.secondary.main} 100%)`,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: "100%",
            }}
          >
            {/* Logo & Title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <GraduationCapIcon sx={{ fontSize: 24, color: colors.secondary.light }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: 18, lineHeight: 1.2, letterSpacing: "-0.02em" }}
                >
                  Application Portal
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.85, fontSize: 11, letterSpacing: "0.02em", fontWeight: 500 }}
                >
                  Application Services Dashboard
                </Typography>
              </Box>
            </Box>

            {/* User Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DashboardLink sx={{ color: "white", opacity: 0.9, "&:hover": { opacity: 1 } }} />
              <NotificationCenter userId={applicantId} userType="applicant" maroon={colors.primary} gold={colors.secondary} />

              {/* Inbox Button */}
              <Tooltip title="Messages">
                <IconButton
                  onClick={handleInboxOpen}
                  sx={{
                    color: "white",
                    opacity: 0.9,
                    "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Badge
                    badgeContent={unreadCount} // Use unreadCount derived from chatList
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: colors.secondary.main,
                        color: colors.primary.dark,
                        fontWeight: 700,
                        fontSize: 10,
                      },
                    }}
                  >
                    <MailIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ bgcolor: "rgba(255,255,255,0.2)", height: 24, alignSelf: "center", mx: 0.5 }}
              />

              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  alignItems: "flex-end",
                  mr: 1,
                  py: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight={600} fontSize={13} sx={{ lineHeight: 1.2 }}>
                  {userData.name || "Loading..."}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.75, fontSize: 11 }}>
                  {userData.email || "Loading..."}
                </Typography>
              </Box>

              <Tooltip title="Account Settings" arrow>
                <Avatar
                  onClick={handleClick}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "white",
                    color: colors.primary.main,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    border: `2px solid ${alpha("#fff", 0.3)}`,
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {userData.initials || <UserIcon sx={{ fontSize: 18 }} />}
                </Avatar>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: alpha("#000", 0.15),
            backdropFilter: "blur(8px)",
          }}
        >
          <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 3 }, py: 1.25 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" fontWeight={500} sx={{ opacity: 0.9 }}>
                  Application Progress
                </Typography>
                <Tooltip title="Complete all steps to submit your application" arrow>
                  <InfoIcon sx={{ fontSize: 14, opacity: 0.6, cursor: "help" }} />
                </Tooltip>
              </Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: colors.secondary.light }}>
                {Math.round(progress)}% Complete
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.15)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${colors.accent.main} 0%, ${colors.accent.light} 100%)`,
                  boxShadow: `0 0 8px ${alpha(colors.accent.main, 0.5)}`,
                },
              }}
            />
          </Box>
        </Box>

        {/* User Menu Popover - Enhanced */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 240,
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)",
              mt: 1.5,
              overflow: "hidden",
              border: `1px solid ${colors.neutral[200]}`,
            },
          }}
        >
          <Box sx={{ p: 2, bgcolor: colors.neutral[50], borderBottom: `1px solid ${colors.neutral[200]}` }}>
            <Typography variant="subtitle2" fontWeight={700} color={colors.neutral[800]}>
              {userData.name}
            </Typography>
            <Typography variant="caption" color={colors.neutral[500]}>
              {userType ? `${userType.charAt(0).toUpperCase() + userType.slice(1)} Account` : "User Account"}
            </Typography>
          </Box>
          <MenuItem
            onClick={() => {
              handleLogout()
              handleClosePopover()
            }}
            sx={{
              py: 1.5,
              px: 2,
              "&:hover": { bgcolor: alpha(colors.accent.error, 0.08) },
            }}
          >
            <Logout fontSize="small" sx={{ mr: 1.5, color: colors.accent.error }} />
            <Typography variant="body2" color={colors.accent.error} fontWeight={600}>
              Sign Out
            </Typography>
          </MenuItem>
        </Popover>

        {/* Chat Drawer */}
        <ChatDrawer
          open={inboxOpen}
          onClose={handleInboxClose}
          chatList={chatList}
          loading={inboxLoading}
          selectedConversation={selectedConversation}
          onSelectConversation={openConversation}
          onCloseConversation={closeConversation}
          conversationMessages={conversationMessages}
          conversationLoading={conversationLoading}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onSendMessage={sendMessage}
          sendingMessage={sendingMessage}
          messagesEndRef={messagesEndRef}
          formatMessageTime={formatMessageTime}
          colors={colors}
          onRefreshChatList={() => fetchChatList(applicantId)}
        />

        {/* Main Content Grid */}
        <Box
          sx={{ flex: 1, overflow: "hidden", maxWidth: 1600, mx: "auto", width: "100%", px: { xs: 2, md: 3 }, py: 2.5 }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "300px 1fr 340px" },
              gap: 2.5,
              height: "100%",
            }}
          >
            {/* Left Column - Personal Info & Application Status */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minHeight: 0 }}>
              {/* Personal Information Card */}
              <Card sx={{ flexShrink: 0 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <SectionHeader icon={UserIcon} title="Personal Information" subtitle="Your account details" />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <InfoField label="Full Name" value={userData.name} />
                    <InfoField label="Email Address" value={userData.email} />
                  </Box>
                </CardContent>
              </Card>

              {/* Application Status Card */}
              <Card sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                  <SectionHeader
                    icon={Assignment}
                    title="Application Status"
                    action={<StatusBadge status={applicationStatus} size="small" />}
                  />

                  <Box sx={{ mb: 2 }}>
                    {[
                      {
                        completed: documents.some((f) => f.type === "INFORMATIVE_COPY_OF_TOR"),
                        label: "Required Documents",
                        icon: FileTextIcon,
                      },
                      { completed: coursePreferences.length > 0, label: "Course Preferences", icon: GraduationCapIcon },
                      { completed: documents.length >= 3, label: "Minimum Documents (3)", icon: FileTextIcon },
                    ].map((step, idx) => (
                      <ProgressStep key={idx} {...step} />
                    ))}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Application Remarks */}
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(colors.secondary.light, 0.08)} 0%, ${alpha(colors.secondary.main, 0.04)} 100%)`,
                      border: `1px solid ${alpha(colors.secondary.main, 0.15)}`,
                      overflow: "auto",
                      minHeight: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                      <InfoIcon sx={{ fontSize: 14, color: colors.primary.main }} />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={colors.primary.main}
                        sx={{ textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 10 }}
                      >
                        ETEEAP Application Remarks
                      </Typography>
                    </Box>
                    {notesLoading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={14} sx={{ color: colors.primary.main }} />
                        <Typography variant="caption" color={colors.neutral[500]}>
                          Loading remarks...
                        </Typography>
                      </Box>
                    ) : notesError ? (
                      <Typography variant="caption" color="error">
                        {notesError}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        color={applicationNotes ? colors.neutral[700] : colors.neutral[400]}
                        sx={{ fontSize: 13, lineHeight: 1.6 }}
                      >
                        {applicationNotes || "No remarks from evaluators yet."}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Middle Column - Documents */}
            <Card sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <SectionHeader
                  icon={FileTextIcon}
                  title="Application Documents"
                  subtitle="Upload and manage your files"
                  action={
                    <Chip
                      label={`${documents.length} uploaded`}
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${alpha(colors.accent.main, 0.15)} 0%, ${alpha(colors.accent.main, 0.08)} 100%)`,
                        border: `1px solid ${alpha(colors.accent.main, 0.2)}`,
                        color: colors.accent.main,
                        fontWeight: 700,
                        height: 26,
                        fontSize: 11,
                      }}
                    />
                  }
                />

                <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                  <DocumentHandler
                    isLoading={loading.documents}
                    documents={documents}
                    documentsByType={documentsByType}
                    apiBaseUrl={API_BASE_URL}
                    uploadingFiles={uploadingFiles}
                    handleFileUpload={handleFileUpload}
                    handleFileChange={handleFileChange}
                    missingDocuments={missingDocuments}
                    handleMissingFileUpload={handleMissingFileUpload}
                    requiredDocuments={REQUIRED_DOCUMENTS}
                    maroon={colors.primary}
                    gold={colors.secondary}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Right Column - Course Preferences */}
            <Card sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <SectionHeader
                  icon={GraduationCapIcon}
                  title="Course Preferences"
                  subtitle="Selected courses by priority"
                />

                <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
                  <CoursePreferences
                    isLoading={loading.preferences}
                    coursePreferences={coursePreferences}
                    formatPriority={formatPriority}
                    getCourseName={getCourseName}
                    maroon={colors.primary}
                    gold={colors.secondary}
                  />
                </Box>

                {/* Review Status Message */}
                {applicationStatus === APPLICATION_STATUS.PENDING && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${alpha(colors.secondary.light, 0.08)} 0%, ${alpha(colors.secondary.main, 0.04)} 100%)`,
                      border: `1px solid ${alpha(colors.secondary.main, 0.15)}`,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.75 }}>
                      <ProcessingIcon sx={{ color: colors.secondary.dark, fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={700} color={colors.primary.main} sx={{ fontSize: 12 }}>
                        Application Under Review
                      </Typography>
                    </Box>
                    <Typography variant="caption" color={colors.neutral[500]} sx={{ fontSize: 11, lineHeight: 1.5 }}>
                      You'll be notified once your application has been reviewed by our evaluation team.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Pollers */}
        <ApplicationStatusPoller
          applicantId={applicantId}
          currentStatus={applicationStatus}
          onStatusChange={(newStatus) => {
            setApplicationStatus(newStatus)
            fetchApplicantData(applicantId)
          }}
        />
        <CoursePreferencesPoller
          applicantId={applicantId}
          currentPreferences={coursePreferences}
          onPreferencesChange={(newPrefs) => {
            setCoursePreferences(newPrefs)
          }}
        />
        <EvaluationStatusPoller
          applicantId={applicantId}
          fetchEvaluations={fetchCoursePreferences}
        />

        {snackbar}
      </Box>
    </ThemeProvider>
  )
}

export default ApplicationTracking
