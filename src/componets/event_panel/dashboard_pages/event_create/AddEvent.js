import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaSave } from "react-icons/fa";
import { useAuthFetch } from "../../../context/AuthFetch";

const AddEvent = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date_time: "",
    venue: "",
    event_type: ""
  });

  // Status fields (calculated based on event date time)
  const [eventStatus, setEventStatus] = useState({
    is_past: false,
    is_present: false,
    is_upcoming: false
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

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

  // Update event status whenever event_date_time changes
  useEffect(() => {
    if (formData.event_date_time) {
      const eventDate = new Date(formData.event_date_time);
      const now = new Date();
      
      // Check if the event is in the past, present, or future
      const isPast = eventDate < now;
      const isPresent = Math.abs(eventDate - now) < 24 * 60 * 60 * 1000; // Within 24 hours
      const isUpcoming = eventDate > now;
      
      setEventStatus({
        is_past: isPast,
        is_present: isPresent && !isPast,
        is_upcoming: isUpcoming
      });
    } else {
      setEventStatus({
        is_past: false,
        is_present: false,
        is_upcoming: false
      });
    }
  }, [formData.event_date_time]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.event_name.trim()) {
      errors.event_name = "Event name is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (!formData.event_date_time) {
      errors.event_date_time = "Event date and time is required";
    } else {
      const selectedDate = new Date(formData.event_date_time);
      const now = new Date();
      if (selectedDate < now) {
        errors.event_date_time = "Event date cannot be in the past";
      }
    }
    
    if (!formData.venue.trim()) {
      errors.venue = "Venue is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Create form data for API submission
      const submitData = new FormData();
      submitData.append('event_name', formData.event_name);
      submitData.append('description', formData.description);
      submitData.append('event_date_time', formData.event_date_time);
      submitData.append('venue', formData.venue);
      
      // Only add event_type if it has a value
      if (formData.event_type) {
        submitData.append('event_type', formData.event_type);
      }
      
      // Add status fields (calculated based on event date time)
      submitData.append('is_past', eventStatus.is_past);
      submitData.append('is_present', eventStatus.is_present);
      submitData.append('is_upcoming', eventStatus.is_upcoming);
      
      const response = await authFetch(
        'https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/',
        {
          method: 'POST',
          body: submitData
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess("Event created successfully!");
        // Reset form
        setFormData({
          event_name: "",
          description: "",
          event_date_time: "",
          venue: "",
          event_type: ""
        });
        
        // Reset status
        setEventStatus({
          is_past: false,
          is_present: false,
          is_upcoming: false
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/ManageEvent'); // or your events list page
        }, 2000);
      } else {
        setError(data.message || "Failed to create event. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date for input min attribute (current date/time)
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get status badge component
  const getStatusBadge = () => {
    if (eventStatus.is_past) {
      return <span className="badge bg-secondary">Past</span>;
    } else if (eventStatus.is_present) {
      return <span className="badge bg-success">Ongoing</span>;
    } else if (eventStatus.is_upcoming) {
      return <span className="badge bg-primary">Upcoming</span>;
    }
    return <span className="badge bg-secondary">Not Set</span>;
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

          <Container fluid className="dashboard-body dashboard-main-container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="page-title mb-1">Add New Event</h1>
                <p className="text-muted mb-0">Create a new event for your organization</p>
              </div>
            </div>

            {/* Alert Messages */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}

            {/* Event Form */}
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    {/* Event Name */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-primary" />
                          Event Name <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="event_name"
                          value={formData.event_name}
                          onChange={handleChange}
                          placeholder="Enter event name"
                          isInvalid={!!validationErrors.event_name}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.event_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Venue */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          Venue <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="venue"
                          value={formData.venue}
                          onChange={handleChange}
                          placeholder="Enter event venue"
                          isInvalid={!!validationErrors.venue}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.venue}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* Date and Time */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-success" />
                          Date & Time <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          type="datetime-local"
                          name="event_date_time"
                          value={formData.event_date_time}
                          onChange={handleChange}
                          min={getMinDateTime()}
                          isInvalid={!!validationErrors.event_date_time}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.event_date_time}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Select a future date and time for the event
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Event Type */}
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          Event Type
                        </Form.Label>
                        <Form.Select
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleChange}
                          className="form-control-lg"
                        >
                          <option value="">Select event type (optional)</option>
                          <option value="conference">Conference</option>
                          <option value="workshop">Workshop</option>
                          <option value="seminar">Seminar</option>
                          <option value="webinar">Webinar</option>
                          <option value="networking">Networking</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Select the type of event (optional)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Description */}
                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-info" />
                          Description <span className="text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Enter event description"
                          rows={4}
                          isInvalid={!!validationErrors.description}
                          className="form-control-lg"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.description}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Provide a detailed description of the event (minimum 10 characters)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Event Status */}
                  <Row>
                    <Col md={12} className="mb-4">
                      <Form.Group>
                        <Form.Label className="d-flex align-items-center">
                          <FaInfoCircle className="me-2 text-warning" />
                          Event Status
                        </Form.Label>
                        <div className="d-flex align-items-center">
                          {getStatusBadge()}
                          <Form.Text className="text-muted ms-2">
                            Automatically calculated based on the event date and time
                          </Form.Text>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Form Actions */}
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate('/ManageEvent')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      className="px-4"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Preview Card */}
            {formData.event_name && (
              <Card className="shadow-sm mt-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">Event Preview</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Name:</strong> {formData.event_name || 'Not specified'}</p>
                      <p><strong>Venue:</strong> {formData.venue || 'Not specified'}</p>
                      <p><strong>Type:</strong> {formData.event_type ? formData.event_type.charAt(0).toUpperCase() + formData.event_type.slice(1) : 'Not specified'}</p>
                      <p><strong>Status:</strong> {getStatusBadge()}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Date & Time:</strong> {formData.event_date_time ? 
                        new Date(formData.event_date_time).toLocaleString() : 'Not specified'}</p>
                      <p><strong>Description:</strong> {formData.description || 'Not specified'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddEvent;