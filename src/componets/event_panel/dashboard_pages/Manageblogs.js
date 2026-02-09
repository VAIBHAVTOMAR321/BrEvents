import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus, FaImage, FaVideo } from "react-icons/fa";
import LeftNav from "../LeftNav";
import DashBoardHeader from "../DashBoardHeader";
import { useAuthFetch } from "../../context/AuthFetch";
import { useAuth } from "../../context/AuthContext";

const Manageblogs = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for all posts
  const [posts, setPosts] = useState([]);
  
  // Form state for selected post
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    summary: "",
    description: "",
    category: "",
    video_url: "",
    thumbnail: null,
    thumbnailPreview: null,
    status: "draft"
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

  // Options for category
  const categoryOptions = [
    "Travel", "Food", "Lifestyle", "Technology", "Education", 
    "Entertainment", "Sports", "Politics", "Business", "Health"
  ];

  // Options for status
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

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

  // Fetch all posts when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchAllPosts();
    }
  }, [authLoading, isAuthenticated]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all posts from API
  const fetchAllPosts = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts data");
      }

      const result = await response.json();
      console.log("GET All Posts API Response:", result);

      if (result.status && result.data && result.data.length > 0) {
        // Process thumbnail URLs for all items
        const processedItems = result.data.map(item => ({
          ...item,
          thumbnailUrl: item.thumbnail ? `${BASE_URL}${item.thumbnail}` : null
        }));
        setPosts(processedItems);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts data:", error);
      setMessage(error.message || "An error occurred while fetching data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch specific post data by ID
  const fetchPostData = async (postId) => {
    setIsLoading(true);
    try {
      console.log("Fetching post with ID:", postId);
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/${postId}/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch post data. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("GET Post Details API Response:", result);

      if (result.status && result.data) {
        let itemData = result.data;
        
        // Check if the returned item ID matches the requested ID
        if (itemData.id.toString() !== postId.toString()) {
          throw new Error(`Returned item ID ${itemData.id} does not match requested ID ${postId}`);
        }

        // Process thumbnail URL
        const thumbnailUrl = itemData.thumbnail ? `${BASE_URL}${itemData.thumbnail}` : null;

        setFormData({
          id: itemData.id,
          title: itemData.title,
          summary: itemData.summary,
          description: itemData.description,
          category: itemData.category,
          video_url: itemData.video_url,
          thumbnail: null, // We don't store the actual thumbnail file, just the URL
          thumbnailPreview: thumbnailUrl,
          status: itemData.status
        });

        setSelectedItemId(postId);
      } else {
        console.error("API Response issue:", result);
        throw new Error(result.message || "No post data found in response");
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
      setMessage(error.message || "An error occurred while fetching post data");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post card click
  const handleItemClick = (postId) => {
    console.log("Post card clicked with ID:", postId);
    fetchPostData(postId);
    setIsEditing(true); // Set to editing mode immediately when clicking edit
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle thumbnail file change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form to original data
  const resetForm = () => {
    if (selectedItemId) {
      fetchPostData(selectedItemId);
    }
    setIsEditing(false);
    setShowAlert(false);
  };

  // Go back to posts list
  const backToPostsList = () => {
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

  // Enable adding new post
  const addNewPost = () => {
    setFormData({
      id: null,
      title: "",
      summary: "",
      description: "",
      category: "",
      video_url: "",
      thumbnail: null,
      thumbnailPreview: null,
      status: "draft"
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
      formDataToSend.append("summary", formData.summary);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("video_url", formData.video_url);
      formDataToSend.append("status", formData.status);
      
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      console.log("Submitting data for post:", formData.title);

      let response;
      let successMessage;
      
      if (formData.id) {
        // Update existing post
        response = await authFetch(
          `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/${formData.id}/`,
          {
            method: "PUT",
            body: formDataToSend,
          }
        );
        successMessage = "Post updated successfully!";
      } else {
        // Create new post
        response = await authFetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/",
          {
            method: "POST",
            body: formDataToSend,
          }
        );
        successMessage = "Post created successfully!";
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.message || "Failed to save post details"
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.status) {
        setMessage(successMessage);
        setVariant("success");
        setShowAlert(true);
        setIsEditing(false);
        
        // Refresh the posts list
        await fetchAllPosts();
        
        // If creating a new item, switch to view mode for the new item
        if (!formData.id && result.data && result.data.id) {
          fetchPostData(result.data.id);
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(
          result.message || "Failed to save post details"
        );
      }
    } catch (error) {
      console.error("Error saving post details:", error);
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

  // Handle delete post
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
     
    setIsSubmitting(true);
    try {
      // Include the ID in the query parameters for the DELETE request
      const formDataToSend = new FormData();
      formDataToSend.append("id", itemToDelete.id);
      
      const response = await authFetch(
        `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/${itemToDelete.id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      const result = await response.json();
      
      if (result.status) {
        setMessage("Post deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        // Refresh the posts list
        await fetchAllPosts();
        
        // If we were viewing the deleted item, go back to the list
        if (selectedItemId === itemToDelete.id) {
          backToPostsList();
        }
        
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        throw new Error(result.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setMessage(error.message || "An error occurred while deleting the post");
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
              <h1 className="page-title mb-0">Manage Posts</h1>
              <Button variant="primary" onClick={addNewPost}>
                <FaPlus /> Add New Post
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
                <p className="mt-2">Loading Posts...</p>
              </div>
            ) : (
              <>
                {!selectedItemId ? (
                  // Posts List View
                  <>
                    <Row className="mb-4">
                      <Col>
                        {posts.length === 0 ? (
                          <Alert variant="info">
                            No posts found. Click "Add New Post" to create one.
                          </Alert>
                        ) : (
                          <Row>
                            {posts.map((item) => (
                              <Col md={6} lg={4} className="mb-4" key={item.id}>
                                <Card className="h-100 post-card profile-card">
                                  <Card.Body className="d-flex flex-column">
                                    <div className="flex-grow-1">
                                      {item.thumbnail ? (
                                        <div className="mb-3 text-center">
                                          <img 
                                            src={getImageUrl(item.thumbnail)} 
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
                                          <p className="text-muted mt-2">No Thumbnail</p>
                                        </div>
                                      )}
                                      <Card.Title as="h5" className="mb-3">
                                        {item.title}
                                      </Card.Title>
                                      <Card.Text className="text-muted mb-2">
                                        {item.summary && item.summary.length > 100 
                                          ? `${item.summary.substring(0, 100)}...` 
                                          : item.summary}
                                      </Card.Text>
                                      <div className="mb-2">
                                        <Badge bg="info" className="me-2">{item.category}</Badge>
                                        <Badge bg={item.status === 'published' ? 'success' : 'secondary'}>
                                          {item.status}
                                        </Badge>
                                      </div>
                                      {item.video_url && (
                                        <div className="mb-2">
                                          <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                                            <FaVideo /> Watch Video
                                          </a>
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
                  // Post Edit View
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Button variant="outline-secondary" onClick={backToPostsList}>
                        <FaArrowLeft /> Back to Posts List
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <Card.Header as="h5">
                        {formData.id ? `Edit Post: ${formData.title}` : "Add New Post"}
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter post title"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Summary</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter post summary"
                              name="summary"
                              value={formData.summary}
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
                              placeholder="Enter post description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              required
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              disabled={!isEditing}
                              required
                            >
                              <option value="">Select a category</option>
                              {categoryOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Video URL</Form.Label>
                            <Form.Control
                              type="url"
                              placeholder="Enter video URL"
                              name="video_url"
                              value={formData.video_url}
                              onChange={handleChange}
                              disabled={!isEditing}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              disabled={!isEditing}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Thumbnail</Form.Label>
                            {formData.thumbnailPreview ? (
                              <div className="mb-3">
                                <img 
                                  src={formData.thumbnailPreview} 
                                  alt="Preview" 
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "200px" }}
                                  onError={(e) => {
                                    console.error("Thumbnail preview failed to load:", e.target.src);
                                    e.target.src = "https://picsum.photos/seed/placeholder/300/200.jpg";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="mb-3 text-center bg-light p-4 rounded">
                                <FaImage size={50} color="#ccc" />
                                <p className="text-muted mt-2">No Thumbnail</p>
                              </div>
                            )}
                            {isEditing && (
                              <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
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
                            <FaEdit /> Edit Post Details
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => showDeleteConfirmation(formData)}
                            type="button"
                          >
                            <FaTrash /> Delete Post
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
          Are you sure you want to delete the post "{itemToDelete?.title}"? This action cannot be undone.
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

export default Manageblogs;