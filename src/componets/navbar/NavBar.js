import React, { useEffect, useState } from 'react';
import "../../assets/css/mainstyle.css"
import { Link } from 'react-router-dom';
import EventLogo from '../../assets/images/br-event-logo.png'
import { Button, Container } from 'react-bootstrap';
import { FaPhone } from "react-icons/fa6";
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedin, FaGlobe, FaEnvelope } from 'react-icons/fa';

function NavBar() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (key) => {
    // Close all other dropdowns when opening a new one (optional behavior)
    setOpenDropdowns(prevState => {
      const newState = {};
      // Only keep the current dropdown state
      newState[key] = !prevState[key];
      return newState;
    });
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/');
        const data = await response.json();
        
        if (data.success) {
          setCompanies(data.data);
        } else {
          setError('Failed to fetch company details');
        }
      } catch (err) {
        setError('Error fetching company details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  const getSocialIcon = (url) => {
    if (!url) return null;
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('facebook.com')) {
      return <FaFacebook className="social-icon facebook-icon" />;
    } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return <FaTwitter className="social-icon twitter-icon" />;
    } else if (lowerUrl.includes('whatsapp.com')) {
      return <FaWhatsapp className="social-icon whatsapp-icon" />;
    } else if (lowerUrl.includes('instagram.com')) {
      return <FaInstagram className="social-icon instagram-icon" />;
    } else if (lowerUrl.includes('linkedin.com')) {
      return <FaLinkedin className="social-icon linkedin-icon" />;
    } else {
      return <FaGlobe className="social-icon website-icon" />;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading company details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <>
      {/* 
        This top bar will scroll normally. It's now a sibling to the sticky nav.
      */}
      <div className='top-nav d-flex align-items-center'>
        {companies.map((company) => (
          <Container 
            key={company.id}
            className='container-fluid container-xl d-flex justify-content-center justify-content-md-between py-1'
          >
            {/* Hide email and phone on mobile */}
            <div className='d-none d-md-flex align-items-center'>
              <div className='d-flex align-items-center'>
                <div className="d-flex align-items-center me-4">
                  <FaEnvelope className="me-2" />
                  <span>{company.email}</span>
                </div>
                <div className="d-flex align-items-center">
                  {/* <FaPhone className="me-2" /> */}
                  <span>{company.phone}</span>
                </div>
              </div>
            </div>
            
            {/* Mobile view - show social icons and auth buttons */}
            <div className='social-links d-flex d-md-none align-items-center justify-content-between w-100'>
              <ul className="event-social-link d-flex list-unstyled mb-0">
                {company.profile_link.map((link, index) => (
                  <li key={index} className="mx-2">
                    <a href={link} target="_blank" rel="noopener noreferrer" data-discover="true">
                      {getSocialIcon(link)}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="list-unstyled mb-0">
                <li>
                  <Link to="/Login" className="btn btn-primary login-btn">Login</Link>
                  <Link to="/Registration" className="btn btn-primary login-btn mx-3">Register</Link>
                </li>
              </ul>
            </div>
            
            {/* Desktop view - show all elements */}
            <div className='social-links d-none d-md-flex align-items-center'>
              <ul className="event-social-link d-flex list-unstyled mb-0">
                {company.profile_link.map((link, index) => (
                  <li key={index} className="mx-2">
                    <a href={link} target="_blank" rel="noopener noreferrer" data-discover="true">
                      {getSocialIcon(link)}
                    </a>
                  </li>
                ))}
              </ul>
              <ul className="list-unstyled mb-0 ms-3">
                <li>
                  <Link to="/Login" className="btn btn-primary login-btn">Login</Link>
                  <Link to="/Registration" className="btn btn-primary login-btn mx-3">Register</Link>
                </li>
              </ul>
            </div>
          </Container>
        ))}
      </div>
      
      {/* 
        This container is now a direct child of the fragment.
        The sticky-top class will now work correctly, sticking it to the viewport.
      */}
      <div className='nav-start-sub sticky-top'>
        <header
          id="main-navbar"
          className={`header d-flex align-items-center ${isMenuOpen ? 'mobile-nav-active' : ''}`}
        >
          <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-end">
            <Link to="/" className="logo d-flex align-items-center me-auto">
              <img src={EventLogo} alt="logo" className="logo-wecd" />
              <h1 className="sitename">Br Events</h1>
            </Link>

            <nav id="navmenu" className={`navmenu ${isMenuOpen ? 'navmenu-active' : ''}`}>
              <ul>
                <li><Link to="/" className="active">Home</Link></li>
                <li><Link to="/AboutUs" className="active">About Us</Link></li>

                <li className={`dropdown ${openDropdowns['services'] ? 'dropdown-active' : ''}`}>
                  <Link to="#services" onClick={(e) => { e.preventDefault(); toggleDropdown('services'); }}>
                    <span>Services</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['services'] ? 'rotate-icon' : ''}`}></i>
                  </Link>
                  <ul>
                    <li><Link to="/CorporateEvents">Corporate events</Link></li>
                    <li><Link to="/EntertainmentEvents">Entertainment Events</Link></li>
                    <li><Link to="/ConcertEvent">Concert events</Link></li>
                    <li><Link to="/PrivateParties">Private Parties</Link></li>
                    <li><Link to="/Seminar">Seminar</Link></li>
                  </ul>
                </li>
                
                <li><Link to="/Events">Events</Link></li>
                <li><Link to="/Gallery">Gallery</Link></li>
                <li><Link to="/Blogs">Blogs</Link></li>
                <li><Link to="/Contact">Contact</Link></li>
              </ul>
              
              <i
                className={`mobile-nav-toggle d-xl-none bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`}
                onClick={toggleMenu}
              ></i>
            </nav>
          </div>
        </header>
      </div>
    </>
  )
}

export default NavBar;