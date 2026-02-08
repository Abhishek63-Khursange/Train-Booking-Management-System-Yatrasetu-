import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import "../App.css";

export default function Login() {
  console.log("Login component rendering...");
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      // Check if there's a pending booking in session storage
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        // Redirect back to the original page with the pending booking data
        const bookingData = JSON.parse(pendingBooking);
        navigate(bookingData.redirectUrl || '/trains', { 
          state: { ...bookingData } 
        });
        // Clear the pending booking from session storage
        sessionStorage.removeItem('pendingBooking');
      } else {
        // Default redirect to home if no pending booking
        navigate(location.state?.from || "/home");
      }
    }
  }, [navigate, location.state]);

  // Check for registration success message
  useEffect(() => {
    if (location.state?.fromRegister) {
      toast.success("Registration successful! Please login.");
      // Clear the state to prevent the toast from showing again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      valid = false;
    }

    return valid;
  };

 const submit = async (e) => {
  e.preventDefault();
  setError("");
  if (!validate()) return;

  setLoading(true);
  try {
    const res = await axios.post(
      "/login",
      { email, password },
      { withCredentials: true }
    );

    if (res.data && res.data.username && res.data.token) {
      // Save user info, including the token, to localStorage
      const user = {
        id: res.data.id, // Make sure the backend includes the user ID in the response
        email: res.data.email,
        username: res.data.username,
        role: res.data.role,
        token: res.data.token,
      };
      
      console.log('User data to be stored:', user); // Debug log
      localStorage.setItem("user", JSON.stringify(user));

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Check for pending booking in session storage
      const pendingBooking = sessionStorage.getItem('pendingBooking');
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          // Redirect back to the original page with the pending booking data
          navigate(bookingData.redirectUrl || '/trains', { 
            state: { ...bookingData },
            replace: true
          });
          // Clear the pending booking from session storage
          sessionStorage.removeItem('pendingBooking');
          return;
        } catch (error) {
          console.error('Error processing pending booking:', error);
        }
      }

      // Default redirect
      const from = location.state?.from || "/home";
      navigate(from, { replace: true });
    }
  } catch (err) {
    setError("");
    setEmailError("");
    setPasswordError("");
    if (err.response) {
      let msg = "";
      if (typeof err.response.data === "string") {
        msg = err.response.data.toLowerCase();
      } else if (
        typeof err.response.data === "object" &&
        err.response.data.error
      ) {
        msg = err.response.data.error.toLowerCase();
      }
      if (msg.includes("password") && msg.includes("email")) {
        setEmailError("Email and password are invalid");
        setPasswordError("Email and password are invalid");
      } else if (msg.includes("password")) {
        setPasswordError("Password is incorrect");
      } else if (msg.includes("email")) {
        setEmailError("Email is not registered");
      } else {
        setEmailError("Email and password are invalid");
        setPasswordError("Email and password are invalid");
      }
    } else {
      setEmailError("Email and password are invalid");
      setPasswordError("Email and password are invalid");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',

      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      padding: '20px'
    }}>


      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <form onSubmit={submit} className="login-box p-4" style={{
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        border: '1px solid #e0e0e0',
        borderRadius: '14px',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.13)'
      }}>
        <h3 className="text-center mb-3">
          <i className="fa-solid fa-user-circle me-2"></i>Login
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label>
            <i className="fa-solid fa-envelope me-2"></i>Email
          </label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className={`form-control ${emailError ? "is-invalid" : ""}`}
            required
          />
          {emailError && (
            <div className="invalid-feedback">
              {emailError}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label>
            <i className="fa-solid fa-lock me-2"></i>Password
          </label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            className={`form-control ${passwordError ? "is-invalid" : ""}`}
            required
          />
          {passwordError && (
            <div className="invalid-feedback">
              {passwordError}
            </div>
          )}
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="rememberMe">
            Remember me
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin me-2"></i>Logging in...
            </>
          ) : (
            <>
              <i className="fa-solid fa-right-to-bracket me-2"></i>Login
            </>
          )}
        </button>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don't have an account?{" "}
            <a href="/register" className="text-primary text-decoration-none">
              Register here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}