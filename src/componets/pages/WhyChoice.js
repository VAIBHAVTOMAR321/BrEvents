import React, { useState, useEffect } from 'react';
import EducationImage from "../../assets/images/education/campus-5.webp";

function WhyChoice() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const id = 5;
  
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

  // Extract timeline items from module array
  const getTimelineItems = () => {
    if (!aboutData || !aboutData.module) return [];
    
    return aboutData.module.filter(item => {
      // Check if it's an object with title and description
      if (!item || typeof item !== 'object') return false;
      
      const title = item.title ? item.title.toString().trim() : '';
      const description = item.description ? item.description.toString().trim() : '';
      
      // Ensure description is not empty
      if (!description) return false;
      
      // Filter out mission and vision items
      const titleLower = title.toLowerCase();
      if (titleLower.includes('mission') || titleLower.includes('vision')) return false;
      
      // Check if title is a year (4 digits)
      if (!/^\d{4}$/.test(title)) return false;
      
      return true;
    });
  };

  // Extract features from module array (items with empty titles)
  const getFeatures = () => {
    if (!aboutData || !aboutData.module) return [];
    
    return aboutData.module.filter(item => {
      // Check if it's an object with title and description
      if (!item || typeof item !== 'object') return false;
      
      const title = item.title ? item.title.toString().trim() : '';
      const description = item.description ? item.description.toString().trim() : '';
      
      // Ensure description is not empty and title is empty
      if (!description || title) return false;
      
      return true;
    });
  };

  // Extract mission and vision from module array
  const getMissionVision = () => {
    if (!aboutData || !aboutData.module) return { mission: null, vision: null };
    
    let mission = null;
    let vision = null;
    
    aboutData.module.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      const title = item.title ? item.title.toString().trim() : '';
      const description = item.description ? item.description.toString().trim() : '';
      
      if (!title || !description) return;
      
      const titleLower = title.toLowerCase();
      
      if (titleLower.includes('mission')) {
        mission = { title, description };
      } else if (titleLower.includes('vision')) {
        vision = { title, description };
      }
    });
    
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

  const timelineItems = getTimelineItems();
  const { mission, vision } = getMissionVision();
  const features = getFeatures();
  const imageUrl = getImageUrl();

  return (
    <div className='mt-4'>
      <section id="about" className="about section">
        <div className="container container-box-title" data-aos="fade-up" data-aos-delay="100">
           
                <h2>{aboutData ? aboutData.title : "Educating Minds, Inspiring Hearts"}</h2>
                <p>
                  {aboutData ? 
                    aboutData.description : 
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vitae odio ac nisi tristique venenatis. Nullam feugiat ipsum vitae justo finibus, in sagittis dolor malesuada. Aenean vel fringilla est, a vulputate massa."
                  }
                </p>

          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <div className="about-image" data-aos="zoom-in" data-aos-delay="300">
                <img 
                  src={imageError ? EducationImage : imageUrl} 
                  className="img-fluid" 
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
                    <h4>Why Choose Us</h4>
                    <ul className="list-unstyled">
                      {features.map((item, index) => (
                        <li key={index} className="mb-3">
                          <i className="bi bi-check-circle-fill text-primary me-2"></i>
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Display timeline if available */}
                {timelineItems.length > 0 && (
                  <div className="timeline mt-4">
                    {timelineItems.map((item, index) => (
                      <div className="timeline-item" key={index}>
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
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
                          <h3>{mission.title}</h3>
                          <p>{mission.description}</p>
                        </div>
                      </div>
                    )}
                    {vision && (
                      <div className="col-md-6 mb-4">
                        <div className="vision h-100 p-4 bg-light rounded">
                          <h3>{vision.title}</h3>
                          <p>{vision.description}</p>
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