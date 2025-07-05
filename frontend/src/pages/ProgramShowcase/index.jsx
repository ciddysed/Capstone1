import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Chip,
  Divider,
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  alpha,
} from "@mui/material"
import {
  Search,
  Notifications as Bell,
  School as GraduationCap,
  People as Users,
  MenuBook as BookOpen,
  EmojiEvents as Award,
  CheckCircle,
  ArrowBack as ArrowLeft,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  Email as Mail,
  Phone,
  LocationOn as MapPin,
} from "@mui/icons-material"
import eteeapLogo from "../../assets/eteeaplogo-removebg-preview.png"

const ProgramShowcase = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const programs = [
    {
      college: "College of Management, Business, and Accountancy",
      icon: "💼",
      color: "maroon",
      programs: [
        "BSBA: General, HR, Marketing, Banking, etc.",
        "Bachelor in Public Administration",
        "BS Office Administration",
      ],
    },
    {
      college: "College of Computer Studies",
      icon: "💻",
      color: "gold",
      programs: ["BS Information Technology"],
    },
    {
      college: "College of Arts, Sciences, and Education",
      icon: "📚",
      color: "maroon",
      programs: [
        "AB Communication",
        "BS Elementary Education",
        "BS Secondary Education: English, Filipino, Math, Science",
      ],
    },
    {
      college: "College of Engineering and Architecture",
      icon: "🏗️",
      color: "gold",
      programs: ["BS Architecture", "BS Civil, Electrical, Electronics, Mechanical, Computer, Industrial Engineering"],
    },
  ]

  const qualifications = [
    "Is a Filipino",
    "Has 5 years or more of RELEVANT AND MEANINGFUL work experience related to the degree applied",
    "Is 23 years old or more",
    "Has two years of college credits for Engineering and architecture and all other board and computer programs/ High school Graduate for non-board programs, except BSE",
  ]

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #faf5f0 0%, #f5e6d3 50%, #f0dcc0 100%)" }}>
      {/* Header */}
      <Paper 
        elevation={3} 
        sx={{ 
          background: "linear-gradient(90deg, #800000 0%, #a0001a 100%)",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button 
                variant="text" 
                onClick={() => navigate(-1)}
                sx={{ color: "white", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
                startIcon={<ArrowLeft />}
              >
                Back
              </Button>
              
            </Box>
            <Button sx={{ color: "white", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
              <Bell />
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Hero Section */}
      <Box sx={{ 
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(90deg, #800000 0%, #a0001a 50%, #b8860b 100%)"
      }}>
        <Box sx={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.2)" }} />
        <Container maxWidth="lg" sx={{ position: "relative", py: 8, textAlign: "center", color: "white" }}>
          <Box sx={{ maxWidth: "800px", mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ 
              width: 120, 
              height: 120, 
              backgroundColor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
              p: 2
            }}>
              <img 
                src={eteeapLogo} 
                alt="ETEEAP Logo" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain"
                }} 
              />
            </Box>
            <Typography variant="h2" component="h1" fontWeight="bold" sx={{ fontSize: { xs: "2.5rem", md: "4rem" } }}>
              ETEEAP Program
            </Typography>
            <Typography variant="h5" sx={{ color: "#ffd700", fontWeight: 500 }}>
              Expanded Tertiary Education Equivalency and Accreditation Program
            </Typography>
            <Box sx={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 1,
              backgroundColor: "rgba(255,215,0,0.2)",
              backdropFilter: "blur(8px)",
              borderRadius: 50,
              px: 3,
              py: 1.5,
              mx: "auto"
            }}>
              <Award />
              <Typography fontWeight="bold">"Credits for Prior Learning/Life-long Learning/Adult Education"</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* What is ETEEAP Section */}
        <Box sx={{ maxWidth: "800px", mx: "auto", mb: 8 }}>
          <Card sx={{ 
            backgroundColor: "rgba(255,255,255,0.7)", 
            backdropFilter: "blur(8px)",
            border: "none",
            boxShadow: 3
          }}>
            <CardHeader sx={{ textAlign: "center", pb: 3 }}>
              <Typography variant="h3" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                What is ETEEAP?
              </Typography>
            </CardHeader>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="body1" sx={{ fontSize: "1.125rem", color: "text.secondary", textAlign: "center", lineHeight: 1.7 }}>
                ETEEAP is an equivalency program. The basis for the grant of the degree is the work experience and other prior learning. ETEEAP means Expanded Tertiary Education Equivalency and Accreditation Program.  Executive Order 330, Series of 1996 was promulgated by the then President of the Republic of the Philippines, His Excellency Fidel V. Ramos providing for deputized Higher Education Institutions to grant earned Bachelor’s degree on the basis of at least 5 years of work experience related to the degree applied.  CIT University is one of the earliest deputized institutions.  CIT University had been operational since June 1999 and is now a Quarter-of-a-Century old.
              </Typography>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ background: "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)", border: "1px solid #90caf9" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          backgroundColor: "#1976d2", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <BookOpen sx={{ fontSize: 16, color: "white" }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="#0d47a1" sx={{ mb: 1 }}>
                            NON-FORMAL LEARNING
                          </Typography>
                          <Typography variant="body2" color="#1565c0">
                            Intentional learning acquired through participation in structured workplace-based training,
                            non-credit courses, and workshops.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)", border: "1px solid #81c784" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          backgroundColor: "#388e3c", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <Users sx={{ fontSize: 16, color: "white" }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="#1b5e20" sx={{ mb: 1 }}>
                            INFORMAL LEARNING
                          </Typography>
                          <Typography variant="body2" color="#2e7d32">
                            Learning that occurs incidentally through life experiences, workplace activities,
                            self-directed learning, and family responsibilities.
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Qualifications Section */}
        <Box sx={{ maxWidth: "800px", mx: "auto", mb: 8 }}>
          <Card sx={{ 
            backgroundColor: "rgba(255,255,255,0.7)", 
            backdropFilter: "blur(8px)",
            border: "none",
            boxShadow: 3
          }}>
            <CardHeader sx={{ textAlign: "center" }}>
              <Typography variant="h3" component="h2" fontWeight="bold" color="text.primary">
                Basic Applicant Qualifications
              </Typography>
            </CardHeader>
            <CardContent>
              <Grid container spacing={2}>
                {qualifications.map((qualification, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "flex-start", 
                      gap: 1.5, 
                      p: 2, 
                      backgroundColor: "#e8f5e8", 
                      borderRadius: 2 
                    }}>
                      <CheckCircle sx={{ color: "#4caf50", flexShrink: 0, mt: 0.125 }} />
                      <Typography variant="body2" color="text.secondary">
                        {qualification}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ 
                mt: 4, 
                p: 2, 
                backgroundColor: "#e3f2fd", 
                borderRadius: 2, 
                borderLeft: "4px solid #1976d2" 
              }}>
                <Typography variant="body2" fontWeight="medium" color="#0d47a1" sx={{ mb: 1 }}>
                  Additional Requirements:
                </Typography>
                <Box component="ul" sx={{ color: "#1565c0", fontSize: "0.875rem", pl: 2, m: 0 }}>
                  <li>Two years of college credits for Engineering, Architecture, and board programs</li>
                  <li>High School Graduate for non-board programs (except BSIE)</li>
                  <li>Aggregate of at least five years in industry related to the academic degree program</li>
                </Box>
                <Typography variant="caption" color="#1976d2" sx={{ mt: 1.5, fontStyle: "italic", display: "block" }}>
                  Reference: CMO No. 29 Series of 2021 - Article 5 Implementing Guidelines
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Programs Section */}
        <Box sx={{ maxWidth: "1200px", mx: "auto", mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
              Programs Covered
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose from our comprehensive range of accredited programs
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {programs.map((college, index) => (
              <Card 
                key={index}
                sx={{ 
                  "&:hover": { boxShadow: 6 },
                  transition: "all 0.3s",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(8px)",
                  border: "none",
                  overflow: "hidden"
                }}>
                  {/* College Header with Gradient Background */}
                  <Box sx={{
                    background: college.color === 'maroon' 
                      ? 'linear-gradient(135deg, #800000, #a0001a)' 
                      : 'linear-gradient(135deg, #b8860b, #ffd700)',
                    color: "white",
                    p: 3,
                    textAlign: "center"
                  }}>
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      gap: 2,
                      mb: 2
                    }}>
                      <Box sx={{ 
                        width: 56, 
                        height: 56, 
                        backgroundColor: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 3, 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "1.5rem"
                      }}>
                        {college.icon}
                      </Box>
                    </Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      sx={{ 
                        lineHeight: 1.2,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        mb: 1
                      }}
                    >
                      {college.college}
                    </Typography>
                    <Chip 
                      label={`${college.programs.length} Program${college.programs.length > 1 ? "s" : ""}`}
                      size="small"
                      sx={{ 
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  </Box>
                  {/* Programs List */}
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      color="text.primary" 
                      sx={{ mb: 2, textAlign: "center" }}
                    >
                      Programs Offered
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {college.programs.map((program, programIndex) => (
                        <Box
                          key={programIndex}
                          sx={{ 
                            display: "flex", 
                            alignItems: "flex-start", 
                            gap: 1.5, 
                            p: 2, 
                            backgroundColor: "#f8f9fa", 
                            borderRadius: 2, 
                            border: "1px solid #e9ecef",
                            "&:hover": { 
                              backgroundColor: "#e9ecef",
                              borderColor: "#dee2e6"
                            },
                            transition: "all 0.2s"
                          }}
                        >
                          <Box sx={{ 
                            width: 10, 
                            height: 10, 
                            background: college.color === 'maroon' 
                              ? 'linear-gradient(135deg, #800000, #a0001a)' 
                              : 'linear-gradient(135deg, #b8860b, #ffd700)',
                            borderRadius: "50%", 
                            mt: 0.75, 
                            flexShrink: 0 
                          }} />
                          <Typography 
                            variant="body1" 
                            color="text.primary" 
                            sx={{ 
                              lineHeight: 1.5,
                              fontWeight: 500
                            }}
                          >
                            {program}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box sx={{ maxWidth: "800px", mx: "auto", textAlign: "center" }}>
          <Card sx={{ 
            background: "linear-gradient(90deg, #b8860b 0%, #ffd700 100%)",
            border: "none",
            color: "white"
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                Ready to Start Your Journey?
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
                Transform your professional experience into academic credentials today.
              </Typography>
              <Button
                onClick={() => navigate("/")}
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#800000",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#660000" }
                }}
              >
                Begin Application
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        background: "linear-gradient(90deg, #b8860b 0%, #ffd700 100%)",
        mt: 8
      }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Grid container spacing={4} sx={{ color: "white" }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Phone />
                  <Typography>+63 (02) 123-4567</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Mail />
                  <Typography>info@eteeap.edu.ph</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <MapPin />
                  <Typography>Manila, Philippines</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { color: "#ffd700" }, 
                    justifyContent: "flex-start",
                    p: 0,
                    minHeight: "auto",
                    textTransform: "none"
                  }}
                >
                  About ETEEAP
                </Button>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { color: "#ffd700" }, 
                    justifyContent: "flex-start",
                    p: 0,
                    minHeight: "auto",
                    textTransform: "none"
                  }}
                >
                  Application Process
                </Button>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { color: "#ffd700" }, 
                    justifyContent: "flex-start",
                    p: 0,
                    minHeight: "auto",
                    textTransform: "none"
                  }}
                >
                  Requirements
                </Button>
                <Button 
                  variant="text" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { color: "#ffd700" }, 
                    justifyContent: "flex-start",
                    p: 0,
                    minHeight: "auto",
                    textTransform: "none"
                  }}
                >
                  FAQs
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { backgroundColor: "rgba(255,215,0,0.2)" },
                    minWidth: "auto",
                    p: 1
                  }}
                >
                  <Facebook />
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { backgroundColor: "rgba(255,215,0,0.2)" },
                    minWidth: "auto",
                    p: 1
                  }}
                >
                  <Instagram />
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { backgroundColor: "rgba(255,215,0,0.2)" },
                    minWidth: "auto",
                    p: 1
                  }}
                >
                  <Twitter />
                </Button>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ 
                    color: "white", 
                    "&:hover": { backgroundColor: "rgba(255,215,0,0.2)" },
                    minWidth: "auto",
                    p: 1
                  }}
                >
                  <LinkedIn />
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, backgroundColor: "rgba(255,255,255,0.3)" }} />

          <Box sx={{ textAlign: "center", color: "white" }}>
            <Typography>&copy; 2024 ETEEAP System. All rights reserved.</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default ProgramShowcase
