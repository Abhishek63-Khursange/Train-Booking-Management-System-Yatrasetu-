import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function BasicExample() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))?.role || "";
    } catch {
      return "";
    }
  });

  // Update user/role when location changes
  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user'));
      setUser(parsed);
      setRole(parsed?.role || "");
    } catch {
      setUser(null);
      setRole("");
    }
  }, [location]);

  const handleLogout = () => {
    setUser(null);
    setRole("");
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    navigate('/login');
  };

  const displayName = user?.username?.split('@')[0] || "Guest";
  const isAdmin = role.toUpperCase() === "ADMIN";

  return (
    <Navbar expand="lg" className="bg-dark py-2 px-3" data-bs-theme="dark">
      <Container fluid>
        <Navbar.Brand as={Link} to="/home" className="me-4">
          <img
            src="/IRCTC-Black.png"
            alt="IRCTC Logo"
            style={{
              height: 32,
              marginRight: 8,
              borderRadius: 4,
              verticalAlign: 'middle',
              background: '#fff',
              padding: 2,
            }}
          />
          IRCTC
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            {user && (
              <>
                <Nav.Link as={Link} to="/home" className="px-2">Home</Nav.Link>
                <Nav.Link as={Link} to="/my-bookings" className="px-2 text-primary">My Bookings</Nav.Link>
                <Nav.Link as={Link} to="/about" className="px-2">About</Nav.Link>
                <Nav.Link as={Link} to="/contact" className="px-2">Contact Us</Nav.Link>
                <Nav.Link as={Link} to="/pnr-lookup" className="px-2">PNR Lookup</Nav.Link>
                <Nav.Link as={Link} to="/cancel" className="px-2">Cancel Ticket</Nav.Link>
                <Nav.Link as={Link} to="/support" className="px-2">My Support</Nav.Link>
              </>
            )}

            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/add-train" className="px-2 text-warning">Add Train</Nav.Link>
                <Nav.Link as={Link} to="/train-detail" className="px-2 text-info">Train Details</Nav.Link>
                <Nav.Link as={Link} to="/helpdesk" className="px-2 text-success">Help Desk</Nav.Link>
              </>
            )}

            {!user ? (
              <>
                <Nav.Link as={Link} to="/login" className="px-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="px-2">Register</Nav.Link>
              </>
            ) : (
              <>
                <span className="navbar-user-welcome px-2">Welcome, <b>{displayName}</b> ({role})!</span>
                <Nav.Link as="button" onClick={handleLogout} className="px-2">Logout</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .navbar {
          min-height: 60px;
        }
        .navbar-brand {
          font-size: 1.2rem;
          font-weight: 600;
        }
        .nav-link {
          font-size: 0.95rem;
          white-space: nowrap;
        }
        .navbar-user-welcome {
          color: #ffc107;
          font-size: 0.95rem;
        }
        @media (max-width: 991px) {
          .navbar-collapse {
            padding: 1rem 0;
          }
          .nav-link {
            padding: 0.5rem 0 !important;
          }
          .navbar-user-welcome {
            padding: 0.5rem 0;
          }
        }
      `}</style>
    </Navbar>
  );
}

export default BasicExample;
