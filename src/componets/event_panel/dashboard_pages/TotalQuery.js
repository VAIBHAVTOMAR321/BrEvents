import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Form, Modal, Spinner, Alert } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import { useNavigate } from "react-router-dom";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { FaDownload, FaEye } from "react-icons/fa";

const TotalQuery = () => {
  const { auth, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for contact queries data
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  
  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);

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

  // Fetch contact queries data
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchQueries();
    }
  }, [authLoading, isAuthenticated]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching contact queries data...");
      
      const response = await authFetch(
        'https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/contact-us/'
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Contact Queries API Response:", result);
      
      // Handle different response structures
      if (result.success && result.data) {
        setQueries(result.data);
      } else if (Array.isArray(result)) {
        setQueries(result);
      } else {
        console.warn("Unexpected response format:", result);
        setQueries([]);
      }
    } catch (err) {
      console.error('Error fetching contact queries:', err);
      setError(err.message || 'Failed to fetch contact queries data');
      setMessage(err.message || 'Failed to fetch contact queries data');
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

  // Function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to handle view query details
  const handleViewQuery = (query) => {
    setSelectedQuery(query);
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
          <title>Contact Queries</title>
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
            <h1>Contact Queries</h1>
            <div class="export-date">Exported on: ${currentDate}</div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Message</th>
                <th>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              ${queries.map(query => `
                <tr>
                  <td>${query.id}</td>
                  <td>${query.full_name || 'N/A'}</td>
                  <td>${query.email || 'N/A'}</td>
                  <td>${query.mobile_number || 'N/A'}</td>
                  <td>${query.message || 'N/A'}</td>
                  <td>${formatDateTime(query.created_at)}</td>
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

  // Function to export data to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Mobile Number', 'Message', 'Submitted On'];
    const csvContent = [
      headers.join(','),
      ...queries.map(query => [
        query.id,
        query.full_name || 'N/A',
        query.email || 'N/A',
        query.mobile_number || 'N/A',
        `"${(query.message || 'N/A').replace(/"/g, '""')}"`, // Escape quotes in message
        formatDateTime(query.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact_queries_${new Date().toISOString().split('T')[0]}.csv`;
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
              <h1 className="page-title">Contact Queries</h1>
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
                <p className="mt-3">Loading contact queries...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                <h5>Error loading contact queries</h5>
                <p>{error}</p>
                <Button variant="primary" onClick={fetchQueries}>
                  Try Again
                </Button>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-th">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    <th>Message</th>
                    <th>Submitted On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.length > 0 ? (
                    queries.map((query, index) => (
                      <tr key={query.id}>
                        <td>{index + 1}</td>
                        <td>{query.full_name || 'N/A'}</td>
                        <td>{query.email || 'N/A'}</td>
                        <td>{query.mobile_number || 'N/A'}</td>
                        <td>
                          {query.message && query.message.length > 50 
                            ? `${query.message.substring(0, 50)}...` 
                            : query.message || 'N/A'}
                        </td>
                        <td>{formatDateTime(query.created_at)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewQuery(query)}
                            className="me-2"
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No contact queries found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Container>
        </div>
      </div>

      {/* Query Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Contact Query Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuery && (
            <div>
              <Table striped bordered>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Query ID:</td>
                    <td>{selectedQuery.id}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Full Name:</td>
                    <td>{selectedQuery.full_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Email:</td>
                    <td>{selectedQuery.email || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Mobile Number:</td>
                    <td>{selectedQuery.mobile_number || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Message:</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{selectedQuery.message || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold', width: '30%' }}>Submitted On:</td>
                    <td>{formatDateTime(selectedQuery.created_at)}</td>
                  </tr>
                  {selectedQuery.updated_at && (
                    <tr>
                      <td style={{ fontWeight: 'bold', width: '30%' }}>Last Updated:</td>
                      <td>{formatDateTime(selectedQuery.updated_at)}</td>
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

export default TotalQuery;