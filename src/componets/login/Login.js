// src/components/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if necessary
import LoginImg from "../../assets/images/login-img.jpg";
import { Button, Alert, Form } from 'react-bootstrap';

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Get the login function from AuthContext
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or use default
  const from = location.state?.from?.pathname || null;

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!emailOrPhone.trim()) {
      errors.emailOrPhone = 'Email or phone number is required';
    } else if (emailOrPhone.includes('@')) {
      // Validate email format
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(emailOrPhone)) {
        errors.emailOrPhone = 'Please enter a valid email address';
      }
    } else {
      // Validate phone number (assuming 10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(emailOrPhone.replace(/\D/g, ''))) {
        errors.emailOrPhone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setError(''); // Clear previous errors
    setIsLoading(true);

    try {
      console.log('Attempting login with:', { emailOrPhone, password: '******' });
      
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email_or_phone: emailOrPhone.trim(),
            password: password,
          }),
        }
      );

      console.log('Response status:', response.status);
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        // Check if the response contains the expected data
        if (!data.access || !data.refresh) {
          throw new Error('Invalid authentication response from server');
        }
        
        // On successful login, call the login function from AuthContext
        // This will save the tokens and update the authentication state globally
        login(data);

        // --- ROLE-BASED REDIRECTION LOGIC ---
        let redirectTo;
        
        // If there's a redirect path from location state, use it
        if (from) {
          redirectTo = from;
        } else if (data.role === 'admin') {
          redirectTo = "/DashBoard"; // Admin dashboard
        } else {
          // Default to user dashboard for 'user' role or any other role
          redirectTo = "/UserDashBoard";
        }

        // Redirect the user to their role-specific dashboard
        navigate(redirectTo, { replace: true });
      } else {
        // Handle different error status codes
        if (response.status === 400) {
          throw new Error(data.message || data.error || 'Invalid credentials. Please check your email/phone and password.');
        } else if (response.status === 401) {
          throw new Error(data.message || data.error || 'Authentication failed. Please check your credentials.');
        } else if (response.status === 403) {
          throw new Error(data.message || data.error || 'Access forbidden. Your account may be suspended.');
        } else if (response.status === 404) {
          throw new Error('Login service not found. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || data.error || `Login failed with status: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle network errors
      if (err.message === 'Failed to fetch') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clear form errors when user starts typing
  useEffect(() => {
    if (emailOrPhone && formErrors.emailOrPhone) {
      setFormErrors(prev => ({ ...prev, emailOrPhone: '' }));
    }
  }, [emailOrPhone]);

  useEffect(() => {
    if (password && formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '' }));
    }
  }, [password]);

  return (
    <div className="login-box">
      <div className="dashboard-body container">
        <div className="ay-box-container">
          <div className="br-registration-heading">
            <Form onSubmit={handleSubmit}>
              <div className="mt-3 row">
                <div className="d-flex justify-content-center align-items-center login-img col-lg-6 col-md-6 col-sm-12">
                  <img src={LoginImg} className="img-fluid" alt="Login" />
                </div>
                <div className="p-4 col-lg-6 col-md-6 col-sm-12">
                  <div className='Login-page'>
                    <h1 className="pb-4">Login</h1>
                  </div>
                  
                  {/* Display error message if it exists */}
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="br-label form-label">
                      Email or Mobile Number <span className="br-span-star">*</span>
                    </Form.Label>
                    <Form.Control 
                      placeholder="Email or Phone" 
                      className="mb-3" 
                      name="email_or_phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      isInvalid={!!formErrors.emailOrPhone}
                      required
                      disabled={isLoading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.emailOrPhone}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="br-label form-label">
                      Password <span className="br-span-star">*</span>
                    </Form.Label>
                    <div className="password-wrapper" style={{ position: 'relative' }}>
                      <Form.Control 
                        placeholder="Password" 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={!!formErrors.password}
                        required
                        disabled={isLoading}
                        style={{ paddingRight: '40px' }}
                      />
                      <span 
                        className="ShowPassword-wrapper" 
                        onClick={togglePasswordVisibility}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          height: '100%'
                        }}
                      >
                        {showPassword ? (
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 640 512" 
                            height="1.2em" 
                            width="1.2em" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#6c757d' }}
                          >
                            <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-11.33L342.3 381.1C335.05 383.82 327.61 385.68 320 400zm381.61 121.53c-5.43 5.43-13.27 8.47-21.17 8.47H60c-7.89 0-15.74-3.04-21.17-8.47a29.91 29.91 0 0 1-8.47-21.17V432c0-7.89 3.04-15.74 8.47-21.17l45.2-45.2c15.12-15.12 15.12-39.63 0-54.75L75.63 244.4a29.91 29.91 0 0 1-8.47-21.17V144c0-7.89 3.04-15.74 8.47-21.17C81.26 117.4 89.11 114.36 97 114.36h680.44c7.89 0 15.74 3.04 21.17 8.47a29.91 29.91 0 0 1 8.47 21.17v79.23c0 7.89-3.04 15.74-8.47 21.17L653.37 289.9c-15.12 15.12-15.12 39.63 0 54.75l45.2 45.2c5.43 5.43 8.47 13.27 8.47 21.17v79.23c0 7.89-3.04 15.74-8.47 21.17zM571.31 320c7.89 0 15.74-3.04 21.17-8.47a29.91 29.91 0 0 0 8.47-21.17V211c0-7.89-3.04-15.74-8.47-21.17-5.43-5.43-13.27-8.47-21.17-8.47H68.69c-7.89 0-15.74 3.04-21.17 8.47A29.91 29.91 0 0 0 39.05 211v79.36c0 7.89 3.04 15.74 8.47 21.17 5.43 5.43 13.27 8.47 21.17 8.47h502.62z"></path>
                          </svg>
                        ) : (
                          <svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 576 512" 
                            height="1.2em" 
                            width="1.2em" 
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: '#6c757d' }}
                          >
                            <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path>
                          </svg>
                        )}
                      </span>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <div className="text-center mt-3">
                    <Button 
                      type="submit" 
                      className="w-100 trilok-submit-btn btn btn-primary" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          {' '}Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                    <div className='mt-3'>
                      <Link to="/ForgotPassword">Forgot Password</Link>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;