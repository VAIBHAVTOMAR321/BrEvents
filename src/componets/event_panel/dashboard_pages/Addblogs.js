import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashBoardHeader from "../DashBoardHeader";
import LeftNav from "../LeftNav";


const Addblogs = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    category: "",
    video_url: "",
    status: "draft"
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Post added successfully!");
        // Reset form
        setFormData({
          title: "",
          summary: "",
          description: "",
          category: "",
          video_url: "",
          status: "draft"
        });
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/ManagePosts"); // Changed to posts list page
        }, 2000);
      } else {
        setError(data.message || "Failed to add post");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Categories options
  const categoryOptions = [
    "Travel",
    "Food",
    "Lifestyle",
    "Technology",
    "Education",
    "Entertainment",
    "Sports",
    "Politics",
    "Business",
    "Health",
    "Other"
  ];

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" }
  ];

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
            <h1 className="page-title">Add New Post</h1>
            
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
                      
                      <Form.Group className="mb-3" controlId="summary">
                        <Form.Label>Summary</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter summary"
                          name="summary"
                          value={formData.summary}
                          onChange={handleChange}
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
                      
                      <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="">Select a category</option>
                          {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      
                      <Form.Group className="mb-3" controlId="video_url">
                        <Form.Label>Video URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="Enter video URL"
                          name="video_url"
                          value={formData.video_url}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4" controlId="status">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      
                      <div className="d-grid gap-2 d-flex ">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                          className="btn-primary"
                        >
                          {loading ? "Submitting..." : "Add Post"}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate("/ManagePosts")}
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

export default Addblogs;