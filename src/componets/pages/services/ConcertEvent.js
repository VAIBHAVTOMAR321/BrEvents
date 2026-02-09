import React, { useState, useEffect } from 'react';
import EducationImage from "../../../assets/images/education/campus-5.webp";
import { Container } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import "../../../assets/css/Services.css";

function ConcertEvent() {
  const { language } = useLanguage();
  const [entertainmentData, setEntertainmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Get field names based on language
  const getTitleField = () => language === 'hi' ? 'title_hi' : 'title';
  const getDescriptionField = () => language === 'hi' ? 'description_hi' : 'description';
  const getModuleField = () => language === 'hi' ? 'module_hi' : 'module';

  // Fetch entertainment event data from API
  useEffect(() => {
    const fetchEntertainmentData = async () => {
      setLoading(true);
      setEntertainmentData(null); // Clear previous data when language changes
      try {
        const langParam = language === 'hi' ? 'hi' : 'en';
        const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/concert-event-service-item/?lang=${langParam}`;
        
        console.log(`Fetching concert data from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log(`Concert API Response (${langParam}):`, data);
        
        if (data.success && data.data.length > 0) {
          setEntertainmentData(data.data[0]);
        } else {
          throw new Error('No concert event data available');
        }
      } catch (err) {
        console.error('Error fetching concert event data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEntertainmentData();
  }, [language]);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load entertainment event image, using fallback');
    setImageError(true);
  };

  // Extract service items from module array
  const getServiceItems = () => {
    if (!entertainmentData) return [];
    
    const moduleField = getModuleField();
    const modules = entertainmentData[moduleField];
    
    if (!modules || !Array.isArray(modules)) return [];
    
    // Handle array format [[title, subtitle], ...] from API
    return modules.map((item, index) => {
      if (Array.isArray(item)) {
        return {
          id: index,
          title: item[0] || "",
          subtitle: item[1] || ""
        };
      } else if (typeof item === 'string') {
        return {
          id: index,
          title: item || "",
          subtitle: ""
        };
      }
      return null;
    }).filter(item => item && item.title);
  };

  // Extract main description
  const getMainDescription = () => {
    if (!entertainmentData) return "";
    
    const descField = getDescriptionField();
    return entertainmentData[descField] || "";
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
       <div class="gallery-banner"><div class="site-breadcrumb-wpr"><h2 class="breadcrumb-title">Our Concert</h2><ul class="breadcrumb-menu clearfix" type="none"><li><a class="breadcrumb-home" href="/" data-discover="true">Home</a></li><li>/</li><li><a class="breadcrumb-about" href="/" data-discover="true">Concert</a></li></ul></div></div>
        <Container className='box-shadow'>
      <section id="entertainment-events" className="about section-gallery">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-start g-5">
            {/* Left Content Column */}
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2>{entertainmentData ? entertainmentData[getTitleField()] || "Concert Events" : "Concert Events"}</h2>
                <p>
                  {getMainDescription() && getMainDescription().length > 0
                    ? getMainDescription()
                    : (language === 'hi' 
                      ? "हम अवधारणा से निष्पादन तक, उच्च-ऊर्जा, नवीन संगीत और कॉन्सर्ट अनुभव प्रदान करते हैं जो दर्शकों को मुग्ध करते हैं।" 
                      : "From concept to execution, we deliver high-energy, innovative music and concert experiences that captivate audiences and create lasting impressions."
                    )
                  }
                </p>

                <div className="services-list">
                     <p className="">
                  {entertainmentData && entertainmentData[getDescriptionField()] && entertainmentData[getDescriptionField()].length > 0
                    ? entertainmentData[getDescriptionField()]
                    : (language === 'hi'
                      ? "हमारी संगीत और कॉन्सर्ट सेवाओं में शामिल हैं:"
                      : "Our Concert Event Services Include:"
                    )
                  }
                </p>
                  {getServiceItems().map((item, index) => (
                    <div className="service-item" key={item.id || index}>
                      <div className="service-icon">
                        <i className=""></i>
                      </div>
                     
                      <div className="service-content">
                        {item.title && <h4>{item.title}</h4>}
                        {item.subtitle && <p className="text-muted">{item.subtitle}</p>}
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

export default ConcertEvent;