import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { FaChair, FaChevronRight, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
import api from '../api/axiosConfig';
import PassengerDetailsForm from '../components/PassengerDetailsForm';
import TrainDetails from '../components/TrainDetails';
import SeatLayout from '../components/SeatLayout';

const getCoachTypeName = (type) => {
  const types = {
    'SLEEPER': 'Sleeper Class',
    'AC_3_TIER': 'AC 3 Tier',
    'AC_2_TIER': 'AC 2 Tier',
    'FIRST_CLASS': 'First Class',
    'CHAIR_CAR': 'Chair Car'
  };
  return types[type] || type;
};

const TrainSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { train, searchParams } = location.state || {};

  // Early return if essential data is missing
  if (!train || !train.id) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <Alert.Heading>Error: Incomplete Train Data</Alert.Heading>
          <p>Could not retrieve train details. Please go back and start a new search.</p>
          <hr />
          <Button variant="outline-danger" onClick={() => navigate('/train-search')}>
            <FaArrowLeft className="me-2" /> Go Back to Search
          </Button>
        </Alert>
      </Container>
    );
  }

  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [coachDetails, setCoachDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [totalFare, setTotalFare] = useState(0);
  
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [error, setError] = useState('');
  
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch coaches on component mount
  useEffect(() => {
    const fetchCoaches = async () => {
      if (!train.id) return;
      setLoadingCoaches(true);
      setError('');
      try {
        const response = await api.get(`/trains/${train.id}/coaches`);
        setCoaches(response.data);
      } catch (err) {
        setError('Failed to fetch coaches. Please try again later.');
        console.error('Error fetching coaches:', err);
      } finally {
        setLoadingCoaches(false);
      }
    };
    fetchCoaches();
  }, [train.id]);

  // Fetch seats when a coach is selected
  useEffect(() => {
    const fetchCoachSeats = async (coachId) => {
      if (!coachId) return;
      setLoadingSeats(true);
      setError('');
      try {
        // Assuming the coach object contains the full seat list
        const response = await api.get(`/trains/coaches/${coachId}/seats`);
        const seats = response.data;
        
        // Filter out already booked seats
        const availableSeats = seats.filter(seat => seat.available && !seat.booked);
        setCoachDetails({ seats: availableSeats });
        
        console.log(`Coach ${coachId} seats loaded:`, {
          total: seats.length,
          available: availableSeats.length,
          booked: seats.length - availableSeats.length
        });
      } catch (err) {
        setError('Failed to load seat layout. Please select another coach or try again.');
        console.error('Error fetching coach details:', err);
      } finally {
        setLoadingSeats(false);
      }
    };

    if (selectedCoach) {
      fetchCoachSeats(selectedCoach.id);
    }
  }, [selectedCoach]);

  // Calculate total fare based on the number of selected seats.
  useEffect(() => {
    if (selectedCoach) {
      setTotalFare(selectedCoach.fare * selectedSeats.length);
    }
  }, [selectedCoach, selectedSeats]);

  const handleCoachSelect = (coach) => {
    setSelectedCoach(coach);
    setSelectedSeats([]); // Reset seats on new coach selection
    setError('');
  };

  const handleSeatSelect = (newSelectedSeats) => {
    // Allow selecting up to 6 seats.
    if (newSelectedSeats.length > 6) {
      setError(`You can select a maximum of 6 seats.`);
      return;
    }
    setSelectedSeats(newSelectedSeats);
    setError('');
  };

  const handleProceedToPassengers = () => {
    // Initialize passenger details based on the number of selected seats
    setPassengerDetails(
      Array.from({ length: selectedSeats.length }, () => ({
        name: '',
        age: '',
        gender: '',
      }))
    );
    setShowPassengerForm(true);
  };

  const handlePassengerInputChange = (index, field, value) => {
    const updatedPassengers = [...passengerDetails];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengerDetails(updatedPassengers);

    // Clear validation error for the specific field being changed
    const errorKey = `passenger-${index}-${field}`;
    if (formErrors[errorKey]) {
        const newErrors = { ...formErrors };
        delete newErrors[errorKey];
        setFormErrors(newErrors);
    }
  };

  const validatePassengerDetails = () => {
    const errors = {};
    passengerDetails.forEach((p, i) => {
      if (!p.name.trim() || p.name.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(p.name)) {
        errors[`passenger-${i}-name`] = 'Name must be at least 2 characters and contain only letters.';
      }
      if (!p.age || isNaN(p.age) || p.age < 1 || p.age > 120) {
        errors[`passenger-${i}-age`] = 'Please enter a valid age (1-120).';
      }
      if (!p.gender) {
        errors[`passenger-${i}-gender`] = 'Please select a gender.';
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validatePassengerDetails()) {
      setShowPassengerForm(false);
      setShowPaymentModal(true);
    }
  };

  const processBooking = async () => {
    if (!validatePassengerDetails()) {
      return;
    }

    setProcessingPayment(true);
    setError('');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      setError('Please log in to continue with the booking.');
      setProcessingPayment(false);
      return;
    }

    console.log('Creating booking in database...');
    
    // First, create the booking in your database
    // Assign each selected seat to a passenger
    const passengersWithSeats = passengerDetails.map((passenger, index) => ({
      ...passenger,
      seatId: selectedSeats[index], // Required by PassengerDto
    }));

    const bookingData = {
      trainId: train.id,
      coachId: selectedCoach.id,
      fromStation: searchParams.source,
      toStation: searchParams.destination,
      travelDate: searchParams.date,
      passengers: passengersWithSeats, // Passengers with individual seatId
      seatIds: selectedSeats, // Top-level seatIds array required by SeatBookingRequest
      totalFare: totalFare,
      status: 'pending_payment',
    };
    
    // Log the complete request data
    console.log('=== BOOKING REQUEST DATA ===');
    console.log('Endpoint: /api/bookings/book');
    console.log('Request Payload:', JSON.stringify(bookingData, null, 2));
    console.log('===========================');
    
    try {
      // Get the current user and token
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;
      
      // Debug log user information
      console.log('Current user data:', {
        userId: user?.id,
        userRole: user?.role,
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      
      if (!token) {
        console.error('No authentication token found. User needs to log in.');
        navigate('/login', { state: { from: location.pathname } });
        throw new Error('Authentication required. Please log in again.');
      }
      
      console.log('Sending booking request to:', '/api/bookings/book');
      console.log('Request payload:', JSON.stringify(bookingData, null, 2));
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      // Debug: Check user permissions with the backend
      try {
        const userCheck = await api.get('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('User permissions check:', userCheck.data);
      } catch (checkError) {
        console.error('Error checking user permissions:', checkError);
        if (checkError.response?.status === 403) {
          throw new Error('You do not have permission to make bookings. Please contact support.');
        }
      }
      
      // Make the booking request with explicit headers
      const bookingResponse = await api.post('/api/bookings/book', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Raw booking response:', bookingResponse);
      
      if (!bookingResponse || !bookingResponse.data) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Booking created successfully. Response data:', bookingResponse.data);
      
      // Extract booking ID from response
      const bookingId = bookingResponse.data?.id || bookingResponse.data?.bookingId;
      
      console.log('Full booking response:', bookingResponse.data);
      console.log('Extracted booking ID:', bookingId);
      
      if (!bookingId) {
        console.error('No booking ID in response. Full response:', bookingResponse.data);
        throw new Error('Failed to create booking: No booking ID in response');
      }

      console.log('Booking created with ID:', bookingId);

      // Get the base URL for the current environment
      const baseUrl = window.location.origin;
      
      // Prepare the payment request data
      const paymentRequestData = {
        bookingId: bookingId,
        description: `Ticket for ${train.name} (${train.trainNumber})`,
        amount: Math.round(totalFare * 100), // Ensure amount is an integer
        currency: 'inr',
        success_url: `${baseUrl}/booking/confirmation?booking_id=${bookingId}&payment_success=true`,
        cancel_url: `${baseUrl}/booking/cancel?booking_id=${bookingId}`,
        metadata: {
          bookingId: bookingId,
          trainId: train.id,
          coachId: selectedCoach.id,
          seatIds: selectedSeats.join(','),
          totalFare: totalFare,
          userId: user.id
        },
      };

      console.log('Sending payment request:', {
        url: '/api/v1/payment/checkout',
        data: paymentRequestData
      });

      const checkoutResponse = await api.post('/api/v1/payment/checkout', paymentRequestData);
      
      console.log('Payment response:', {
        status: checkoutResponse.status,
        data: checkoutResponse.data
      });

      const { url } = checkoutResponse.data;

      // Save booking ID to localStorage in case of page refresh
      localStorage.setItem('pendingBookingId', bookingId);

      // Redirect to Stripe's payment page
      if (url) {
        window.location.href = url;
      } else {
        setError('Could not retrieve the payment link. Please try again.');
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error('Full error object:', error);
      
      let errorMessage = 'An unexpected error occurred while processing your request.';
      
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.status === 403) {
          // Check user role and authentication status
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('Current user role:', user.role || 'Not set');
          
          if (error.response.data) {
            errorMessage = error.response.data.message || 
                         error.response.data.error || 
                         'Access denied. You do not have permission to perform this action.';
          }
          
          // If token might be expired, suggest re-login
          if (error.response.data?.error?.includes('expired')) {
            errorMessage += ' Your session may have expired. Please log in again.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          // Redirect to login page
          navigate('/login', { state: { from: location.pathname } });
        } else {
          errorMessage = error.response.data?.message || 'An error occurred while processing your request.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      setProcessingPayment(false);
      console.error('Payment initiation failed with message:', errorMessage);
      setProcessingPayment(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Left Column: Coach Selection */}
        <Col md={3} lg={2} className="coach-selection-sidebar">
          <h5 className="text-center mb-3">Coaches</h5>
          {loadingCoaches ? (
            <div className="text-center"><Spinner animation="border" size="sm" /></div>
          ) : (
            <div className="d-grid gap-2">
              {coaches.map((coach) => (
                <Button
                  key={coach.id}
                  variant={selectedCoach?.id === coach.id ? 'primary' : 'outline-secondary'}
                  onClick={() => handleCoachSelect(coach)}
                  className="d-flex justify-content-between align-items-center w-100"
                >
                  <span><Badge bg="dark" className="me-2">{coach.coachNumber}</Badge>{getCoachTypeName(coach.coachType)}</span>
                  <FaChevronRight />
                </Button>
              ))}
            </div>
          )}
        </Col>

        {/* Right Column: Main Content */}
        <Col md={9} lg={10}>
          <TrainDetails train={train} searchParams={searchParams} />
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          {selectedCoach ? (
            <Card className="mt-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Coach {selectedCoach.coachNumber} - {getCoachTypeName(selectedCoach.coachType)}</h5>
                <Badge bg="success">Fare: ₹{selectedCoach.fare.toFixed(2)}</Badge>
              </Card.Header>
              <Card.Body>
                {loadingSeats ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading Seat Layout...</p>
                  </div>
                ) : (
                  <SeatLayout 
                    seats={coachDetails?.seats || []}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                  />
                )}
              </Card.Body>
              <Card.Footer className="text-end">
                 <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleProceedToPassengers}
                    disabled={selectedSeats.length === 0 || loadingSeats}
                  >
                    {selectedSeats.length > 0 ? `Proceed with ${selectedSeats.length} Seat(s)` : `Please select at least one seat`}
                  </Button>
              </Card.Footer>
            </Card>
          ) : (
            <div className="text-center p-5 mt-4 border rounded bg-light">
              <FaChair size={48} className="text-muted mb-3" />
              <h4>Please select a coach from the left panel to view seats.</h4>
            </div>
          )}
        </Col>
      </Row>

      {/* Passenger Details Modal */}
      <Modal show={showPassengerForm} onHide={() => setShowPassengerForm(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Passenger Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PassengerDetailsForm
            passengers={passengerDetails}
            onPassengerChange={handlePassengerInputChange}
            formErrors={formErrors}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowPassengerForm(false)}>
            Back
          </Button>
          <Button variant="primary" onClick={handleProceedToPayment}>
            Proceed to Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => !processingPayment && setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Complete Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="mb-4">
            <FaMoneyBillWave size={48} className="text-success mb-3" />
            <h4>Total Amount</h4>
            <h3 className="text-primary">₹{totalFare?.toFixed(2) || '0.00'}</h3>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {processingPayment ? (
            <div className="my-4">
              <Spinner animation="border" />
              <p className="mt-2">Simulating payment, please wait...</p>
            </div>
          ) : (
            <Button variant="primary" size="lg" onClick={processBooking}>
              Confirm Payment
            </Button>
          )}
        </Modal.Body>
      </Modal>

      {/* Inline styles for the new layout */}
      <style>{`
        .coach-selection-sidebar {
          background-color: #f8f9fa;
          padding: 1.5rem;
          border-right: 1px solid #dee2e6;
          height: calc(100vh - 56px); /* Adjust based on navbar height */
          position: sticky;
          top: 56px;
        }
      `}</style>
    </Container>
  );
};

export default TrainSelection;
