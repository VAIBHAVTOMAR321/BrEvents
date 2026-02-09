import React, { useState, useEffect } from 'react';
import EducationImage from "../../../assets/images/education/campus-5.webp";
import { Container } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import "../../../assets/css/Services.css";

function PrivateParties() {
  const { language } = useLanguage();
  const [corporateData, setCorporateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Get field names based on language
  const getTitleField = () => language === 'hi' ? 'title_hi' : 'title';
  const getDescriptionField = () => language === 'hi' ? 'description_hi' : 'description';
  const getModuleField = () => language === 'hi' ? 'module_hi' : 'module';

  // Fetch corporate event data from API
  useEffect(() => {
    const fetchCorporateData = async () => {
      setLoading(true);
      setCorporateData(null); // Clear previous data when language changes
      try {
        const langParam = language === 'hi' ? 'hi' : 'en';
        const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/private-parties-event-service/?lang=${langParam}`;
        
        console.log(`Fetching private parties data from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log(`Private Parties API Response (${langParam}):`, data);
        
        if (data.success && data.data.length > 0) {
          setCorporateData(data.data[0]);
        } else {
          throw new Error('No private parties event data available');
        }
      } catch (err) {
        console.error('Error fetching private parties event data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorporateData();
  }, [language]);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load corporate event image, using fallback');
    setImageError(true);
  };

  // Extract service items from module array
  const getServiceItems = () => {
    if (!corporateData) return [];
    
    const moduleField = getModuleField();
    const modules = corporateData[moduleField];
    
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
      } else if (item && typeof item === 'object') {
        return {
          id: index,
          title: item.title || "",
          subtitle: item.subtitle || ""
        };
      }
      return null;
    }).filter(item => item && item.title);
  };

  // Extract main description
  const getMainDescription = () => {
    if (!corporateData) return "";
    
    const descField = getDescriptionField();
    return corporateData[descField] || "";
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
        Error loading private parties event information: {error}. Using default content.
      </div>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <div>
      <div class="gallery-banner"><div class="site-breadcrumb-wpr"><h2 class="breadcrumb-title">Our Private Parties</h2><ul class="breadcrumb-menu clearfix" type="none"><li><a class="breadcrumb-home" href="/" data-discover="true">Home</a></li><li>/</li><li><a class="breadcrumb-about" href="/" data-discover="true">Private Parties</a></li></ul></div></div>
        <Container className='box-shadow'>
      <section id="corporate-events" className="about section-gallery">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-start g-5">
            {/* Left Content Column */}
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
                <h2>{corporateData ? corporateData[getTitleField()] || "Private Parties" : "Private Parties"}</h2>
                <p>
                  {getMainDescription() && getMainDescription().length > 0
                    ? getMainDescription()
                    : (language === 'hi' 
                      ? "हम छोटे पैमाने की निजी पार्टियों और सामाजिक कार्यक्रमों की योजना, डिज़ाइन और प्रबंधन में माहिर हैं।" 
                      : "We specialize in planning, designing, and managing private parties and social gatherings."
                    )
                  }
                </p>

                <div className="services-list">
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
                  alt="Corporate Events"
                  onError={handleImageError}
                />
              </div>
              
              {/* Additional Content Below Image */}
              <div className="image-caption mt-3" data-aos="fade-up" data-aos-delay="400">
                <p className="text-muted">
                  {corporateData && corporateData[getDescriptionField()] && corporateData[getDescriptionField()].length > 0
                    ? corporateData[getDescriptionField()] 
                    : ""
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

export default PrivateParties;