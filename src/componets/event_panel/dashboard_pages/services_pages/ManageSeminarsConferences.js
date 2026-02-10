import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaImage } from "react-icons/fa";

import { useAuthFetch } from "../../../context/AuthFetch";
import { useAuth } from "../../../context/AuthContext";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";

const ManageSeminarsConferences = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all corporate event items
  const [corporateEventItems, setCorporateEventItems] = useState([]);
  
  // Form state for selected corporate event item
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    image: null,
    imagePreview: null,
    modules: []
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com";
  const BACKEND_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /media/, prepend the backend URL
    if (imagePath.startsWith('/media/')) {
      return `${BACKEND_URL}${imagePath}`;
    }
    
    // If it starts with media/ (without leading slash), prepend the backend URL with a slash
    if (imagePath.startsWith('media/')) {
      return `${BACKEND_URL}/${imagePath}`;
    }
    
    // Otherwise, prepend the backend URL with /media/ prefix
    return `${BACKEND_URL}/media/${imagePath}`;
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

  // Fetch all corporate event items when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllCorporateEventItems();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all corporate event items from API
  const fetchAllCorporateEventItems = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch corporate event data");
      }

      const result = await response.json();
      console.log("GET All Corporate Event Items API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        // Process image URLs for all items
        const processedItems = result.data.map(item => ({
          ...item,
          imageUrl: getImageUrl(item.image)
        }));
        setCorporateEventItems(processedItems);
      } else {
        setCorporateEventItems([]);
      }
    } catch (error) {
      console.error("Error fetching corporate event data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific corporate event item data by ID
  const fetchCorporateEventItemData = async (itemId) => {
    setIsLoading(true);
    try {
      console.log("Fetching corporate event item with ID:", itemId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/?id=${itemId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch corporate event item data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Corporate Event Item Details API Response:", result);

      if (result.success) {
        let itemData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          itemData = result.data.find(item => item.id.toString() === itemId.toString());
          if (!itemData) {
            throw new Error(`Corporate Event item with ID ${itemId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === itemId.toString()) {
            itemData = result.data;
          } else {
            throw new Error(`Returned item ID ${result.data.id} does not match requested ID ${itemId}`);
          }
        } else {
          throw new Error("Invalid corporate event item data structure in response");
        }

        // Process modules to ensure they have title and subtitle
        const processedModules = itemData.module ? 
          (Array.isArray(itemData.module) ? itemData.module.map(module => {
            // If module is a string, convert to object with title and subtitle
            if (typeof module === 'string') {
              return { title: module, subtitle: "" };
            }
            // If module is already an object, ensure it has title and subtitle
            return {
              title: module.title || "",
              subtitle: module.subtitle || ""
            };
          }) : []) : [];

        // Process image URL
        const imageUrl = getImageUrl(itemData.image);

        setFormData({
          id: itemData.id,
          title: itemData.title,
          description: itemData.description,
          image: itemData.image, // Store the original image path
          imagePreview: imageUrl,
          modules: processedModules
        });

        setSelectedItemId(itemId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No corporate event item data found in response");
      }
    } catch (error) {
      console.error("Error fetching corporate event item data:", error);
      setMessage(error.message || "An error occurred while fetching corporate event item data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle corporate event item card click
  const handleItemClick = (itemId) => {
    console.log("Corporate Event item card clicked with ID:", itemId);
    fetchCorporateEventItemData(itemId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new module
  const addModule = () => {
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", subtitle: "" }]
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    const updatedModules = [...formData.modules];
    updatedModules.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Handle module change
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedItemId) {
      fetchCorporateEventItemData(selectedItemId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to corporate event list
  const backToCorporateEventList = () => {
    setSelectedItemId(null);
    setIsEditing(false);
    setShowAlert(false);
  };

  // Enable editing mode
  const enableEditing = (e) => {
    e.preventDefault();
    setIsEditing(true);
    setShowAlert(false);
  };

  // Enable adding new corporate event item
  const addNewCorporateEventItem = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      image: null,
      imagePreview: null,
      modules: []
    });
    setIsEditing(true);
    setSelectedItemId(null);
    setShowAlert(false);
  };

  // Handle form submission (POST for new, PUT for update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      
      // Add modules as JSON string (array of objects with title and subtitle)
      formDataToSend.append("module", JSON.stringify(formData.modules));
      
      if (formData.image && typeof formData.image === 'object') {
        formDataToSend.append("image", formData.image);
      }

      console.log("Submitting data for corporate event item:", formData.title);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing corporate event item
        formDataToSend.append("id", formData.id);
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
        successMessage = "Corporate Event item updated successfully!";
      } else {
        // Create new corporate event item
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/",
          {
            method: "POST",
            body: formDataToSend,
          }
        );
        successMessage = "Corporate Event item created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save corporate event item details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the corporate event items list
        await fetchAllCorporateEventItems();
        
        // If creating a new item, switch to view mode for the new item
        if (!formData.id && result.data && result.data.id) {
          fetchCorporateEventItemData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save corporate event item details"
        );
      }
    } catch (error) {
      console.error("Error saving corporate event item details:", error);
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

  // Handle delete corporate event item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
     
    setIsSubmitting(true);
    try {
      // Include the ID in the query parameters for the DELETE request
      const formDataToSend = new FormData();
      formDataToSend.append("id", itemToDelete.id);
      
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/`,
        {
          method: "DELETE",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete corporate event item");
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage("Corporate Event item deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the corporate event items list
        await fetchAllCorporateEventItems();
        
        // If we were viewing the deleted item, go back to the list
        if (selectedItemId === itemToDelete.id) {
          backToCorporateEventList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete corporate event item");
      }
    } catch (error) {
      console.error("Error deleting corporate event item:", error);
      setMessage(error.message || "An error occurred while deleting the corporate event item");
      setVariant("danger");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Render module item for display
  const renderModuleItem = (module, index) => {
    // Handle both string and object formats
    if (typeof module === 'string') {
      return <div key={index} className="mb-2">{module}</div>;
    } else if (module && typeof module === 'object') {
      return (
        <div key={index} className="mb-2">
          <strong>{module.title}</strong>
          {module.subtitle && <div className="text-muted small">{module.subtitle}</div>}
        </div>
      );
    }
    return null;
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
              <h1 className="page-title mb-0">Seminars & Conferences</h1>
              <Button variant="primary" onClick={addNewCorporateEventItem}>
                <FaPlus /> Add New Item
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
                <p className="mt-2">Loading Corporate Event Items...</p>
              </div>
            ) : (
              <>
                {!selectedItemId ? (
                  // Corporate Event Items List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        {corporateEventItems.length === 0 ? (
                          <Alert variant="info">
                            No Corporate Event items found. Click "Add New Item" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {corporateEventItems.map((item) => (
                              <Col md={6} lg={4} className="mb-4" key={item.id}>
                                <Card className="h-100 corporate-event-item-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      {item.image && (
                                        <div className="mb-3 text-center">
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            className="img-fluid rounded"
                                            style={{ maxHeight: "150px" }}
                                            onError={(e) => {
                                              console.error("Image failed to load:", e.target.src);
                                              // Try with a different URL format as fallback
                                              if (item.image && !item.image.startsWith('http')) {
                                                e.target.src = getImageUrl(item.image);
                                              } else {
                                                e.target.src = "https://picsum.photos/seed/placeholder/300/150.jpg";
                                              }
                                            }}
                                          />
                                        </div>
                                      )}
                                      <Card.Title as="h5" className="mb-3">
                                        {item.title}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        {item.description && item.description.length > 100 
                                          ? `${item.description.substring(0, 100)}...` 
                                          : item.description}
                                      </Card.Text>
                                      {item.module && item.module.length > 0 && (
                                        <div className="mb-2">
                                          <strong>Modules:</strong>
                                          <div className="mt-1">
                                            {item.module.slice(0, 2).map((module, index) => renderModuleItem(module, index))}
                                            {item.module.length > 2 && (
                                              <Badge bg="secondary">+{item.module.length - 2} more</Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <Card.Text className="text-muted mb-3">
                                        <small>Created: {formatDate(item.created_at)}</small>
                                      </Card.Text>
                                    </div>
                                    <div className="d-flex justify-content-between mt-3">
                                      <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        onClick={() => handleItemClick(item.id)}
                                      >
                                        <FaEdit /> Edit
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => showDeleteConfirmation(item)}
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
                  // Corporate Event Item Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToCorporateEventList}>
                        <FaArrowLeft /> Back to Corporate Event List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5">
                        {formData.id ? `Edit Corporate Event Item: ${formData.title}` : "Add New Corporate Event Item"}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter corporate event item title"
                              name="title"
                              value={formData.title}
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
                              placeholder="Enter corporate event item description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Image</Form.Label>
                            {formData.imagePreview && (
                              <div className="mb-3">
                                <img 
                                  src={formData.imagePreview} 
                                  alt="Preview" 
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "200px" }}
                                  onError={(e) => {
                                    console.error("Image preview failed to load:", e.target.src);
                                    // If we have the original image path, try to construct the correct URL
                                    if (formData.image && typeof formData.image === 'string') {
                                      e.target.src = getImageUrl(formData.image);
                                    } else {
                                      e.target.src = "https://picsum.photos/seed/placeholder/300/200.jpg";
                                    }
                                  }}
                                />
                              </div>
                            )}
                            {isEditing && (
                              <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            )}
                          </Form.Group>

                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <Form.Label className="mb-0">Modules</Form.Label>
                              {isEditing && (
                                <Button variant="outline-primary" size="sm" onClick={addModule}>
                                  <FaPlus /> Add Module
                                </Button>
                              )}
                            </div>
                            
                            {formData.modules.map((module, index) => (
                              <Card key={index} className="mb-3">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <Badge bg="primary">Module {index + 1}</Badge>
                                  {isEditing && (
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      onClick={() => removeModule(index)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  )}
                                </Card.Header>
                                <Card.Body>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Module Title</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter module title"
                                      value={module.title}
                                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                      disabled={!isEditing}
                                    />
                                  </Form.Group>
                                  <Form.Group>
                                    <Form.Label>Module Subtitle</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter module subtitle"
                                      value={module.subtitle}
                                      onChange={(e) => handleModuleChange(index, 'subtitle', e.target.value)}
                                      disabled={!isEditing}
                                    />
                                  </Form.Group>
                                </Card.Body>
                              </Card>
                            ))}
                            
                            {formData.modules.length === 0 && (
                              <Alert variant="info">
                                No modules added yet. {isEditing && 'Click "Add Module" to add one.'}
                              </Alert>
                            )}
                          </div>
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
                            <FaEdit /> Edit Item Details
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => showDeleteConfirmation(formData)}
                            type="button"
                          >
                            <FaTrash /> Delete Item
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
          Are you sure you want to delete the corporate event item "{itemToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteItem}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManageSeminarsConferences;