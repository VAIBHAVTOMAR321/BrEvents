import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Form, Modal, Spinner, Alert } from "react-bootstrap";
import "../../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../../context/AuthFetch";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserMd, FaPhone, FaEnvelope, FaHome, FaVenusMars, FaRulerVertical, FaWeight, FaCalendarAlt,
  FaHospital, FaStethoscope, FaNotesMedical, FaUserClock, FaInfoCircle, FaExclamationTriangle,
  FaHeartbeat, FaAppleAlt, FaBed, FaBrain, FaEye, FaTooth,
  FaRunning, FaClipboardList, FaUserMd as FaUser, FaIdCard, FaBaby, FaCut, FaUserNurse,
  FaFileMedical, FaAllergies, FaPills, FaThermometer, FaHandHoldingMedical, FaStar, FaCommentDots,
  FaCheckCircle, FaTimesCircle, FaQuoteLeft, FaQuoteRight, FaChartLine, FaHeart, FaUsers, FaMapMarkerAlt,
  FaImage, FaLink, FaCertificate, FaBuilding, FaUserTie, FaGlobe, FaCity, FaInfo, FaEye as FaViewIcon,
  FaGraduationCap, FaTheaterMasks, FaMusic, FaPalette, FaCamera, FaMicrophone, FaBook, FaGamepad,
  FaFilm, FaCode, FaLaptopCode, FaDesktop, FaPencilRuler, FaBullhorn, FaHandshake,
  FaFilePdf, FaFileExcel, FaSearch, FaDownload, FaPrint
} from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";

