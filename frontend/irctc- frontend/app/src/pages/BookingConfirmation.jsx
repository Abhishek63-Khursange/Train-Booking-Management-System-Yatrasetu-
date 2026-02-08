import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Card, Row, Col, Button, Alert,
  ListGroup, Badge, Spinner, Modal, Table
} from 'react-bootstrap';
import {
  FaTrain, FaUser, FaCheckCircle, FaPrint, FaHome,
  FaRupeeSign, FaQrcode, FaInfoCircle, FaChair,
  FaTicketAlt, FaClock, FaCalendarAlt, FaHourglassHalf, FaDownload, FaExclamationTriangle, FaEnvelope
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [train, setTrain] = useState(null);
  const [coach, setCoach] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const ticketRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    const bookingId = urlParams.get('booking_id') || localStorage.getItem('pendingBookingId');

    if (!bookingId && !sessionId) {
      setError('No booking or session information found. Please try again.');
      setLoading(false);
      return;
    }

    const verifyPaymentAndFetchBooking = async (id, bId) => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching booking details:', { bookingId: bId });

        if (!bId) {
          throw new Error('No booking ID available to fetch details');
        }

        // Get the current user and token
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = user?.token;

        if (!token) {
          console.error('No authentication token found. Redirecting to login...');
          navigate('/login', { state: { from: location.pathname } });
          throw new Error('Authentication required. Please log in again.');
        }

        console.log('Fetching booking details for ID:', bId);
        console.log('Current user ID:', user.id);

        // Make the request with explicit headers
        const bookingResponse = await api.get(`/api/bookings/${bId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        console.log('Booking API Response Status:', bookingResponse.status);
        console.log('Booking API Response Headers:', bookingResponse.headers);

        // The server returns the booking directly, not nested in a 'booking' property
        const data = bookingResponse.data;

        // Clear the pending booking ID from localStorage
        localStorage.removeItem('pendingBookingId');

        if (!data) {
          throw new Error('No booking data received from server');
        }

        // Debug: Log the structure of the received data
        console.log('Booking data structure:', {
          hasTrain: !!data.train,
          hasCoach: !!data.coach,
          hasPassengers: Array.isArray(data.passengers),
          passengerCount: Array.isArray(data.passengers) ? data.passengers.length : 0,
          dataKeys: Object.keys(data)
        });

        // Normalize backend response to match UI expectations
        const normalizeData = (resp) => {
          const bookingObj = {
            pnr: resp?.pnr || resp?.PNR || resp?.booking?.pnr || '',
            fromStation: resp?.fromStation || resp?.source || resp?.from || resp?.booking?.fromStation || 'N/A',
            toStation: resp?.toStation || resp?.destination || resp?.to || resp?.booking?.toStation || 'N/A',
            travelDate: resp?.travelDate || resp?.journeyDate || resp?.date || resp?.booking?.travelDate || '',
            bookingStatus: resp?.bookingStatus || resp?.status || 'CONFIRMED',
          };
          const trainObj = resp?.train ? {
            trainNumber: resp.train.trainNumber || resp.train.number || resp.train.code || '',
            trainName: resp.train.trainName || resp.train.name || '',
            departureTime: resp.train.departureTime || resp.departureTime || '',
            arrivalTime: resp.train.arrivalTime || resp.arrivalTime || '',
          } : {
            trainNumber: resp?.trainNumber || resp?.number || '',
            trainName: resp?.trainName || '',
            departureTime: resp?.departureTime || '',
            arrivalTime: resp?.arrivalTime || '',
          };
          const coachObj = resp?.coach ? {
            coachNumber: resp.coach.coachNumber || resp.coach.number || resp.coach.code || '',
            class: resp.coach.class || resp.coach.coachClass || resp.class || resp.travelClass || '',
            fare: resp.coach.fare || (resp.fare && (resp.fare.perPassenger || resp.fare.baseFare)) || 0,
          } : {
            coachNumber: resp?.coachNumber || resp?.coachCode || '',
            class: resp?.class || resp?.travelClass || '',
            fare: (resp?.fare && (resp.fare.perPassenger || resp.fare.baseFare || resp.fare.amount)) || 0,
          };
          const rawPassengers = Array.isArray(resp?.passengers) ? resp.passengers : (resp?.passengerList || resp?.booking?.passengers || []);
          const normalizedPassengers = rawPassengers.map((p) => ({
            ...p,
            seatNumber: p?.seatNumber || p?.seat || p?.berthNo || p?.seatAssignment?.number || p?.allocation?.seatNumber || '--',
            status: p?.status || p?.bookingStatus || 'Confirmed',
            berthPreference: p?.berthPreference || p?.berth,
            gender: p?.gender || p?.sex,
          }));
          const sParams = resp?.searchParams || {
            date: bookingObj.travelDate,
            from: bookingObj.fromStation,
            to: bookingObj.toStation,
          };
          return { bookingObj, trainObj, coachObj, normalizedPassengers, sParams };
        };

        const { bookingObj, trainObj, coachObj, normalizedPassengers, sParams } = normalizeData(data);

        // Set the booking and related data using normalized structures
        setBooking(bookingObj);
        setTrain(trainObj);
        setCoach(coachObj);
        setPassengers(normalizedPassengers);
        setSearchParams(sParams);

      } catch (err) {
        console.error('Full error object:', err);

        let errorMessage = 'Failed to load booking details. ';

        if (err.response) {
          // The request was made and the server responded with an error status
          console.error('Error response data:', err.response.data);
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);

          if (err.response.status === 403) {
            // Handle 403 Forbidden - likely a permission issue
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            console.error('Access denied for user:', {
              userId: currentUser?.id,
              userRole: currentUser?.role,
              requestedBookingId: bId
            });

            errorMessage += 'You do not have permission to view this booking. ';

            // If user is not logged in, suggest logging in
            if (!currentUser?.token) {
              errorMessage += 'Please log in to view your bookings.';
              navigate('/login', { state: { from: location.pathname } });
            } else {
              // If user is logged in but still gets 403, they might be trying to access someone else's booking
              errorMessage += 'Please ensure you are logged in with the correct account.';
            }
          } else if (err.response.data) {
            // Handle other API errors with custom messages
            errorMessage += err.response.data.message ||
              err.response.data.error ||
              'An error occurred while fetching booking details.';
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Payment verification failed with message:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      verifyPaymentAndFetchBooking(sessionId, bookingId);  // Pass both sessionId and bookingId
    } else if (bookingId) {
      verifyPaymentAndFetchBooking(null, bookingId);  // Pass null for sessionId and bookingId
    } else {
      setError('No payment session or booking ID found. Cannot confirm booking.');
      setLoading(false);
    }
  }, [location.search, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Helper function to safely get nested object properties
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    try {
      const value = path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), obj);
      return value !== undefined ? value : defaultValue;
    } catch (e) {
      console.error(`Error getting ${path}:`, e);
      return defaultValue;
    }
  };

  // Calculate journey duration
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 'N/A';

    try {
      const depTime = new Date(departureTime);
      const arrTime = new Date(arrivalTime);

      // Handle case where arrival is the next day
      if (arrTime < depTime) {
        arrTime.setDate(arrTime.getDate() + 1);
      }

      const diffMs = arrTime - depTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'N/A';
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle ticket download
  const handleDownloadTicket = () => {
    const ticketElement = ticketRef.current;
    if (!ticketElement) return;

    html2canvas(ticketElement).then(canvas => {
      canvas.toBlob((blob) => {
        saveAs(blob, `ticket-${booking?.pnr || 'booking'}.png`);
      });
    });
  };

  const handleOpenEmailModal = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setRecipientEmail(user?.email || '');
    setShowEmailModal(true);
  };

  // Handle sending ticket via email
  const handleSendEmail = async () => {
    if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setShowEmailModal(false);
    const ticketElement = ticketRef.current;
    if (!ticketElement || sendingEmail) return;

    setSendingEmail(true);
    toast.info('Preparing to send email...');

    try {
      const canvas = await html2canvas(ticketElement, { scale: 2 });
      const imageDataUrl = canvas.toDataURL('image/png');

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;

      if (!token) {
        toast.error('Authentication error. Please log in again.');
        setSendingEmail(false);
        return;
      }

      await api.post('/api/bookings/send-email',
        {
          email: recipientEmail,
          pnr: booking?.pnr,
          ticketImage: imageDataUrl,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      toast.success(`Ticket successfully sent to ${recipientEmail}`);
    } catch (err) {
      console.error('Failed to send email:', err);
      const errorMessage = err.response?.data?.message || 'An error occurred while sending the email.';
      toast.error(errorMessage);
    } finally {
      setSendingEmail(false);
    }
  };

  // Calculate fare details
  const calculateFareDetails = () => {
    const baseFare = coach?.fare || 0;
    const reservationCharges = 60; // Fixed reservation charges
    const gst = Math.ceil((baseFare * passengers.length + reservationCharges) * 0.05);
    const totalFare = baseFare * passengers.length + reservationCharges + gst;

    return {
      baseFare: baseFare * passengers.length,
      reservationCharges,
      gst,
      totalFare
    };
  };

  const fareDetails = calculateFareDetails();

  return (
    <>
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Ticket to Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter the email address to send the ticket to.</p>
          <input
            type="email"
            className="form-control"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendEmail} disabled={sendingEmail}>
            {sendingEmail ? <Spinner as="span" animation="border" size="sm" /> : 'Send'}
          </Button>
        </Modal.Footer>
      </Modal>

      {loading ? (
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your booking details...</p>
        </Container>
      ) : error ? (
        <Container className="py-5">
          <Alert variant="danger">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
          <div className="text-center mt-3">
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="secondary" onClick={handlePrint}><FaPrint className="me-2" /> Print</Button>
              <Button variant="info" onClick={handleDownloadTicket}><FaDownload className="me-2" /> Download</Button>
              <Button variant="success" onClick={handleOpenEmailModal} disabled={sendingEmail}>
                {sendingEmail ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaEnvelope className="me-2" />}
                {sendingEmail ? ' Sending...' : ' Send to Email'}
              </Button>
            </div>
            <hr className="my-4" />
            <Button variant="primary" onClick={() => navigate('/')}>
              <FaHome className="me-2" /> Back to Home
            </Button>
          </div>
        </Container>
      ) : !booking ? (
        <Container className="py-5">
          <Alert variant="warning">
            <FaInfoCircle className="me-2" />
            No booking details found. Please check your booking or try again later.
          </Alert>
          <div className="text-center mt-3">
            <Button variant="primary" onClick={() => navigate('/train-search')}>
              <FaTrain className="me-2" /> Search Trains
            </Button>
          </div>
        </Container>
      ) : (
        // Main ticket view
        <Container className="py-4 print-container">
          <Card className="shadow-lg ticket-card" ref={ticketRef}>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0"><FaTicketAlt className="me-2" /> E-Ticket</h4>
              <img src="/logo.png" alt="IRCTC Logo" height="40" />
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={8}>
                  <h5 className="text-primary"><FaTrain className="me-2" /> {train?.trainNumber} - {train?.trainName}</h5>
                  <p className="text-muted mb-1">From: <strong>{booking?.fromStation}</strong> To: <strong>{booking?.toStation}</strong></p>
                  <p className="text-muted">Travel Class: <strong>{coach?.class} ({coach?.coachNumber})</strong></p>
                </Col>
                <Col md={4} className="text-md-end">
                  <h6 className="mb-1">PNR: <Badge bg="secondary">{booking?.pnr}</Badge></h6>
                  <p className="mb-0">Booking Status: <Badge bg="success">{booking?.bookingStatus}</Badge></p>
                </Col>
              </Row>

              <Row className="align-items-center bg-light p-2 rounded mb-3">
                <Col>
                  <FaCalendarAlt className="me-2 text-muted" />
                  <span>{formatDate(booking?.travelDate)}</span>
                </Col>
                <Col className="text-center">
                  <FaClock className="me-2 text-muted" />
                  <span>{formatTime(train?.departureTime)}</span>
                </Col>
                <Col className="text-center">
                  <FaHourglassHalf className="me-2 text-muted" />
                  <span>{calculateDuration(train?.departureTime, train?.arrivalTime)}</span>
                </Col>
                <Col className="text-end">
                  <FaClock className="me-2 text-muted" />
                  <span>{formatTime(train?.arrivalTime)}</span>
                </Col>
              </Row>

              <h6 className="mt-4"><FaUser className="me-2" /> Passenger Details</h6>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Seat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, index) => (
                    <tr key={p.id || index}>
                      <td>{index + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.age}</td>
                      <td>{p.gender}</td>
                      <td><FaChair className="me-1" /> {p.seatNumber}</td>
                      <td><Badge bg={p.status === 'Confirmed' ? 'success' : 'warning'}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Row className="mt-4">
                <Col md={7}>
                  <h6 className="mb-3">Fare Details</h6>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Base Fare ({passengers.length}x)</span>
                      <strong><FaRupeeSign /> {fareDetails.baseFare.toFixed(2)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>Reservation Charges</span>
                      <strong><FaRupeeSign /> {fareDetails.reservationCharges.toFixed(2)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <span>GST (5%)</span>
                      <strong><FaRupeeSign /> {fareDetails.gst.toFixed(2)}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between bg-light">
                      <h5 className="mb-0">Total Fare</h5>
                      <h5 className="mb-0"><FaRupeeSign /> {fareDetails.totalFare.toFixed(2)}</h5>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={5} className="text-center align-self-center">
                  <div onClick={() => setShowQrModal(true)} style={{ cursor: 'pointer' }}>
                    <QRCodeSVG value={JSON.stringify({ pnr: booking?.pnr, from: booking?.fromStation, to: booking?.toStation })} size={128} />
                    <p className="text-muted mt-2"><FaQrcode className="me-1" /> Scan for details</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="text-muted small">
              This is a computer-generated ticket and does not require a signature.
            </Card.Footer>
          </Card>

          <div className="text-center mt-4 action-buttons">
            <h5 className="mb-3">Action Buttons</h5>
            <div className="d-flex justify-content-center flex-wrap">
              <Button variant="info" className="me-2 mb-2" onClick={handlePrint}>
                <FaPrint className="me-2" /> Print Ticket
              </Button>
              <Button variant="secondary" className="me-2 mb-2" onClick={handleDownloadTicket}>
                <FaDownload className="me-2" /> Download Ticket
              </Button>
              <Button variant="success" className="me-2 mb-2" onClick={handleOpenEmailModal} disabled={sendingEmail}>
                {sendingEmail ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaEnvelope className="me-2" />}
                {sendingEmail ? ' Sending...' : ' Send to Email'}
              </Button>
            </div>
            <div className="d-flex align-items-center text-muted">
              <FaInfoCircle className="me-2" />
              <span>You can print, download, or email your ticket.</span>
            </div>
          </div>
        </Container>
      )}

      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <QRCodeSVG value={JSON.stringify({ pnr: booking?.pnr, from: booking?.fromStation, to: booking?.toStation })} size={256} />
          <p className="mt-3">Scan this code with your mobile device to get ticket details.</p>
        </Modal.Body>
      </Modal>
    </>
  );

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
        <div className="text-center mt-3">
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button variant="secondary" onClick={handlePrint}><FaPrint className="me-2" /> Print</Button>
            <Button variant="info" onClick={handleDownloadTicket}><FaDownload className="me-2" /> Download</Button>
            <Button variant="success" onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaEnvelope className="me-2" />}
              {sendingEmail ? ' Sending...' : ' Send to Email'}
            </Button>
          </div>
          <hr className="my-4" />
          <Button variant="primary" onClick={() => navigate('/')}>
            <FaHome className="me-2" /> Back to Home
          </Button>
        </div>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <FaInfoCircle className="me-2" />
          No booking details found. Please check your booking or try again later.
        </Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate('/train-search')}>
            <FaTrain className="me-2" /> Search Trains
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4" id="ticket">
      <Row className="justify-content-center">
        <Col lg={10} ref={ticketRef}>
          {/* Main Content */}
          {/* Booking Confirmation Header */}
          <Card className="shadow-sm mb-4 border-success">
            <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
              <div>
                <FaCheckCircle className="me-2" />
                <span className="h4 mb-0">Booking Confirmed</span>
              </div>
              <div>
                <span className="me-3">PNR: <strong>{booking.pnr}</strong></span>
                <Button variant="light" size="sm" onClick={() => setShowQrModal(true)}>
                  <FaQrcode className="me-1" /> Show QR Code
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-success bg-opacity-10 p-4 rounded-3">
                  <FaCheckCircle className="text-success" size={48} />
                  <h3 className="mt-3 text-success">Booking Confirmed!</h3>
                  <p className="lead mb-0">Thank you for choosing Yatrasetu</p>
                  <p className="text-muted mt-2">Booking ID: {booking.id}</p>
                </div>
              </div>

              {/* Journey Details */}
              <Card className="mb-4">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaTrain className="me-2 text-primary" />
                    Journey Details
                  </h5>
                  <Badge bg="info">
                    <FaTicketAlt className="me-1" /> E-Ticket
                  </Badge>
                </Card.Header>
                <Card.Body>
                  {train && (
                    <div className="mb-4">
                      <h5 className="text-primary">{train.trainNumber} - {train.trainName}</h5>
                      <p className="text-muted mb-4">{booking.fromStation} to {booking.toStation}</p>

                      <Row className="text-center">
                        <Col md={4}>
                          <div className="h4">{formatDate(booking.travelDate)}</div>
                          <div className="text-muted small">Date of Journey</div>
                        </Col>
                        <Col md={4}>
                          <div className="h4">{coach?.coachNumber || 'N/A'}</div>
                          <div className="text-muted small">Coach Number</div>
                        </Col>
                        <Col md={4}>
                          <div className="h4">
                            <Badge bg="success">
                              {booking.bookingStatus || 'CONFIRMED'}
                            </Badge>
                          </div>
                          <div className="text-muted small">Status</div>
                        </Col>
                      </Row>

                      <Row className="mt-4">
                        <Col md={6}>
                          <div className="d-flex align-items-center mb-2">
                            <FaClock className="text-primary me-2" />
                            <div>
                              <div className="fw-bold">Departure</div>
                              <div className="text-muted">
                                {formatTime(train.departureTime)}
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex align-items-center mb-2">
                            <FaClock className="text-primary me-2" />
                            <div>
                              <div className="fw-bold">Arrival</div>
                              <div className="text-muted">
                                {formatTime(train.arrivalTime)}
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <div className="mt-3 text-center">
                        <Badge bg="light" className="text-dark">
                          <FaHourglassHalf className="me-1" />
                          Journey Duration: {calculateDuration(train.departureTime, train.arrivalTime)}
                        </Badge>
                      </div>
                      <div className="text-muted small text-center mt-2">Status: Confirmed</div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Passenger Details */}
              <Card className="mb-4">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaUser className="me-2 text-primary" />
                    Passenger Details
                  </h5>
                  <Badge bg="primary">
                    {passengers?.length || 0} Passenger{passengers?.length !== 1 ? 's' : ''}
                  </Badge>
                </Card.Header>
                <Card.Body className="p-0">
                  {passengers?.length > 0 ? (
                    <ListGroup variant="flush">
                      {passengers.map((passenger, index) => {
                        const passengerFare = coach?.fare || (calculateFareDetails().totalFare / Math.max(1, passengers.length));
                        return (
                          <ListGroup.Item key={index} className="p-3">
                            <Row className="align-items-center">
                              <Col xs={12} md={3} className="mb-2 mb-md-0">
                                <div className="d-flex align-items-center">
                                  <div className="position-relative me-3">
                                    <FaUser className="text-primary" size={24} />
                                    <Badge
                                      bg="primary"
                                      className="position-absolute top-0 start-100 translate-middle rounded-circle"
                                      style={{ fontSize: '0.6rem', padding: '0.25rem 0.35rem' }}
                                    >
                                      {index + 1}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="fw-bold">{passenger.name}</div>
                                    <div className="text-muted small">
                                      {passenger.gender}, {passenger.age} years
                                      {passenger.berthPreference && `, ${passenger.berthPreference}`}
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <div className="text-muted small">Seat No</div>
                                <div className="fw-bold">{passenger.seatNumber || '--'}</div>
                              </Col>
                              <Col xs={6} md={2} className="mb-2 mb-md-0">
                                <div className="text-muted small">Coach</div>
                                <div className="fw-bold">{coach?.coachNumber || '--'}</div>
                              </Col>
                              <Col xs={6} md={3} className="mb-2 mb-md-0">
                                <div className="text-muted small">Fare</div>
                                <div className="fw-bold">
                                  <FaRupeeSign className="text-muted" size={12} />
                                  {passengerFare.toFixed(2)}
                                </div>
                              </Col>
                              <Col xs={6} md={2}>
                                <div className="text-muted small">Status</div>
                                <Badge bg="success" className="text-uppercase">
                                  {passenger.status || 'Confirmed'}
                                </Badge>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  ) : (
                    <div className="p-4 text-center text-muted">
                      No passenger details available.
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Fare Details */}
              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <FaRupeeSign className="me-2 text-primary" />
                    Fare & Payment Summary
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6 className="mb-3">Fare Breakdown</h6>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                          <span>Base Fare ({passengers.length} x <FaRupeeSign className="text-muted" size={10} />{coach?.fare?.toFixed(2) || '0.00'})</span>
                          <span><FaRupeeSign className="text-muted" size={10} />{fareDetails.baseFare.toFixed(2)}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                          <span>Reservation Charges</span>
                          <span><FaRupeeSign className="text-muted" size={10} />{fareDetails.reservationCharges.toFixed(2)}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0">
                          <span>GST (5%)</span>
                          <span><FaRupeeSign className="text-muted" size={10} />{fareDetails.gst.toFixed(2)}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold">
                          <span>Total Amount</span>
                          <span className="text-success">
                            <FaRupeeSign size={12} />{fareDetails.totalFare.toFixed(2)}
                          </span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header className="bg-light">
                  <h6 className="mb-0">Payment Information</h6>
                </Card.Header>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Train No. & Name:</span>
                      <span className="fw-bold">{train?.trainNumber} - {train?.trainName}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">From:</span>
                      <span className="fw-bold">{booking?.fromStation || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">To:</span>
                      <span className="fw-bold">{booking?.toStation || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Date of Journey:</span>
                      <span className="fw-bold">{searchParams?.date ? formatDate(searchParams.date) : 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Class:</span>
                      <span className="fw-bold">{coach?.class || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Coach:</span>
                      <span className="fw-bold">{coach?.coachNumber || 'N/A'}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="mt-4 d-flex flex-wrap justify-content-between align-items-center">
                <div>
                  <Button variant="outline-primary" className="me-2 mb-2" onClick={handlePrint}>
                    <FaPrint className="me-2" /> Print Ticket
                  </Button>
                  <Button variant="outline-secondary" className="me-2 mb-2" onClick={handleDownloadTicket}>
                    <FaDownload className="me-2" /> Download Ticket
                  </Button>
                  <Button variant="outline-success" className="me-2 mb-2" onClick={handleOpenEmailModal} disabled={sendingEmail}>
                    {sendingEmail ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaEnvelope className="me-2" />}
                    {sendingEmail ? ' Sending...' : ' Send to Email'}
                  </Button>
                </div>
                <div className="d-flex align-items-center text-muted">
                  <FaInfoCircle className="me-2" />
                  <small>Please carry a valid ID proof during the journey</small>
                </div>
              </div>

              {/* Important Information */}
              <Card className="border-warning mt-4">
                <Card.Header className="bg-warning bg-opacity-25">
                  <h5 className="mb-0">
                    <FaInfoCircle className="me-2 text-warning" />
                    Important Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <FaInfoCircle className="text-primary me-2" />
                      Please carry a valid photo ID proof while traveling.
                    </li>
                    <li className="mb-2">
                      <FaInfoCircle className="text-primary me-2" />
                      Arrive at the station at least 30 minutes before departure.
                    </li>
                    <li className="mb-2">
                      <FaInfoCircle className="text-primary me-2" />
                      E-ticket is a valid travel document. No printout is required.
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QR Code Modal */}
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Ticket QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="d-flex justify-content-center mb-3">
            <QRCodeSVG
              value={JSON.stringify({
                pnr: booking?.pnr || '',
                trainNumber: train?.trainNumber,
                from: booking?.fromStation || '',
                to: booking?.toStation || '',
                date: searchParams?.date || '',
                passengers: passengers?.length || 0
              })}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mb-0">Scan this QR code at the station for quick verification</p>
          <p className="text-muted small">PNR: {booking?.pnr || 'N/A'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDownloadTicket}>
            <FaDownload className="me-2" /> Download QR Code
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingConfirmation;
