import React, { useState, useEffect } from 'react';
import EducationImage from "../../assets/images/education/campus-5.webp";
import "../../assets/css/imageTransitions.css";
import { useLanguage } from '../context/LanguageContext';

// Array of smooth animation classes that pan/move within container bounds
const animationClasses = [
  'carousel-item-animation-pan-right',
  'carousel-item-animation-pan-left',
  'carousel-item-animation-pan-up',
  'carousel-item-animation-pan-down',
  'carousel-item-animation-pan-diagonal-tl',
  'carousel-item-animation-pan-diagonal-br',
  'carousel-item-animation-breathing'
];

function WhyChoice() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const { language } = useLanguage();
  const id = 10;  // Changed from 5 to 9 to match API endpoint
  
  // Cycle through animations every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationIndex(prev => (prev + 1) % animationClasses.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch about us data from API
  useEffect(() => {
    const fetchAboutData = async () => {
      setLoading(true);
      setError(null);
      try {
        const langParam = language === 'hi' ? 'hi' : 'en';
        const apiUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/aboutus-item/?lang=${langParam}&id=${id}`;
        
        console.log(`Fetching Why Choose Us from: ${apiUrl}`);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log(`Why Choose Us API Response (${langParam}):`, data);
        
        if (data.success && data.data) {
          setAboutData(data.data);
          setError(null);
        } else {
          const errorMessage = data.message || 'No data available';
          console.error('API returned error:', errorMessage);
          setError(errorMessage);
          setAboutData(null);
        }
      } catch (err) {
        console.error('Error fetching why choose us data:', err);
        setError(err.message || 'Failed to fetch data');
        setAboutData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, [language]);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load about us image, using fallback');
    setImageError(true);
  };

  // Get field names based on language
  const getTitleField = () => language === 'hi' ? 'title_hi' : 'title';
  const getDescriptionField = () => language === 'hi' ? 'description_hi' : 'description';
  const getModuleField = () => language === 'hi' ? 'module_hi' : 'module';

  // Get current animation class
  const getAnimationClass = () => {
    return animationClasses[animationIndex];
  };

  // Extract features from module array
  const getFeatures = () => {
    if (!aboutData) return [];
    
    const moduleField = getModuleField();
    const modules = aboutData[moduleField];
    
    if (!modules || !Array.isArray(modules)) return [];
    
    return modules.filter(item => {
      return Array.isArray(item) && 
             item[0] && 
             typeof item[0] === 'string' &&
             item[1] && 
             typeof item[1] === 'string' &&
             item[1].trim() !== '';
    });
  };

  // Extract mission and vision from module array
  const getMissionVision = () => {
    if (!aboutData) return { mission: null, vision: null };
    
    const moduleField = getModuleField();
    const modules = aboutData[moduleField];
    
    if (!modules || !Array.isArray(modules)) return { mission: null, vision: null };
    
    const mission = modules.find(item => 
      Array.isArray(item) && 
      (item[0].toLowerCase().includes('mission') || item[0].toLowerCase().includes('मिशन'))
    );
    
    const vision = modules.find(item => 
      Array.isArray(item) &&
      (item[0].toLowerCase().includes('vision') || item[0].toLowerCase().includes('विज़न'))
    );
    
    return { mission, vision };
  };

  // Construct image URL
  const getImageUrl = () => {
    // If image is null or undefined, use fallback
    if (!aboutData || !aboutData.image) return EducationImage;
    
    if (aboutData.image.startsWith('http')) {
      return aboutData.image;
    } else {
      const imagePath = aboutData.image.startsWith('/') ? 
        aboutData.image.substring(1) : aboutData.image;
      return `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${imagePath}`;
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
        Error loading about us information: {error}. Using default content.
      </div>
    );
  }

  const { mission, vision } = getMissionVision();
  const features = getFeatures();
  const imageUrl = getImageUrl();

  return (
    <div className='mt-4'>
      <section id="about" className="about section">
        <div className="container container-box-title" data-aos="fade-up" data-aos-delay="100">
           
                <h2>{aboutData ? aboutData[getTitleField()] : "Why Choose Us"}</h2>
                <p>
                  {aboutData ? 
                    aboutData[getDescriptionField()] : 
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae odio ac nisi tristique venenatis. Nullam feugiat ipsum vitae justo finibus, in sagittis dolor malesuada. Aenean vel fringilla est, a vulputate massa."
                  }
                </p>

          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <div className="about-image" data-aos="zoom-in" data-aos-delay="300">
                <img 
                  src={imageError ? EducationImage : imageUrl} 
                  className={`img-fluid ${getAnimationClass()}`}
                  alt="About Us Image"
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-content" data-aos="fade-up" data-aos-delay="200">
               
                {/* Display features if available */}
                {features.length > 0 && (
                  <div className="features-list mt-4">
                    <h4>{language === 'hi' ? 'हमें क्यों चुनें' : 'Why Choose Us'}</h4>
                    <ul className="list-unstyled">
                      {features.map((item, index) => (
                        <li key={index} className="mb-3">
                          <i className="bi bi-check-circle-fill text-primary me-2"></i>
                          {item[1]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display mission and vision if available */}
          {(mission || vision) && (
            <div className="row mt-5">
              <div className="col-lg-12">
                <div className="mission-vision" data-aos="fade-up" data-aos-delay="400">
                  <div className="row">
                    {mission && (
                      <div className="col-md-6 mb-4">
                        <div className="mission h-100 p-4 bg-light rounded">
                          <h3>{mission[0]}</h3>
                          <p>{mission[1]}</p>
                        </div>
                      </div>
                    )}
                    {vision && (
                      <div className="col-md-6 mb-4">
                        <div className="vision h-100 p-4 bg-light rounded">
                          <h3>{vision[0]}</h3>
                          <p>{vision[1]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
 
export default WhyChoice;