import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [gender, setGender] = useState("Male");
  const [role, setRole] = useState("USER");



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

    return isValid;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setUsernameError("");
    setEmailError("");
    setFullnameError("");
    setPhoneError("");
    setPasswordError("");


    if (!validateForm()) {
      return;
    }

    const user = {
      username,
      fullname,
      email,
      phoneNumber: "+91" + phoneNumber,
      password,
      gender,
      role: role
    };

    // Send to backend
    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        toast.success("Registration successful!");
        setUsername("");
        setFullname("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        const data = await response.json();
        console.error("Registration error:", data);
        if (data.error && data.error.toLowerCase().includes("username")) {
          setUsernameError(data.error);
        } else if (data.error && data.error.toLowerCase().includes("email")) {
          setEmailError(data.error);
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("Server error. Please try again later.");
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
      <form onSubmit={submit} className="login-box p-4">
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
            onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
            className={`form-control ${usernameError ? 'is-invalid' : ''}`}
            required
          />
          {usernameError && <div className="invalid-feedback">{usernameError}</div>}
        </div>
        <div className="mb-3">
          <label><i className="fa fa-id-card"></i> Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => { setFullname(e.target.value); setFullnameError(""); }}
            className={`form-control ${fullnameError ? 'is-invalid' : ''}`}
            required
          />
          {fullnameError && <div className="invalid-feedback">{fullnameError}</div>}
        </div>
        <div className="mb-3">
          <label><i className="fa fa-envelope"></i> Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            className={`form-control ${emailError ? 'is-invalid' : ''}`}
            required
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
        <div className="mb-3">
          <label><i className="fa fa-phone"></i> Phone Number</label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(""); }}
              className={`form-control ${phoneError ? 'is-invalid' : ''}`}
              required
            />
          </div>
          {phoneError && <div className="invalid-feedback d-block">{phoneError}</div>}
        </div>
        <div className="mb-3">
          <label><i className="fa fa-user-shield"></i> Role</label>
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="mb-3">
          <label><i className="fa fa-venus-mars"></i> Gender</label>
          <select
            className="form-control"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
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
            onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            required
          />
          {passwordError && <div className="invalid-feedback">{passwordError}</div>}
        </div>
        <button className="btn btn-primary w-100"><i className="fa fa-user-plus"></i> Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;
