import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { FaDownload, FaEye } from "react-icons/fa";

const ParticipatedUser = () => {
  const { auth, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for participants data
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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

  // Fetch participants data
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchParticipants();
    }
  }, [authLoading, isAuthenticated]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching participants data...");
      
      const response = await authFetch(
        'https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-participant/'
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Participants API Response:", result);
      
      // Handle different response structures
      if (result.success && result.data) {
        setParticipants(result.data);
      } else if (Array.isArray(result)) {
        setParticipants(result);
      } else {
        console.warn("Unexpected response format:", result);
        setParticipants([]);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.message || 'Failed to fetch participants data');
      setMessage(err.message || 'Failed to fetch participants data');
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to determine event status
  const getEventStatus = (eventDateTime) => {
    if (!eventDateTime) return null;
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    
    if (eventDate < now) {
      return { is_past: true, is_present: false, is_upcoming: false };
    } else if (eventDate.toDateString() === now.toDateString()) {
      return { is_past: false, is_present: true, is_upcoming: false };
    } else {
      return { is_past: false, is_present: false, is_upcoming: true };
    }
  };

  // Function to handle view participant details
  const handleViewParticipant = (participant) => {
    setSelectedParticipant(participant);
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
          <title>Event Participants</title>
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
            <h1>Event Participants</h1>
            <div class="export-date">Exported on: ${currentDate}</div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>User Name</th>
                <th>Event ID</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${participants.map(participant => {
                const status = getEventStatus(participant.event_detail?.event_date_time);
                return `
                <tr>
                  <td>${participant.id}</td>
                  <td>${participant.user_detail?.user_id || 'N/A'}</td>
                  <td>${participant.user_detail?.full_name || 'N/A'}</td>
                  <td>${participant.event_detail?.event_id || 'N/A'}</td>
                  <td>${participant.event_detail?.event_name || 'N/A'}</td>
                  <td>${formatDate(participant.event_detail?.event_date_time)}</td>
                  <td>${participant.event_detail?.venue || 'N/A'}</td>
                  <td>
                    ${status?.is_past ? '<span class="badge bg-secondary">Past</span>' : ''}
                    ${status?.is_present ? '<span class="badge bg-success">Ongoing</span>' : ''}
                    ${status?.is_upcoming ? '<span class="badge bg-primary">Upcoming</span>' : ''}
                  </td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Function to export data to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['ID', 'User ID', 'User Name', 'Event ID', 'Event Name', 'Date', 'Venue', 'Status'];
    const csvContent = [
      headers.join(','),
      ...participants.map(participant => {
        const status = getEventStatus(participant.event_detail?.event_date_time);
        let statusText = '';
        if (status?.is_past) statusText = 'Past';
        else if (status?.is_present) statusText = 'Ongoing';
        else if (status?.is_upcoming) statusText = 'Upcoming';
        
        return [
          participant.id,
          participant.user_detail?.user_id || 'N/A',
          participant.user_detail?.full_name || 'N/A',
          participant.event_detail?.event_id || 'N/A',
          participant.event_detail?.event_name || 'N/A',
          formatDate(participant.event_detail?.event_date_time),
          participant.event_detail?.venue || 'N/A',
          statusText
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
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
              <h1 className="page-title">Event Participants</h1>
              <div>
                <Button variant="outline-primary" onClick={exportToPDF} className="me-2">
                  <FaDownload className="me-1" /> Export PDF
                </Button>
                <Button variant="outline-success" onClick={exportToExcel} className="me-2">
                  <FaDownload className="me-1" /> Export Excel
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
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading participants...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <h5>Error loading participants</h5>
                <p>{error}</p>
                <Button variant="primary" onClick={fetchParticipants}>
                  Try Again
                </Button>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-th">
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => {
                      const status = getEventStatus(participant.event_detail?.event_date_time);
                      return (
                        <tr key={participant.id}>
                          <td>{index + 1}</td>
                          <td>{participant.user_detail?.user_id || 'N/A'}</td>
                          <td>{participant.user_detail?.full_name || 'N/A'}</td>
                          <td>{participant.event_detail?.event_id || 'N/A'}</td>
                          <td>{participant.event_detail?.event_name || 'N/A'}</td>
                          <td>{formatDate(participant.event_detail?.event_date_time)}</td>
                          <td>{participant.event_detail?.venue || 'N/A'}</td>
                          <td>
                            {status?.is_past && <Badge bg="secondary">Past</Badge>}
                            {status?.is_present && <Badge bg="success">Ongoing</Badge>}
                            {status?.is_upcoming && <Badge bg="primary">Upcoming</Badge>}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewParticipant(participant)}
                              className="me-2"
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">No participants found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Container>
        </div>
      </div>

      {/* Participant Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Participant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedParticipant && (
            <div>
              <h5 className="mb-3">User Details</h5>
              <Table striped bordered className="mb-4">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>User ID:</td>
                    <td>{selectedParticipant.user_detail?.user_id || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Full Name:</td>
                    <td>{selectedParticipant.user_detail?.full_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Email:</td>
                    <td>{selectedParticipant.user_detail?.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Phone:</td>
                    <td>{selectedParticipant.user_detail?.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>User Type:</td>
                    <td>{selectedParticipant.user_detail?.user_type || 'N/A'}</td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-3">Event Details</h5>
              <Table striped bordered className="mb-4">
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Event ID:</td>
                    <td>{selectedParticipant.event_detail?.event_id || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Event Name:</td>
                    <td>{selectedParticipant.event_detail?.event_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Event Type:</td>
                    <td>{selectedParticipant.event_detail?.event_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Date:</td>
                    <td>{formatDate(selectedParticipant.event_detail?.event_date_time)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Venue:</td>
                    <td>{selectedParticipant.event_detail?.venue || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Status:</td>
                    <td>
                      {(() => {
                        const status = getEventStatus(selectedParticipant.event_detail?.event_date_time);
                        return (
                          <>
                            {status?.is_past && <Badge bg="secondary">Past</Badge>}
                            {status?.is_present && <Badge bg="success">Ongoing</Badge>}
                            {status?.is_upcoming && <Badge bg="primary">Upcoming</Badge>}
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-3">Registration Details</h5>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Registration ID:</td>
                    <td>{selectedParticipant.id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Registered On:</td>
                    <td>{formatDate(selectedParticipant.created_at)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ParticipatedUser;