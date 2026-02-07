import React, { useEffect, useState } from 'react';
import "../../assets/css/mainstyle.css";
import { Link } from 'react-router-dom';
import EventLogo from '../../assets/images/br-event-logo.png';
import { FaPhone, FaFacebook, FaTwitter, FaWhatsapp, FaInstagram, FaLinkedin, FaGlobe, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function Footer() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  // Function to determine which icon to use based on URL
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
    return <div className="text-center py-4">Loading footer...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <footer id="footer" className="footer position-relative light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          {companies.map((company) => (
            <React.Fragment key={company.id}>
              <div className="col-lg-5 col-md-6 footer-about">
                <Link to="/" className="logo d-flex align-items-center">
                  <img src={EventLogo} alt="logo" className="logo-wecd me-2" />
                  <span className="sitename">Br Events</span>
                </Link>
                <p className="mt-3">{company.description || "We create memorable events that exceed expectations. From corporate gatherings to private celebrations, we bring your vision to life."}</p>
                <div className="footer-contact pt-3">
                  <p><strong>Address:</strong> <span>{company.address || "A108 Adam Street, New York, NY 535022"}</span></p>
                  <p className="mt-2"><strong>Phone:</strong> <span>{company.phone}</span></p>
                  <p className="mt-2"><strong>Email:</strong> <span>{company.email}</span></p>
                </div>
              
              </div>

              <div className="col-lg-3 col-md-3 footer-links">
                <h4>Useful Links</h4>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/AboutUs">About us</Link></li>
                  <li><Link to="/Events">Events</Link></li>
                  <li><Link to="/Gallery">Gallery</Link></li>
                  <li><Link to="/Contact">Contact</Link></li>
                </ul>
              </div>

              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li><Link to="/CorporateEvents">Corporate Events</Link></li>
                  <li><Link to="/EntertainmentEvents">Entertainment Events</Link></li>
                  <li><Link to="/ConcertEvent">Concert Events</Link></li>
                  <li><Link to="/PrivateParties">Private Parties</Link></li>
                  <li><Link to="/Seminar">Seminars</Link></li>
                </ul>
              </div>

           

              <div className="col-lg-2 col-md-3 footer-links">
                <h4>Get In Touch</h4>
                <div className="social-links d-flex mt-4">
                  {company.profile_link.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="me-3">
                      {getSocialIcon(link)}
                    </a>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>{currentYear}</span> <strong className="px-1 sitename">Br Events</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by <a href="https://brainrock.in/">Brainrock</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;