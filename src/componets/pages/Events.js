import React, { useState, useEffect } from 'react';
import { Button, Container, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [userId, setUserId] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [registeringForEvent, setRegisteringForEvent] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for simplified registration form
  const [showSimplifiedRegistration, setShowSimplifiedRegistration] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userExists, setUserExists] = useState(false);
  const [userData, setUserData] = useState({
    full_name: '',
    email: '',
    phone: '',
    participant_type: 'audience'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Response is not valid JSON:', responseText.substring(0, 200));
          throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
        }
        
        if (data.success) {
          setEvents(data.data);
        } else {
          setError('Failed to fetch events: ' + (data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Error fetching events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Function to check if user exists
  const checkUserExists = async (email) => {
    if (!email) {
      setError('Please enter your email address');
      return { exists: false, userId: null, isVerified: false };
    }

    setCheckingUser(true);
    setError(null);

    try {
      const response = await fetch(`https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/get-userid/?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setUserId(null);
          return { exists: false, userId: null, isVerified: false };
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('User check response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      if (data.user_id) {
        setUserId(data.user_id);
        
        // Update user data with existing information
        setUserData(prevData => ({
          ...prevData,
          full_name: data.full_name || '',
          email: data.email || email,
          phone: data.phone || ''
        }));
        
        return { 
          exists: true, 
          userId: data.user_id, 
          isVerified: data.is_verified === true
        };
      } else {
        setUserId(null);
        return { exists: false, userId: null, isVerified: false };
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setError('Error checking user: ' + err.message);
      return { exists: false, userId: null, isVerified: false };
    } finally {
      setCheckingUser(false);
    }
  };

  // Function to register for event
  const registerForEvent = async (eventId, userIdParam = null) => {
    const currentUserId = userIdParam || userId;
    
    setRegisteringForEvent(eventId);
    setRegistrationMessage('');

    try {
      let payload;
      
      if (userExists && currentUserId) {
        // For existing users
        payload = {
          event_id: eventId,
          user_id: currentUserId,
          participant_type: userData.participant_type
        };
      } else {
        // For new users
        payload = {
          event_id: eventId,
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          participant_type: userData.participant_type
        };
      }
      
      console.log('Sending registration payload:', payload);
      
      const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-participant/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Registration response is not valid JSON:', responseText.substring(0, 200));
        throw new Error('API returned HTML instead of JSON. Check the endpoint URL and server configuration.');
      }
      
      console.log('Registration response:', data);
      
      if (!response.ok) {
        let errorMessage = '';
        
        // Handle different error response formats
        if (Array.isArray(data) && data.length > 0) {
          // If response is an array of error messages
          errorMessage = data.join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors.join(', ') 
            : data.non_field_errors;
        } else {
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      setRegistrationMessage('Successfully registered for the event!');
      setMessageContent('Successfully registered for the event!');
      setShowMessageModal(true);
      setShowSimplifiedRegistration(false);
      console.log('Registration successful:', data);
    } catch (err) {
      console.error('Error registering for event:', err);
      
      // Display the error message directly without prefix for better UX
      setRegistrationMessage(err.message);
      setMessageContent(err.message);
      setShowMessageModal(true);
    } finally {
      setRegisteringForEvent(null);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setShowSimplifiedRegistration(true);
    setUserExists(false);
    setUserData({
      full_name: '',
      email: '',
      phone: '',
      participant_type: 'audience'
    });
  };

  // Handle email input change and check if user exists
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setUserData(prevData => ({ ...prevData, email }));
    
    if (email && email.includes('@')) {
      const { exists, userId: returnedUserId } = await checkUserExists(email);
      setUserExists(exists);
      
      if (exists) {
        setUserId(returnedUserId);
      }
    }
  };

  // Handle form submission
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    if (selectedEvent) {
      registerForEvent(selectedEvent.event_id);
    }
  };

  // Improved date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return { day: 'N/A', monthYear: 'N/A' };
    
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    const parts = formattedDate.split(' ');
    return {
      day: parts[0],
      monthYear: `${parts[1]} ${parts[2]}`
    };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const getBadgeClass = (eventType) => {
    if (!eventType) return 'academic';
    return eventType.toLowerCase();
  };

  const getStatusBadge = (event) => {
    if (event.is_past) {
      return { text: 'Past', className: 'past-event' };
    } else if (event.is_present) {
      return { text: 'Ongoing', className: 'present-event' };
    } else if (event.is_upcoming) {
      return { text: 'Upcoming', className: 'upcoming-event' };
    }
    return { text: 'Unknown', className: 'unknown-event' };
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'past') return event.is_past;
    if (activeFilter === 'present') return event.is_present;
    if (activeFilter === 'upcoming') return event.is_upcoming;
    return true;
  });

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger" role="alert">
          <h5>Error loading events</h5>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-3" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Container className='box-shadow'>
        <section id="events" className="events section-gallery">
          {/* Only show registration message for successful registration */}
          {registrationMessage && registrationMessage.includes('Successfully') && (
            <div className="container mb-4">
              <div className="alert alert-success" role="alert">
                {registrationMessage}
              </div>
            </div>
          )}

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row section-title g-4">
               
              {filteredEvents.map((event, index) => {
                const { day, monthYear } = formatDate(event.event_date_time);
                const time = formatTime(event.event_date_time);
                const status = getStatusBadge(event);
                const aosDelay = 200 + (index % 3) * 100;

                return (
                  <div key={event.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={aosDelay}>
                    <div className={`event-item ${status.className}`}>
                      <div className="event-header">
                        <div className="event-date-overlay">
                          <span className="date">{day} {monthYear}</span>
                        </div>
                        <div className="event-status-badge">
                          <span className={`badge ${status.className}`}>{status.text}</span>
                        </div>
                      </div>
                      <div className="event-details">
                        <div className="event-category">
                          <span className={`badge ${getBadgeClass(event.event_type)}`}>
                            {event.event_type || 'Event'}
                          </span>
                          <span className="event-time">{time}</span>
                        </div>
                        <h3>{event.event_name}</h3>
                        <p>{event.description}</p>
                        <div className="event-info">
                          <div className="info-row">
                            <i className="bi bi-tag"></i>
                            <span>Type: {event.event_type || 'General'}</span>
                          </div>
                          <div className="info-row">
                            <i className="bi bi-geo-alt"></i>
                            <span>{event.venue}</span>
                          </div>
                        </div>
                        <div className="event-footer">
                          {!event.is_past && (
                            <button 
                              className="register-btn"
                              onClick={() => handleRegisterClick(event)}
                              disabled={registeringForEvent === event.event_id}
                            >
                              {registeringForEvent === event.event_id ? 'Registering...' : 'Register Now'}
                            </button>
                          )}
                          {event.is_past && (
                            <button className="register-btn" disabled>
                              Event Ended
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="events-navigation" data-aos="fade-up" data-aos-delay="500">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="filter-tabs">
                    <button 
                      className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} 
                      onClick={() => setActiveFilter('all')}
                    >
                      All Events
                    </button>
                    <button 
                      className={`filter-tab ${activeFilter === 'upcoming' ? 'active' : ''}`} 
                      onClick={() => setActiveFilter('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button 
                      className={`filter-tab ${activeFilter === 'present' ? 'active' : ''}`} 
                      onClick={() => setActiveFilter('present')}
                    >
                      Ongoing
                    </button>
                    <button 
                      className={`filter-tab ${activeFilter === 'past' ? 'active' : ''}`} 
                      onClick={() => setActiveFilter('past')}
                    >
                      Past
                    </button>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <a href="#" className="view-calendar-btn">
                    <i className="bi bi-calendar3"></i>
                    View Calendar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simplified Registration Modal */}
        <Modal show={showSimplifiedRegistration} onHide={() => setShowSimplifiedRegistration(false)} centered size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Event Registration</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleRegistrationSubmit}>
      {/* Event Information Fields */}
      <Form.Group className="mb-3">
        <Form.Label>Event Name</Form.Label>
        <Form.Control
          type="text"
          value={selectedEvent ? selectedEvent.event_name : ''}
          readOnly
          className="bg-light"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Event ID</Form.Label>
        <Form.Control
          type="text"
          value={selectedEvent ? selectedEvent.event_id : ''}
          readOnly
          className="bg-light"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email address"
          value={userData.email}
          onChange={handleEmailChange}
          required
        />
        <Form.Text className="text-muted">
          {userExists ? "We found your account. Your details have been pre-filled." : "New to our events? Please fill in your details below."}
        </Form.Text>
      </Form.Group>
      
      {userExists ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              value={userData.full_name}
              disabled
              className="bg-light"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              value={userData.phone}
              disabled
              className="bg-light"
            />
          </Form.Group>
          
          <div className="alert alert-info">
            <p>Welcome back! Your account has been found.</p>
            <p>If you need to update your information, please contact our support team.</p>
          </div>
        </>
      ) : (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={userData.full_name}
              onChange={(e) => setUserData(prevData => ({ ...prevData, full_name: e.target.value }))}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your phone number"
              value={userData.phone}
              onChange={(e) => setUserData(prevData => ({ ...prevData, phone: e.target.value }))}
              required
            />
          </Form.Group>
        </>
      )}
      
      <Form.Group className="mb-3">
        <Form.Label>Participant Type</Form.Label>
        <Form.Select
          value={userData.participant_type}
          onChange={(e) => setUserData(prevData => ({ ...prevData, participant_type: e.target.value }))}
          required
        >
          <option value="audience">Audience</option>
          <option value="participant">Participant</option>
          <option value="volunteer">Volunteer</option>
          <option value="speaker">Speaker</option>
          <option value="organizer">Organizer</option>
        </Form.Select>
      </Form.Group>
      
      <div className="d-flex justify-content-end">
        <Button variant="secondary" className="me-2" onClick={() => setShowSimplifiedRegistration(false)}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={registeringForEvent}>
          {registeringForEvent ? 'Registering...' : 'Register for Event'}
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

{/* Message Modal */}
<Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Information</Modal.Title>
  </Modal.Header>
  <Modal.Body className='modal-p'>
    <p>{messageContent}</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="primary" onClick={() => setShowMessageModal(false)}>
      OK
    </Button>
  </Modal.Footer>
</Modal>
      </Container>
    </div>
  );
}

export default Events;