import React, { useState, useEffect } from 'react';
import EducationImage from "../../../assets/images/education/campus-5.webp";
import { Container } from 'react-bootstrap';
import "../../../assets/css/Services.css";

function EntertainmentEvents() {
  const [entertainmentData, setEntertainmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Fetch entertainment event data from API
  useEffect(() => {
    const fetchEntertainmentData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/entertainment-event-service-item/');
        const data = await response.json();
        
        console.log('Entertainment Events API Response:', data); // Debug log
        
        if (data.success && data.data.length > 0) {
          setEntertainmentData(data.data[0]);
        } else {
          throw new Error('No entertainment event data available');
        }
      } catch (err) {
        console.error('Error fetching entertainment event data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntertainmentData();
  }, []);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load entertainment event image, using fallback');
    setImageError(true);
  };

  // Extract service items from module array
  const getServiceItems = () => {
    if (!entertainmentData || !entertainmentData.module) return [];
    
    return entertainmentData.module.filter(item => {
      // Filter out items with empty titles and subtitles
      return item.title || item.subtitle;
    });
  };

  // Extract main description from module array
  const getMainDescription = () => {
    if (!entertainmentData || !entertainmentData.module) return "";
    
    // Find the first module with a subtitle but no title (main description)
    const mainDesc = entertainmentData.module.find(item => 
      !item.title && item.subtitle
    );
    
    return mainDesc ? mainDesc.subtitle : "";
  };

  // Construct image URL - Fixed version
  const getImageUrl = () => {
    if (!entertainmentData || !entertainmentData.image) return EducationImage;
    
    if (entertainmentData.image.startsWith('http')) {
      return entertainmentData.image;
    } else {
      // For paths like /media/entertainment_service_images/events-9.webp
      // The API already returns the full path starting with /media/
      // So we just need to prepend the base URL
      return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${entertainmentData.image}`;
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
        Error loading entertainment event information: {error}. Using default content.
      </div>
    );
  }

  const serviceItems = getServiceItems();
  const mainDescription = getMainDescription();
  const imageUrl = getImageUrl();

  return (
    <div>
       <div class="gallery-banner"><div class="site-breadcrumb-wpr"><h2 class="breadcrumb-title">Our Entertainment</h2><ul class="breadcrumb-menu clearfix" type="none"><li><a class="breadcrumb-home" href="/" data-discover="true">Home</a></li><li>/</li><li><a class="breadcrumb-about" href="/" data-discover="true">Entertainment</a></li></ul></div></div>
        <Container className='box-shadow'>
      <section id="entertainment-events" className="about section-gallery">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-start g-5">
            {/* Left Content Column */}
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2>{entertainmentData ? entertainmentData.title : "Entertainment Events"}</h2>
                <p>
                  {mainDescription || 
                    "From concept to execution, we deliver high-energy, innovative entertainment experiences that captivate audiences and create lasting impressions."
                  }
                </p>

                <div className="services-list">
                     <h5 className="">
                  {entertainmentData && entertainmentData.description ? 
                    entertainmentData.description : 
                    "Our Entertainment Event Services Include:"
                  }
                </h5>
                  {serviceItems.map((item, index) => (
                    <div className="service-item" key={index}>
                      <div className="service-icon">
                        <i className=""></i>
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
                  alt="Entertainment Events"
                  onError={handleImageError}
                />
              </div>
              
              {/* Additional Content Below Image */}
              <div className="image-caption mt-3" data-aos="fade-up" data-aos-delay="400">
                
              </div>
            </div>
          </div>

        
        </div>
      </section>
      </Container>
    </div>
  );
}

export default EntertainmentEvents;