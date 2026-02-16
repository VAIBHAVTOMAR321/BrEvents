import React, { useEffect, useState } from "react";
import "../../assets/css/mainstyle.css";
import { Link } from "react-router-dom";
import EventLogo from "../../assets/images/br-event-logo.png"; // Keep as fallback

// NOTE: We no longer need the social media icon imports
// import { FaPhone, FaFacebook, ... } from "react-icons/fa";

function Footer() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Function to scroll to the top of the page
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // for a smooth scroll
    });
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/company-detail-item/"
        );
        const data = await response.json();

        if (data.success) {
          setCompanies(data.data);
        } else {
          setError("Failed to fetch company details");
        }
      } catch (err) {
        setError("Error fetching company details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading footer...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Get the first company's logo or use fallback
  const companyLogo =
    companies.length > 0 && companies[0].logo
      ? `https://mahadevaaya.com/eventmanagement/eventmanagement_backend${companies[0].logo}`
      : EventLogo;

  return (
    <footer id="footer" className="footer position-relative light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          {companies.map((company) => (
            <React.Fragment key={company.id}>
              {/* --- Column 1: About --- */}
              {/* Changed from col-lg-4 to col-lg-3 for a 4-column layout */}
              <div className="col-lg-6 col-md-6 footer-about">
                <Link to="/" className="logo d-flex align-items-center" onClick={handleScrollToTop}>
                  <img
                    src={companyLogo}
                    alt="logo"
                    className="logo-wecd me-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = EventLogo;
                    }}
                  />
                  <span className="sitename">BR Infotainment</span>
                </Link>
                <p className="mt-3">
                  {company.description ||
                    "We create memorable events that exceed expectations. From corporate gatherings to private celebrations, we bring your vision to life."}
                </p>
                <div className="footer-contact pt-3">
                  <p>
                    <strong>Address:</strong>{" "}
                    <span>
                      {company.address ||
                        "A108 Adam Street, New York, NY 535022"}
                    </span>
                  </p>
                  <p className="mt-2">
                    <strong>Phone:</strong> <span>{company.phone}</span>
                  </p>
                  <p className="mt-2">
                    <strong>Email:</strong> <span>{company.email}</span>
                  </p>
                </div>
              </div>

              {/* --- Column 2: Useful Links --- */}
              {/* Changed from col-lg-4 to col-lg-3 */}
              <div className="col-lg-2 col-md-6 footer-links">
                <h4>Useful Links</h4>
                <ul>
                  <li>
                    <Link to="/" onClick={handleScrollToTop}>Home</Link>
                  </li>
                  <li>
                    <Link to="/AboutUs" onClick={handleScrollToTop}>About us</Link>
                  </li>
                  <li>
                    <Link to="/Events" onClick={handleScrollToTop}>Events</Link>
                  </li>
                  <li>
                    <Link to="/Gallery" onClick={handleScrollToTop}>Gallery</Link>
                  </li>
                  <li>
                    <Link to="/Contact" onClick={handleScrollToTop}>Contact</Link>
                  </li>
                </ul>
              </div>

              {/* --- Column 3: Our Services --- */}
              {/* Changed from col-lg-4 to col-lg-3 */}
              <div className="col-lg-2 col-md-6 footer-links">
                <h4>Our Services</h4>
                <ul>
                  <li>
                    <Link to="/CorporateEvents" onClick={handleScrollToTop}>Corporate Events</Link>
                  </li>
                  <li>
                    <Link to="/EntertainmentEvents" onClick={handleScrollToTop}>Entertainment Events</Link>
                  </li>
                  <li>
                    <Link to="/ConcertEvent" onClick={handleScrollToTop}>Concert Events</Link>
                  </li>
                  <li>
                    <Link to="/PrivateParties" onClick={handleScrollToTop}>Private Parties</Link>
                  </li>
                  <li>
                    <Link to="/Seminar" onClick={handleScrollToTop}>Seminars</Link>
                  </li>
                </ul>
              </div>

              {/* --- Column 4: Our Events --- */}
              {/* New column for event links */}
              <div className="col-lg-2 col-md-6 footer-links">
                <h4>Our Events</h4>
                <ul>
                  <li>
                     <Link to="/Events" onClick={handleScrollToTop}>Events</Link>
                  </li>
                 
                   
                </ul>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>
          © <span>{currentYear}</span>{" "}
          <strong className="px-1 sitename">BR Infotainment</strong>{" "}
          <span>All Rights Reserved</span>
        </p>
        <div className="credits">
          Designed by <a href="https://brainrock.in/">Brainrock</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;