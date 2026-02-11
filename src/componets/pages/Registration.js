import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Alert,
  Dropdown,
  Row,
  Col,
  Image,
  ProgressBar,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../assets/css/registration.css";
import RegistrationPreview from "./RegistrationPreview";

const Registration = ({
  email: propEmail,
  onRegistrationSuccess,
  fromEvent = false,
  pendingEventId = null,
}) => {
  const navigate = useNavigate();

  // Form state - Kept in React state for secure handling (not stored in localStorage)
  // This data persists throughout the user's session during registration flow
  const [formData, setFormData] = useState({
    user_type: "individual", // Default to individual
    team_name: "",
    profile_image: null,
    profile_image_preview: "",
    full_name: "",
    gender: "",
    email: propEmail || "", // Auto-fill with prop email if provided
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    country: "",
    state: "",
    city: "",
    phone: "",
    address: "",
    introduction: "",
    talent_scope: [],
    social_media_links: [""],
    additional_links: [""],
    portfolio_links: [""],
    // Certificate fields
    selected_certificates: [], // To track which certificates are selected
    national_level_certificate: null,
    internation_level_certificate_award: null,
    state_level_certificate: null,
    district_level_certificate: null,
    college_level_certificate: null,
    other_certificate: null,
    agreeTerms: false,
  });

  // Verification form state
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userId, setUserId] = useState(""); // Store user_id fetched from API

  // UI state
  const [currentStep, setCurrentStep] = useState("registration"); // 'registration', 'preview', or 'verification'

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // To store detailed API response for debugging
  const [countdown, setCountdown] = useState(0); // For resend code countdown
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] = useState(""); // New state for already registered message
  const [phoneAlreadyRegisteredMessage, setPhoneAlreadyRegisteredMessage] =
    useState(""); // New state for phone already registered message
  const [userTypeError, setUserTypeError] = useState(""); // New state for user type error
  const [certificateUrls, setCertificateUrls] = useState({}); // Secure storage of certificate URLs in React state (not localStorage)
  const [emailNotVerified, setEmailNotVerified] = useState(false); // New state for unverified email
  const [checkingEmail, setCheckingEmail] = useState(false); // New state for email checking status

  // Ref for file inputs
  const fileInputRef = useRef(null);
  const certificateFileRefs = {
    national_level_certificate: useRef(null),
    internation_level_certificate_award: useRef(null),
    state_level_certificate: useRef(null),
    district_level_certificate: useRef(null),
    college_level_certificate: useRef(null),
    other_certificate: useRef(null),
  };

  // Certificate options
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

  // Talent scope options
  const talentOptions = [
    "Dancing",
    "Acting",
    "Singing",
    "Music",
    "script Writing",
  ];

  // Form validation for registration with scroll to first error
  const validateForm = () => {
    const newErrors = {};

    // Team name validation (only for team)
    if (formData.user_type === "team" && !formData.team_name.trim()) {
      newErrors.team_name = "Team name is required for team registration";
    }

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
      newErrors.full_name = "Full name should only contain letters and spaces";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    // Date of birth validation - no future dates (only for individual)
    if (formData.user_type === "individual") {
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = "Date of birth is required";
      } else {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to beginning of day for accurate comparison

        if (dob > today) {
          newErrors.date_of_birth = "Date of birth cannot be in the future";
        } else {
          const age = Math.floor(
            (today - dob) / (365.25 * 24 * 60 * 60 * 1000),
          );
          if (age < 13) {
            newErrors.date_of_birth =
              "You must be at least 13 years old to register";
          }
        }
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    // Phone validation - exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Talent scope validation
    if (formData.talent_scope.length === 0) {
      newErrors.talent_scope = "Please select at least one talent scope";
    }

    // Social media links validation
    const validSocialMediaLinks = formData.social_media_links.filter(
      (link) => link.trim() !== "",
    );
    if (validSocialMediaLinks.length === 0) {
      newErrors.social_media_links =
        "Please add at least one social media link";
    } else {
      const linkErrors = [];
      validSocialMediaLinks.forEach((link, index) => {
        if (
          !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            link,
          )
        ) {
          linkErrors[index] = "Please enter a valid URL";
        }
      });
      if (linkErrors.length > 0) {
        newErrors.social_media_links = linkErrors;
      }
    }

    // Additional links validation
    const validAdditionalLinks = formData.additional_links.filter(
      (link) => link.trim() !== "",
    );
    if (validAdditionalLinks.length > 0) {
      const linkErrors = [];
      validAdditionalLinks.forEach((link, index) => {
        if (
          !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            link,
          )
        ) {
          linkErrors[index] = "Please enter a valid URL";
        }
      });
      if (linkErrors.length > 0) {
        newErrors.additional_links = linkErrors;
      }
    }

    // Portfolio links validation
    const validPortfolioLinks = formData.portfolio_links.filter(
      (link) => link.trim() !== "",
    );
    if (validPortfolioLinks.length > 0) {
      const linkErrors = [];
      validPortfolioLinks.forEach((link, index) => {
        if (
          !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            link,
          )
        ) {
          linkErrors[index] = "Please enter a valid URL";
        }
      });
      if (linkErrors.length > 0) {
        newErrors.portfolio_links = linkErrors;
      }
    }

    // Introduction validation
    if (!formData.introduction.trim()) {
      newErrors.introduction = "Please introduce yourself";
    } else if (formData.introduction.length < 50) {
      newErrors.introduction =
        "Introduction must be at least 50 characters long";
    } else if (formData.introduction.length > 500) {
      newErrors.introduction = "Introduction must be less than 500 characters";
    }

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);

    // Scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.querySelector(
        '[name="' + Object.keys(newErrors)[0] + '"]',
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorField.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Verification form validation
  const validateVerificationForm = () => {
    const newErrors = {};

    if (!verificationCode.trim()) {
      newErrors.verificationCode = "Verification code is required";
    } else if (!/^[0-9]{6}$/.test(verificationCode)) {
      newErrors.verificationCode = "Verification code must be 6 digits";
    }

    setErrors(newErrors);

    // Scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = document.querySelector(
        '[name="' + Object.keys(newErrors)[0] + '"]',
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstErrorField.focus();
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // Live validation for individual fields
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "team_name":
        if (formData.user_type === "team" && !value.trim()) {
          error = "Team name is required for team registration";
        }
        break;

      case "full_name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Full name should only contain letters and spaces";
        }
        break;

      case "gender":
        if (!value) {
          error = "Please select your gender";
        }
        break;

      case "date_of_birth":
        if (formData.user_type === "individual") {
          if (!value) {
            error = "Date of birth is required";
          } else {
            const dob = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dob > today) {
              error = "Date of birth cannot be in the future";
            } else {
              const age = Math.floor(
                (today - dob) / (365.25 * 24 * 60 * 60 * 1000),
              );
              if (age < 13) {
                error = "You must be at least 13 years old to register";
              }
            }
          }
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;

      case "country":
        if (!value.trim()) {
          error = "Country is required";
        }
        break;

      case "state":
        if (!value.trim()) {
          error = "State is required";
        }
        break;

      case "city":
        if (!value.trim()) {
          error = "City is required";
        }
        break;

      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits";
        }
        break;

      case "address":
        if (!value.trim()) {
          error = "Address is required";
        }
        break;

      case "introduction":
        if (!value.trim()) {
          error = "Please introduce yourself";
        } else if (value.length < 50) {
          error = "Introduction must be at least 50 characters long";
        } else if (value.length > 500) {
          error = "Introduction must be less than 500 characters";
        }
        break;

      case "agreeTerms":
        if (!value) {
          error = "You must agree to the terms and conditions";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Handle input change for registration form with live validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for different fields
    let processedValue = value;

    if (name === "phone") {
      // Only allow digits for phone, max 10
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (name === "full_name") {
      // Only allow letters and spaces for name
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    // Perform live validation for the changed field
    const fieldError = validateField(
      name,
      type === "checkbox" ? checked : processedValue,
    );
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Clear phone already registered message when phone is changed
    if (name === "phone" && phoneAlreadyRegisteredMessage) {
      setPhoneAlreadyRegisteredMessage("");
    }

    // Clear user type error when user type is changed
    if (name === "user_type" && userTypeError) {
      setUserTypeError("");
    }

    // Check email status when email changes
    if (name === "email") {
      // Clear previous messages
      setAlreadyRegisteredMessage("");
      setEmailNotVerified(false);
    }
  };

  // Handle user type change with validation
  const handleUserTypeChange = (userType) => {
    setFormData((prev) => ({
      ...prev,
      user_type: userType,
      // Reset form fields that are specific to each user type
      team_name: userType === "team" ? prev.team_name : "",
      date_of_birth: userType === "individual" ? prev.date_of_birth : "",
    }));

    // Validate fields based on new user type
    const newErrors = {};
    if (userType === "team") {
      const teamNameError = validateField("team_name", formData.team_name);
      if (teamNameError) {
        newErrors.team_name = teamNameError;
      }
      newErrors.date_of_birth = ""; // Clear DOB error for team
    } else {
      const dobError = validateField("date_of_birth", formData.date_of_birth);
      if (dobError) {
        newErrors.date_of_birth = dobError;
      }
      newErrors.team_name = ""; // Clear team name error for individual
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));

    // Clear user type error
    setUserTypeError("");
  };

  // Handle verification code change
  const handleVerificationCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setVerificationCode(value);

    // Clear error if it exists
    if (errors.verificationCode) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: "",
      }));
    }
  };

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profile_image:
            "Please upload a valid image file (JPEG, JPG, PNG, or GIF)",
        }));
        return;
      }

      // Validate file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          profile_image: "Image size should be less than 1MB",
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_image: file,
          profile_image_preview: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      // Clear error if it exists
      if (errors.profile_image) {
        setErrors((prev) => ({
          ...prev,
          profile_image: "",
        }));
      }
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_image: null,
      profile_image_preview: "",
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle certificate file change
  const handleCertificateFileChange = (certificateType, e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [certificateType]:
            "Please upload a valid file (JPEG, JPG, PNG, or PDF)",
        }));
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          [certificateType]: "File size should be less than 2MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [certificateType]: file,
      }));

      // Create URL for the certificate file
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificateUrls((prev) => ({
          ...prev,
          [certificateType]: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      // Clear error if it exists
      if (errors[certificateType]) {
        setErrors((prev) => ({
          ...prev,
          [certificateType]: "",
        }));
      }
    }
  };

  // Remove certificate file
  const removeCertificateFile = (certificateType) => {
    setFormData((prev) => ({
      ...prev,
      [certificateType]: null,
    }));

    setCertificateUrls((prev) => {
      const newUrls = { ...prev };
      delete newUrls[certificateType];
      return newUrls;
    });

    // Reset file input
    if (certificateFileRefs[certificateType].current) {
      certificateFileRefs[certificateType].current.value = "";
    }
  };

  // Handle certificate selection
  const handleCertificateSelection = (certificateId) => {
    setFormData((prev) => {
      const newSelectedCertificates = prev.selected_certificates.includes(
        certificateId,
      )
        ? prev.selected_certificates.filter((id) => id !== certificateId)
        : [...prev.selected_certificates, certificateId];

      // If certificate is being deselected, remove the file
      if (!newSelectedCertificates.includes(certificateId)) {
        return {
          ...prev,
          selected_certificates: newSelectedCertificates,
          [certificateId]: null,
        };
      }

      return { ...prev, selected_certificates: newSelectedCertificates };
    });

    // Clear error if it exists
    if (errors[certificateId]) {
      setErrors((prev) => ({
        ...prev,
        [certificateId]: "",
      }));
    }
  };

  // Handle talent scope selection with validation
  const handleTalentScopeChange = (talent) => {
    setFormData((prev) => {
      const newTalentScope = prev.talent_scope.includes(talent)
        ? prev.talent_scope.filter((t) => t !== talent)
        : [...prev.talent_scope, talent];

      return { ...prev, talent_scope: newTalentScope };
    });

    // Validate talent scope
    const talentError =
      formData.talent_scope.includes(talent) &&
      formData.talent_scope.length === 1
        ? "Please select at least one talent scope"
        : "";

    setErrors((prev) => ({
      ...prev,
      talent_scope: talentError,
    }));
  };

  // Handle social media links with validation
  const handleSocialMediaLinkChange = (index, value) => {
    const newLinks = [...formData.social_media_links];
    newLinks[index] = value;
    setFormData((prev) => ({
      ...prev,
      social_media_links: newLinks,
    }));

    // Validate social media links
    const validLinks = newLinks.filter((link) => link.trim() !== "");
    let linkError = "";
    if (validLinks.length === 0) {
      linkError = "Please add at least one social media link";
    } else {
      const invalidLinks = validLinks.some(
        (link) =>
          !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            link,
          ),
      );
      if (invalidLinks) {
        linkError = "Please enter valid URLs";
      }
    }

    setErrors((prev) => ({
      ...prev,
      social_media_links: linkError,
    }));
  };

  const addSocialMediaLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_media_links: [...prev.social_media_links, ""],
    }));
  };

  const removeSocialMediaLink = (index) => {
    if (formData.social_media_links.length > 1) {
      const newSocialMediaLinks = [...formData.social_media_links];
      newSocialMediaLinks.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        social_media_links: newSocialMediaLinks,
      }));
    }
  };

  // Handle additional links
  const handleAdditionalLinkChange = (index, value) => {
    const newAdditionalLinks = [...formData.additional_links];
    newAdditionalLinks[index] = value;
    setFormData((prev) => ({ ...prev, additional_links: newAdditionalLinks }));

    // Clear error for this specific link if it exists
    if (
      errors.additional_links &&
      Array.isArray(errors.additional_links) &&
      errors.additional_links[index]
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (Array.isArray(newErrors.additional_links)) {
          newErrors.additional_links = [...newErrors.additional_links];
          newErrors.additional_links[index] = "";
        }
        return newErrors;
      });
    } else if (
      errors.additional_links &&
      typeof errors.additional_links === "string"
    ) {
      // Clear the general additional_links error if it's a string
      setErrors((prev) => ({
        ...prev,
        additional_links: "",
      }));
    }
  };

  const addAdditionalLink = () => {
    setFormData((prev) => ({
      ...prev,
      additional_links: [...prev.additional_links, ""],
    }));
  };

  const removeAdditionalLink = (index) => {
    if (formData.additional_links.length > 1) {
      const newAdditionalLinks = [...formData.additional_links];
      newAdditionalLinks.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        additional_links: newAdditionalLinks,
      }));
    }
  };

  // Handle portfolio links with validation
  const handlePortfolioLinkChange = (index, value) => {
    const newLinks = [...formData.portfolio_links];
    newLinks[index] = value;
    setFormData((prev) => ({
      ...prev,
      portfolio_links: newLinks,
    }));

    // Validate portfolio links
    const validLinks = newLinks.filter((link) => link.trim() !== "");
    let linkError = "";
    if (validLinks.length > 0) {
      const invalidLinks = validLinks.some(
        (link) =>
          !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(
            link,
          ),
      );
      if (invalidLinks) {
        linkError = "Please enter valid URLs";
      }
    }

    setErrors((prev) => ({
      ...prev,
      portfolio_links: linkError,
    }));
  };

  const addPortfolioLink = () => {
    setFormData((prev) => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, ""],
    }));
  };

  const removePortfolioLink = (index) => {
    if (formData.portfolio_links.length > 1) {
      const newPortfolioLinks = [...formData.portfolio_links];
      newPortfolioLinks.splice(index, 1);
      setFormData((prev) => ({ ...prev, portfolio_links: newPortfolioLinks }));
    }
  };

  // Handle preview button click - validate form and submit
  const handlePreviewClick = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      await handleRegistrationSubmit(e);
    }
  };

  // Handle direct verification for already registered but unverified email
  const handleDirectVerification = () => {
    setRegisteredEmail(formData.email);
    setCurrentStep("verification");
  };

  // Open certificate in new tab
  const openCertificateInNewTab = (certificateId) => {
    if (certificateUrls[certificateId]) {
      window.open(certificateUrls[certificateId], "_blank");
    }
  };

  // Handle completion and cleanup
  const handleRegistrationComplete = async () => {
    // Reset all state
    setErrors({});
    setApiError("");
    setSubmitSuccess(false);
    setVerificationSuccess(false);
    setCurrentStep("registration");
    setVerificationCode("");
    setRegisteredEmail("");
    setResendSuccess(false);
    setApiResponse(null);
    setCountdown(0);
    setAlreadyRegisteredMessage("");
    setPhoneAlreadyRegisteredMessage("");
    setUserTypeError("");
    setCertificateUrls({});
    setEmailNotVerified(false);
    setCheckingEmail(false);
    setUserId("");
    setFormData({
      user_type: "individual",
      team_name: "",
      profile_image: null,
      profile_image_preview: "",
      full_name: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
      date_of_birth: "",
      country: "",
      state: "",
      city: "",
      phone: "",
      address: "",
      introduction: "",
      talent_scope: [],
      social_media_links: [""],
      additional_links: [""],
      portfolio_links: [""],
      selected_certificates: [],
      national_level_certificate: null,
      internation_level_certificate_award: null,
      state_level_certificate: null,
      district_level_certificate: null,
      college_level_certificate: null,
      other_certificate: null,
      agreeTerms: false,
    });

    // Reset file inputs
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    Object.values(certificateFileRefs).forEach((ref) => {
      if (ref.current) {
        ref.current.value = "";
      }
    });

    // Navigate
    navigate(fromEvent ? "/Events" : "/Login");
  };

  // Reset form when component unmounts
  useEffect(() => {
    return () => {
      setErrors({});
      setApiError("");
      setSubmitSuccess(false);
      setVerificationSuccess(false);
      setCurrentStep("registration");
      setVerificationCode("");
      setRegisteredEmail("");
      setResendSuccess(false);
      setApiResponse(null);
      setCountdown(0);
      setAlreadyRegisteredMessage("");
      setPhoneAlreadyRegisteredMessage("");
      setUserTypeError("");
      setCertificateUrls({});
      setEmailNotVerified(false);
      setCheckingEmail(false);
    };
  }, []);

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split("T")[0];

  // Check if links error is a string or array
  const getLinkError = (errorType, index) => {
    if (errors[errorType]) {
      if (Array.isArray(errors[errorType])) {
        return errors[errorType][index];
      }
      return errors[errorType];
    }
    return "";
  };

  // ==================== ENHANCED DOWNLOAD FUNCTION ====================
  // Function to handle downloading the registration preview as PDF
  // This function is reusable and works multiple times
  const handlePrintPreview = async () => {
    try {
      // Find the preview container element
      const previewContainer = document.querySelector(".preview-container");
      if (!previewContainer) {
        console.error("Preview container not found");
        alert(
          "Error: Could not find preview content. Please refresh the page.",
        );
        return;
      }

      // Hide action buttons temporarily
      const previewActions = previewContainer.querySelector(".preview-actions");
      const originalDisplay = previewActions
        ? previewActions.style.display
        : "";
      if (previewActions) {
        previewActions.style.display = "none";
      }

      // Try to use html2canvas and jsPDF from CDN or fallback to print
      try {
        // Load html2canvas if not already loaded
        if (!window.html2canvas) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Load jsPDF if not already loaded
        if (!window.jsPDF) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Create a deep clone of the container to avoid modifying the original
        const clonedContainer = previewContainer.cloneNode(true);
        clonedContainer.style.width = previewContainer.offsetWidth + "px";
        clonedContainer.style.position = "absolute";
        clonedContainer.style.left = "-9999px";
        clonedContainer.style.top = "-9999px";
        clonedContainer.style.visibility = "hidden";
        clonedContainer.style.background = "white";
        document.body.appendChild(clonedContainer);

        try {
          // Remove no-print elements from cloned container
          const noPrintElements = clonedContainer.querySelectorAll(".no-print");
          noPrintElements.forEach((el) => el.remove());

          // Copy all computed styles from original to cloned elements
          const copyStyles = (source, target) => {
            const computed = window.getComputedStyle(source);
            for (let prop of computed) {
              try {
                target.style[prop] = computed.getPropertyValue(prop);
              } catch (e) {
                // Skip properties that can't be set
              }
            }
            // Recursively copy styles for child elements
            for (let i = 0; i < source.children.length; i++) {
              copyStyles(source.children[i], target.children[i]);
            }
          };

          // Apply computed styles from original preview container
          copyStyles(previewContainer, clonedContainer);

          // Wait a moment for styles to be applied
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Generate canvas from cloned element with better settings
          const canvas = await window.html2canvas(clonedContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: "#ffffff",
            windowWidth: clonedContainer.scrollWidth,
            windowHeight: clonedContainer.scrollHeight,
            imageTimeout: 0,
          });

          // Create PDF
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Calculate number of pages needed
          let heightLeft = imgHeight;
          let position = 0;
          const pageCount = Math.ceil(imgHeight / pageHeight);

          for (let i = 0; i < pageCount; i++) {
            if (i > 0) {
              pdf.addPage();
            }
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, pageHeight);
            position -= pageHeight;
          }

          // Generate filename
          const fileName = `registration-preview-${formData.full_name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
          pdf.save(fileName);
        } finally {
          // Clean up cloned element
          if (document.body.contains(clonedContainer)) {
            document.body.removeChild(clonedContainer);
          }

          // Restore action buttons
          if (previewActions) {
            previewActions.style.display = originalDisplay;
          }
        }
      } catch (loadError) {
        console.error("Error loading or using PDF libraries:", loadError);
        // Fallback to print method if PDF generation fails
        handlePrintFallback();
      }
    } catch (error) {
      console.error("Error in handlePrintPreview:", error);
      alert(
        "Error generating PDF: " +
          error.message +
          "\nFalling back to print method...",
      );
      // Fallback to print
      handlePrintFallback();
    }
  };

  // Fallback print method - improved to exclude no-print elements
  const handlePrintFallback = () => {
    try {
      const previewContainer = document.querySelector(".preview-container");
      if (!previewContainer) {
        console.error("Preview container not found");
        alert("Error: Could not find preview content.");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        console.error("Could not open print window");
        alert(
          "Error: Could not open print window. Please check your browser settings.",
        );
        return;
      }

      // Clone the container and remove no-print elements
      const clonedContainer = previewContainer.cloneNode(true);
      const noPrintElements = clonedContainer.querySelectorAll(".no-print");
      noPrintElements.forEach((el) => el.remove());

      printWindow.document.write(`
        <html>
          <head>
            <title>Registration Preview</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              body { font-family: 'Times New Roman', serif; color: #333; padding: 20px; background-color: #fff; }
              .government-form-preview {
                max-width: 210mm;
                margin: 0 auto;
                box-shadow: 0 0 15px rgba(0,0,0,0.1);
                background-color: #f8f9fa;
              }
              @media print {
                body { 
                  padding: 0; 
                  background-color: #fff;
                }
                .no-print { 
                  display: none !important; 
                }
                .government-form-preview {
                  box-shadow: none;
                }
                @page {
                  margin: 15mm;
                }
              }
            </style>
          </head>
          <body>
            ${clonedContainer.innerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error("Error in print fallback:", error);
      alert("Error opening print dialog: " + error.message);
    }
  };

  // ===========================================================

  // Handle registration form submission
  const handleRegistrationSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setApiError("");
    setApiResponse(null);
    setAlreadyRegisteredMessage(""); // Clear any previous already registered message
    setPhoneAlreadyRegisteredMessage(""); // Clear any previous phone already registered message
    setUserTypeError(""); // Clear any previous user type error

    try {
      // Create FormData for file upload
      const apiFormData = new FormData();

      // Add user type - ensure it's a clean string without quotes
      // Make sure we're sending exactly 'individual' or 'team' without any extra characters
      apiFormData.append("user_type", formData.user_type);

      // Add team name if team
      if (formData.user_type === "team") {
        apiFormData.append("team_name", formData.team_name);
      }

      // Add all form fields
      apiFormData.append("full_name", formData.full_name);
      apiFormData.append("gender", formData.gender);

      if (formData.user_type === "individual") {
        apiFormData.append("date_of_birth", formData.date_of_birth);
      }

      apiFormData.append("email", formData.email);
      apiFormData.append("password", formData.password);
      apiFormData.append("country", formData.country);
      apiFormData.append("state", formData.state);
      apiFormData.append("city", formData.city);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("address", formData.address);
      apiFormData.append("introduction", formData.introduction);

      // Add profile image
      if (formData.profile_image) {
        apiFormData.append("profile_image", formData.profile_image);
      }

      // Add talent scope as JSON string
      apiFormData.append("talent_scope", JSON.stringify(formData.talent_scope));

      // Add social media links as JSON string
      const validSocialMediaLinks = formData.social_media_links.filter(
        (link) => link.trim() !== "",
      );
      apiFormData.append(
        "social_media_link",
        JSON.stringify(validSocialMediaLinks),
      );

      // Add additional links as JSON string
      const validAdditionalLinks = formData.additional_links.filter(
        (link) => link.trim() !== "",
      );
      if (validAdditionalLinks.length > 0) {
        apiFormData.append(
          "additional_link",
          JSON.stringify(validAdditionalLinks),
        );
      }

      // Add portfolio links as JSON string
      const validPortfolioLinks = formData.portfolio_links.filter(
        (link) => link.trim() !== "",
      );
      if (validPortfolioLinks.length > 0) {
        apiFormData.append(
          "portfolio_link",
          JSON.stringify(validPortfolioLinks),
        );
      }

      // Add certificate files
      certificateOptions.forEach((option) => {
        if (formData[option.id]) {
          apiFormData.append(option.id, formData[option.id]);
        }
      });

      // Log the form data for debugging
      console.log("Submitting registration data:");
      for (let [key, value] of apiFormData.entries()) {
        console.log(`${key}:`, value);
      }

      // API call with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reg-user/",
        {
          method: "POST",
          body: apiFormData,
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
        },
      );

      clearTimeout(timeoutId);

      // Try to parse the response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If we can't parse JSON, use status text
        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        }
        // If response is OK but we can't parse JSON, treat it as success
        data = { success: true };
      }

      console.log("API Response:", data); // Log the response for debugging
      setApiResponse(data); // Store response for debugging

      // Check if response is OK
      if (!response.ok) {
        // Handle different error formats
        if (data.message) {
          // Check if this is the "Email not verified" case
          if (
            data.message === "Email not verified. Verification code resent."
          ) {
            // Set the already registered message
            setAlreadyRegisteredMessage(data.message);
            // Set the registered email for verification
            setRegisteredEmail(formData.email);
            // Move to verification step
            setCurrentStep("verification");
            setIsSubmitting(false);
            return;
          }
          // Check if this is the "Email already registered and verified" case
          else if (data.message === "Email already registered and verified.") {
            // Set the already registered message
            setAlreadyRegisteredMessage(data.message);
            setIsSubmitting(false);

            // Scroll to the email field
            setTimeout(() => {
              const emailField = document.querySelector('[name="email"]');
              if (emailField) {
                emailField.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                emailField.focus();
              }
            }, 100);

            return;
          }
          // Check if this is the "Phone number already in use" case
          else if (data.message === "This phone number is already in use.") {
            // Set the phone error
            setErrors((prev) => ({ ...prev, phone: data.message }));
            setPhoneAlreadyRegisteredMessage(data.message);
            setIsSubmitting(false);

            // Scroll to the phone field
            setTimeout(() => {
              const phoneField = document.querySelector('[name="phone"]');
              if (phoneField) {
                phoneField.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                phoneField.focus();
              }
            }, 100);

            return;
          }
          throw new Error(data.message);
        } else if (data.error) {
          throw new Error(data.error);
        } else if (data.errors) {
          // If there are field-specific errors, extract them
          const errorMessages = Object.values(data.errors).flat();

          // Check for user_type error specifically
          if (data.errors.user_type) {
            const userTypeErrorMsg = Array.isArray(data.errors.user_type)
              ? data.errors.user_type[0]
              : data.errors.user_type;
            setUserTypeError(userTypeErrorMsg);
          }

          throw new Error(errorMessages.join(", "));
        } else if (data.detail) {
          throw new Error(data.detail);
        } else if (data.email) {
          // Check if this is the "Email already registered and verified" case
          if (data.email === "Email already registered and verified.") {
            // Set the already registered message
            setAlreadyRegisteredMessage(data.email);
            setIsSubmitting(false);

            // Scroll to the email field
            setTimeout(() => {
              const emailField = document.querySelector('[name="email"]');
              if (emailField) {
                emailField.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                emailField.focus();
              }
            }, 100);

            return;
          }
          throw new Error(data.email);
        } else if (data.phone) {
          // Check if this is the "Phone number already in use" case
          if (data.phone === "This phone number is already in use.") {
            // Set the phone error
            setErrors((prev) => ({ ...prev, phone: data.phone }));
            setPhoneAlreadyRegisteredMessage(data.phone);
            setIsSubmitting(false);

            // Scroll to the phone field
            setTimeout(() => {
              const phoneField = document.querySelector('[name="phone"]');
              if (phoneField) {
                phoneField.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                phoneField.focus();
              }
            }, 100);

            return;
          }
          throw new Error(data.phone);
        } else if (data.user_type) {
          // Handle user_type error
          const userTypeErrorMsg = Array.isArray(data.user_type)
            ? data.user_type[0]
            : data.user_type;
          setUserTypeError(userTypeErrorMsg);
          setIsSubmitting(false);
          return;
        } else if (data.non_field_errors) {
          // Handle non-field errors
          throw new Error(data.non_field_errors.join(", "));
        } else {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        }
      }

      // On success, transition to verification step
      // Form data is kept in React state for secure handling
      setRegisteredEmail(formData.email);
      setSubmitSuccess(true);
      setIsSubmitting(false);

      // Move to verification step immediately
      setTimeout(() => {
        setCurrentStep("verification");
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle different types of errors
      if (error.name === "AbortError") {
        setApiError(
          "Request timed out. Please check your connection and try again.",
        );
      } else if (error.message.includes("Failed to fetch")) {
        setApiError(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else if (error.message.includes("CORS")) {
        setApiError(
          "Network error: CORS policy issue. Please contact support.",
        );
      } else {
        setApiError(`Error: ${error.message}`);
      }

      setIsSubmitting(false);
    }
  };

  // Handle verification form submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (validateVerificationForm()) {
      setIsSubmitting(true);
      setApiError("");

      try {
        // API call with timeout and proper error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Changed to JSON format instead of FormData
        const response = await fetch(
          "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/verify-email/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: registeredEmail,
              code: verificationCode,
            }),
            signal: controller.signal,
            mode: "cors", // Explicitly set CORS mode
          },
        );

        clearTimeout(timeoutId);

        console.log("Verification payload:", {
          email: registeredEmail,
          code: verificationCode,
        });

        // Check if response is OK
        if (!response.ok) {
          // Try to get error details from response
          let errorData;
          try {
            errorData = await response.json();
            console.log("Error response:", errorData);
          } catch (e) {
            // If we can't parse JSON, use status text
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`,
            );
          }

          // Handle different error formats
          if (errorData.message) {
            throw new Error(errorData.message);
          } else if (errorData.error) {
            throw new Error(errorData.error);
          } else if (errorData.detail) {
            throw new Error(errorData.detail);
          } else {
            throw new Error(
              `Server returned ${response.status}: ${response.statusText}`,
            );
          }
        }

        // Parse successful response
        const data = await response.json();
        console.log("Verification API Response:", data); // Log the response for debugging

        // On success, fetch user_id using the registered email
        try {
          const userIdResponse = await fetch(
            `https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/get-userid/?email=${encodeURIComponent(registeredEmail)}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              mode: "cors",
            },
          );

          if (userIdResponse.ok) {
            const userIdData = await userIdResponse.json();
            console.log("User ID API Response:", userIdData); // Log the response for debugging
            if (userIdData.user_id) {
              setUserId(userIdData.user_id);
            }
          } else {
            console.warn("Could not fetch user ID:", userIdResponse.status);
          }
        } catch (userIdError) {
          console.warn("Error fetching user ID:", userIdError);
          // Continue without user_id, it's not critical
        }

        // On success, show preview with form data (persisted in React state)
        // Form data has been maintained in state throughout the process
        setVerificationSuccess(true);
        setIsSubmitting(false);
      } catch (error) {
        console.error("Verification error:", error);

        // Handle different types of errors
        if (error.name === "AbortError") {
          setApiError(
            "Request timed out. Please check your connection and try again.",
          );
        } else if (error.message.includes("Failed to fetch")) {
          setApiError(
            "Network error: Unable to connect to the server. Please check your internet connection and try again.",
          );
        } else if (error.message.includes("CORS")) {
          setApiError(
            "Network error: CORS policy issue. Please contact support.",
          );
        } else {
          setApiError(`Error: ${error.message}`);
        }

        setIsSubmitting(false);
      }
    }
  };

  // Handle resend verification code - Updated to use the correct API endpoint
  const handleResendCode = async () => {
    if (countdown > 0) return; // Prevent multiple requests during countdown

    setIsSubmitting(true);
    setApiError("");
    setResendSuccess(false);

    try {
      // API call with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Updated to use the correct resend email OTP endpoint
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/resend-email-otp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: registeredEmail,
          }),
          signal: controller.signal,
          mode: "cors", // Explicitly set CORS mode
        },
      );

      clearTimeout(timeoutId);

      console.log("Resend OTP payload:", {
        email: registeredEmail,
      });

      // Check if response is OK
      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
          console.log("Error response:", errorData);
        } catch (e) {
          // If we can't parse JSON, use status text
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        }

        // Handle different error formats
        if (errorData.message) {
          throw new Error(errorData.message);
        } else if (errorData.error) {
          throw new Error(errorData.error);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error(
            `Server returned ${response.status}: ${response.statusText}`,
          );
        }
      }

      // Parse successful response
      const data = await response.json();
      console.log("Resend OTP API Response:", data); // Log the response for debugging

      // On success
      setResendSuccess(true);
      setIsSubmitting(false);

      // Start countdown for 60 seconds
      setCountdown(60);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Resend OTP error:", error);

      // Handle different types of errors
      if (error.name === "AbortError") {
        setApiError(
          "Request timed out. Please check your connection and try again.",
        );
      } else if (error.message.includes("Failed to fetch")) {
        setApiError(
          "Network error: Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else if (error.message.includes("CORS")) {
        setApiError(
          "Network error: CORS policy issue. Please contact support.",
        );
      } else {
        setApiError(`Error: ${error.message}`);
      }

      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="gallery-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">User Registration</h2>
          <ul className="breadcrumb-menu clearfix" type="none">
            <li>
              <a className="breadcrumb-home" href="/" data-discover="true">
                Home
              </a>
            </li>
            <li className="px-2">/</li>
            <li>
              <a className="breadcrumb-about" href="/" data-discover="true">
                Registration
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container box-shadow-reg">
        <main className="main">
          <section
            id="registration"
            className="registration section-registration section-gallery"
          >
            <div className="container" data-aos="fade-up" data-aos-delay="100">
              {currentStep === "registration" ? (
                // Registration Form
                submitSuccess ? (
                  <div className="text-center py-4">
                    <div className="success-icon mb-3">
                      <i
                        className="bi bi-check-circle-fill text-success"
                        style={{ fontSize: "3rem" }}
                      ></i>
                    </div>
                    <h4 className="text-success">Registration Successful!</h4>
                    <p className="text-muted">
                      Please check your email for verification code.
                    </p>
                    <ProgressBar animated now={100} className="mt-3" />
                  </div>
                ) : (
                  <div className="registration-form-container p-3">
                    <h3 className="mb-4">User Registration</h3>
                    <Form onSubmit={handlePreviewClick}>
                      {apiError && <Alert variant="danger">{apiError}</Alert>}

                      {/* User Type and Profile Image Section */}
                      <Row className="mb-4">
                        {/* Left Column - User Type and Team Name */}
                        <Col md={6}>
                          {/* User Type Selection */}
                          <Form.Group className="mb-4">
                            <Form.Label className="form-label-custom">
                              Registration Type{" "}
                              <span className="star">*</span>{" "}
                            </Form.Label>
                            <div className="d-flex">
                              <Form.Check
                                type="radio"
                                id="individual-type"
                                name="user_type"
                                label="Individual"
                                value="individual"
                                checked={formData.user_type === "individual"}
                                onChange={() =>
                                  handleUserTypeChange("individual")
                                }
                                className="me-4 user-type-option"
                              />
                              <Form.Check
                                type="radio"
                                id="team-type"
                                name="user_type"
                                label="Organization"
                                value="team"
                                checked={formData.user_type === "team"}
                                onChange={() => handleUserTypeChange("team")}
                                className="user-type-option"
                              />
                            </div>
                            {userTypeError && (
                              <div className="val-error mt-1 text-danger">
                                {userTypeError}
                              </div>
                            )}
                          </Form.Group>

                          {/* Team Name (only for team) */}
                          {formData.user_type === "team" && (
                            <Form.Group className="mb-3">
                              <Form.Label className="form-label-custom">
                                Team Name <span className="star">*</span>
                              </Form.Label>
                              <Form.Control
                                type="text"
                                name="team_name"
                                value={formData.team_name}
                                onChange={handleChange}
                                isInvalid={!!errors.team_name}
                                placeholder="Enter your organization/team name"
                                className="form-control-custom"
                              />
                              <Form.Control.Feedback
                                type="invalid"
                                className="val-error"
                              >
                                {errors.team_name}
                              </Form.Control.Feedback>
                            </Form.Group>
                          )}
                        </Col>

                        {/* Right Column - Profile Image Upload */}
                        <Col md={6}>
                          <Form.Group className="profile-image-upload">
                            <Form.Label className="form-label-custom">
                              Profile Image
                            </Form.Label>
                            <div className="d-flex flex-column align-items-center">
                              {formData.profile_image_preview ? (
                                <div className="position-relative">
                                  <Image
                                    src={formData.profile_image_preview}
                                    alt="Profile Preview"
                                    roundedCircle
                                    style={{
                                      width: "100px",
                                      height: "100px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0"
                                    onClick={removeProfileImage}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  className="upload-icon-container d-flex align-items-center justify-content-center"
                                  onClick={() => fileInputRef.current.click()}
                                  style={{
                                    cursor: "pointer",
                                    width: "150px",
                                    height: "150px",
                                    border: "2px dashed #ccc",
                                    borderRadius: "50%",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.borderColor =
                                      "#0d6efd")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.borderColor = "#ccc")
                                  }
                                >
                                  <i
                                    className="bi bi-cloud-arrow-up"
                                    style={{
                                      fontSize: "3rem",
                                      color: "#0d6efd",
                                    }}
                                  ></i>
                                </div>
                              )}
                              <Form.Control
                                type="file"
                                ref={fileInputRef}
                                name="profile_image"
                                onChange={handleProfileImageChange}
                                isInvalid={!!errors.profile_image}
                                accept="image/*"
                                className="profile-image-input d-none"
                              />
                              <Form.Text className="text-muted mt-2">
                                {formData.profile_image_preview
                                  ? "Click the image to change"
                                  : "Click the icon to upload a profile picture (JPEG, JPG, PNG, or GIF, max 1MB)"}
                              </Form.Text>
                              <Form.Control.Feedback
                                type="invalid"
                                className="val-error mt-2"
                              >
                                {errors.profile_image}
                              </Form.Control.Feedback>
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Full Name and Gender */}
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Full Name <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleChange}
                              isInvalid={!!errors.full_name}
                              placeholder="Enter your full name"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.full_name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Gender <span className="star">*</span>
                            </Form.Label>
                            <div className="d-flex">
                              <Form.Check
                                type="radio"
                                id="gender-male"
                                name="gender"
                                label="Male"
                                value="Male"
                                checked={formData.gender === "Male"}
                                onChange={handleChange}
                                className="me-3 gender-option"
                              />
                              <Form.Check
                                type="radio"
                                id="gender-female"
                                name="gender"
                                label="Female"
                                value="Female"
                                checked={formData.gender === "Female"}
                                onChange={handleChange}
                                className="me-3 gender-option"
                              />
                              <Form.Check
                                type="radio"
                                id="gender-other"
                                name="gender"
                                label="Other"
                                value="Other"
                                checked={formData.gender === "Other"}
                                onChange={handleChange}
                                className="gender-option"
                              />
                            </div>
                            {errors.gender && (
                              <div className="val-error mt-1 text-danger">
                                {errors.gender}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        <Col lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Email Address<span className="star">*</span>
                            </Form.Label>
                            <div className="d-flex align-items-center">
                              <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                                placeholder="Enter your email"
                                className="form-control-custom"
                              />
                              {checkingEmail && (
                                <div className="ms-2">
                                  <div
                                    className="spinner-border spinner-border-sm text-primary"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Checking...
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.email}
                            </Form.Control.Feedback>

                            {/* Display verification link for already registered but unverified email */}
                            {emailNotVerified && (
                              <Alert variant="warning" className="mt-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    This email is already registered but not
                                    verified.
                                  </div>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleDirectVerification}
                                  >
                                    Verify Email
                                  </Button>
                                </div>
                              </Alert>
                            )}

                            {/* Display already registered message below the email field */}
                            {alreadyRegisteredMessage && (
                              <Alert
                                variant={
                                  alreadyRegisteredMessage.includes(
                                    "not verified",
                                  )
                                    ? "warning"
                                    : "info"
                                }
                                className="mt-2"
                              >
                                {alreadyRegisteredMessage}
                                {alreadyRegisteredMessage.includes(
                                  "not verified",
                                ) && (
                                  <div className="mt-2">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() =>
                                        setCurrentStep("verification")
                                      }
                                    >
                                      Verify Email Now
                                    </Button>
                                  </div>
                                )}
                              </Alert>
                            )}
                          </Form.Group>
                        </Col>

                        <Col lg={6} md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Password <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              isInvalid={!!errors.password}
                              placeholder="Enter your password"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col lg={6} md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Confirm Password<span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              isInvalid={!!errors.confirmPassword}
                              placeholder="Confirm your password"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col lg={6} md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Talent Scope <span className="star">*</span>
                            </Form.Label>
                            <Dropdown autoClose="outside">
                              <Dropdown.Toggle
                                variant=""
                                id="talent-scope-dropdown"
                                className="dropdown-custom"
                              >
                                Select Your Talents
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {talentOptions.map((talent, index) => (
                                  <Dropdown.Item key={index} as="div">
                                    <Form.Check
                                      type="checkbox"
                                      id={`talent-${index}`}
                                      label={talent}
                                      checked={formData.talent_scope.includes(
                                        talent,
                                      )}
                                      onChange={() =>
                                        handleTalentScopeChange(talent)
                                      }
                                    />
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                            {formData.talent_scope.length > 0 && (
                              <div className="mt-2">
                                <small className="text-muted">
                                  Selected: {formData.talent_scope.join(", ")}
                                </small>
                              </div>
                            )}
                            {errors.talent_scope && (
                              <div className="val-error mt-1 text-danger">
                                {errors.talent_scope}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {/* Date of Birth (only for individual) */}
                        {formData.user_type === "individual" && (
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="form-label-custom">
                                Date of Birth <span className="star">*</span>
                              </Form.Label>
                              <Form.Control
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                isInvalid={!!errors.date_of_birth}
                                max={today} // Prevent future dates
                                className="form-control-custom"
                              />
                              <Form.Control.Feedback
                                type="invalid"
                                className="val-error"
                              >
                                {errors.date_of_birth}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        )}
                        <Col md={formData.user_type === "individual" ? 6 : 12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Phone Number<span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              isInvalid={!!errors.phone}
                              placeholder="Enter 10-digit phone number"
                              maxLength={10}
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.phone}
                            </Form.Control.Feedback>
                            {/* Display phone number already in use message below the phone field */}
                            {phoneAlreadyRegisteredMessage && (
                              <Alert variant="info" className="mt-2">
                                {phoneAlreadyRegisteredMessage}
                              </Alert>
                            )}
                          </Form.Group>
                        </Col>

                        <Col lg={6} md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Social Media Links{" "}
                            </Form.Label>
                            {formData.social_media_links.map((link, index) => (
                              <div key={index} className="d-flex mb-2">
                                <Form.Control
                                  type="url"
                                  value={link}
                                  onChange={(e) =>
                                    handleSocialMediaLinkChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  placeholder=" https://www.instagram.com/"
                                  className="form-control-custom"
                                />
                                {formData.social_media_links.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeSocialMediaLink(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline-primary link-add"
                              size="sm"
                              onClick={addSocialMediaLink}
                              className="mt-2"
                            >
                              + Add Another Link
                            </Button>
                            {errors.social_media_links &&
                              typeof errors.social_media_links === "string" && (
                                <div className="val-error mt-1 text-danger">
                                  {errors.social_media_links}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                        <Col lg={6} md={6} sm={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Additional Links
                            </Form.Label>
                            {formData.additional_links.map((link, index) => (
                              <div key={index} className="d-flex mb-2">
                                <Form.Control
                                  type="url"
                                  value={link}
                                  onChange={(e) =>
                                    handleAdditionalLinkChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  isInvalid={
                                    !!getLinkError("additional_links", index)
                                  }
                                  placeholder="https://example.com/additional"
                                  className="form-control-custom"
                                />
                                {formData.additional_links.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removeAdditionalLink(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline-primary link-add"
                              size="sm"
                              onClick={addAdditionalLink}
                              className="mt-2"
                            >
                              + Add Another Link
                            </Button>
                            {errors.additional_links &&
                              typeof errors.additional_links === "string" && (
                                <div className="val-error mt-1 text-danger">
                                  {errors.additional_links}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                        <Col lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Portfolio Links
                            </Form.Label>
                            {formData.portfolio_links.map((link, index) => (
                              <div key={index} className="d-flex mb-2">
                                <Form.Control
                                  type="url"
                                  value={link}
                                  onChange={(e) =>
                                    handlePortfolioLinkChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  isInvalid={
                                    !!getLinkError("portfolio_links", index)
                                  }
                                  placeholder="https://example.com/portfolio"
                                  className="form-control-custom"
                                />
                                {formData.portfolio_links.length > 1 && (
                                  <Button
                                    variant="outline-danger"
                                    className="ms-2"
                                    onClick={() => removePortfolioLink(index)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline-primary link-add"
                              size="sm"
                              onClick={addPortfolioLink}
                              className="mt-2"
                            >
                              + Add Another Link
                            </Button>
                            {errors.portfolio_links &&
                              typeof errors.portfolio_links === "string" && (
                                <div className="val-error mt-1 text-danger">
                                  {errors.portfolio_links}
                                </div>
                              )}
                          </Form.Group>
                        </Col>

                        <Col md={4} lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Country <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              isInvalid={!!errors.country}
                              placeholder="Country"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.country}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4} lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              State <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              isInvalid={!!errors.state}
                              placeholder="State"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.state}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={4} lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              City <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              isInvalid={!!errors.city}
                              placeholder="City"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.city}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Address <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              isInvalid={!!errors.address}
                              placeholder="Enter your full address"
                              className="form-control-custom"
                            />
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors.address}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Introduction <span className="star">*</span>
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="introduction"
                              value={formData.introduction}
                              onChange={handleChange}
                              isInvalid={!!errors.introduction}
                              placeholder={
                                formData.user_type === "individual"
                                  ? "Tell us about yourself, your experience, and what you hope to achieve..."
                                  : "Tell us about your organization, its mission, and what you hope to achieve..."
                              }
                              className="form-control-custom"
                            />
                            <div className="d-flex justify-content-between">
                              <Form.Control.Feedback
                                type="invalid"
                                className="val-error"
                              >
                                {errors.introduction}
                              </Form.Control.Feedback>
                              <small
                                className={`text-muted ${errors.introduction ? "mt-4" : ""}`}
                              >
                                {formData.introduction.length}/500 characters
                              </small>
                            </div>
                          </Form.Group>
                        </Col>
                        {/* Certificate Selection and Upload */}
                        <Col lg={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="form-label-custom">
                              Certificates
                            </Form.Label>
                            <Dropdown autoClose="outside">
                              <Dropdown.Toggle
                                variant=""
                                id="certificate-dropdown"
                                className="dropdown-custom"
                              >
                                Select Certificates to Upload
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {certificateOptions.map((option, index) => (
                                  <Dropdown.Item key={index} as="div">
                                    <Form.Check
                                      type="checkbox"
                                      id={`certificate-${index}`}
                                      label={option.label}
                                      checked={formData.selected_certificates.includes(
                                        option.id,
                                      )}
                                      onChange={() =>
                                        handleCertificateSelection(option.id)
                                      }
                                    />
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                            {formData.selected_certificates.length > 0 && (
                              <div className="mt-2">
                                <small className="text-muted">
                                  Selected:{" "}
                                  {formData.selected_certificates
                                    .map(
                                      (id) =>
                                        certificateOptions.find(
                                          (option) => option.id === id,
                                        )?.label,
                                    )
                                    .join(", ")}
                                </small>
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      {/* Certificate File Uploads */}
                      {formData.selected_certificates.map((certificateId) => {
                        const option = certificateOptions.find(
                          (opt) => opt.id === certificateId,
                        );
                        return (
                          <Form.Group key={certificateId} className="mb-3">
                            <Form.Label className="form-label-custom">
                              {option.label} *
                            </Form.Label>
                            <div className="d-flex align-items-center">
                              <Form.Control
                                type="file"
                                ref={certificateFileRefs[certificateId]}
                                onChange={(e) =>
                                  handleCertificateFileChange(certificateId, e)
                                }
                                isInvalid={!!errors[certificateId]}
                                accept="image/*,application/pdf"
                                className="me-2 form-control-custom"
                              />
                              {formData[certificateId] && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    removeCertificateFile(certificateId)
                                  }
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <Form.Text className="text-muted">
                              Upload certificate file (JPEG, JPG, PNG, or PDF,
                              max 2MB)
                            </Form.Text>
                            <Form.Control.Feedback
                              type="invalid"
                              className="val-error"
                            >
                              {errors[certificateId]}
                            </Form.Control.Feedback>
                          </Form.Group>
                        );
                      })}

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          id="agree-terms"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                          isInvalid={!!errors.agreeTerms}
                          label={
                            <span>
                              I agree with the{" "}
                              <a
                                href="/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-underline"
                              >
                                Terms and Conditions
                              </a>{" "}
                              and{" "}
                              <a
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-underline"
                              >
                                Privacy Policy
                              </a>
                            </span>
                          }
                          className="terms-checkbox"
                        />
                        <Form.Control.Feedback
                          type="invalid"
                          className="val-error"
                        >
                          {errors.agreeTerms}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting || submitSuccess}
                          className="btn-custom-primary"
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                )
              ) : // Email Verification Form
              verificationSuccess ? (
                // Show Registration Preview with Download/Print buttons after successful verification
                <div className="preview-container">
                  <div
                    className="alert alert-success mb-4 no-print"
                    role="alert"
                  >
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>Email Verified Successfully!</strong> Your
                    registration is complete. You can now download or print your
                    registration preview.
                  </div>

                  <RegistrationPreview
                    formData={formData}
                    certificateUrls={certificateUrls}
                    alreadyRegisteredMessage={alreadyRegisteredMessage}
                    phoneAlreadyRegisteredMessage={
                      phoneAlreadyRegisteredMessage
                    }
                    isVerified={true} // User is verified
                    userId={userId}
                  />

                  <div className="preview-actions mt-4 text-end no-print">
                    <Button
                      variant="outline-secondary"
                      onClick={handlePrintFallback}
                      className="me-2 no-print"
                    >
                      <i className="bi bi-printer me-2"></i>Print Preview
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handlePrintPreview}
                      className="btn-custom-primary no-print"
                    >
                      <i className="bi bi-download me-2"></i>Download as PDF
                    </Button>
                  </div>

                  <div className="mt-4 text-center no-print">
                    <Button
                      variant="secondary" className="btn-go-back-btn"
                      onClick={handleRegistrationComplete}
                    >
                      {fromEvent ? "Continue to Events" : "Go to Login"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="verification-form-container p-4">
                  <h3 className="mb-4 text-center">Email Verification</h3>
                  <Form onSubmit={handleVerificationSubmit}>
                    {apiError && <Alert variant="danger">{apiError}</Alert>}
                    {resendSuccess && (
                      <Alert variant="success">
                        Verification code sent successfully!
                      </Alert>
                    )}

                    <div className="text-center mb-4">
                      <div className="verification-icon mb-3">
                        <i
                          className="bi bi-envelope-check"
                          style={{ fontSize: "4rem", color: "#0d6efd" }}
                        ></i>
                      </div>
                      <h4 className="mb-3">Verify Your Email</h4>
                      <p className="text-muted">
                        We've sent a verification code to{" "}
                        <strong>{registeredEmail}</strong>
                      </p>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="form-label-custom">
                        Verification Code *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        isInvalid={!!errors.verificationCode}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center form-control-custom verification-code-input"
                        style={{ fontSize: "1.5rem", letterSpacing: "0.5rem" }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        className="val-error"
                      >
                        {errors.verificationCode}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="text-center mb-4">
                      <p className="text-muted">
                        Didn't receive the code?{" "}
                        <Button
                          variant="link"
                          className="p-0 resend-code-btn"
                          onClick={handleResendCode}
                          disabled={isSubmitting || countdown > 0}
                        >
                          {countdown > 0
                            ? `Resend Code (${countdown}s)`
                            : "Resend Code"}
                        </Button>
                      </p>
                    </div>

                    <div className="d-flex justify-content-between">
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentStep("registration")}
                        className="btn-custom-secondary"
                      >
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleVerificationSubmit}
                        disabled={isSubmitting || verificationSuccess}
                        className="btn-custom-primary"
                      >
                        {isSubmitting ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Registration;
