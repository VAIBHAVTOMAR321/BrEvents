import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import DashBoardHeader from "../../DashBoardHeader";
import LeftNav from "../../LeftNav";
import { useAuth } from "../../../context/AuthContext";
import { useAuthFetch } from "../../../context/AuthFetch";

const ManageEvent = () => {
  const { auth, refreshAccessToken } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all events
  const [events, setEvents] = useState([]);
  
  // Form state for selected event
  const [formData, setFormData] = useState({
    id: null,
    event_id: "",
    event_name: "",
    description: "",
    event_date_time: "",
    venue: "",
    event_type: "",
    is_past: false,
    is_present: false,
    is_upcoming: false,
    created_at: "",
    updated_at: ""
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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

  // Fetch all events on component mount
  useEffect(() => {
    fetchAllEvents();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all events from API
  const fetchAllEvents = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events data");
      }

      const result = await response.json();
      console.log("GET All Events API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setEvents(result.data);
      } else if (Array.isArray(result)) {
        // Handle direct array response
        setEvents(result);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific event data by ID
  const fetchEventData = async (eventId) => {
    setIsLoading(true);
    try {
      console.log("Fetching event with ID:", eventId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch event data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Event Details API Response:", result);

      let eventData;
      
      // Check if data is an array or a single object
      if (Array.isArray(result)) {
        eventData = result.find(item => item.id.toString() === eventId.toString());
        if (!eventData) {
          throw new Error(`Event with ID ${eventId} not found in response array`);
        }
      } else if (result.data) {
        if (Array.isArray(result.data)) {
          eventData = result.data.find(item => item.id.toString() === eventId.toString());
          if (!eventData) {
            throw new Error(`Event with ID ${eventId} not found in response array`);
          }
        } else if (result.data.id && result.data.id.toString() === eventId.toString()) {
          eventData = result.data;
        } else {
          throw new Error(`Returned event ID ${result.data.id} does not match requested ID ${eventId}`);
        }
      } else if (result.id && result.id.toString() === eventId.toString()) {
        eventData = result;
      } else {
        throw new Error("Invalid event data structure in response");
      }

      // Clean up description field if it has the extra "description\": " part
      let cleanDescription = eventData.description;
      if (cleanDescription && cleanDescription.includes('description": "')) {
        cleanDescription = cleanDescription.replace(/.*?description": "(.*?)".*?/, '$1');
      }

      setFormData({
        id: eventData.id,
        event_id: eventData.event_id,
        event_name: eventData.event_name,
        description: cleanDescription,
        event_date_time: eventData.event_date_time,
        venue: eventData.venue,
        event_type: eventData.event_type || "",
        is_past: eventData.is_past,
        is_present: eventData.is_present,
        is_upcoming: eventData.is_upcoming,
        created_at: eventData.created_at,
        updated_at: eventData.updated_at
      });

      setSelectedEventId(eventId);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setMessage(error.message || "An error occurred while fetching event data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event card click
  const handleEventClick = (eventId) => {
    console.log("Event card clicked with ID:", eventId);
    fetchEventData(eventId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to event list
  const backToEventList = () => {
    setSelectedEventId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Enable adding new event
  const addNewEvent = () => {
    setFormData({
      id: null,
      event_id: "",
      event_name: "",
      description: "",
      event_date_time: "",
      venue: "",
      event_type: "",
      is_past: false,
      is_present: false,
      is_upcoming: false,
      created_at: "",
      updated_at: ""
    });
    setIsEditing(true);
    setSelectedEventId(null);
    setShowAlert(false);
  };

  // Calculate event status based on date
  const calculateEventStatus = (eventDateTime) => {
    if (!eventDateTime) return { is_past: false, is_present: false, is_upcoming: false };
    
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    
    // Check if the event is in the past, present, or future
    const isPast = eventDate < now;
    const isPresent = Math.abs(eventDate - now) < 24 * 60 * 60 * 1000; // Within 24 hours
    const isUpcoming = eventDate > now;
    
    return {
      is_past: isPast,
      is_present: isPresent && !isPast,
      is_upcoming: isUpcoming
    };
  };

  // Get status badge component
  const getStatusBadge = (isPast, isPresent, isUpcoming) => {
    if (isPast) {
      return <Badge bg="secondary">Past</Badge>;
    } else if (isPresent) {
      return <Badge bg="success">Ongoing</Badge>;
    } else if (isUpcoming) {
      return <Badge bg="primary">Upcoming</Badge>;
    }
    return <Badge bg="secondary">Not Set</Badge>;
  };

  // Handle form submission (POST for new, PUT for update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Calculate status based on event date
      const status = calculateEventStatus(formData.event_date_time);
      
      const payload = {
        event_id: formData.event_id,
        event_name: formData.event_name,
        description: formData.description,
        event_date_time: formData.event_date_time,
        venue: formData.venue,
        event_type: formData.event_type || null,
        is_past: status.is_past,
        is_present: status.is_present,
        is_upcoming: status.is_upcoming
      };

      console.log("Submitting data for event:", formData.event_name);
      console.log("Payload:", payload);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing event
        payload.id = formData.id;
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
        successMessage = "Event updated successfully!";
      } else {
        // Create new event
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        successMessage = "Event created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save event details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the events list
        await fetchAllEvents();
        
        // If creating a new event, switch to view mode for the new event
        if (!formData.id && result.data && result.data.id) {
          fetchEventData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save event details"
        );
      }
    } catch (error) {
      console.error("Error saving event details:", error);
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/`,
        {
          method: "DELETE",
          body: JSON.stringify({ event_id: eventToDelete.event_id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage("Event deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the events list
        await fetchAllEvents();
        
        // If we were viewing the deleted event, go back to the list
        if (selectedEventId === eventToDelete.id) {
          backToEventList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setMessage(error.message || "An error occurred while deleting the event");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
              <h1 className="page-title mb-0">Manage Events</h1>
              <Button variant="primary" onClick={addNewEvent}>
                <FaPlus /> Add New Event
              </Button>
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

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Events...</p>
              </div>
            ) : (
              <>
                {!selectedEventId ? (
                  // Events List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        <h2 className="mb-4">Select an Event to Edit</h2>
                        {events.length === 0 ? (
                          <Alert variant="info">
                            No events found. Click "Add New Event" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {events.map((event) => (
                              <Col md={6} lg={4} className="mb-4" key={event.id}>
                                <Card className="h-100 event-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start mb-2">
                                        <Card.Title as="h5" className="mb-0">
                                          {event.event_name}
                                        </Card.Title>
                                        {getStatusBadge(event.is_past, event.is_present, event.is_upcoming)}
                                      </div>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>ID:</strong> {event.event_id}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <strong>Type:</strong> {event.event_type || "Not specified"}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <FaCalendarAlt className="me-1" />
                                        {formatDate(event.event_date_time)}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-2">
                                        <FaMapMarkerAlt className="me-1" />
                                        {event.venue}
                                      </Card.Text>
                                      <Card.Text className="text-muted mb-3">
                                        {event.description && event.description.length > 100 
                                          ? `${event.description.substring(0, 100)}...` 
                                          : event.description}
                                      </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleEventClick(event.id)}
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => showDeleteConfirmation(event)}
                                      >
                                        <FaTrash /> Delete
                                      </Button>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </>
                ) : (
                  // Event Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToEventList}>
                        <FaArrowLeft /> Back to Events List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                        <span>{formData.id ? `Edit Event: ${formData.event_name}` : "Add New Event"}</span>
                        {formData.id && getStatusBadge(formData.is_past, formData.is_present, formData.is_upcoming)}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Event ID</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="event_id"
                                  value={formData.event_id}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                  placeholder="Generated automatically"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Event Type</Form.Label>
                                <Form.Select
                                  name="event_type"
                                  value={formData.event_type}
                                  onChange={handleChange}
                                  disabled={!isEditing}
                                >
                                  <option value="">Select event type</option>
                                  <option value="conference">Conference</option>
                                  <option value="workshop">Workshop</option>
                                  <option value="seminar">Seminar</option>
                                  <option value="webinar">Webinar</option>
                                  <option value="networking">Networking</option>
                                  <option value="other">Other</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter event name"
                              name="event_name"
                              value={formData.event_name}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter event description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Date & Time</Form.Label>
                                <Form.Control
                                  type="datetime-local"
                                  name="event_date_time"
                                  value={formData.event_date_time ? formatDateForInput(formData.event_date_time) : ""}
                                  onChange={handleChange}
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Venue</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter event venue"
                                  name="venue"
                                  value={formData.venue}
                                  onChange={handleChange}
                                  required
                                  disabled={!isEditing}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {formData.id && (
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Created At</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formatDate(formData.created_at)}
                                    disabled
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Updated At</Form.Label>
                                  <Form.Control
                                    type="text"
                                    value={formatDate(formData.updated_at)}
                                    disabled
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                          )}
                        </Form>
                      </Card.Body>
                    </Card>

                    <div className="d-flex gap-2 mt-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={resetForm}
                            type="button"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="primary"
                            onClick={enableEditing}
                            type="button"
                          >
                            <FaEdit /> Edit Event Details
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => showDeleteConfirmation(formData)}
                            type="button"
                          >
                            <FaTrash /> Delete Event
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event "{eventToDelete?.event_name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteEvent}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageEvent;