import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { useAuthFetch } from "../../../context/AuthFetch";
import { FaPlus, FaTrash } from "react-icons/fa";
import LeftNav from "../../LeftNav";
import DashBoardHeader from "../../DashBoardHeader";

const AddCorporateEvents = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    modules: []
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

  // Add a new module with title and subtitle
  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: "", subtitle: "" }]
    });
  };

  // Remove a module
  const removeModule = (index) => {
    const updatedModules = [...formData.modules];
    updatedModules.splice(index, 1);
    setFormData({
      ...formData,
      modules: updatedModules
    });
  };

  // Handle module change for title or subtitle
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value
    };
    setFormData({
      ...formData,
      modules: updatedModules
    });
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
      
      // Add modules as JSON string (array of objects with title and subtitle)
      formDataToSend.append("module", JSON.stringify(formData.modules));
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/corporate-event-service-item/",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("Corporate Event Service Item added successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          image: null,
          modules: []
        });
        setImagePreview(null);
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/ManageCorporateEvents"); // Change this to your actual list page
        }, 2000);
      } else {
        setError(data.message || "Failed to add Corporate Event Service Item");
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
            <h1 className="page-title">Add Corporate Event Service Item</h1>
            
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
                      
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Form.Label className="mb-0">Modules</Form.Label>
                          <Button variant="outline-primary" size="sm" onClick={addModule}>
                            <FaPlus /> Add Module
                          </Button>
                        </div>
                        
                        {formData.modules.map((module, index) => (
                          <Card key={index} className="mb-3">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                              <Badge bg="primary">Module {index + 1}</Badge>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => removeModule(index)}
                              >
                                <FaTrash />
                              </Button>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Module Title</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter module title"
                                      value={module.title}
                                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Module Subtitle</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter module subtitle"
                                      value={module.subtitle}
                                      onChange={(e) => handleModuleChange(index, 'subtitle', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                        
                        {formData.modules.length === 0 && (
                          <Alert variant="info">
                            No modules added yet. Click "Add Module" to add one.
                          </Alert>
                        )}
                      </div>
                      
                      <div className="d-grid gap-2 d-flex ">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                          className="btn-primary"
                        >
                          {loading ? "Submitting..." : "Add Corporate Event Service Item"}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate("/corporate-events-list")} // Change this to your actual list page
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

export default AddCorporateEvents;