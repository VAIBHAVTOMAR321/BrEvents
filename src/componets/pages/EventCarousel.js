// src/components/HeroCarousel.js
import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Link, useNavigate } from 'react-router-dom';
import Showcase from "../../assets/images/education/showcase-6.webp";
import Slide2Image from "../../assets/images/education/activities-1.webp"; 
import Slide3Image from "../../assets/images/education/events-1.webp";
import "../../assets/css/mainstyle.css";
import "../../assets/css/imageTransitions.css";

// Default stats to use when API doesn't provide data
const defaultStats = [
  { value: "Michael Rodriguez", label: "Director of Innovation Strategy" },
  { value: "Date & Time", label: "Day 1 - March 15 9:00 AM" },
  { value: "Venue", label: "125 Innovation Boulevard, Chicago" }
];

// Default image to use when API doesn't provide one
const defaultImages = [Showcase, Slide2Image, Slide3Image];
 
// Array of cinematic animation classes for smooth rotation
const animationClasses = [
  'carousel-item-animation-kenburns',
  'carousel-item-animation-pan-right',
  'carousel-item-animation-pan-down',
  'carousel-item-animation-kenburns-reverse',
  'carousel-item-animation-pan-left',
  'carousel-item-animation-pan-diagonal-tl',
  'carousel-item-animation-zoom',
  'carousel-item-animation-pan-diagonal-br',
  'carousel-item-animation-breathing',
  'carousel-item-animation-pan-up'
];