const TotalRegistration = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const admin_id = auth?.unique_id;

  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for registration entries
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Submission state
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Base URL for API
  const API_BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Function to get icon based on user type
  const getUserTypeIcon = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return <FaGraduationCap />;
    } else if (type.includes('artist') || type.includes('art')) {
      return <FaPalette />;
    } else if (type.includes('musician') || type.includes('music')) {
      return <FaMusic />;
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return <FaTheaterMasks />;
    } else if (type.includes('photographer') || type.includes('photo')) {
      return <FaCamera />;
    } else if (type.includes('singer') || type.includes('vocal')) {
      return <FaMicrophone />;
    } else if (type.includes('writer') || type.includes('author')) {
      return <FaBook />;
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return <FaGamepad />;
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return <FaFilm />;
    } else if (type.includes('developer') || type.includes('programmer')) {
      return <FaCode />;
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return <FaPencilRuler />;
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return <FaBullhorn />;
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return <FaHandshake />;
    } else if (type.includes('doctor') || type.includes('medical')) {
      return <FaUserMd />;
    } else {
      return <FaUser />;
    }
  };

  // Function to get badge color based on user type
  const getUserTypeBadgeColor = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return 'primary';
    } else if (type.includes('artist') || type.includes('art')) {
      return 'danger';
    } else if (type.includes('musician') || type.includes('music')) {
      return 'info';
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return 'warning';
    } else if (type.includes('photographer') || type.includes('photo')) {
      return 'dark';
    } else if (type.includes('singer') || type.includes('vocal')) {
      return 'success';
    } else if (type.includes('writer') || type.includes('author')) {
      return 'secondary';
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return 'danger';
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return 'dark';
    } else if (type.includes('developer') || type.includes('programmer')) {
      return 'info';
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return 'warning';
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return 'primary';
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return 'success';
    } else if (type.includes('doctor') || type.includes('medical')) {
      return 'danger';
    } else {
      return 'secondary';
    }
  };

  // Check device width
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch registration entries from API
  const fetchEntries = async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    try {
      const url = `${API_BASE_URL}/api/reg-user/`;
      
      // Use the authFetch hook which should handle token refresh automatically
      const response = await authFetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch registration entries");
      }

      const result = await response.json();
      console.log("GET API Response:", result);

      // Handle both response formats: direct array or wrapped in success/data object
      let entriesData = [];
      if (Array.isArray(result)) {
        // Direct array response
        entriesData = result;
      } else if (result.success && result.data) {
        // Wrapped response
        entriesData = result.data;
      } else {
        throw new Error("No registration entries found");
      }

      // Process data to format dates
      const processedEntries = entriesData.map(entry => {
        const processedEntry = { ...entry };
        
        // Format created date if it exists
        if (entry.created_at) {
          const createdDate = new Date(entry.created_at);
          processedEntry.formatted_created_date = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        return processedEntry;
      });

      setEntries(processedEntries);
      setFilteredEntries(processedEntries);
    } catch (error) {
      console.error("Error fetching registration entries:", error);
      
      // Check if it's an authentication error
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        setMessage("Your session has expired. Please log in again.");
        setVariant("warning");
        setShowAlert(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 3000);
      } else {
        setMessage(error.message || "An error occurred while fetching registration entries");
        setVariant("danger");
        setShowAlert(true);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Fetch registration entries when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchEntries();
    }
  }, [authLoading, isAuthenticated]);

  // Filter entries based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          (entry.full_name && entry.full_name.toLowerCase().includes(query)) ||
          (entry.user_type && entry.user_type.toLowerCase().includes(query)) ||
          (entry.phone && entry.phone.toLowerCase().includes(query)) ||
          (entry.email && entry.email.toLowerCase().includes(query)) ||
          (entry.city && entry.city.toLowerCase().includes(query)) ||
          (entry.state && entry.state.toLowerCase().includes(query)) ||
          (entry.team_name && entry.team_name.toLowerCase().includes(query))
        );
      });
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);

  // Function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to handle view registration details
  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // Function to export data to PDF
  const exportToPDF = () => {
    // Create a temporary table element for printing
    const printWindow = window.open('', '_blank');
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const printContent = `
      <html>
        <head>
          <title>Registration Data</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .table {
              border-collapse: collapse;
              width: 100%;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .export-date {
              text-align: right;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Registration Data</h1>
            <button>Print</button>
            <div class="export-date">Exported on: ${currentDate}</div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>User Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Team Name</th>
                <th>Talent Scope</th>
                <th>Introduction</th>
                <th>Registration Date</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.id || entry.user_id}</td>
                  <td>${entry.full_name || 'N/A'}</td>
                  <td>${entry.user_type || 'N/A'}</td>
                  <td>${entry.phone || 'N/A'}</td>
                  <td>${entry.email || 'N/A'}</td>
                  <td>${entry.gender || 'N/A'}</td>
                  <td>${entry.address || 'N/A'}</td>
                  <td>${entry.city || 'N/A'}</td>
                  <td>${entry.state || 'N/A'}</td>
                  <td>${entry.country || 'N/A'}</td>
                  <td>${entry.team_name || 'N/A'}</td>
                  <td>${entry.talent_scope && entry.talent_scope.length > 0 ? entry.talent_scope.join(', ') : 'Not specified'}</td>
                  <td>${entry.introduction || 'N/A'}</td>
                  <td>${formatDateTime(entry.created_at)}</td>
                  <td>${entry.updated_at ? formatDateTime(entry.updated_at) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Function to handle print functionality
  const handlePrint = () => {
    // Create a temporary table element for printing
    const printWindow = window.open('', '_blank');
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const printContent = `
      <html>
        <head>
          <title>Registration Data</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .table {
              border-collapse: collapse;
              width: 100%;
            }
            .table th, .table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .table th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .export-date {
              text-align: right;
              font-style: italic;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Registration Data</h1>
            <button class="no-print" onclick="window.print();">Print</button>
            <div class="export-date">Printed on: ${currentDate}</div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>User Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Team Name</th>
                <th>Talent Scope</th>
                <th>Introduction</th>
                <th>Registration Date</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.id || entry.user_id}</td>
                  <td>${entry.full_name || 'N/A'}</td>
                  <td>${entry.user_type || 'N/A'}</td>
                  <td>${entry.phone || 'N/A'}</td>
                  <td>${entry.email || 'N/A'}</td>
                  <td>${entry.gender || 'N/A'}</td>
                  <td>${entry.address || 'N/A'}</td>
                  <td>${entry.city || 'N/A'}</td>
                  <td>${entry.state || 'N/A'}</td>
                  <td>${entry.country || 'N/A'}</td>
                  <td>${entry.team_name || 'N/A'}</td>
                  <td>${entry.talent_scope && entry.talent_scope.length > 0 ? entry.talent_scope.join(', ') : 'Not specified'}</td>
                  <td>${entry.introduction || 'N/A'}</td>
                  <td>${formatDateTime(entry.created_at)}</td>
                  <td>${entry.updated_at ? formatDateTime(entry.updated_at) : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Function to export data to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['ID', 'Full Name', 'User Type', 'Phone', 'Email', 'Gender', 'Address', 'City', 'State', 'Country', 'Team Name', 'Talent Scope', 'Introduction', 'Registration Date', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.id || entry.user_id,
        entry.full_name || 'N/A',
        entry.user_type || 'N/A',
        entry.phone || 'N/A',
        entry.email || 'N/A',
        entry.gender || 'N/A',
        entry.address || 'N/A',
        entry.city || 'N/A',
        entry.state || 'N/A',
        entry.country || 'N/A',
        entry.team_name || 'N/A',
        entry.talent_scope && entry.talent_scope.length > 0 ? entry.talent_scope.join(', ') : 'Not specified',
        entry.introduction || 'N/A',
        formatDateTime(entry.created_at),
        entry.updated_at ? formatDateTime(entry.updated_at) : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `registration_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  // If not authenticated, show message and redirect
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <Alert variant="warning">
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>You need to be logged in to view this page.</p>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title">Total Registrations</h1>
              <div>
                <Button variant="outline-primary" onClick={exportToPDF} className="me-2">
                  <FaDownload className="me-1" /> Export PDF
                </Button>
                <Button variant="outline-success" onClick={exportToExcel} className="me-2">
                  <FaDownload className="me-1" /> Export Excel
                </Button>
                <Button variant="outline-info" onClick={handlePrint} className="me-2">
                  <FaPrint className="me-1" /> Print
                </Button>
              </div>
            </div>

            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}
            
            {/* Search Control */}
            <div className="mb-4">
              <Form.Control
                type="text"
                placeholder="Search by name, type, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-50"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading registration data...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-th">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>User Type</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry, index) => (
                      <tr key={entry.id || entry.user_id}>
                        <td>{index + 1}</td>
                        <td>{entry.full_name || 'N/A'}</td>
                        <td>
                          <Badge bg={getUserTypeBadgeColor(entry.user_type)} className="py-1 px-2">
                            <span className="me-1">{getUserTypeIcon(entry.user_type)}</span>
                            {entry.user_type || 'N/A'}
                          </Badge>
                        </td>
                        <td>{entry.phone || 'N/A'}</td>
                        <td>{entry.email || 'N/A'}</td>
                        <td>{entry.city || 'N/A'}</td>
                        <td>{formatDateTime(entry.created_at)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                            className="me-2"
                          >
                            <FaViewIcon />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {searchQuery ? "No matching registration entries found." : "No registration entries found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Container>
        </div>
      </div>

      {/* Registration Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registration Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <div>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Registration ID:</td>
                    <td>{selectedEntry.id || selectedEntry.user_id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Full Name:</td>
                    <td>{selectedEntry.full_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>User Type:</td>
                    <td>
                      <Badge bg={getUserTypeBadgeColor(selectedEntry.user_type)} className="py-1 px-2">
                        <span className="me-1">{getUserTypeIcon(selectedEntry.user_type)}</span>
                        {selectedEntry.user_type || 'N/A'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Phone:</td>
                    <td>{selectedEntry.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Email:</td>
                    <td>{selectedEntry.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Gender:</td>
                    <td>{selectedEntry.gender || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Address:</td>
                    <td>{selectedEntry.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>City:</td>
                    <td>{selectedEntry.city || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>State:</td>
                    <td>{selectedEntry.state || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Country:</td>
                    <td>{selectedEntry.country || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Team Name:</td>
                    <td>{selectedEntry.team_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Talent Scope:</td>
                    <td>
                      {selectedEntry.talent_scope && selectedEntry.talent_scope.length > 0 ? 
                        selectedEntry.talent_scope.map((talent, index) => (
                          <Badge key={index} bg="secondary" className="py-1 px-2 me-1">
                            {talent}
                          </Badge>
                        )) : 
                        'Not specified'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Introduction:</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{selectedEntry.introduction || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Registration Date:</td>
                    <td>{formatDateTime(selectedEntry.created_at)}</td>
                  </tr>
                  {selectedEntry.updated_at && (
                    <tr>
                      <td style={{ fontWeight: 'bold', width: '30%' }}>Last Updated:</td>
                      <td>{formatDateTime(selectedEntry.updated_at)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TotalRegistration;
