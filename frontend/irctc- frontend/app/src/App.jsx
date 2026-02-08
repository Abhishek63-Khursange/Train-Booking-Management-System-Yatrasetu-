import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

import TrainSearch from './pages/TrainSearch';
import TrainSelection from './pages/TrainSelection';
import Booking from './pages/Booking'; // My Bookings page
import AdminDashboard from './pages/AdminDashboard'; // Admin dashboard
import PnrLookup from './pages/PnrLookup';
import BookingConfirmation from './pages/BookingConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import CancelTicket from './pages/CancelTicket';
import AddTrain from './pages/AddTrain';
import UpdateTrain from './pages/UpdateTrain';
import TrainManagement from './pages/TrainManagement';
import HelpDeskDashboard from './components/helpdesk/HelpDeskDashboard';
import SupportDashboard from './pages/SupportDashboard';
import SupportForm from './pages/SupportForm';

// Stylesheets
import './pages/Home.css';
import './pages/Booking.css';

// Public route wrapper - redirect logged in users to /home
function PublicRoute({ children }) {
  const user = localStorage.getItem('user');
  return user ? <Navigate to="/home" /> : children;
}

function App() {
  const isAdmin = localStorage.getItem('isAdmin');
  return (
    <BrowserRouter>
      <ToastContainer />
      <Navbar />
      <main className="container mt-4 flex-shrink-0">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/home" element={<ProtectedRoute><TrainSearch /></ProtectedRoute>} />
          <Route path="/train-search" element={<ProtectedRoute><TrainSearch /></ProtectedRoute>} />
          <Route path="/train-selection" element={<ProtectedRoute><TrainSelection /></ProtectedRoute>} />
          <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/booking/success" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/cancel" element={<ProtectedRoute><CancelTicket /></ProtectedRoute>} />
          <Route path="/pnr-lookup" element={<ProtectedRoute><PnrLookup /></ProtectedRoute>} />
          <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/helpdesk" element={<ProtectedRoute><HelpDeskDashboard /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportDashboard /></ProtectedRoute>} />
          <Route path="/support/new" element={<ProtectedRoute><SupportForm /></ProtectedRoute>} />
          <Route path="/support/:ticketId" element={<ProtectedRoute><SupportForm /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/add-train" element={<ProtectedRoute><AddTrain /></ProtectedRoute>} />
          <Route path="/update-train/:trainId" element={<ProtectedRoute><UpdateTrain /></ProtectedRoute>} />
          <Route path="/train-detail" element={<ProtectedRoute><TrainManagement /></ProtectedRoute>} />

          {/* Redirect any other paths to home */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

