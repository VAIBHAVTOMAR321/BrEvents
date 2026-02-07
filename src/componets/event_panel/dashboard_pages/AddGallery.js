import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashBoardHeader from "../DashBoardHeader";
import LeftNav from "../LeftNav";
import { useAuthFetch } from "../../context/AuthFetch";

const AddGallery = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Gallery item added successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          image: null
        });
        setImagePreview(null);
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/ManageGallery"); // Changed to gallery list page
        }, 2000);
      } else {
        setError(data.message || "Failed to add gallery item");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
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
            <h1 className="page-title">Add Gallery Item</h1>
            
            <Row className="justify-content-center">
              <Col md={12} lg={12}>
                <Card className="shadow-sm">
                  <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3" controlId="title">
                        <Form.Label>Title *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="image">
                        <Form.Label>Image</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="mt-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        )}
                      </Form.Group>
                      
                      <div className="d-grid gap-2 d-flex ">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                          className="btn-primary"
                        >
                          {loading ? "Submitting..." : "Add Gallery Item"}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate("/gallery-list")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default AddGallery;