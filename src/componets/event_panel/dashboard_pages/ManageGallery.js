import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaImage } from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { useAuthFetch } from "../../context/AuthFetch";
import { useAuth } from "../../context/AuthContext";

const ManageGallery = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all gallery items
  const [galleryItems, setGalleryItems] = useState([]);
  
  // Form state for selected gallery item
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    image: null,
    imagePreview: null
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
  const BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

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

  // Fetch all gallery items when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllGalleryItems();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all gallery items from API
  const fetchAllGalleryItems = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch gallery data");
      }

      const result = await response.json();
      console.log("GET All Gallery Items API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        // Process image URLs for all items
        const processedItems = result.data.map(item => ({
          ...item,
          imageUrl: item.image ? `${BASE_URL}${item.image}` : null
        }));
        setGalleryItems(processedItems);
      } else {
        setGalleryItems([]);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific gallery item data by ID
  const fetchGalleryItemData = async (itemId) => {
    setIsLoading(true);
    try {
      console.log("Fetching gallery item with ID:", itemId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/?id=${itemId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch gallery item data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Gallery Item Details API Response:", result);

      if (result.success) {
        let itemData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          itemData = result.data.find(item => item.id.toString() === itemId.toString());
          if (!itemData) {
            throw new Error(`Gallery item with ID ${itemId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === itemId.toString()) {
            itemData = result.data;
          } else {
            throw new Error(`Returned item ID ${result.data.id} does not match requested ID ${itemId}`);
          }
        } else {
          throw new Error("Invalid gallery item data structure in response");
        }

        // Process image URL
        const imageUrl = itemData.image ? `${BASE_URL}${itemData.image}` : null;

        setFormData({
          id: itemData.id,
          title: itemData.title,
          description: itemData.description,
          image: null, // We don't store the actual image file, just the URL
          imagePreview: imageUrl
        });

        setSelectedItemId(itemId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No gallery item data found in response");
      }
    } catch (error) {
      console.error("Error fetching gallery item data:", error);
      setMessage(error.message || "An error occurred while fetching gallery item data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle gallery item card click
  const handleItemClick = (itemId) => {
    console.log("Gallery item card clicked with ID:", itemId);
    fetchGalleryItemData(itemId);
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

  // Reset form to original data
  const resetForm = () => {
    if (selectedItemId) {
      fetchGalleryItemData(selectedItemId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to gallery list
  const backToGalleryList = () => {
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

  // Enable adding new gallery item
  const addNewGalleryItem = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      image: null,
      imagePreview: null
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
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      console.log("Submitting data for gallery item:", formData.title);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing gallery item
        formDataToSend.append("id", formData.id);
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
        successMessage = "Gallery item updated successfully!";
      } else {
        // Create new gallery item
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/",
          {
            method: "POST",
            body: formDataToSend,
          }
        );
        successMessage = "Gallery item created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save gallery item details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the gallery items list
        await fetchAllGalleryItems();
        
        // If creating a new item, switch to view mode for the new item
        if (!formData.id && result.data && result.data.id) {
          fetchGalleryItemData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save gallery item details"
        );
      }
    } catch (error) {
      console.error("Error saving gallery item details:", error);
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

  // Handle delete gallery item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
     
    setIsSubmitting(true);
    try {
      // Include the ID in the query parameters for the DELETE request
      const formDataToSend = new FormData();
      formDataToSend.append("id", itemToDelete.id);
      
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/`,
        {
          method: "DELETE",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete gallery item");
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage("Gallery item deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the gallery items list
        await fetchAllGalleryItems();
        
        // If we were viewing the deleted item, go back to the list
        if (selectedItemId === itemToDelete.id) {
          backToGalleryList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete gallery item");
      }
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      setMessage(error.message || "An error occurred while deleting the gallery item");
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

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, prepend the base URL
    return `${BASE_URL}${imagePath}`;
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
              <h1 className="page-title mb-0">Manage Gallery</h1>
              <Button variant="primary" onClick={addNewGalleryItem}>
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
                <p className="mt-2">Loading Gallery Items...</p>
              </div>
            ) : (
              <>
                {!selectedItemId ? (
                  // Gallery Items List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        {galleryItems.length === 0 ? (
                          <Alert variant="info">
                            No Gallery items found. Click "Add New Item" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {galleryItems.map((item) => (
                              <Col md={6} lg={4} className="mb-4" key={item.id}>
                                <Card className="h-100 gallery-item-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      {item.image ? (
                                        <div className="mb-3 text-center">
                                          <img 
                                            src={getImageUrl(item.image)} 
                                            alt={item.title} 
                                            className="img-fluid rounded"
                                            style={{ maxHeight: "150px" }}
                                            onError={(e) => {
                                              console.error("Image failed to load:", e.target.src);
                                              e.target.src = "https://picsum.photos/seed/placeholder/300/150.jpg";
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="mb-3 text-center bg-light p-4 rounded">
                                          <FaImage size={50} color="#ccc" />
                                          <p className="text-muted mt-2">No Image</p>
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
                  // Gallery Item Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToGalleryList}>
                        <FaArrowLeft /> Back to Gallery List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5">
                        {formData.id ? `Edit Gallery Item: ${formData.title}` : "Add New Gallery Item"}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter gallery item title"
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
                              placeholder="Enter gallery item description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Image</Form.Label>
                            {formData.imagePreview ? (
                              <div className="mb-3">
                                <img 
                                  src={formData.imagePreview} 
                                  alt="Preview" 
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "200px" }}
                                  onError={(e) => {
                                    console.error("Image preview failed to load:", e.target.src);
                                    e.target.src = "https://picsum.photos/seed/placeholder/300/200.jpg";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="mb-3 text-center bg-light p-4 rounded">
                                <FaImage size={50} color="#ccc" />
                                <p className="text-muted mt-2">No Image</p>
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
          Are you sure you want to delete the gallery item "{itemToDelete?.title}"? This action cannot be undone.
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

export default ManageGallery;