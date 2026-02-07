import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Image,
  Badge,
  Button,
  Spinner,
  Alert,
  Tab,
  Tabs,
  ListGroup,
  Form,
  Dropdown,
  DropdownButton,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLinkedin,
  FaExternalLinkAlt,
  FaAward,
  FaFileAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaCamera,
  FaDownload,
  FaCheckCircle,
  FaGlobe,
  FaIdCard,
  FaBriefcase,
  FaGraduationCap,
  FaTrophy,
  FaLink,
  FaUserTie,
  FaBuilding,
  FaMapPin,
  FaBirthdayCake,
  FaTransgender,
  FaUpload,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserHeader from "../UserHeader";
import UserLeftNav from "../UserLeftNav";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../context/AuthFetch";
import FooterDashBoard from "../../footer/FooterDashBoard";

const UserProfile = () => {
  const navigate = useNavigate();
  const { auth, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for user data
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // State for document upload
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  
  // State for profile image preview
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("personal");

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

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!auth?.access || !auth?.unique_id) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // URL encode the unique_id to handle forward slashes
      const encodedUserId = encodeURIComponent(auth.unique_id);
      
      // Make API request with authentication token
      const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/?user_id=${encodedUserId}`;
      
      const response = await authFetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update user data state with response data
      if (result.success && result.data) {
        setUserData(result.data);
        // Initialize edit form data with user data
        setEditFormData(result.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      if (err.message.includes("401") || err.message.includes("403")) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate("/Login", { replace: true });
        }, 3000);
      } else if (err.message.includes("404")) {
        setError('User profile not found.');
      } else if (err.message.includes("Failed to fetch")) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchUserData();
    }
  }, [authLoading, isAuthenticated]);

  // Get user photo URL
  const getUserPhotoUrl = () => {
    // If we have a preview image, use it
    if (profileImagePreview) {
      return profileImagePreview;
    }
    
    if (!userData?.profile_image || imageError) {
      return null;
    }
    
    const profilePhoto = userData.profile_image;
    
    // If it's a full URL, return as is
    if (profilePhoto.startsWith('http')) {
      return profilePhoto;
    }
    
    // If it's a relative path, prepend the base URL
    return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${profilePhoto}`;
  };

  // Get document URL
  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    
    // If it's a full URL, return as is
    if (documentPath.startsWith('http')) {
      return documentPath;
    }
    
    // If it's a relative path, prepend the base URL
    return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${documentPath}`;
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditMode(true);
    setSuccessMessage("");
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original user data
    setEditFormData(userData);
    setSelectedDocumentType("");
    // Reset profile image preview
    setProfileImagePreview(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array field changes (talent_scope, social_media_link, additional_link)
  const handleArrayFieldChange = (fieldName, index, value) => {
    const updatedArray = [...editFormData[fieldName]];
    updatedArray[index] = value;
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: updatedArray
    }));
  };

  // Add new item to array field
  const addArrayItem = (fieldName) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], ""]
    }));
  };

  // Remove item from array field
  const removeArrayItem = (fieldName, index) => {
    const updatedArray = [...editFormData[fieldName]];
    updatedArray.splice(index, 1);
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: updatedArray
    }));
  };

  // Handle form submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");
    
    try {
      if (!auth?.access || !auth?.unique_id) {
        throw new Error("Authentication required");
      }
      
      // URL encode the unique_id to handle forward slashes
      const encodedUserId = encodeURIComponent(auth.unique_id);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(editFormData).forEach(key => {
        const isFileField = ['profile_image', 'portfolio_file', 'national_level_certificate', 
                          'internation_level_certificate_award', 'state_level_certificate', 
                          'district_level_certificate', 'college_level_certificate', 
                          'other_certificate'].includes(key);
        
        if (isFileField) {
          if (editFormData[key] instanceof File) {
            formDataToSend.append(key, editFormData[key]);
          }
        } else if (Array.isArray(editFormData[key])) {
          formDataToSend.append(key, JSON.stringify(editFormData[key]));
        } else if (editFormData[key] !== null && editFormData[key] !== undefined && editFormData[key] !== '') {
          formDataToSend.append(key, editFormData[key]);
        }
      });
      
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/?user_id=${encodedUserId}`,
        {
          method: "PUT",
          body: formDataToSend
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const updatedUserData = { ...userData };
        
        if (result.data) {
          Object.keys(result.data).forEach(key => {
            updatedUserData[key] = result.data[key];
          });
        }
        
        setUserData(updatedUserData);
        setEditFormData(updatedUserData);
        
        setSuccessMessage("Profile updated successfully!");
        setIsEditMode(false);
        
        // Reset profile image preview after successful save
        setProfileImagePreview(null);
        
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.message.includes("401") || err.message.includes("403")) {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          logout();
          navigate("/Login", { replace: true });
        }, 3000);
      } else if (err.message.includes("400")) {
        setError(`Bad request: ${err.message}`);
      } else if (err.message.includes("Failed to fetch")) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
      
      // Update the form data with the file
      setEditFormData(prev => ({
        ...prev,
        profile_image: file
      }));
    }
  };

  // Handle document file change
  const handleDocumentChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
  };

  // Handle document type selection
  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
  };

  // Document types for dropdown
  const documentTypes = [
    { key: 'portfolio_file', label: 'Portfolio', icon: <FaBriefcase /> },
    { key: 'national_level_certificate', label: 'National Level Certificate', icon: <FaTrophy /> },
    { key: 'internation_level_certificate_award', label: 'International Level Certificate', icon: <FaAward /> },
    { key: 'state_level_certificate', label: 'State Level Certificate', icon: <FaGraduationCap /> },
    { key: 'district_level_certificate', label: 'District Level Certificate', icon: <FaMapPin /> },
    { key: 'college_level_certificate', label: 'College Level Certificate', icon: <FaGraduationCap /> },
    { key: 'other_certificate', label: 'Other Certificate', icon: <FaFileAlt /> }
  ];

  // Check if a document exists
  const documentExists = (documentType) => {
    return userData && userData[documentType];
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    
    let filledFields = 0;
    const totalFields = 15; // Approximate number of important fields
    
    // Check important fields
    if (userData.full_name) filledFields++;
    if (userData.email) filledFields++;
    if (userData.phone) filledFields++;
    if (userData.address) filledFields++;
    if (userData.country) filledFields++;
    if (userData.state) filledFields++;
    if (userData.city) filledFields++;
    if (userData.date_of_birth) filledFields++;
    if (userData.gender) filledFields++;
    if (userData.user_type) filledFields++;
    if (userData.introduction) filledFields++;
    if (userData.profile_image) filledFields++;
    if (userData.talent_scope && userData.talent_scope.length > 0) filledFields++;
    if (userData.social_media_link && userData.social_media_link.length > 0) filledFields++;
    if (userData.portfolio_link && userData.portfolio_link.length > 0) filledFields++;
    
    return Math.round((filledFields / totalFields) * 100);
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
              You must be logged in to view this page.
            </Alert>
            <Button variant="primary" onClick={() => navigate('/Login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading user data
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  // If there's an error, show message
  if (error) {
    return (
      <div className="dashboard-container">
        <UserLeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content-dash">
          <UserHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body dashboard-main-container">
            <Alert variant="danger">
              {error}
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
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

        <Container fluid className="dashboard-body dashboard-main-container p-4">
          {/* Page Header */}
          <div className="page-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="page-title">User Profile</h1>
              <p className="text-muted">Manage your personal information and preferences</p>
            </div>
            {isEditMode ? (
              <div>
                <Button variant="success" className="me-2" onClick={handleSaveProfile} disabled={isSubmitting}>
                  {isSubmitting ? <Spinner as="span" animation="border" size="sm" /> : <FaSave className="me-1" />}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline-secondary" onClick={handleCancelEdit}>
                  <FaTimes className="me-1" /> Cancel
                </Button>
              </div>
            ) : (
              <Button variant="primary" className="btn-edit-profile" onClick={handleEditClick}>
                <FaEdit className="me-2" /> Edit Profile
              </Button>
            )}
          </div>

          {successMessage && (
            <Alert variant="success" className="mb-4 alert-dismissible fade show">
              <FaCheckCircle className="me-2" />
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
            </Alert>
          )}

          {/* Two Column Layout */}
          <Row>
            {/* Left Column - Profile Information */}
            <Col md={4} className="mb-4">
              <Card className="profile-info-card border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="profile-header-section text-center">
                    <div className="profile-photo-wrapper position-relative d-inline-block mb-3">
                      <Image
                        src={getUserPhotoUrl() || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'User')}&background=0d6efd&color=fff&size=128`}
                        roundedCircle
                        className="profile-photo"
                        onError={handleImageError}
                      />
                      {isEditMode && (
                        <label htmlFor="profile-image-upload" className="profile-photo-edit">
                          <FaCamera />
                          <Form.Control
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="d-none"
                          />
                        </label>
                      )}
                    </div>
                    <h4 className="profile-name mb-1">
                      {userData?.full_name || 'User'}
                    </h4>
                    <Badge bg="primary" className="profile-role mb-3">
                      {userData?.role || 'User'}
                    </Badge>
                    
                    <div className="profile-stats d-flex justify-content-around mb-3">
                      <div className="text-center">
                        <h6 className="mb-0">{userData?.talent_scope?.length || 0}</h6>
                        <small className="text-muted">Talents</small>
                      </div>
                      <div className="text-center">
                        <h6 className="mb-0">{userData?.social_media_link?.length || 0}</h6>
                        <small className="text-muted">Social</small>
                      </div>
                      <div className="text-center">
                        <h6 className="mb-0">{documentTypes.filter(type => documentExists(type.key)).length}</h6>
                        <small className="text-muted">Documents</small>
                      </div>
                    </div>
                    
                    <div className="profile-completion mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>Profile Completion</small>
                        <small>{profileCompletion}%</small>
                      </div>
                      <ProgressBar now={profileCompletion} variant={profileCompletion >= 80 ? "success" : profileCompletion >= 50 ? "warning" : "danger"} />
                    </div>
                    
                 
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column - Content Area with Tabs */}
            <Col md={8} className="mb-4">
              <Card className="profile-content-card border-0 shadow-sm">
                <Card.Header className="bg-light p-3">
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(key) => setActiveTab(key)}
                    className="profile-tabs"
                  >
                    <Tab eventKey="personal" title={
                      <span className="d-flex align-items-center">
                        <FaUser className="me-2 text-primary" />
                        Personal Information
                      </span>
                    }>
                    </Tab>
                    <Tab eventKey="contact" title={
                      <span className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        Contact Information
                      </span>
                    }>
                    </Tab>
                    <Tab eventKey="professional" title={
                      <span className="d-flex align-items-center">
                        <FaBriefcase className="me-2 text-primary" />
                        Professional Information
                      </span>
                    }>
                    </Tab>
                    <Tab eventKey="social" title={
                      <span className="d-flex align-items-center">
                        <FaLink className="me-2 text-primary" />
                        Social Media
                      </span>
                    }>
                    </Tab>
                    <Tab eventKey="documents" title={
                      <span className="d-flex align-items-center">
                        <FaFileAlt className="me-2 text-primary" />
                        Documents & Certificates
                      </span>
                    }>
                    </Tab>
                  </Tabs>
                </Card.Header>

                <Card.Body className="p-4">
                  {/* Personal Information Tab */}
                  {activeTab === "personal" && (
                    <div>
                      <h4 className="mb-4">
                        <FaUser className="me-2 text-primary" />
                        Personal Information
                      </h4>
                      <Form onSubmit={handleSaveProfile}>
                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="formFullName" className="mb-3 form-group-modern">
                                <Form.Label><FaUser className="me-2 text-primary" />Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="full_name"
                                  value={editFormData.full_name || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="formEmail" className="mb-3 form-group-modern">
                                <Form.Label><FaEnvelope className="me-2 text-primary" />Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={editFormData.email || ''}
                                  onChange={handleInputChange}
                                  disabled
                                  className="form-control-readonly"
                                />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="formPhone" className="mb-3 form-group-modern">
                                <Form.Label><FaPhone className="me-2 text-primary" />Phone Number</Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="phone"
                                  value={editFormData.phone || ''}
                                  onChange={handleInputChange}
                                  disabled
                                  className="form-control-readonly"
                                />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="formDateOfBirth" className="mb-3 form-group-modern">
                                <Form.Label><FaBirthdayCake className="me-2 text-primary" />Date of Birth</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="date_of_birth"
                                  value={editFormData.date_of_birth || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                />
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="formGender" className="mb-3 form-group-modern">
                                <Form.Label><FaTransgender className="me-2 text-primary" />Gender</Form.Label>
                                <Form.Select
                                  name="gender"
                                  value={editFormData.gender || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="formUserType" className="mb-3 form-group-modern">
                                <Form.Label><FaUserTie className="me-2 text-primary" />User Type</Form.Label>
                                <Form.Select
                                  name="user_type"
                                  value={editFormData.user_type || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                >
                                  <option value="individual">Individual</option>
                                  <option value="organization">Organization</option>
                                </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        {editFormData.user_type === 'organization' && (
                          <Row>
                            <Col md={12}>
                              <Form.Group controlId="formTeamName" className="mb-3 form-group-modern">
                                  <Form.Label><FaBuilding className="me-2 text-primary" />Team/Organization Name</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="team_name"
                                    value={editFormData.team_name || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditMode}
                                    className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                  />
                                </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </Form>
                    </div>
                  )}

                  {/* Contact Information Tab */}
                  {activeTab === "contact" && (
                    <div>
                      <h4 className="mb-4">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        Contact Information
                      </h4>
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formAddress" className="mb-3 form-group-modern">
                          <Form.Label><FaMapMarkerAlt className="me-2 text-primary" />Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={editFormData.address || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                            className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                          />
                        </Form.Group>

                        <Row>
                          <Col md={4}>
                            <Form.Group controlId="formCountry" className="mb-3 form-group-modern">
                                <Form.Label><FaGlobe className="me-2 text-primary" />Country</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="country"
                                  value={editFormData.country || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="formState" className="mb-3 form-group-modern">
                                <Form.Label><FaMapMarkerAlt className="me-2 text-primary" />State</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="state"
                                  value={editFormData.state || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group controlId="formCity" className="mb-3 form-group-modern">
                                <Form.Label><FaMapPin className="me-2 text-primary" />City</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="city"
                                  value={editFormData.city || ''}
                                  onChange={handleInputChange}
                                  disabled={!isEditMode}
                                  className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                                />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  )}

                  {/* Professional Information Tab */}
                  {activeTab === "professional" && (
                    <div>
                      <h4 className="mb-4">
                        <FaBriefcase className="me-2 text-primary" />
                        Professional Information
                      </h4>
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formIntroduction" className="mb-3 form-group-modern">
                          <Form.Label><FaFileAlt className="me-2 text-primary" />Introduction</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="introduction"
                            value={editFormData.introduction || ''}
                            onChange={handleInputChange}
                            disabled={!isEditMode}
                            className={isEditMode ? "form-control-modern" : "form-control-readonly"}
                          />
                        </Form.Group>

                        <Form.Group controlId="formTalentScope" className="mb-3 form-group-modern">
                          <Form.Label><FaTrophy className="me-2 text-primary" />Talent Scope</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.talent_scope && editFormData.talent_scope.map((talent, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="text"
                                    value={talent}
                                    onChange={(e) => handleArrayFieldChange('talent_scope', index, e.target.value)}
                                    className="form-control-modern"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('talent_scope', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('talent_scope')}
                              >
                                <FaPlus className="me-1" /> Add Talent
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.talent_scope && userData.talent_scope.length > 0 ? (
                                <div className="d-flex flex-wrap">
                                  {userData.talent_scope.map((talent, index) => (
                                    <Badge key={index} bg="secondary" className="me-2 mb-2">
                                      {talent}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted">No talents added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>
                      </Form>
                    </div>
                  )}

                  {/* Social Media Tab */}
                  {activeTab === "social" && (
                    <div>
                      <h4 className="mb-4">
                        <FaLink className="me-2 text-primary" />
                        Social Media
                      </h4>
                      <Form onSubmit={handleSaveProfile}>
                        <Form.Group controlId="formSocialMediaLinks" className="mb-3 form-group-modern">
                          <Form.Label><FaLinkedin className="me-2 text-primary" />Social Media Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.social_media_link && editFormData.social_media_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('social_media_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                    className="form-control-modern"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('social_media_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('social_media_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.social_media_link && userData.social_media_link.length > 0 ? (
                                userData.social_media_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No social media links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group controlId="formAdditionalLinks" className="mb-3 form-group-modern">
                          <Form.Label><FaExternalLinkAlt className="me-2 text-primary" />Additional Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.additional_link && editFormData.additional_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('additional_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                    className="form-control-modern"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('additional_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('additional_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.additional_link && userData.additional_link.length > 0 ? (
                                userData.additional_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No additional links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>

                        <Form.Group controlId="formPortfolioLinks" className="mb-3 form-group-modern">
                          <Form.Label><FaBriefcase className="me-2 text-primary" />Portfolio Links</Form.Label>
                          {isEditMode ? (
                            <div>
                              {editFormData.portfolio_link && editFormData.portfolio_link.map((link, index) => (
                                <div key={index} className="d-flex mb-2">
                                  <Form.Control
                                    type="url"
                                    value={link}
                                    onChange={(e) => handleArrayFieldChange('portfolio_link', index, e.target.value)}
                                    placeholder="https://example.com"
                                    className="form-control-modern"
                                  />
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeArrayItem('portfolio_link', index)}
                                  >
                                    <FaTimes />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline-primary"
                                onClick={() => addArrayItem('portfolio_link')}
                              >
                                <FaPlus className="me-1" /> Add Link
                              </Button>
                            </div>
                          ) : (
                            <div>
                              {userData?.portfolio_link && userData.portfolio_link.length > 0 ? (
                                userData.portfolio_link.map((link, index) => (
                                  <div key={index} className="mb-2">
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                      {link} <FaExternalLinkAlt className="ms-1" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted">No portfolio links added</p>
                              )}
                            </div>
                          )}
                        </Form.Group>
                      </Form>
                    </div>
                  )}

                  {/* Documents Tab */}
                  {activeTab === "documents" && (
                    <div>
                      <h4 className="mb-4">
                        <FaFileAlt className="me-2 text-primary" />
                        Documents & Certificates
                      </h4>
                      {isEditMode ? (
                        <div>
                          <Form.Group className="mb-3 form-group-modern">
                            <Form.Label><FaUpload className="me-2 text-primary" />Select Document Type to Upload</Form.Label>
                            <DropdownButton
                              id="document-type-dropdown"
                              title={selectedDocumentType ? 
                                documentTypes.find(type => type.key === selectedDocumentType)?.label : 
                                "Select Document Type"
                              }
                              onSelect={handleDocumentTypeSelect}
                              className="mb-3 document-dropdown"
                            >
                              {documentTypes.map(type => (
                                <Dropdown.Item key={type.key} eventKey={type.key}>
                                  {type.icon && <span className="me-2 text-primary">{type.icon}</span>}
                                  {type.label}
                                </Dropdown.Item>
                              ))}
                            </DropdownButton>
                            
                            {selectedDocumentType && (
                              <Form.Group controlId={`form${selectedDocumentType}`} className="mb-3 form-group-modern">
                                <Form.Label>
                                  {documentTypes.find(type => type.key === selectedDocumentType)?.icon && 
                                    <span className="me-2 text-primary">
                                      {documentTypes.find(type => type.key === selectedDocumentType)?.icon}
                                    </span>
                                  }
                                  {documentTypes.find(type => type.key === selectedDocumentType)?.label}
                                </Form.Label>
                                <Form.Control
                                  type="file"
                                  onChange={(e) => handleDocumentChange(e, selectedDocumentType)}
                                  className="form-control-modern"
                                />
                                {documentExists(selectedDocumentType) && (
                                  <div className="mt-2">
                                    <small className="text-muted">
                                      Current file: {userData[selectedDocumentType]}
                                    </small>
                                  </div>
                                )}
                              </Form.Group>
                            )}
                          </Form.Group>
                        </div>
                      ) : (
                        <div>
                          {documentTypes.filter(type => documentExists(type.key)).length > 0 ? (
                            <ListGroup className="document-list">
                              {documentTypes.filter(type => documentExists(type.key)).map(type => (
                                <ListGroup.Item key={type.key} className="d-flex justify-content-between align-items-center document-item">
                                  <div>
                                    {type.icon && <span className="me-2 text-primary">{type.icon}</span>}
                                    {type.label}
                                  </div>
                                  <div>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>View Document</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        href={getDocumentUrl(userData[type.key])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="me-2"
                                      >
                                        <FaEye />
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Download Document</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        href={getDocumentUrl(userData[type.key])}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                      >
                                        <FaDownload />
                                      </Button>
                                    </OverlayTrigger>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          ) : (
                            <div className="text-center py-4">
                              <FaFileAlt className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                              <p className="text-muted">No documents uploaded</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        <FooterDashBoard />
      </div>

      <style jsx>{`
        .dashboard-body {
          padding: 20px !important;
        }
        
        .profile-info-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }
        
        .profile-info-card:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .profile-content-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .profile-content-card:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .profile-header-section {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .profile-photo-wrapper {
          position: relative;
        }
        
        .profile-photo {
          width: 120px;
          height: 120px;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background-color: #f8f9fa;
        }
        
        .profile-photo-edit {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .profile-photo-edit:hover {
          background-color: #0069d9;
          transform: scale(1.1);
        }
        
        .profile-name {
          font-weight: 600;
          font-size: 1.2rem;
          margin-bottom: 8px;
        }
        
        .profile-role {
          font-size: 0.8rem;
          padding: 5px 10px;
        }
        
        .profile-stats {
          display: flex;
          justify-content: space-around;
          padding: 15px 0;
          margin: 15px 0;
        }
        
        .profile-stats h6 {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .profile-completion {
          margin: 15px 0;
        }
        
        .profile-actions {
          margin-top: 15px;
        }
        
        .profile-tabs {
          border-bottom: none;
          background-color: #f8f9fa;
          padding: 10px 0;
        }
        
        .profile-tabs .nav-link {
          border: none;
          border-radius: 8px;
          margin-right: 5px;
          color: #6c757d;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 8px 16px;
        }
        
        .profile-tabs .nav-link:hover {
          background-color: #e9ecef;
        }
        
        .profile-tabs .nav-link.active {
          background-color: #007bff;
          color: white;
        }
        
        .form-group-modern {
          margin-bottom: 1.5rem;
        }
        
        .form-group-modern label {
          font-weight:  500;
          margin-bottom: 0.5rem;
          color: #495057;
        }
        
        .form-control-modern {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 15px;
          transition: all 0.2s ease;
        }
        
        .form-control-modern:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .form-control-readonly {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 15px;
          background-color: #f8f9fa;
          color: #6c757d;
        }
        
        .document-dropdown .dropdown-toggle {
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          padding: 10px 15px;
          font-weight: 500;
        }
        
        .document-list {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .document-item {
          border: 1px solid #e0e0e0;
          padding: 15px;
          transition: all 0.2s ease;
        }
        
        .document-item:hover {
          background-color: #f8f9fa;
        }
        
        .btn-edit-profile {
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .btn-edit-profile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .page-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .alert-dismissible .btn-close {
          padding: 0.75rem 1rem;
        }
        
        .text-primary {
          color: #007bff !important;
        }
        
        @media (max-width: 991px) {
          .profile-info-card {
            margin-bottom: 1rem;
          }
          
          .profile-photo {
            width: 100px;
            height: 100px;
          }
          
          .profile-stats {
            padding: 10px 0;
          }
          
          .profile-stats h6 {
            font-size: 0.8rem;
          }
          
          .profile-nav .nav-item {
            padding: 10px 15px;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 768px) {
          .profile-nav .nav-item {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
          
          .profile-photo {
            width: 80px;
            height: 80px;
          }
          
          .profile-stats {
            padding: 8px 0;
          }
          
          .profile-stats h6 {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile; 