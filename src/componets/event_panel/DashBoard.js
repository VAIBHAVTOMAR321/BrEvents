import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Form, Modal, Spinner, Alert, Image } from "react-bootstrap";
import "../../assets/css/dashboard.css";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../context/AuthFetch";
import { useAuth } from "../context/AuthContext";
import Logo from "../../assets/images/br-event-logo.png"
import {
  FaUserMd, FaPhone, FaEnvelope, FaHome, FaVenusMars, FaRulerVertical, FaWeight, FaCalendarAlt,
  FaHospital, FaStethoscope, FaNotesMedical, FaUserClock, FaInfoCircle, FaExclamationTriangle,
  FaHeartbeat, FaAppleAlt, FaBed, FaBrain, FaEye, FaTooth,
  FaRunning, FaClipboardList, FaUserMd as FaUser, FaIdCard, FaBaby, FaCut, FaUserNurse,
  FaFileMedical, FaAllergies, FaPills, FaThermometer, FaHandHoldingMedical, FaStar, FaCommentDots,
  FaCheckCircle, FaTimesCircle, FaQuoteLeft, FaQuoteRight, FaChartLine, FaHeart, FaUsers, FaMapMarkerAlt,
  FaImage, FaLink, FaCertificate, FaBuilding, FaUserTie, FaGlobe, FaCity, FaInfo, FaEye as FaViewIcon,
  FaGraduationCap, FaTheaterMasks, FaMusic, FaPalette, FaCamera, FaMicrophone, FaBook, FaGamepad,
  FaFilm, FaCode, FaLaptopCode, FaDesktop, FaPencilRuler, FaBullhorn, FaHandshake,
  FaFilePdf, FaFileExcel, FaSearch, FaTimes, FaExternalLinkAlt,
  FaDownload
} from "react-icons/fa";
import LeftNav from "./LeftNav";
import DashBoardHeader from "./DashBoardHeader";

