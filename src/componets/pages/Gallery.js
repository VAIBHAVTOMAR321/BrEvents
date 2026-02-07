import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Fetch gallery items from API
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/gallery-items/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch gallery items');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setGalleryItems(data.data);
        } else {
          throw new Error('Failed to load gallery items');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, prepend the base URL
    return `${BASE_URL}${imagePath}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
    <div class="gallery-banner"><div class="site-breadcrumb-wpr"><h2 class="breadcrumb-title">Our Gallery</h2><ul class="breadcrumb-menu clearfix" type="none"><li><a class="breadcrumb-home" href="/" data-discover="true">Home</a></li><li>/</li><li><a class="breadcrumb-about" href="/" data-discover="true">Gallery</a></li></ul></div></div>

    <Container className='box-shadow'>
      <main className="main">
       

        <section id="gallery" className="gallery section-gallery">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading Gallery Items...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                Error: {error}
              </div>
            ) : (
              <>
                {galleryItems.length === 0 ? (
                  <div className="alert alert-info" role="alert">
                    No gallery items found.
                  </div>
                ) : (
                  <div className="row g-4">
                    {galleryItems.map((item) => (
                      <div className="col-lg-4 col-md-6" key={item.id} data-aos="fade-up">
                        <div className="gallery-card">
                          <div className="gallery-image">
                            {item.image ? (
                              <img 
                                src={getImageUrl(item.image)} 
                                className="img-fluid" 
                                alt={item.title}
                                onError={(e) => {
                                  console.error("Image failed to load:", e.target.src);
                                  e.target.src = "https://picsum.photos/seed/gallery/400/300.jpg";
                                }}
                              />
                            ) : (
                              <div className="no-image-placeholder d-flex justify-content-center align-items-center" style={{height: "250px", backgroundColor: "#f8f9fa"}}>
                                <p className="text-muted">No Image Available</p>
                              </div>
                            )}
                          </div>
                          <div className="gallery-info p-3">
                            <h3>{item.title}</h3>
                            <p className="description">{item.description}</p>
                         
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </Container>
    </>
  );
}

export default Gallery;