import React, { useState, useEffect } from 'react';
import EducationImage from "../../../assets/images/education/campus-5.webp";
import { Container } from 'react-bootstrap';
import "../../../assets/css/Services.css";

function Seminar() {
  const [corporateData, setCorporateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch corporate event data from API
  useEffect(() => {
    const fetchCorporateData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/seminar-event-service/');
        const data = await response.json();
        
        console.log('Corporate Events API Response:', data); // Debug log
        
        if (data.success && data.data.length > 0) {
          setCorporateData(data.data[0]);
        } else {
          throw new Error('No corporate event data available');
        }
      } catch (err) {
        console.error('Error fetching corporate event data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateData();
  }, []);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load corporate event image, using fallback');
    setImageError(true);
  };

  // Extract service items from module array
  const getServiceItems = () => {
    if (!corporateData || !corporateData.module) return [];
    
    return corporateData.module.filter(item => {
      // Filter out items with empty titles and subtitles
      return item.title || item.subtitle;
    });
  };

  // Extract main description from module array
  const getMainDescription = () => {
    if (!corporateData || !corporateData.module) return "";
    
    // Find the first module with a subtitle but no title (main description)
    const mainDesc = corporateData.module.find(item => 
      !item.title && item.subtitle
    );
    
    return mainDesc ? mainDesc.subtitle : "";
  };

// Construct image URL - Fixed version
const getImageUrl = () => {
  if (!corporateData || !corporateData.image) return EducationImage;
  
  if (corporateData.image.startsWith('http')) {
    return corporateData.image;
  } else {
 
    return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${corporateData.image}`;
  }
};

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning m-3" role="alert">
        Error loading corporate event information: {error}. Using default content.
      </div>
    );
  }

  const serviceItems = getServiceItems();
  const mainDescription = getMainDescription();
  const imageUrl = getImageUrl();

  return (
    <div>
      <div class="gallery-banner"><div class="site-breadcrumb-wpr"><h2 class="breadcrumb-title">Our Seminars & Conferences</h2><ul class="breadcrumb-menu clearfix" type="none"><li><a class="breadcrumb-home" href="/" data-discover="true">Home</a></li><li>/</li><li><a class="breadcrumb-about" href="/" data-discover="true">Seminars & Conferences</a></li></ul></div></div>
        <Container className='box-shadow'>
      <section id="corporate-events" className="about section-gallery">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-start g-5">
            {/* Left Content Column */}
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2>{corporateData ? corporateData.title : "Professional Corporate Events"}</h2>
                <p>
                  {mainDescription || 
                    "We specialize in planning, designing, and managing professional corporate events that perfectly align with your brand, goals, and business objectives."
                  }
                </p>

                <div className="services-list">
                  {serviceItems.map((item, index) => (
                    <div className="service-item" key={index}>
                      <div className="service-icon">
                        {/* <i className="bi bi-check-circle-fill"></i> */}
                      </div>
                      <div className="service-content">
                        {item.title && <h4>{item.title}</h4>}
                        {item.subtitle && <p>{item.subtitle}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="col-lg-6">
              <div className="about-image" data-aos="zoom-in" data-aos-delay="300">
                <img 
                  src={imageError ? EducationImage : imageUrl} 
                  className="img-fluid" 
                  alt="Corporate Events"
                  onError={handleImageError}
                />
              </div>
              
              {/* Additional Content Below Image */}
              <div className="image-caption mt-3" data-aos="fade-up" data-aos-delay="400">
                <p className="text-muted">
                  {corporateData && corporateData.description ? 
                    corporateData.description : 
                    "."
                  }
                </p>
              </div>
            </div>
          </div>

        
        </div>
      </section>
      </Container>
    </div>
  );
}

export default Seminar;