// Registration Details Modal Component (based on RegistrationPreview)
const RegistrationDetailsModal = ({ entry, onClose }) => {
  // State for full-screen certificate preview
  const [fullscreenPreview, setFullscreenPreview] = useState({
    isOpen: false,
    certificateId: null,
    certificateUrl: null,
    certificateLabel: null
  });

  // Certificate options for reference
  const certificateOptions = [
    { id: 'national_level_certificate', label: 'National Level Certificate' },
    { id: 'internation_level_certificate_award', label: 'International Level Certificate/Award' },
    { id: 'state_level_certificate', label: 'State Level Certificate' },
    { id: 'district_level_certificate', label: 'District Level Certificate' },
    { id: 'college_level_certificate', label: 'College Level Certificate' },
    { id: 'other_certificate', label: 'Other Certificate' }
  ];

  // Function to open certificate in full-screen preview
  const openCertificateFullscreen = (certificateId) => {
    if (entry.certificates && entry.certificates[certificateId]) {
      const option = certificateOptions.find(opt => opt.id === certificateId);
      setFullscreenPreview({
        isOpen: true,
        certificateId,
        certificateUrl: getImageUrl(entry.certificates[certificateId]),
        certificateLabel: option ? option.label : 'Certificate'
      });
    }
  };

  // Function to open certificate in a new tab
  const openCertificateInNewTab = (certificateId) => {
    if (entry.certificates && entry.certificates[certificateId]) {
      const certificateUrl = getImageUrl(entry.certificates[certificateId]);
      if (certificateUrl) {
        // Open in a new tab
        window.open(certificateUrl, '_blank');
      }
    }
  };

  // Function to close full-screen preview
  const closeFullscreenPreview = () => {
    setFullscreenPreview({
      isOpen: false,
      certificateId: null,
      certificateUrl: null,
      certificateLabel: null
    });
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL or base64, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Otherwise, construct the full URL
    const API_BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";
    return `${API_BASE_URL}/${imagePath}`;
  };

  // Helper function to check if a field has a value
  const hasValue = (field) => {
    return field !== undefined && field !== null && field !== '';
  };

  // Get current date for display
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Get current time for display
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="government-form-preview position-relative">
        {/* Watermark */}
        <div className="watermark">
          BrEvent.com
        </div>
        
        {/* Official Header with Emblem */}
        <div className="official-header text-center py-4 border-bottom border-dark">
          <div className="d-flex justify-content-center mb-3">
            <div className="emblem me-3">
              <img src={Logo} alt="logo" className='img-fluid img-pdf-logo'></img>
            </div>
            <div className="text-start">
              <p className="mb-0">REGISTRATION FORM</p>
            </div>
          </div>
          {/* Current Date and Time Display */}
          <div className="current-date mt-2">
            <p className="mb-0 small font-weight-bold">Date: {getCurrentDate()} | Time: {getCurrentTime()}</p>
          </div>
        </div>

        <div className="form-content p-4">
          {/* Education & Training Cell Header with Photo */}
          <div className="d-flex justify-content-between mb-3">
            <div className="flex-grow-1">
              <h3 className="mb-1">E v e n t </h3>
            
              <p className="mb-0 small">Dehradun, Uttarakhand</p>
            
              {/* Additional date and time display in the main content */}
              <p className="mb-0 small font-weight-bold">Application Date: {formatDate(entry.created_at)} | Time: {formatDateTime(entry.created_at)}</p>
            </div>
            <div className="photo-section ms-3">
              <label className="form-label font-weight-bold">Place Your Current photo</label>
              {entry.profile_image ? (
                <Image
                  src={getImageUrl(entry.profile_image)}
                  alt="Profile"
                  style={{ width: '120px', height: '150px', objectFit: 'cover', border: '1px solid #ccc' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect fill="%23ddd" width="120" height="150"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="photo-placeholder d-inline-flex align-items-center justify-content-center bg-light" 
                     style={{ width: '120px', height: '150px', border: '1px solid #ccc' }}>
                  <i className="bi bi-person" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
            </div>
          </div>

          {/* OJT REGISTRATION FORM Title */}
          <div className="text-center mb-4">
            <div className="d-flex align-items-center mb-3">
              <span className="me-2 font-weight-bold">APPLICATION FOR EVENT</span>
              <div className="border-bottom flex-grow-1"></div>
            </div>
          </div>

          {/* User Type Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0 font-weight-bold">USER TYPE:</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Type:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    <Badge bg="info">{entry.user_type === 'individual' ? 'Individual' : 'Organization'}</Badge>
                  </div>
                </div>
              </div>
              {entry.user_type === 'team' && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Team Name:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{entry.team_name || 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PERSONAL DETAILS Section */}
          <div className="form-section mb-4">
            <div className="section-header text-white p-2">
              <h5 className="mb-0 font-weight-bold">PERSONAL DETAILS:</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              {/* Candidate Name - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Candidate Name</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{entry.full_name || 'N/A'}</div>
                </div>
              </div>
              
              {/* Address - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Address:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{entry.address || 'N/A'}</div>
                </div>
              </div>
              
              {/* Location - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Location:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{`${entry.city || 'N/A'}, ${entry.state || 'N/A'}, ${entry.country || 'N/A'}`}</div>
                </div>
              </div>
              
              {/* Telephone No - Only show if filled */}
              {hasValue(entry.telephone) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Telephone No:</label>
                  </div>
                  <div className="col-md-4">
                    <div className="form-control-static">{entry.telephone}</div>
                  </div>
                </div>
              )}
              
              {/* Mobile No - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Mobile No:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{entry.phone || 'N/A'}</div>
                </div>
              </div>
              
              {/* Email ID - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">Email ID:</label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{entry.email || 'N/A'}</div>
                </div>
              </div>
              
              {/* Date of Birth - Only show if filled */}
              {hasValue(entry.date_of_birth) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Date of Birth:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{formatDate(entry.date_of_birth)}</div>
                  </div>
                </div>
              )}
              
              {/* Gender - Only show if filled */}
              {hasValue(entry.gender) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Gender:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{entry.gender}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section - Only show if any of these fields are filled */}
          {hasValue(entry.talent_scope) && entry.talent_scope.length > 0 && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">TALENT SCOPE:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Talents:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {entry.talent_scope.map((talent, index) => (
                        <Badge key={index} bg="light" text="dark" className="me-2 mb-2 p-2" style={{ fontWeight: 500 }}>
                          {talent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Links Section - Only show if any links are provided */}
          {hasValue(entry.social_media_links) && entry.social_media_links.some(link => hasValue(link)) && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">SOCIAL MEDIA LINKS:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Social Media:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {entry.social_media_links.map((link, index) => (
                        hasValue(link) && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Links Section - Only show if any links are provided */}
          {hasValue(entry.additional_links) && entry.additional_links.some(link => hasValue(link)) && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">ADDITIONAL LINKS:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Additional Links:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {entry.additional_links.map((link, index) => (
                        hasValue(link) && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Links Section - Only show if any links are provided */}
          {hasValue(entry.portfolio_links) && entry.portfolio_links.some(link => hasValue(link)) && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">PORTFOLIO LINKS:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">Portfolio:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {entry.portfolio_links.map((link, index) => (
                        hasValue(link) && <p key={index} className="small mb-1"><a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">{link}</a></p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Introduction Section - Only show if filled */}
          {hasValue(entry.introduction) && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">INTRODUCTION:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">About {entry.user_type === 'individual' ? 'You' : 'Your Organization'}:</label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">{entry.introduction}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificates Section - Only show if any certificates are selected */}
          {entry.certificates && Object.keys(entry.certificates).length > 0 && (
            <div className="form-section mb-4 certificates-section">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">CERTIFICATES:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className=''>
                      <tr>
                        <th width="30%">Certificate Type</th>
                        <th>Preview</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(entry.certificates).map((certificateId) => {
                        const option = certificateOptions.find(opt => opt.id === certificateId);
                        const certificateUrl = getImageUrl(entry.certificates[certificateId]);
                        
                        return (
                          <tr key={certificateId}>
                            <td>{option ? option.label : certificateId}</td>
                            <td>
                              <div className="certificate-preview-container d-inline-block">
                                {certificateUrl ? (
                                  certificateUrl.startsWith('data:image/') || certificateUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    <div className="position-relative">
                                      <Image
                                        src={certificateUrl}
                                        alt={certificateId}
                                        className="certificate-preview-image border"
                                        style={{ 
                                          maxHeight: '120px', 
                                          maxWidth: '200px',
                                          objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"%3E%3Crect fill="%23ddd" width="200" height="120"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ECertificate Preview%3C/text%3E%3C/svg%3E';
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="pdf-preview border p-3 d-inline-flex flex-column align-items-center">
                                      <i className="bi bi-file-earmark-pdf" style={{ fontSize: '2.5rem', color: '#dc3545' }}></i>
                                      <p className="mt-2 mb-0 small">PDF Certificate</p>
                                    </div>
                                  )
                                ) : (
                                  <div className="border p-3 d-inline-flex flex-column align-items-center">
                                    <i className="bi bi-file-earmark" style={{ fontSize: '2.5rem' }}></i>
                                    <p className="mt-2 mb-0 small">Certificate uploaded</p>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openCertificateInNewTab(certificateId)}
                                  title="Open in new tab"
                                >
                                  <FaExternalLinkAlt />
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => openCertificateFullscreen(certificateId)}
                                  title="View in full screen"
                                >
                                  <FaEye />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Declaration Section */}
          <div className="form-section mb-4">
            <div className="section-header p-2">
              <h5 className="mb-0 font-weight-bold">DECLARATION</h5>
            </div>
            <div className="section-content border border-top-0 p-3">
              <p>I hereby declare that the information furnished above is true to the best of my knowledge and belief.</p>
              <div className="row mt-4">
                <div className="col-md-12">
                  <div className="date-box border p-2 text-center">
                    <p className="mb-0">Date: {formatDate(entry.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with date, time, and website link */}
        <div className="form-footer p-3 text-center border-top">
          <p className="mb-0 small">Generated on {getCurrentDate()} at {getCurrentTime()}</p>
          <p className="mb-0 small mt-1">Visit us at: <a href="http://localhost:3000/eventmanagement/" target="_blank" rel="noopener noreferrer">http://localhost:3000/eventmanagement/</a></p>
        </div>
      </div>

      {/* Full-screen Certificate Preview */}
      {fullscreenPreview.isOpen && (
        <div className="fullscreen-certificate-preview position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex flex-column z-index-9999">
          {/* Watermark for fullscreen preview */}
          <div className="watermark-fullscreen">
            BrEvent.com
          </div>
          
          <div className="d-flex justify-content-between align-items-center p-3 bg-white">
            <h4 className="mb-0">{fullscreenPreview.certificateLabel}</h4>
            <div>
              <Button variant="outline-primary" className="me-2" onClick={() => openCertificateInNewTab(fullscreenPreview.certificateId)}>
                <FaExternalLinkAlt className="me-1" /> Open in New Tab
              </Button>
              <Button variant="outline-danger" onClick={closeFullscreenPreview}>
                <FaTimes /> Close
              </Button>
            </div>
          </div>
          <div className="flex-grow-1 d-flex justify-content-center align-items-center p-3 overflow-auto">
            {fullscreenPreview.certificateUrl && (
              fullscreenPreview.certificateUrl.startsWith('data:image/') || 
              fullscreenPreview.certificateUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <Image 
                  src={fullscreenPreview.certificateUrl} 
                  alt={fullscreenPreview.certificateLabel}
                  className="max-w-full max-h-full"
                  style={{ objectFit: 'contain' }}
                />
              ) : fullscreenPreview.certificateUrl.startsWith('data:application/pdf') || 
                fullscreenPreview.certificateUrl.match(/\.pdf$/i) ? (
                <iframe 
                  src={fullscreenPreview.certificateUrl} 
                  className="w-100 h-100"
                  title={fullscreenPreview.certificateLabel}
                />
              ) : (
                <div className="text-white ">
                  <i className="bi bi-file-earmark" style={{ fontSize: '4rem' }}></i>
                  <p className="mt-3">Certificate preview not available</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .government-form-preview {
          font-family: 'Times New Roman', serif;
          background-color: #f8f9fa;
          margin: 0 auto;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .form-content {
          flex-grow-1;
        }
        
        .form-footer {
          background-color: #f5f5f5;
          margin-top: auto;
        }
       
        .form-footer a {
          color: #007bff;
          text-decoration: none;
        }
        
        .form-footer a:hover {
          text-decoration: underline;
        }
        
        /* Watermark styling */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 150px;
          color: rgba(0, 0, 0, 0.1);
          font-weight: bold;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
          user-select: none;
        }
        
        /* Watermark for fullscreen preview */
        .watermark-fullscreen {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.15);
          font-weight: bold;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
          user-select: none;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .form-section {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 1px solid #000 !important;
            margin-bottom: 1rem;
          }
          
          .certificates-section {
            page-break-before: auto;
            break-before: auto;
          }
          
          .government-form-preview {
            box-shadow: none;
            min-height: auto;
            border: 1px solid #000 !important;
          }
          
          /* Ensure watermark appears in print */
          .watermark {
            color: rgba(0, 0, 0, 0.05) !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure footer appears in print */
          .form-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #000 !important;
          }
          
          /* Ensure link appears in print */
          .form-footer a:after {
            content: " (http://localhost:3000/eventmanagement/)";
            font-size: 0.8em;
          }
          
          /* Ensure all borders show in print */
          .border, .border-top, .border-bottom, .border-start, .border-end {
            border-color: #000 !important;
            border-style: solid !important;
            border-width: 1px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure table borders show in print */
          .table, .table th, .table td {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure certificate preview shows properly in print */
          .certificate-preview-image {
            max-width: 100% !important;
            max-height: 300px !important;
            page-break-inside: avoid;
          }
          
          /* Ensure section headers show properly in print */
          .section-header {
            background-color: #f5f5f5 !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border: 1px solid #000 !important;
          }
          
          /* Ensure section content shows properly in print */
          .section-content {
            border: 1px solid #000 !important;
            border-top: none !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure form control static shows properly in print */
          .form-control-static {
            border-bottom: 1px dotted #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure photo placeholder shows properly in print */
          .photo-placeholder {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure PDF preview shows properly in print */
          .pdf-preview {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        .official-header {
          background-color: #f5f5f5;
        }
        
        .emblem {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .document-id {
          font-size: 0.9rem;
          color: #495057;
        }
        
        .img-pdf-logo {
          width: 30px;
          background-color: black;
          border-radius: 35px;
        }
        
        .form-section h5 {
          color: black;
          font-weight: 700;
        }
        
        .form-section {
          margin-bottom: 2rem;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .certificates-section {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .section-header {
          border-top-left-radius: 0.25rem;
          border-top-right-radius: 0.25rem;
        }
        
        .section-content {
          background-color: white;
          border-bottom-left-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
        
        .form-control-static {
          padding-top: 0.375rem;
          padding-bottom: 0.375rem;
          min-height: calc(1.5em + 0.75rem + 2px);
          border-bottom: 1px dotted #000;
        }
        
        .min-height-100 {
          min-height: 100px;
        }
        
        .certificate-preview-container {
          cursor: pointer;
        }
        
        .signature-box, .date-box {
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .official-footer {
          background-color: #f5f5f5;
          font-size: 0.85rem;
          color: #6c757d;
        }
        
        .fullscreen-certificate-preview {
          z-index: 9999;
        }
        
        .max-w-full {
          max-width: 100%;
        }
        
        .max-h-full {
          max-height: 100%;
        }
        
        .z-index-9999 {
          z-index: 9999;
        }
        
        .font-weight-bold {
          font-weight: bold;
        }
        
        .photo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .current-date {
          font-size: 1rem;
        }
      `}</style>
    </>
  );
};

const DashBoard = () => {
  const { auth, logout, refreshAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const admin_id = auth?.unique_id;

  console.log("Admin ID:", admin_id);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for registration entries
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Submission state
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Base URL for API
  const API_BASE_URL = "https://mahadevaaya.com/eventmanagement/eventmanagement_backend";

  // Function to get icon based on user type
  const getUserTypeIcon = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return <FaGraduationCap />;
    } else if (type.includes('artist') || type.includes('art')) {
      return <FaPalette />;
    } else if (type.includes('musician') || type.includes('music')) {
      return <FaMusic />;
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return <FaTheaterMasks />;
    } else if (type.includes('photographer') || type.includes('photo')) {
      return <FaCamera />;
    } else if (type.includes('singer') || type.includes('vocal')) {
      return <FaMicrophone />;
    } else if (type.includes('writer') || type.includes('author')) {
      return <FaBook />;
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return <FaGamepad />;
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return <FaFilm />;
    } else if (type.includes('developer') || type.includes('programmer')) {
      return <FaCode />;
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return <FaPencilRuler />;
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return <FaBullhorn />;
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return <FaHandshake />;
    } else if (type.includes('doctor') || type.includes('medical')) {
      return <FaUserMd />;
    } else {
      return <FaUser />;
    }
  };

  // Function to get badge color based on user type
  const getUserTypeBadgeColor = (userType) => {
    const type = userType ? userType.toLowerCase() : '';
    
    if (type.includes('student') || type.includes('education')) {
      return 'primary';
    } else if (type.includes('artist') || type.includes('art')) {
      return 'danger';
    } else if (type.includes('musician') || type.includes('music')) {
      return 'info';
    } else if (type.includes('actor') || type.includes('actress') || type.includes('theater')) {
      return 'warning';
    } else if (type.includes('photographer') || type.includes('photo')) {
      return 'dark';
    } else if (type.includes('singer') || type.includes('vocal')) {
      return 'success';
    } else if (type.includes('writer') || type.includes('author')) {
      return 'secondary';
    } else if (type.includes('gamer') || type.includes('gaming')) {
      return 'danger';
    } else if (type.includes('filmmaker') || type.includes('director')) {
      return 'dark';
    } else if (type.includes('developer') || type.includes('programmer')) {
      return 'info';
    } else if (type.includes('designer') || type.includes('ui') || type.includes('ux')) {
      return 'warning';
    } else if (type.includes('speaker') || type.includes('presenter')) {
      return 'primary';
    } else if (type.includes('entrepreneur') || type.includes('business')) {
      return 'success';
    } else if (type.includes('doctor') || type.includes('medical')) {
      return 'danger';
    } else {
      return 'secondary';
    }
  };

  // Check device width
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch registration entries from API
  const fetchEntries = async () => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setIsFetching(true);
    try {
      const url = `${API_BASE_URL}/api/reg-user/`;
      
      // Use the authFetch hook which should handle token refresh automatically
      const response = await authFetch(url, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch registration entries");
      }

      const result = await response.json();
      console.log("GET API Response:", result);

      // Handle both response formats: direct array or wrapped in success/data object
      let entriesData = [];
      if (Array.isArray(result)) {
        // Direct array response
        entriesData = result;
      } else if (result.success && result.data) {
        // Wrapped response
        entriesData = result.data;
      } else {
        throw new Error("No registration entries found");
      }

      // Process data to format dates
      const processedEntries = entriesData.map(entry => {
        const processedEntry = { ...entry };
        
        // Format created date if it exists
        if (entry.created_at) {
          const createdDate = new Date(entry.created_at);
          processedEntry.formatted_created_date = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        
        return processedEntry;
      });

      setEntries(processedEntries);
      setFilteredEntries(processedEntries);
    } catch (error) {
      console.error("Error fetching registration entries:", error);
      
      // Check if it's an authentication error
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        setMessage("Your session has expired. Please log in again.");
        setVariant("warning");
        setShowAlert(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 3000);
      } else {
        setMessage(error.message || "An error occurred while fetching registration entries");
        setVariant("danger");
        setShowAlert(true);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Fetch registration entries when auth is ready
  useEffect(() => {
    // Only fetch when auth is not loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      fetchEntries();
    }
  }, [authLoading, isAuthenticated]);

  // Filter entries based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
          (entry.full_name && entry.full_name.toLowerCase().includes(query)) ||
          (entry.user_type && entry.user_type.toLowerCase().includes(query)) ||
          (entry.phone && entry.phone.toLowerCase().includes(query)) ||
          (entry.email && entry.email.toLowerCase().includes(query)) ||
          (entry.city && entry.city.toLowerCase().includes(query)) ||
          (entry.state && entry.state.toLowerCase().includes(query)) ||
          (entry.team_name && entry.team_name.toLowerCase().includes(query))
        );
      });
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);

  // Function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to handle view registration details
  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // Function to export data to Excel (CSV)
  const exportToExcel = () => {
    const headers = ['ID', 'Full Name', 'User Type', 'Phone', 'Email', 'Gender', 'Address', 'City', 'State', 'Country', 'Team Name', 'Talent Scope', 'Introduction', 'Registration Date', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.id || entry.user_id,
        entry.full_name || 'N/A',
        entry.user_type || 'N/A',
        entry.phone || 'N/A',
        entry.email || 'N/A',
        entry.gender || 'N/A',
        entry.address || 'N/A',
        entry.city || 'N/A',
        entry.state || 'N/A',
        entry.country || 'N/A',
        entry.team_name || 'N/A',
        entry.talent_scope && entry.talent_scope.length > 0 ? entry.talent_scope.join(', ') : 'Not specified',
        entry.introduction || 'N/A',
        formatDateTime(entry.created_at),
        entry.updated_at ? formatDateTime(entry.updated_at) : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `registration_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  // If not authenticated, show message and redirect
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <div className="main-content-dash d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <Alert variant="warning">
              <Alert.Heading>Authentication Required</Alert.Heading>
              <p>You need to be logged in to view this page.</p>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content-dash">
          <DashBoardHeader toggleSidebar={toggleSidebar} />

          <Container fluid className="dashboard-body dashboard-main-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="page-title">Total Registrations</h1>
              <div>
                <Button variant="outline-success" onClick={exportToExcel} className="me-2">
                  <FaDownload className="me-1" /> Export Excel
                </Button>
              </div>
            </div>

            {/* Alert for success/error messages */}
            {showAlert && (
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                {message}
              </Alert>
            )}
            
            {/* Search Control */}
            <div className="mb-4">
              <Form.Control
                type="text"
                placeholder="Search by name, type, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-50"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading registration data...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead className="table-th">
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>User Type</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry, index) => (
                      <tr key={entry.id || entry.user_id}>
                        <td>{index + 1}</td>
                        <td>{entry.full_name || 'N/A'}</td>
                        <td>
                          <Badge bg={getUserTypeBadgeColor(entry.user_type)} className="py-1 px-2">
                            <span className="me-1">{getUserTypeIcon(entry.user_type)}</span>
                            {entry.user_type || 'N/A'}
                          </Badge>
                        </td>
                        <td>{entry.phone || 'N/A'}</td>
                        <td>{entry.email || 'N/A'}</td>
                        <td>{entry.city || 'N/A'}</td>
                        <td>{formatDateTime(entry.created_at)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewEntry(entry)}
                          >
                            <FaViewIcon />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {searchQuery ? "No matching registration entries found." : "No registration entries found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Container>
        </div>
      </div>

      {/* Registration Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title className="">Registration Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <RegistrationDetailsModal 
              entry={selectedEntry} 
              onClose={() => setShowModal(false)}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DashBoard;