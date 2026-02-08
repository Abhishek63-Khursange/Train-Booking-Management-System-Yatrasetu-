import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faTrain, faCalendarAlt, faExclamationTriangle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import './Booking.css';

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/bookings/user');
        setBookings(response.data);
      } catch (err) {
        setError('Failed to fetch your bookings. Please try again later.');
        console.error('Fetch bookings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h2 className="mb-4 text-center">My Bookings</h2>

          {error && <Alert variant="danger"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />{error}</Alert>}

          {!bookings.length && !error && (
            <Alert variant="info">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              You have no bookings yet.
            </Alert>
          )}

          {bookings.map((booking) => (
            <Card key={booking.pnr} className="mb-4 booking-card-hover shadow-sm">
              <Card.Header className="bg-light">
                <Row className="align-items-center">
                  <Col md={6}>
                    <strong className="text-primary">PNR: {booking.pnr}</strong>
                  </Col>
                  <Col md={6} className="text-md-end">
                    <span className={`badge bg-${booking.bookingStatus === 'CONFIRMED' ? 'success' : 'warning'}`}>
                      {booking.bookingStatus}
                    </span>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5><FontAwesomeIcon icon={faTrain} className="me-2" /> {booking.trainName}</h5>
                    <p className="mb-1">{booking.fromStation} to {booking.toStation}</p>
                    <p className="text-muted small">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      Journey Date: {new Date(booking.travelDate).toLocaleDateString()}
                    </p>
                  </Col>
                  <Col md={4} className="d-flex align-items-center justify-content-end gap-2">
                    <Button as={Link} to={`/pnr-lookup?pnr=${booking.pnr}`} variant="outline-primary" size="sm">
                      <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                      View Details
                    </Button>
                    {booking.bookingStatus === 'CONFIRMED' && (
                      <Button as={Link} to={`/cancel?pnr=${booking.pnr}`} variant="danger" size="sm">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                        Cancel
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default Booking;