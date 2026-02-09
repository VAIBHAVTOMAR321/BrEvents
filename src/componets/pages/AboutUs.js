import React, { useState, useEffect } from 'react';
import EducationImage from "../../assets/images/education/campus-5.webp";
import "../../assets/css/imageTransitions.css";

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

function AboutUs() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const id = 3;
  
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
      try {
        const response = await fetch(`https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/aboutus-item/?id=${id}`);
        const data = await response.json();
        
        console.log('About Us API Response:', data); // Debug log
        
        if (data.success && data.data) {
          setAboutData(data.data);
        } else {
          throw new Error('No about us data available');
        }
      } catch (err) {
        console.error('Error fetching about us data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Handle image loading errors
  const handleImageError = () => {
    console.error('Failed to load about us image, using fallback');
    setImageError(true);
  };

  // Get current animation class
  const getAnimationClass = () => {
    return animationClasses[animationIndex];
  };

  // Extract timeline items from module array
  const getTimelineItems = () => {
    if (!aboutData || !aboutData.module) return [];
    
    return aboutData.module.filter(item => {
      return item.title && 
             typeof item.title === 'string' &&
             item.description && 
             typeof item.description === 'string' &&
             item.description.trim() !== '' && 
             !item.title.toLowerCase().includes('mission') && 
             !item.title.toLowerCase().includes('vision') &&
             /^\d+$/.test(item.title) && 
             item.title.length <= 4;
    });
  };

  // Extract mission and vision from module array
  const getMissionVision = () => {
    if (!aboutData || !aboutData.module) return { mission: null, vision: null };
    
    const mission = aboutData.module.find(item => 
      item.title && typeof item.title === 'string' && 
      item.title.toLowerCase().includes('mission')
    );
    
    const vision = aboutData.module.find(item => 
      item.title && typeof item.title === 'string' &&
      item.title.toLowerCase().includes('vision')
    );
    
    return { mission, vision };
  };

  // Extract all other module items (not timeline, mission, or vision)
  const getOtherItems = () => {
    if (!aboutData || !aboutData.module) return [];
    
    const timelineItems = getTimelineItems();
    const { mission, vision } = getMissionVision();
    
    return aboutData.module.filter(item => {
      // Skip if it's a timeline item, mission, or vision
      if (timelineItems.includes(item)) return false;
      if (mission === item) return false;
      if (vision === item) return false;
      
      // Only include items with both title and description
      return item.title && item.description && item.description.trim() !== '';
    });
  };

  // Construct image URL
  const getImageUrl = () => {
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

  const timelineItems = getTimelineItems();
  const { mission, vision } = getMissionVision();
  const otherItems = getOtherItems();
  const imageUrl = getImageUrl();

  return (
    <div>
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-content mt-4" data-aos="fade-up" data-aos-delay="200">
                <h2>{aboutData ? aboutData.title : "Educating Minds, Inspiring Hearts"}</h2>
                <p>
                  {aboutData ? 
                    aboutData.description : 
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae odio ac nisi tristique venenatis. Nullam feugiat ipsum vitae justo finibus, in sagittis dolor malesuada. Aenean vel fringilla est, a vulputate massa."
                  }
                </p>

                {/* Display all other module items */}
                {otherItems.length > 0 && (
                  <div className="other-items mt-4">
                    {otherItems.map((item, index) => (
                      <div className="mb-4" key={index}>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display timeline items */}
                {timelineItems.length > 0 && (
                  <div className="timeline mt-4">
                    <h3 className="mb-4">Our Journey</h3>
                    {timelineItems.map((item, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-image" data-aos="zoom-in" data-aos-delay="300">
                <img 
                  src={imageError ? EducationImage : imageUrl} 
                  className={`img-fluid ${getAnimationClass()}`}
                  alt="About Us Image"
                  onError={handleImageError}
                />

                <div className="mission-vision mt-4" data-aos="fade-up" data-aos-delay="400">
                  {mission && (
                    <div className="mission mb-4">
                      <h3>{mission.title}</h3>
                      <p>{mission.description}</p>
                    </div>
                  )}

                  {vision && (
                    <div className="vision">
                      <h3>{vision.title}</h3>
                      <p>{vision.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;