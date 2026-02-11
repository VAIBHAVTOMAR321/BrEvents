import React, { useState } from "react";
import { Image, Badge, Alert, Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import "../../assets/css/registration.css";
import Logo from "../../assets/images/br-event-logo.png";

const RegistrationPreview = ({
  formData,
  certificateUrls,
  alreadyRegisteredMessage,
  phoneAlreadyRegisteredMessage,
  isVerified = false,
  userId = "",
}) => {
  // State for full-screen certificate preview
  const [fullscreenPreview, setFullscreenPreview] = useState({
    isOpen: false,
    certificateId: null,
    certificateUrl: null,
    certificateLabel: null,
  });

  // Certificate options for reference
  const certificateOptions = [
    { id: "national_level_certificate", label: "National Level Certificate" },
    {
      id: "internation_level_certificate_award",
      label: "International Level Certificate/Award",
    },
    { id: "state_level_certificate", label: "State Level Certificate" },
    { id: "district_level_certificate", label: "District Level Certificate" },
    { id: "college_level_certificate", label: "College Level Certificate" },
    { id: "other_certificate", label: "Other Certificate" },
  ];

  // Function to open certificate in full-screen preview
  const openCertificateFullscreen = (certificateId) => {
    if (certificateUrls[certificateId]) {
      const option = certificateOptions.find((opt) => opt.id === certificateId);
      setFullscreenPreview({
        isOpen: true,
        certificateId,
        certificateUrl: certificateUrls[certificateId],
        certificateLabel: option ? option.label : "Certificate",
      });
    }
  };

  // Function to close full-screen preview
  const closeFullscreenPreview = () => {
    setFullscreenPreview({
      isOpen: false,
      certificateId: null,
      certificateUrl: null,
      certificateLabel: null,
    });
  };

  // Helper function to check if a field has a value
  const hasValue = (field) => {
    return field !== undefined && field !== null && field !== "";
  };

  // Get current date for display
  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get current time for display
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="government-form-preview position-relative">
        {/* Watermark */}
        <div className="watermark">BrEvent.com</div>

        {/* Official Header with Emblem */}
        <div className="official-header text-center py-4 border-bottom border-dark">
          <div className="d-flex justify-content-center mb-3">
            <div className="emblem me-3">
              <img
                src={Logo}
                alt="logo"
                className="img-fluid img-pdf-logo"
              ></img>
            </div>
            <div className="text-start">
              <p className="mb-0">REGISTRATION FORM</p>
            </div>
          </div>
          {/* Current Date and Time Display */}
          <div className="current-date mt-2">
            <p className="mb-0 small font-weight-bold">
              Date: {getCurrentDate()} | Time: {getCurrentTime()}
            </p>
            {userId && (
              <p
                className="mb-0 small font-weight-bold mt-2"
                style={{ color: "#005f9e", fontSize: "1.1rem" }}
              >
                <strong>Registration ID: {userId}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Display already registered messages */}
        {alreadyRegisteredMessage && (
          <div className="alert alert-warning mb-3 no-print">
            {alreadyRegisteredMessage}
          </div>
        )}
        {phoneAlreadyRegisteredMessage && (
          <div className="alert alert-warning mb-3 no-print">
            {phoneAlreadyRegisteredMessage}
          </div>
        )}

        {isVerified && (
          <Alert variant="info" className="mb-3 no-print">
            <i className="bi bi-info-circle me-2"></i>
            Email Verified Successfully! Your registration is complete. You can
            now download or print your registration preview.
          </Alert>
        )}

        <div className="form-content p-4">
          {/* Education & Training Cell Header with Photo */}
          <div className="d-flex justify-content-between mb-3">
            <div className="flex-grow-1">
              <h3 className="mb-1">E v e n t </h3>

              <p className="mb-0 small">Dehradun, Uttarakhand</p>

              {/* Additional date and time display in the main content */}
              <p className="mb-0 small font-weight-bold">
                Application Date: {getCurrentDate()} | Time: {getCurrentTime()}
              </p>
            </div>
            <div className="photo-section ms-3">
              <label className="form-label font-weight-bold">
                Place Your Current photo
              </label>
              {formData.profile_image_preview ? (
                <Image
                  src={formData.profile_image_preview}
                  alt="Profile Preview"
                  style={{
                    width: "120px",
                    height: "150px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />
              ) : (
                <div
                  className="photo-placeholder d-inline-flex align-items-center justify-content-center bg-light"
                  style={{
                    width: "120px",
                    height: "150px",
                    border: "1px solid #ccc",
                  }}
                >
                  <i className="bi bi-person" style={{ fontSize: "3rem" }}></i>
                </div>
              )}
            </div>
          </div>

          {/* OJT REGISTRATION FORM Title */}
          <div className="text-center mb-4">
            <div className="d-flex align-items-center mb-3">
              <span className="me-2 font-weight-bold">
                APPLICATION FOR EVENT
              </span>
              <div className="border-bottom flex-grow-1"></div>
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
                  <label className="form-label font-weight-bold">
                    Candidate Name
                  </label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">
                    {formData.full_name}
                  </div>
                </div>
              </div>

              {/* Address - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">
                    Address:
                  </label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.address}</div>
                </div>
              </div>

              {/* Pin-code - Only show if filled */}
              {hasValue(formData.pin_code) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Pin-code:
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.pin_code}
                    </div>
                  </div>
                </div>
              )}

              {/* Telephone No - Only show if filled */}
              {hasValue(formData.telephone) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Telephone No:
                    </label>
                  </div>
                  <div className="col-md-4">
                    <div className="form-control-static">
                      {formData.telephone}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile No - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">
                    Mobile No:
                  </label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.phone}</div>
                </div>
              </div>

              {/* Email ID - Always show as it's required */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label font-weight-bold">
                    Email ID:
                  </label>
                </div>
                <div className="col-md-9">
                  <div className="form-control-static">{formData.email}</div>
                </div>
              </div>

              {/* Date of Birth - Only show if filled */}
              {hasValue(formData.date_of_birth) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Date of Birth:
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.date_of_birth}
                    </div>
                  </div>
                </div>
              )}

              {/* Aadhar No - Only show if filled */}
              {hasValue(formData.aadhar_no) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Aadhar No:
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.aadhar_no}
                    </div>
                  </div>
                </div>
              )}

              {/* Highest Educational Qualification - Only show if filled */}
              {hasValue(formData.highest_education) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Highest Educational Qualification:
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.highest_education}
                    </div>
                  </div>
                </div>
              )}

              {/* Other Educational Qualifications - Only show if filled */}
              {hasValue(formData.other_education) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Other Educational Qualifications:
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.other_education}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience - Only show if filled */}
              {hasValue(formData.experience) && (
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      Experience (if applicable):
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.experience}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section - Only show if any of these fields are filled */}
          {hasValue(formData.talent_scope) &&
            formData.talent_scope.length > 0 && (
              <div className="form-section mb-4">
                <div className="section-header text-white p-2">
                  <h5 className="mb-0 font-weight-bold">TALENT SCOPE:</h5>
                </div>
                <div className="section-content border border-top-0 p-3">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label font-weight-bold">
                        Talents:
                      </label>
                    </div>
                    <div className="col-md-9">
                      <div className="form-control-static">
                        {formData.talent_scope.map((talent, index) => (
                          <Badge
                            key={index}
                            bg="light"
                            text="dark"
                            className="me-2 mb-2 p-2"
                            style={{ fontWeight: 500 }}
                          >
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
          {hasValue(formData.social_media_links) &&
            formData.social_media_links.some((link) => hasValue(link)) && (
              <div className="form-section mb-4">
                <div className="section-header text-white p-2">
                  <h5 className="mb-0 font-weight-bold">SOCIAL MEDIA LINKS:</h5>
                </div>
                <div className="section-content border border-top-0 p-3">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label font-weight-bold">
                        Social Media:
                      </label>
                    </div>
                    <div className="col-md-9">
                      <div className="form-control-static">
                        {formData.social_media_links.map(
                          (link, index) =>
                            hasValue(link) && (
                              <p key={index} className="small mb-1">
                                <a
                                  href={
                                    link.startsWith("http")
                                      ? link
                                      : `https://${link}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {link}
                                </a>
                              </p>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Additional Links Section - Only show if any links are provided */}
          {hasValue(formData.additional_links) &&
            formData.additional_links.some((link) => hasValue(link)) && (
              <div className="form-section mb-4">
                <div className="section-header text-white p-2">
                  <h5 className="mb-0 font-weight-bold">ADDITIONAL LINKS:</h5>
                </div>
                <div className="section-content border border-top-0 p-3">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label font-weight-bold">
                        Additional Links:
                      </label>
                    </div>
                    <div className="col-md-9">
                      <div className="form-control-static">
                        {formData.additional_links.map(
                          (link, index) =>
                            hasValue(link) && (
                              <p key={index} className="small mb-1">
                                <a
                                  href={
                                    link.startsWith("http")
                                      ? link
                                      : `https://${link}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {link}
                                </a>
                              </p>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Portfolio Links Section - Only show if any links are provided */}
          {hasValue(formData.portfolio_links) &&
            formData.portfolio_links.some((link) => hasValue(link)) && (
              <div className="form-section mb-4">
                <div className="section-header text-white p-2">
                  <h5 className="mb-0 font-weight-bold">PORTFOLIO LINKS:</h5>
                </div>
                <div className="section-content border border-top-0 p-3">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label font-weight-bold">
                        Portfolio:
                      </label>
                    </div>
                    <div className="col-md-9">
                      <div className="form-control-static">
                        {formData.portfolio_links.map(
                          (link, index) =>
                            hasValue(link) && (
                              <p key={index} className="small mb-1">
                                <a
                                  href={
                                    link.startsWith("http")
                                      ? link
                                      : `https://${link}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {link}
                                </a>
                              </p>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Introduction Section - Only show if filled */}
          {hasValue(formData.introduction) && (
            <div className="form-section mb-4">
              <div className="section-header text-white p-2">
                <h5 className="mb-0 font-weight-bold">INTRODUCTION:</h5>
              </div>
              <div className="section-content border border-top-0 p-3">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label font-weight-bold">
                      About{" "}
                      {formData.user_type === "individual"
                        ? "You"
                        : "Your Organization"}
                      :
                    </label>
                  </div>
                  <div className="col-md-9">
                    <div className="form-control-static">
                      {formData.introduction}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificates Section - Only show if any certificates are selected */}
          {hasValue(formData.selected_certificates) &&
            formData.selected_certificates.length > 0 && (
              <div className="form-section mb-4 certificates-section">
                <div className="section-header text-white p-2">
                  <h5 className="mb-0 font-weight-bold">CERTIFICATES:</h5>
                </div>
                <div className="section-content border border-top-0 p-3">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="">
                        <tr>
                          <th width="30%">Certificate Type</th>
                          <th>Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.selected_certificates.map(
                          (certificateId, index) => {
                            const option = certificateOptions.find(
                              (opt) => opt.id === certificateId,
                            );

                            return (
                              <tr key={certificateId}>
                                <td>{option.label}</td>
                                <td>
                                  <div
                                    className="certificate-preview-container d-inline-block"
                                    onClick={() =>
                                      openCertificateFullscreen(certificateId)
                                    }
                                    title="Click to view in full screen"
                                  >
                                    {certificateUrls[certificateId] ? (
                                      certificateUrls[certificateId].startsWith(
                                        "data:image/",
                                      ) ? (
                                        <div className="position-relative">
                                          <Image
                                            src={certificateUrls[certificateId]}
                                            alt={certificateId}
                                            className="certificate-preview-image border"
                                            style={{
                                              maxHeight: "120px",
                                              maxWidth: "200px",
                                              objectFit: "cover",
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="pdf-preview border p-3 d-inline-flex flex-column align-items-center">
                                          <i
                                            className="bi bi-file-earmark-pdf"
                                            style={{
                                              fontSize: "2.5rem",
                                              color: "#dc3545",
                                            }}
                                          ></i>
                                          <p className="mt-2 mb-0 small">
                                            PDF Certificate
                                          </p>
                                        </div>
                                      )
                                    ) : (
                                      <div className="border p-3 d-inline-flex flex-column align-items-center">
                                        <i
                                          className="bi bi-file-earmark"
                                          style={{ fontSize: "2.5rem" }}
                                        ></i>
                                        <p className="mt-2 mb-0 small">
                                          Certificate uploaded
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer with date, time, and website link */}
        <div className="form-footer p-3 text-center border-top">
          <p className="mb-0 small">
            Generated on {getCurrentDate()} at {getCurrentTime()}
          </p>
          <p className="mb-0 small mt-1">
            Visit us at:{" "}
            <a
              href="http://localhost:3000/eventmanagement/"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:3000/eventmanagement/
            </a>
          </p>
        </div>
      </div>

      {/* Full-screen Certificate Preview */}
      {fullscreenPreview.isOpen && (
        <div className="fullscreen-certificate-preview position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-90 d-flex flex-column z-index-9999">
          {/* Watermark for fullscreen preview */}
          <div className="watermark-fullscreen">BrEvent.com</div>

          <div className="d-flex justify-content-between align-items-center p-3 bg-white">
            <h4 className="mb-0">{fullscreenPreview.certificateLabel}</h4>
            <div>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1" /> Print
              </Button>
              <Button variant="outline-danger" onClick={closeFullscreenPreview}>
                <FaTimes /> Close
              </Button>
            </div>
          </div>
          <div className="flex-grow-1 d-flex justify-content-center align-items-center p-3 overflow-auto">
            {fullscreenPreview.certificateUrl.startsWith("data:image/") ? (
              <img
                src={fullscreenPreview.certificateUrl}
                alt={fullscreenPreview.certificateLabel}
                className="max-w-full max-h-full"
                style={{ objectFit: "contain" }}
              />
            ) : fullscreenPreview.certificateUrl.startsWith(
                "data:application/pdf",
              ) ? (
              <iframe
                src={fullscreenPreview.certificateUrl}
                className="w-100 h-100"
                title={fullscreenPreview.certificateLabel}
              />
            ) : (
              <div className="text-white ">
                <i
                  className="bi bi-file-earmark"
                  style={{ fontSize: "4rem" }}
                ></i>
                <p className="mt-3">Certificate preview not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .government-form-preview {
          font-family: "Times New Roman", serif;
          background-color: #f8f9fa;
          margin: 0 auto;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .preview-actions {
          padding: 12px;
        }
        .form-content {
          flex-grow: 1;
        }
        .certificate-preview-image {
          max-height: 80px;
          max-width: 120px;
          object-fit: cover;
        }

        .form-footer {
          background-color: #f5f5f5;
          margin-top: auto;
        }
       .btn-go-back-btn{
       margin-bottom: 12px;
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

          /* Ensure table borders show in print */
          .table,
          .table th,
          .table td {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Ensure certificate preview shows properly in print */
          .certificate-preview-image {
            max-width: 100px !important;
            max-height: 80px !important;
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
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          white-space: normal;
        }

        .min-height-100 {
          min-height: 100px;
        }

        .certificate-preview-container {
          cursor: pointer;
        }

        .signature-box,
        .date-box {
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

export default RegistrationPreview;
