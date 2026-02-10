import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaImage } from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { useAuthFetch } from "../../context/AuthFetch";
import { useAuth } from "../../context/AuthContext";

const ManageCarousel = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all carousel items
  const [carouselItems, setCarouselItems] = useState([]);
  
  // Form state for selected carousel item
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    sub_title: "",
    description: "",
    image: null,
    imagePreview: null,
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

  // Fetch all carousel items when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllCarouselItems();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all carousel items from API
  const fetchAllCarouselItems = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch carousel data");
      }

      const result = await response.json();
      console.log("GET All Carousel Items API Response:", result);

      if (result.success && result.data && result.data.length > 0) {
        setCarouselItems(result.data);
      } else {
        setCarouselItems([]);
      }
    } catch (error) {
      console.error("Error fetching carousel data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific carousel item data by ID
  const fetchCarouselItemData = async (itemId) => {
    setIsLoading(true);
    try {
      console.log("Fetching carousel item with ID:", itemId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch carousel item data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Carousel Item Details API Response:", result);

      if (result.success) {
        let itemData;
        
        // Check if data is an array or a single object
        if (Array.isArray(result.data)) {
          itemData = result.data.find(item => item.id.toString() === itemId.toString());
          if (!itemData) {
            throw new Error(`Carousel item with ID ${itemId} not found in response array`);
          }
        } else if (result.data && result.data.id) {
          if (result.data.id.toString() === itemId.toString()) {
            itemData = result.data;
          } else {
            throw new Error(`Returned item ID ${result.data.id} does not match requested ID ${itemId}`);
          }
        } else {
          throw new Error("Invalid carousel item data structure in response");
        }

        setFormData({
          id: itemData.id,
          title: itemData.title,
          sub_title: itemData.sub_title,
          description: itemData.description,
          image: null, // We don't store the actual image file, just the URL
          imagePreview: itemData.image,
        });

        setSelectedItemId(itemId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No carousel item data found in response");
      }
    } catch (error) {
      console.error("Error fetching carousel item data:", error);
      setMessage(error.message || "An error occurred while fetching carousel item data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle carousel item card click
  const handleItemClick = (itemId) => {
    console.log("Carousel item card clicked with ID:", itemId);
    fetchCarouselItemData(itemId);
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
      fetchCarouselItemData(selectedItemId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to carousel list
  const backToCarouselList = () => {
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

  // Enable adding new carousel item
  const addNewCarouselItem = () => {
    setFormData({
      id: null,
      title: "",
      sub_title: "",
      description: "",
      image: null,
      imagePreview: null,
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
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("sub_title", formData.sub_title.trim());
      formDataToSend.append("description", formData.description.trim());
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      console.log("Submitting data for carousel item:", formData.title);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing carousel item
        formDataToSend.append("id", formData.id);
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
        successMessage = "Carousel item updated successfully!";
      } else {
        // Create new carousel item
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/",
          {
            method: "POST",
            body: formDataToSend,
          }
        );
        successMessage = "Carousel item created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save carousel item details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the carousel items list
        await fetchAllCarouselItems();
        
        // If creating a new item, switch to view mode for the new item
        if (!formData.id && result.data && result.data.id) {
          fetchCarouselItemData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save carousel item details"
        );
      }
    } catch (error) {
      console.error("Error saving carousel item details:", error);
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

  // Handle delete carousel item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setIsSubmitting(true);
    try {
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/`,
        {
          method: "DELETE",
          body: JSON.stringify({ id: itemToDelete.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete carousel item");
      }

      const result = await response.json();
      
      if (result.success) {
        setMessage("Carousel item deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the carousel items list
        await fetchAllCarouselItems();
        
        // If we were viewing the deleted item, go back to the list
        if (selectedItemId === itemToDelete.id) {
          backToCarouselList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete carousel item");
      }
    } catch (error) {
      console.error("Error deleting carousel item:", error);
      setMessage(error.message || "An error occurred while deleting the carousel item");
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
              <h1 className="page-title mb-0">Manage Carousel</h1>
              <Button variant="primary" onClick={addNewCarouselItem}>
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
                <p className="mt-2">Loading Carousel Items...</p>
              </div>
            ) : (
              <>
                {!selectedItemId ? (
                  // Carousel Items List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        <h2 className="mb-4">Select an Item to Edit</h2>
                        {carouselItems.length === 0 ? (
                          <Alert variant="info">
                            No carousel items found. Click "Add New Item" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {carouselItems.map((item) => (
                              <Col md={6} lg={4} className="mb-4" key={item.id}>
                                <Card className="h-100 carousel-item-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      {item.image && (
                                        <div className="mb-3 text-center">
                                          <img 
                                            src={item.image ? (item.image.startsWith('http') ? item.image : `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${item.image}`) : ''} 
                                            alt={item.title} 
                                            className="img-fluid rounded"
                                            style={{ maxHeight: "150px" }}
                                          />
                                        </div>
                                      )}
                                      <Card.Title as="h5" className="mb-3">
                                        {item.title}
                                      </Card.Title>
                                      {item.sub_title && (
                                        <Card.Text className="text-muted mb-2">
                                          <strong>Subtitle:</strong> {item.sub_title}
                                        </Card.Text>
                                      )}
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
                  // Carousel Item Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToCarouselList}>
                        <FaArrowLeft /> Back to Carousel List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5">
                        {formData.id ? `Edit Carousel Item: ${formData.title}` : "Add New Carousel Item"}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter carousel item title"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Subtitle</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter subtitle (optional)"
                              name="sub_title"
                              value={formData.sub_title}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter carousel item description"
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
                                  src={typeof formData.imagePreview === 'string' && formData.imagePreview.startsWith('http') 
                                    ? formData.imagePreview 
                                    : (formData.imagePreview ? `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${formData.imagePreview}` : '')} 
                                  alt="Preview" 
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "200px" }}
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
          Are you sure you want to delete the carousel item "{itemToDelete?.title}"? This action cannot be undone.
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

export default ManageCarousel;