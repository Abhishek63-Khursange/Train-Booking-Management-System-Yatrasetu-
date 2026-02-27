import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [gender, setGender] = useState("Male");
  const [showOtpField, setShowOtpField] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Optimized handlers with useCallback
  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
    setUsernameError("");
  }, []);

  const handleFullnameChange = useCallback((e) => {
    setFullname(e.target.value);
    setFullnameError("");
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setEmailError("");
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setPhoneNumber(e.target.value);
    setPhoneError("");
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    setPasswordError("");
  }, []);

  const handleOtpChange = useCallback((e) => {
    setOtp(e.target.value);
    setOtpError("");
  }, []);



  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;

    // Username validation
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      isValid = false;
    }

    // Full name validation
    if (fullname.length < 2) {
      setFullnameError("Full name must be at least 2 characters long");
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullname)) {
      setFullnameError("Full name can only contain letters and spaces");
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Phone number must be 10 digits");
      isValid = false;
    }

    // Password validation
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      isValid = false;
    } else if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter");
      isValid = false;
    } else if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      isValid = false;
    } else if (!/(?=.*\d)/.test(password)) {
      setPasswordError("Password must contain at least one number");
      isValid = false;
    } else if (!/(?=.*[!@#$%^&*])/.test(password)) {
      setPasswordError("Password must contain at least one special character (!@#$%^&*)");
      isValid = false;
    }

    // OTP validation
    if (showOtpField && otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      isValid = false;
    }

    return isValid;
  };

  const sendOtp = async () => {
    setError("");
    setEmailError("");
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "OTP sent to your email!");
        setShowOtpField(true);
        setIsOtpSent(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setOtpError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const userData = {
      username,
      fullname,
      email,
      phoneNumber: "+91" + phoneNumber,
      password,
      gender,
      otp
    };

    try {
      const response = await fetch("/verify-otp-and-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Registration successful!");
        // Clear form
        setUsername("");
        setFullname("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setOtp("");
        setShowOtpField(false);
        setIsOtpSent(false);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const data = await response.json();
        if (data.error && data.error.toLowerCase().includes("otp")) {
          setOtpError(data.error);
        } else if (data.error && data.error.toLowerCase().includes("username")) {
          setUsernameError(data.error);
        } else if (data.error && data.error.toLowerCase().includes("email")) {
          setEmailError(data.error);
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div
      className="login-background"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        minHeight: '100vh',

        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >

      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
      <form onSubmit={verifyOtpAndRegister} className="login-box p-4">
        <div className="text-center mb-3">
          <i className="fa fa-user-plus fa-3x"></i>
        </div>
        <h3 className="mb-3 text-center">Register</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="mb-3">
          <label><i className="fa fa-user"></i> Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            className={`form-control ${usernameError ? 'is-invalid' : ''}`}
            required
            disabled={isOtpSent}
          />
          {usernameError && <div className="invalid-feedback">{usernameError}</div>}
        </div>
        
        <div className="mb-3">
          <label><i className="fa fa-id-card"></i> Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={handleFullnameChange}
            className={`form-control ${fullnameError ? 'is-invalid' : ''}`}
            required
            disabled={isOtpSent}
          />
          {fullnameError && <div className="invalid-feedback">{fullnameError}</div>}
        </div>
        
        <div className="mb-3">
          <label><i className="fa fa-envelope"></i> Email</label>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className={`form-control ${emailError ? 'is-invalid' : ''}`}
              required
              disabled={isOtpSent}
            />
            {!isOtpSent && (
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={sendOtp}
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            )}
          </div>
          {emailError && <div className="invalid-feedback d-block">{emailError}</div>}
        </div>
        
        <div className="mb-3">
          <label><i className="fa fa-phone"></i> Phone Number</label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={`form-control ${phoneError ? 'is-invalid' : ''}`}
              required
              disabled={isOtpSent}
            />
          </div>
          {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
        </div>
        
        <div className="mb-3">
          <label><i className="fa fa-venus-mars"></i> Gender</label>
          <select
            className="form-control"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            disabled={isOtpSent}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label><i className="fa fa-lock"></i> Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            required
            disabled={isOtpSent}
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>
        
        {showOtpField && (
          <div className="mb-3">
            <label><i className="fa fa-key"></i> Enter OTP</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={handleOtpChange}
              className={`form-control ${otpError ? 'is-invalid' : ''}`}
              required
              maxLength={6}
            />
            {otpError && <div className="invalid-feedback">{otpError}</div>}
            <small className="text-muted">OTP sent to your email. Valid for 5 minutes.</small>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary w-100" 
          disabled={isLoading || !isOtpSent}
        >
          {isLoading ? 'Processing...' : 'Verify & Register'}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;
