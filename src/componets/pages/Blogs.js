import React, { useState, useEffect } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Fetch blog items from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/blogs/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Filter only published blogs
          const publishedBlogs = data.data.filter(blog => blog.status === 'published');
          setBlogs(publishedBlogs);
        } else {
          throw new Error('Failed to load blogs');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
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

  // Extract video ID from YouTube URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    let videoId = '';
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <>
      <div className="gallery-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Our Blogs</h2>
          <ul className="breadcrumb-menu clearfix" type="none">
            <li><a className="breadcrumb-home" href="/" data-discover="true">Home</a></li>
            <li>/</li>
            <li><a className="breadcrumb-about" href="/" data-discover="true">Blogs</a></li>
          </ul>
        </div>
      </div>

      <Container className='box-shadow'>
        <main className="main">
          <section id="blogs" className="gallery section-gallery">
            <div className="container" data-aos="fade-up" data-aos-delay="100">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading Blogs...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  Error: {error}
                </div>
              ) : (
                <>
                  {blogs.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                      No blogs found.
                    </div>
                  ) : (
                    <div className="row g-4">
                      {blogs.map((blog) => (
                        <div className="col-lg-4 col-md-6" key={blog.id} data-aos="fade-up">
                          <div className="gallery-card">
                            <div className="gallery-image" style={{position: 'relative', cursor: blog.video_url ? 'pointer' : 'default'}} onClick={() => {
                              if (blog.video_url) {
                                setSelectedBlog(blog);
                                setShowVideoModal(true);
                              }
                            }}>
                              {blog.thumbnail ? (
                                <>
                                  <img 
                                    src={getImageUrl(blog.thumbnail)} 
                                    className="img-fluid" 
                                    alt={blog.title}
                                    onError={(e) => {
                                      console.error("Image failed to load:", e.target.src);
                                      e.target.src = "https://picsum.photos/seed/blogs/400/300.jpg";
                                    }}
                                  />
                                  {blog.video_url && (
                                    <div className="play-button-overlay" style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      backgroundColor: 'rgba(0,0,0,0.5)',
                                      borderRadius: '50%',
                                      width: '60px',
                                      height: '60px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '24px'
                                    }}>
                                      <FaPlay />
                                    </div>
                                  )}
                                </>
                              ) : blog.video_url ? (
                                <div className="video-embed" style={{position: 'relative', width: '100%', paddingTop: '56.25%'}}>
                                  <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    zIndex: 10
                                  }}>
                                    <FaPlay />
                                  </div>
                                </div>
                              ) : (
                                <div className="no-image-placeholder d-flex justify-content-center align-items-center" style={{height: "250px", backgroundColor: "#f8f9fa"}}>
                                  <p className="text-muted">No Image/Video Available</p>
                                </div>
                              )}
                            </div>
                            <div className="gallery-info p-3">
                              <h3>{blog.title}</h3>
                              <p className="description">{blog.summary}</p>
                              <div className="blog-meta d-flex justify-content-between align-items-center mt-2">
                                <span className="badge bg-primary">{blog.category}</span>
                                <span className="text-muted small">{formatDate(blog.created_at)}</span>
                              </div>
                              {blog.status && (
                                <div className="mt-2">
                                  <span className={`badge ${blog.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                    {blog.status}
                                  </span>
                                </div>
                              )}
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

        {/* Video Modal */}
        <Modal show={showVideoModal} onHide={() => setShowVideoModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedBlog?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBlog && selectedBlog.video_url ? (
              <div style={{position: 'relative', width: '100%', paddingTop: '56.25%'}}>
                <iframe
                  src={getYoutubeEmbedUrl(selectedBlog.video_url)}
                  title={selectedBlog.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p>No video available</p>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default Blogs;
