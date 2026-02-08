import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faTrain, 
  faCalendarAlt, 
  faRoute, 
  faUser, 
  faClock, 
  faPrint,
  faExclamationTriangle,
  faCheckCircle,
  faEye,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import RailwayTheme from '../components/RailwayTheme';
import api from '../services/api';

const EnhancedUserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    cancelled: 0,
    upcoming: 0
  });

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/bookings/user');
        const userBookings = response.data;
        setBookings(userBookings);
        
        // Calculate stats
        const total = userBookings.length;
        const confirmed = userBookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
        const cancelled = userBookings.filter(b => b.bookingStatus === 'CANCELLED').length;
        const upcoming = userBookings.filter(b => 
          b.bookingStatus === 'CONFIRMED' && 
          new Date(b.travelDate) > new Date()
        ).length;
        
        setStats({ total, confirmed, cancelled, upcoming });
      } catch (err) {
        setError('Failed to fetch your bookings. Please try again later.');
        console.error('Fetch bookings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge bg="success">Confirmed</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'PENDING':
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handlePrintTicket = (booking) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Ticket - ${booking.pnr}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 2px solid #1a237e; padding-bottom: 10px; margin-bottom: 20px; }
            .details { margin: 10px 0; }
            .passenger { border: 1px solid #ddd; padding: 10px; margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YATRASETU RAILWAY BOOKING</h1>
            <h2>PNR: ${booking.pnr}</h2>
          </div>
          <div class="details">
            <p><strong>Train:</strong> ${booking.trainName}</p>
            <p><strong>From:</strong> ${booking.fromStation}</p>
            <p><strong>To:</strong> ${booking.toStation}</p>
            <p><strong>Date:</strong> ${booking.travelDate}</p>
            <p><strong>Status:</strong> ${booking.bookingStatus}</p>
          </div>
          <div class="passenger">
            <h3>Passenger Details</h3>
            ${booking.passengers ? booking.passengers.map(p => `
              <div class="passenger">
                <p><strong>Name:</strong> ${p.name}</p>
                <p><strong>Age:</strong> ${p.age}</p>
                <p><strong>Gender:</strong> ${p.gender}</p>
                <p><strong>Seat:</strong> ${p.seatId}</p>
              </div>
            `).join('') : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <>
        <RailwayTheme />
        <Container className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading your bookings...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <RailwayTheme />
      
      {/* Stats Section */}
      <Container className="py-4">
        <h2 className="text-center mb-4">
          <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
          My Booking Dashboard
        </h2>
        
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faTicketAlt} size="3x" className="text-primary mb-3" />
                <h3 className="stats-number">{stats.total}</h3>
                <p className="text-muted">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                <h3 className="stats-number">{stats.confirmed}</h3>
                <p className="text-muted">Confirmed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-warning mb-3" />
                <h3 className="stats-number">{stats.upcoming}</h3>
                <p className="text-muted">Upcoming</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body className="text-center">
                <FontAwesomeIcon icon={faTrash} size="3x" className="text-danger mb-3" />
                <h3 className="stats-number">{stats.cancelled}</h3>
                <p className="text-muted">Cancelled</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Error Alert */}
      {error && (
        <Container className="mb-4">
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
        </Container>
      )}

      {/* Bookings List */}
      <Container>
        <h3 className="mb-4">Your Recent Bookings</h3>
        
        {bookings.length === 0 && !error ? (
          <Alert variant="info">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            You haven't made any bookings yet. 
            <Link to="/train-search" className="alert-link">Book your first journey</Link>
          </Alert>
        ) : (
          <Row className="g-4">
            {bookings.map((booking) => (
              <Col md={6} key={booking.pnr}>
                <Card className="booking-card-hover">
                  <Card.Header className="bg-light">
                    <Row className="align-items-center">
                      <Col>
                        <strong className="text-primary">PNR: {booking.pnr}</strong>
                      </Col>
                      <Col className="text-end">
                        {getStatusBadge(booking.bookingStatus)}
                      </Col>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col>
                        <FontAwesomeIcon icon={faTrain} className="text-primary me-2" />
                        <strong>{booking.trainName}</strong>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col>
                        <FontAwesomeIcon icon={faRoute} className="text-info me-2" />
                        {booking.fromStation} → {booking.toStation}
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col>
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-warning me-2" />
                        Journey Date: {new Date(booking.travelDate).toLocaleDateString()}
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col>
                        <FontAwesomeIcon icon={faUser} className="text-muted me-2" />
                        Passengers: {booking.passengers ? booking.passengers.length : 0}
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col className="text-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="me-2"
                          onClick={() => handlePrintTicket(booking)}
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </Button>
                        
                        <Button 
                          as={Link} 
                          to={`/pnr-lookup?pnr=${booking.pnr}`}
                          variant="outline-info" 
                          size="sm"
                          className="me-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                        
                        {booking.bookingStatus === 'CONFIRMED' && (
                          <Button 
                            as={Link} 
                            to={`/cancel?pnr=${booking.pnr}`}
                            variant="danger" 
                            size="sm"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Quick Actions */}
      <Container className="py-5">
        <div className="text-center">
          <h3 className="mb-4">Quick Actions</h3>
          <Row className="g-3 justify-content-center">
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faSearch} size="2x" className="text-primary mb-3" />
                  <h5>Search Trains</h5>
                  <Button as={Link} to="/train-search" variant="primary" className="w-100">
                    Find Trains
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faTicketAlt} size="2x" className="text-info mb-3" />
                  <h5>Track PNR</h5>
                  <Button as={Link} to="/pnr-lookup" variant="info" className="w-100">
                    Check Status
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-success mb-3" />
                  <h5>Cancel Ticket</h5>
                  <Button as={Link} to="/cancel" variant="danger" className="w-100">
                    Cancel Booking
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};

export default EnhancedUserDashboard;
