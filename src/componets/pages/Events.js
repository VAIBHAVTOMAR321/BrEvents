import React, { useState, useEffect } from 'react';
import Registration from './Registration'; // Import the Registration component
import { Button, Container, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false); // Modal for showing messages
  const [messageContent, setMessageContent] = useState(''); // Content for the message modal
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [registeringForEvent, setRegisteringForEvent] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // For filtering events
  const [pendingEventId, setPendingEventId] = useState(null); // Store event ID if registration is pending
  const [isRegistrationActive, setIsRegistrationActive] = useState(false); // Track if registration is active
  const [userVerified, setUserVerified] = useState(false); // Track if user is verified

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

  // Updated checkUserExists to return user ID and verification status
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
          setUserVerified(false);
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
        // Check if user is verified
        const isUserVerified = data.is_verified === true;
        setUserVerified(isUserVerified);
        
        return { 
          exists: true, 
          userId: data.user_id, 
          isVerified: isUserVerified 
        };
      } else {
        setUserId(null);
        setUserVerified(false);
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

  // FIXED: Updated registerForEvent function with proper error handling
  const registerForEvent = async (eventId, userIdParam = null) => {
    const currentUserId = userIdParam || userId;
    
    if (!currentUserId) {
      setShowEmailModal(true);
      setPendingEventId(eventId);
      return;
    }

    setRegisteringForEvent(eventId);
    setRegistrationMessage('');

    try {
      const payload = {
        event_id: eventId,
        user_id: currentUserId
      };
      
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
        let errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors.join(', ') 
            : data.non_field_errors;
        }
        throw new Error(errorMessage);
      }
      
      setRegistrationMessage('Successfully registered for the event!');
      setMessageContent('Successfully registered for the event!');
      setShowMessageModal(true);
      console.log('Registration successful:', data);
    } catch (err) {
      console.error('Error registering for event:', err);
      
      // Check if this is the "already participated" error
      if (err.message && err.message.includes('You have already participated in this event')) {
        setRegistrationMessage(err.message);
        setMessageContent(err.message);
      } else {
        // For other errors, keep the prefix
        setRegistrationMessage('Error registering for event: ' + err.message);
        setMessageContent('Error registering for event: ' + err.message);
      }
      
      setShowMessageModal(true);
    } finally {
      setRegisteringForEvent(null);
    }
  };

  const handleRegisterClick = (eventId) => {
    setPendingEventId(eventId);
    if (userId && userVerified) {
      registerForEvent(eventId);
    } else {
      setShowEmailModal(true);
    }
  };

  // Updated handleEmailSubmit to use the returned user ID and verification status
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Please enter your email address');
      return;
    }

    const { exists, userId: returnedUserId, isVerified } = await checkUserExists(userEmail);
    
    if (exists) {
      if (isVerified) {
        setShowEmailModal(false);
        setMessageContent('Now you can apply for events');
        setShowMessageModal(true);
        
        if (pendingEventId) {
          registerForEvent(pendingEventId, returnedUserId);
          setPendingEventId(null);
        }
      } else {
        // User exists but is not verified, redirect to registration
        setShowEmailModal(false);
        setMessageContent('Your account is not verified. Please complete registration.');
        setShowMessageModal(true);
        setTimeout(() => {
          setShowRegistrationModal(true);
          setIsRegistrationActive(true);
        }, 2000); // Show message for 2 seconds before opening registration
      }
    } else {
      setShowEmailModal(false);
      setShowRegistrationModal(true);
      setIsRegistrationActive(true);
    }
  };

  const handleCheckEmail = async () => {
    const { exists, isVerified } = await checkUserExists(userEmail);
    
    if (exists) {
      if (isVerified) {
        setMessageContent('Now you can apply for events');
        setShowMessageModal(true);
      } else {
        setMessageContent('Your account is not verified. Please complete registration.');
        setShowMessageModal(true);
        setTimeout(() => {
          setShowRegistrationModal(true);
          setIsRegistrationActive(true);
        }, 2000);
      }
    } else {
      setShowRegistrationModal(true);
    }
  };

  // Updated handleRegistrationSuccess to use the returned user ID
  const handleRegistrationSuccess = (userData) => {
    setUserEmail(userData.email);
    setShowRegistrationModal(false);
    setIsRegistrationActive(false);
    setMessageContent('Registration successful! Now you can apply for events.');
    setShowMessageModal(true);
    
    // Check if user exists and get the user ID
    const checkAndRegister = async () => {
      const { exists, userId: returnedUserId, isVerified } = await checkUserExists(userData.email);
      
      if (exists && isVerified && pendingEventId) {
        registerForEvent(pendingEventId, returnedUserId);
        setPendingEventId(null);
      }
    };
    
    checkAndRegister();
  };

  // Improved date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return { day: 'N/A', monthYear: 'N/A' };
    
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options); // e.g., "15 Jan 2024"
    
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

  // Conditionally render events or registration
  if (isRegistrationActive) {
    return (
      <Registration 
        email={userEmail}
        onRegistrationSuccess={handleRegistrationSuccess}
        fromEvent={true} // Indicate that registration was initiated from events page
        pendingEventId={pendingEventId}
      />
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
              // Using the new formatDate function
              const { day, monthYear } = formatDate(event.event_date_time);
              const time = formatTime(event.event_date_time);
              const status = getStatusBadge(event);
              const aosDelay = 200 + (index % 3) * 100;

              return (
                <div key={event.id} className="col-lg-4 col-md-6" data-aos="zoom-in" data-aos-delay={aosDelay}>
                  <div className={`event-item ${status.className}`}>
                    <div className="event-header">
                      <div className="event-date-overlay">
                        {/* Fixed: Added space between day and monthYear */}
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
                        {/* Added a clear display for the event type */}
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
                            onClick={() => handleRegisterClick(event.event_id)}
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

      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Your Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEmailSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                We'll check if you have an account with us.
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="event-cancel-right" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={checkingUser}>
                {checkingUser ? 'Checking...' : 'Continue'}
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

      {showRegistrationModal && (
        <Registration 
          email={userEmail}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
    </Container>
    </div>
  );
}

export default Events;