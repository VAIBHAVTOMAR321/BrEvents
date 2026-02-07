import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { FaCalendarAlt, FaMapMarkerAlt, FaTag } from "react-icons/fa";

import "../../assets/css/dashboard.css";
import UserLeftNav from "./UserLeftNav";
import "../../assets/css/UserDashBoadCard.css"
import UserHeader from "./UserHeader";
import { useAuthFetch } from "../context/AuthFetch"; // Import useAuthFetch
import { useNavigate } from "react-router-dom";
import FooterDashBoard from "../footer/FooterDashBoard";

const UserDashBoard = () => {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // --- NEW STATES FOR FETCHING EVENTS ---
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth data from localStorage
  const getAuthData = () => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
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

  // --- NEW useEffect TO FETCH DATA ---
  useEffect(() => {
    const auth = getAuthData();
    
    if (auth?.unique_id) {
      const fetchUserEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const userId = auth.unique_id;
          console.log("Fetching events for user ID:", userId);
          
          const response = await authFetch(
            `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-participant/?user_id=${userId}`
          );

          if (!response.ok) {
            console.error("API response not OK:", response.status, response.statusText);
            throw new Error("Failed to fetch your events. Please try again later.");
          }

          const data = await response.json();
          console.log("Fetched events data:", data);
          
          setEvents(data);

        } catch (err) {
          console.error("Error fetching user events:", err);
          setError(err.message || "An unexpected error occurred.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserEvents();
    } else {
      console.log("No unique_id found in authentication data");
      setIsLoading(false);
    }
  }, [authFetch]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // --- Helper function to format date and time ---
  const formatEventDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // --- Helper function to get status badge variant ---
  const getStatusVariant = (eventDateTime) => {
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    if (eventDate > now) {
      return "success"; // Upcoming
    } else {
      return "secondary"; // Past/Completed
    }
  };

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title mb-0">My Events</h1>
            </div>

            {/* --- CONDITIONAL RENDERING --- */}
            {isLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading your events...</span>
                </Spinner>
                <p className="mt-2">Loading your events...</p>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="mb-4">
                <Alert.Heading>Oops!</Alert.Heading>
                <p>{error}</p>
              </Alert>
            )}

            {!isLoading && !error && (
              <>
                {events.length === 0 ? (
                  <Alert variant="info">
                    <Alert.Heading>No Events Found</Alert.Heading>
                    <p>You haven't registered for any events yet. Check out our upcoming events!</p>
                  </Alert>
                ) : (
                  <Row>
                    {events.map((participation) => (
                      <Col md={6} lg={4} className="mb-4" key={participation.id}>
                        <Card className="h-100 event-card profile-card">
                          <Card.Body className="d-flex flex-column">
                            <div className="flex-grow-1">
                              <Card.Title as="h5" className="event-title">
                                {participation.event_detail.event_name}
                              </Card.Title>
                              
                              <div className="event-details">
                                <p className="mb-2">
                                  <FaCalendarAlt className="me-2 text-primary" />
                                  <strong>Date & Time:</strong> {formatEventDateTime(participation.event_detail.event_date_time)}
                                </p>
                                <p className="mb-2">
                                  <FaMapMarkerAlt className="me-2 text-danger" />
                                  <strong>Venue:</strong> {participation.event_detail.venue}
                                </p>
                                {participation.event_detail.event_type && (
                                  <p className="mb-3">
                                    <FaTag className="me-2 text-info" />
                                    <strong>Type:</strong> {participation.event_detail.event_type}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                               <Badge bg={getStatusVariant(participation.event_detail.event_date_time)}>
                                  {new Date(participation.event_detail.event_date_time) > new Date() ? "Upcoming" : "Completed"}
                               </Badge>
                               <small className="text-muted">
                                 Registered: {new Date(participation.created_at).toLocaleDateString()}
                               </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}
          </Container>
          <FooterDashBoard />
        </div>
        
      </div>
    </>
  );
};

export default UserDashBoard;