function EventCarousel() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [carouselData, setCarouselData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Fetch carousel data from API
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/carousel1-item/');
        const data = await response.json();
        
        console.log('Carousel API Response:', data); // Debug log
        
        if (data.success) {
          // Map API data to component structure
          const mappedData = data.data.map((item, index) => {
            // Handle image URL construction
            let imageUrl = null;
            const slideId = item.id || `slide-${index}`;
            
            if (item.image) {
              // Make sure the image path doesn't already have the base URL
              if (item.image.startsWith('http')) {
                imageUrl = item.image;
              } else {
                // Remove leading slash if present to avoid double slashes
                const imagePath = item.image.startsWith('/') ? item.image.substring(1) : item.image;
                // Include the backend path in the URL
                imageUrl = `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/${imagePath}`;
              }
              console.log(`Image ${index}:`, imageUrl); // Debug log
            } else {
              console.log(`No image provided for slide ${index}, using default`);
              // Use default image
              imageUrl = defaultImages[index % defaultImages.length];
            }
            
            return {
              id: slideId, // Ensure we always have an ID
              title: item.title,
              subtitle: item.sub_title || "Default subtitle text for this carousel item.",
              image: imageUrl,
              description: item.description || "",
              stats: defaultStats, // We'll update this with event data
              event: null // We'll update this with event data
            };
          });
          
          setCarouselData(mappedData);
        } else {
          throw new Error('Failed to fetch carousel data');
        }
      } catch (err) {
        console.error('Error fetching carousel data:', err);
        setError(err.message);
        
        // Fallback to hardcoded data if API fails
        setCarouselData([
          {
            id: 'fallback-1',
            title: "Inspiring Excellence Through Education",
            subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget lacus id tortor facilisis tincidunt.",
            image: Showcase,
            description: "Default description for fallback carousel item.",
            stats: defaultStats,
            event: null
          }
        ]);
      }
    };

    // Fetch events data from API
    const fetchEventsData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/event-item/');
        const data = await response.json();
        
        console.log('Events API Response:', data); // Debug log
        
        if (data.success && data.data.length > 0) {
          setEventsData(data.data);
          
          // Update carousel data with event information
          setCarouselData(prevData => {
            if (prevData.length === 0) return prevData;
            
            // Get the first event (or the next upcoming event)
            const nextEvent = data.data[0];
            
            // Format date and time
            const eventDate = new Date(nextEvent.event_date_time);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
            const formattedTime = eventDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });
            
            // Extract day and month for event display
            const day = eventDate.getDate();
            const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
            
            // Create new stats with event data
            const eventStats = [
              { value: nextEvent.event_name, label: "Upcoming Event" },
              { value: `${formattedDate} at ${formattedTime}`, label: "Date & Time" },
              { value: nextEvent.venue, label: "Venue" }
            ];
            
            // Create new event object with event data
            const eventData = {
              day: day.toString(),
              month: month,
              title: nextEvent.event_name,
              description: nextEvent.description
            };
            
            // Update the first slide with event data
            return prevData.map((slide, index) => {
              if (index === 0) {
                return {
                  ...slide,
                  stats: eventStats,
                  event: eventData
                };
              }
              return slide;
            });
          });
        } else {
          console.log('No events data available');
        }
      } catch (err) {
        console.error('Error fetching events data:', err);
      }
    };

    // Fetch both carousel and events data
    const fetchData = async () => {
      setLoading(true);
      await fetchCarouselData();
      await fetchEventsData();
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Navigate to registration page
  const openRegistration = (e) => {
    e.preventDefault();
    navigate('/Registration');
  };

  // Handle image loading errors
  const handleImageError = (slideId, slideIndex) => {
    console.error(`Failed to load image for slide ${slideId}, using fallback`);
    setImageErrors(prev => ({
      ...prev,
      [slideId]: true
    }));
  };

  // Handle image loading success
  const handleImageLoad = (slideId) => {
    console.log(`Successfully loaded image for slide ${slideId}`);
  };

  // Get animation class based on slide index for cinematic effect
  const getAnimationClass = (slideIndex) => {
    return animationClasses[slideIndex % animationClasses.length];
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
        Error loading carousel: {error}. Using fallback content.
      </div>
    );
  }

  return (
    <>
      {/* The main carousel component from react-bootstrap */}
      <Carousel activeIndex={index} onSelect={handleSelect} interval={5000} pause="hover">
        
        {/* We map over our data array to create a slide for each item */}
        {carouselData.map((slide, slideIndex) => (
          <Carousel.Item key={slide.id}>
            {/* Inside each Carousel.Item, we place your hero section structure with background image */}
            <section 
              id="hero" 
              className={`hero section hero-area-bg hero-animated-bg ${getAnimationClass(slideIndex)} moving`}
              style={{
                backgroundImage: `url(${imageErrors[slide.id] ? defaultImages[slideIndex % defaultImages.length] : slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
              }}
            >
              <div className="overlay"></div>
              <div className="hero-wrapper">
                <div className="container">
                  <div className="row align-items-center">
                    <div className="col-lg-12 hero-content" data-aos="fade-right">
                      <h1>{slide.title}</h1>
                      <p>{slide.subtitle}</p>
                      <div className="stats-row">
                        {slide.stats.map((stat, index) => (
                          <div key={index} className="stat-item">
                            <span className="stat-number">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="action-buttons">
                        <Link to="/Registration" className="btn-primary" onClick={openRegistration}>Registration</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Preload image for smooth transitions */}
              <img 
                src={imageErrors[slide.id] ? defaultImages[slideIndex % defaultImages.length] : slide.image} 
                alt="Background"
                style={{ display: 'none' }}
                onError={() => handleImageError(slide.id, slideIndex)}
                onLoad={() => handleImageLoad(slide.id)}
              />

              {/* Only render the upcoming event section if event data exists */}
              {slide.event && (
                <div className="upcoming-event" data-aos="fade-up">
                  <div className="container">
                    <div className="event-content">
                      <div className="event-date">
                        <span className="day">{slide.event.day}</span>
                        <span className="month">{slide.event.month}</span>
                      </div>
                      <div className="event-info">
                        <h3>{slide.event.title}</h3>
                        <p>{slide.event.description}</p>
                      </div>
                     
                    </div>
                  </div>
                </div>
              )}
            </section>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
}

export default EventCarousel;