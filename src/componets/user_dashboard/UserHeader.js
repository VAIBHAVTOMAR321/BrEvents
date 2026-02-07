import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Dropdown,
  Image,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function UserHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  
  // Get auth data from localStorage
  const getAuthData = () => {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New employee joined - Rahul Sharma",
      time: "10 min ago",
      read: false,
    },
    {
      id: 2,
      text: "HR meeting scheduled at 4 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "Payroll processed successfully",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(2);
  
  // State for user details
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_image: null,
  });
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Function to get display name
  const getDisplayName = () => {
    if (userDetails.full_name) {
      return userDetails.full_name;
    } else {
      return "Admin";
    }
  };

  // Function to fetch user data with auth handling
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAuthError(null);
      setImageError(false);
      
      const auth = getAuthData();
      
      if (!auth || !auth.access || !auth.unique_id) {
        console.error('No authentication data found');
        setAuthError('Authentication required. Please log in again.');
        return;
      }
      
      // URL encode the unique_id to handle forward slashes
      const encodedUserId = encodeURIComponent(auth.unique_id);
      console.log('Fetching user data for unique_id:', auth.unique_id);
      console.log('Encoded user ID:', encodedUserId);
      
      // Make API request with authentication token
      const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/?user_id=${encodedUserId}`;
      console.log('API URL:', apiUrl);
      
      const response = await axios.get(
        apiUrl,
        {
          headers: {
            'Authorization': `Bearer ${auth.access}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Response status:', response.status);
      console.log('API Response data:', response.data);
      
      // Update user details state with response data
      if (response.data && response.data.success && response.data.data) {
        const userData = response.data.data;
        console.log('User data from API:', userData);
        console.log('Profile image from API:', userData.profile_image);
        
        setUserDetails({
          full_name: userData.full_name || "",
          profile_image: userData.profile_image || null,
        });
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
        
        if (err.response.status === 401 || err.response.status === 403) {
          setAuthError('Your session has expired. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('auth');
            navigate("/Login", { replace: true });
          }, 3000);
        } else if (err.response.status === 404) {
          setError('User profile not found. The user ID may be incorrect.');
        } else {
          setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  };
  
  // Get user photo URL
  const getUserPhotoUrl = () => {
    const profilePhoto = userDetails.profile_image;
    
    console.log('Profile photo from state:', profilePhoto);
    
    if (profilePhoto && !imageError) {
      if (profilePhoto.startsWith('http')) {
        console.log('Full URL profile photo:', profilePhoto);
        return profilePhoto;
      }
      const fullUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${profilePhoto}`;
      console.log('Constructed profile photo URL:', fullUrl);
      return fullUrl;
    }
    return null;
  };
  
  // Handle image loading error
  const handleImageError = (e) => {
    console.error('Error loading profile image:', e);
    setImageError(true);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=0d6efd&color=fff&size=40`;
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate("/Login", { replace: true });
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col>
            {authError && (
              <Alert variant="danger" className="mb-0 py-1">
                <small>{authError}</small>
              </Alert>
            )}
            {error && (
              <Alert variant="warning" className="mb-0 py-1">
                <small>{error}</small>
              </Alert>
            )}
          </Col>
          <Col xs="auto">
            <div className="header-actions">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="user-profile-btn">
                  {isLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <Image
                      src={getUserPhotoUrl()}
                      roundedCircle
                      className="user-avatar"
                      onError={handleImageError}
                    />
                  )}
                  <span className="user-name d-none d-md-inline">
                    {isLoading ? 'Loading...' : getDisplayName()}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate('/UserProfile')}>
                    <FaUserCircle className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default UserHeader;
