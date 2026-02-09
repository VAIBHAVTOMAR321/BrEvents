import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashBoardHeader from "../DashBoardHeader";
import LeftNav from "../LeftNav";
import { useAuthFetch } from "../../context/AuthFetch";
import { FaPlus, FaTrash } from "react-icons/fa";

const AddAboutUs = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    title_hi: "",
    description: "",
    description_hi: "",
    image: null,
    page: 1,
    modules: [] // [{title: "", description: "", title_hi: "", description_hi: ""}]
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

  // Add a new module
  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { title: "", description: "", title_hi: "", description_hi: "" }]
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

  // Handle module change
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index][field] = value;
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
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("title_hi", formData.title_hi.trim());
      formDataToSend.append("description", formData.description.trim());
      formDataToSend.append("description_hi", formData.description_hi.trim());
      formDataToSend.append("page", formData.page);
      
      // Format modules as array format for both English and Hindi
      const modulesEn = formData.modules.map(module => [
        module.title.trim(),
        module.description.trim()
      ]);
      
      const modulesHi = formData.modules.map(module => [
        module.title_hi.trim(),
        module.description_hi.trim()
      ]);
      
      formDataToSend.append("module", JSON.stringify(modulesEn));
      formDataToSend.append("module_hi", JSON.stringify(modulesHi));
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }
      
      const response = await authFetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/aboutus-item/",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess("About Us item added successfully!");
        // Reset form
        setFormData({
          title: "",
          title_hi: "",
          description: "",
          description_hi: "",
          image: null,
          page: 1,
          modules: []
        });
        setImagePreview(null);
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate("/ManageAboutUs");
        }, 2000);
      } else {
        setError(data.message || "Failed to add About Us item");
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
            <h1 className="page-title">Add About Us Item</h1>
            
            <Row className="justify-content-center">
              <Col md={12} lg={12}>
                <Card className="shadow-sm">
                  <Card.Body className="p-4">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="title">
                            <Form.Label>Title (English) *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter title in English"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="title_hi">
                            <Form.Label>Title (हिंदी) *</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="हिंदी में शीर्षक दर्ज करें"
                              name="title_hi"
                              value={formData.title_hi}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Description (English)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="Enter description in English"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="description_hi">
                            <Form.Label>Description (हिंदी)</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              placeholder="हिंदी में विवरण दर्ज करें"
                              name="description_hi"
                              value={formData.description_hi}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Form.Group className="mb-3" controlId="page">
                        <Form.Label>Page</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter page number"
                          name="page"
                          value={formData.page}
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
                                    <Form.Label>Module Title (English)</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="Enter module title in English"
                                      value={module.title}
                                      onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                                    />
                                  </Form.Group>
                                  <Form.Group>
                                    <Form.Label>Module Description (English)</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      placeholder="Enter module description in English"
                                      value={module.description}
                                      onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Module Title (हिंदी)</Form.Label>
                                    <Form.Control
                                      type="text"
                                      placeholder="हिंदी में मॉड्यूल शीर्षक दर्ज करें"
                                      value={module.title_hi}
                                      onChange={(e) => handleModuleChange(index, 'title_hi', e.target.value)}
                                    />
                                  </Form.Group>
                                  <Form.Group>
                                    <Form.Label>Module Description (हिंदी)</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      placeholder="हिंदी में मॉड्यूल विवरण दर्ज करें"
                                      value={module.description_hi}
                                      onChange={(e) => handleModuleChange(index, 'description_hi', e.target.value)}
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
                          {loading ? "Submitting..." : "Add About Us Item"}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => navigate("/aboutus-list")} // Change this to your actual list page
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

export default AddAboutUs;