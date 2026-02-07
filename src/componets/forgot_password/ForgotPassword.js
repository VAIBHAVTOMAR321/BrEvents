import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginImg from '../../assets/images/hero-area.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // --- State for managing the multi-step process ---
  const [step, setStep] = useState(1); // 1: Email, 2: Verify OTP, 3: Reset Password

  // --- State for all steps ---
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Global State ---
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0); // Timer in seconds

  // --- API Handlers ---

  // Step 1: Handle submitting email to send OTP
  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    setIsLoading(true);

    try {
      console.log("Step 1: Sending OTP to email", email);
      const otpResponse = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reset-password/email-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }
      );

      const otpData = await otpResponse.json();
      console.log("Send OTP API response:", { status: otpResponse.status, data: otpData });

      if (otpResponse.ok) {
        setSuccessMessage("A verification code has been sent to your email.");
        setStep(2); // Move to the OTP verification step
        setResendTimer(120); // Set 2-minute timer (120 seconds)
      } else {
        throw new Error(otpData.message || "Failed to send verification code. Please check your email.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle verifying the OTP code
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log("Step 2: Verifying OTP", { email, otpCode });
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/verify-email/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            code: otpCode,
          }),
        }
      );

      const data = await response.json();
      console.log("Verify OTP API response:", { status: response.status, data });

      if (response.ok) {
        setSuccessMessage("OTP verified successfully! You can now reset your password.");
        setStep(3); // Move to password reset step
      } else {
        throw new Error(data.message || "Invalid or expired code. Please try again.");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle resetting password after OTP verification
  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Step 3: Resetting password", { email, newPasswordLength: newPassword.length });
      const resetResponse = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reset-password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            new_password: newPassword,
          }),
        }
      );

      const resetData = await resetResponse.json();
      console.log("Reset password API response:", { status: resetResponse.status, data: resetData });

      if (!resetResponse.ok) {
        throw new Error(resetData.message || "Failed to reset password. Please check your details.");
      }

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helper Function to Resend OTP ---
  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      return; // Do nothing if timer is still active
    }

    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      console.log("Resending OTP to email", email);
      const response = await fetch(
        "https://mahadevaaya.com/eventmanagement/eventmanagement_backend/api/reset-password/email-otp/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }
      );

      const data = await response.json();
      console.log("Resend OTP API response:", { status: response.status, data });

      if (response.ok) {
        setSuccessMessage("A new verification code has been sent to your email.");
        // Set 2-minute timer (120 seconds)
        setResendTimer(120);
      } else {
        throw new Error(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Timer countdown effect
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);


  // --- Helper Functions ---
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const renderStep = () => {
    const errorDisplay = error && <div className="alert alert-danger" role="alert">{error}</div>;
    const successDisplay = successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>;

    switch (step) {
      case 1: // Enter Email
        return (
          <>
            <div className='Login-page'>
              <h1 className="pb-4">Reset Password</h1>
              <p className="text-muted">Enter your email to receive a verification code.</p>
            </div>
            {errorDisplay}
            <form onSubmit={handleSubmitEmail}>
              <div className="mb-3">
                <label className="br-label form-label">Email Address <span className="br-span-star">*</span></label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="text-center mt-4">
                <button type="submit" className="w-100 trilok-submit-btn btn btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...</> : 'Send Verification Code'}
                </button>
              </div>
            </form>
          </>
        );

      case 2: // Verify OTP
        return (
          <>
            <div className='Login-page'>
              <h1 className="pb-4">Verify Your Code</h1>
              <p className="text-muted">A code has been sent to <strong>{email}</strong></p>
            </div>
            {successDisplay}
            {errorDisplay}
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3">
                <label className="br-label form-label">Verification Code <span className="br-span-star">*</span></label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="form-control"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="text-center mt-4">
                <button type="submit" className="w-100 trilok-submit-btn btn btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...</> : 'Verify Code'}
                </button>
              </div>
              <div className="text-center mt-3">
                <button 
                  type="button" 
                  className="btn btn-link p-0" 
                  onClick={handleResendOtp} 
                  disabled={isLoading || resendTimer > 0}
                >
                  {resendTimer > 0 
                    ? `Resend OTP in ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')}`
                    : "Didn't receive the code? Resend"
                  }
                </button>
              </div>
            </form>
          </>
        );

      case 3: // Reset Password
        return (
          <>
            <div className='Login-page'>
              <h1 className="pb-4">Set New Password</h1>
              <p className="text-muted">Enter your new password.</p>
            </div>
            {successDisplay}
            {errorDisplay}
            <form onSubmit={handleResetPassword}>
              <div className="mb-3">
                <label className="br-label form-label">New Password <span className="br-span-star">*</span></label>
                <div className="password-wrapper" style={{ position: 'relative' }}>
                  <input
                    placeholder="Enter new password"
                    className="form-control"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ paddingRight: '40px' }}
                  />
                  <span className="ShowPassword-wrapper" onClick={toggleNewPasswordVisibility} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg" style={{ color: '#6c757d' }}><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="br-label form-label">Confirm New Password <span className="br-span-star">*</span></label>
                <div className="password-wrapper" style={{ position: 'relative' }}>
                  <input
                    placeholder="Confirm new password"
                    className="form-control"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ paddingRight: '40px' }}
                  />
                  <span className="ShowPassword-wrapper" onClick={toggleConfirmPasswordVisibility} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg" style={{ color: '#6c757d' }}><path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"></path></svg>
                  </span>
                </div>
              </div>
              <div className="text-center mt-4">
                <button type="submit" className="w-100 trilok-submit-btn btn btn-primary" disabled={isLoading}>
                  {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="login-box">
      <div className="dashboard-body container">
        <div className="ay-box-container">
          <div className="br-registration-heading">
            <div className="mt-3 row">
              <div className="d-flex justify-content-center align-items-center login-img col-lg-6 col-md-6 col-sm-12">
                <img src={LoginImg} className="img-fluid" alt="Login Visual" />
              </div>
              <div className="p-4 col-lg-6 col-md-6 col-sm-12">
                {renderStep()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;