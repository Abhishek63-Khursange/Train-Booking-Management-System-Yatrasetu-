import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner, Button, Badge, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faTrain, 
  faCalendarAlt, 
  faExclamationTriangle, 
  faInfoCircle,
  faUsers,
  faChartBar,
  faEye,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import './Booking.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        // Admin can see all bookings - need to create this endpoint
        const response = await api.get('/api/bookings/all');
        const allBookings = response.data;
        
        setBookings(allBookings);
        
        // Calculate stats
        const total = allBookings.length;
        const confirmed = allBookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
        const cancelled = allBookings.filter(b => b.bookingStatus === 'CANCELLED').length;
        const revenue = confirmed.reduce((sum, b) => sum + (b.totalFare || 0), 0);
        
        setStats({
          totalBookings: total,
          confirmedBookings: confirmed,
          cancelledBookings: cancelled,
          totalRevenue: revenue
        });
      } catch (err) {
        setError('Failed to fetch all bookings. Please try again later.');
        console.error('Fetch all bookings error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  const handleCancelBooking = async (pnr) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/api/bookings/cancel/${pnr}`);
        // Refresh bookings
        const response = await api.get('/api/bookings/all');
        setBookings(response.data);
        
        // Update stats
        const updatedBookings = response.data;
        const total = updatedBookings.length;
        const confirmed = updatedBookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
        const cancelled = updatedBookings.filter(b => b.bookingStatus === 'CANCELLED').length;
        const revenue = confirmed.reduce((sum, b) => sum + (b.totalFare || 0), 0);
        
        setStats({
          totalBookings: total,
          confirmedBookings: confirmed,
          cancelledBookings: cancelled,
          totalRevenue: revenue
        });
        
        alert('Booking cancelled successfully!');
      } catch (err) {
        alert('Failed to cancel booking: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading all bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col lg={12}>
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Admin Dashboard
          </h2>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faTicketAlt} size="3x" className="text-primary mb-3" />
              <h3>{stats.totalBookings}</h3>
              <p className="text-muted">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
              <h3>{stats.confirmedBookings}</h3>
              <p className="text-muted">Confirmed Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faTrash} size="3x" className="text-danger mb-3" />
              <h3>{stats.cancelledBookings}</h3>
              <p className="text-muted">Cancelled Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FontAwesomeIcon icon={faChartBar} size="3x" className="text-info mb-3" />
              <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
              <p className="text-muted">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* All Bookings Table */}
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                All Bookings
              </h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger"><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />{error}</Alert>}

              {!bookings.length && !error && (
                <Alert variant="info">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  No bookings found in the system.
                </Alert>
              )}

              {bookings.length > 0 && (
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>PNR</th>
                        <th>User Email</th>
                        <th>Train</th>
                        <th>From - To</th>
                        <th>Travel Date</th>
                        <th>Status</th>
                        <th>Fare</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.pnr}>
                          <td><strong>{booking.pnr}</strong></td>
                          <td>{booking.userEmail}</td>
                          <td>{booking.trainName}</td>
                          <td>{booking.fromStation} - {booking.toStation}</td>
                          <td>{new Date(booking.travelDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={booking.bookingStatus === 'CONFIRMED' ? 'success' : 'danger'}>
                              {booking.bookingStatus}
                            </Badge>
                          </td>
                          <td>₹{(booking.totalFare || 0).toFixed(2)}</td>
                          <td>
                            <Button 
                              as={Link} 
                              to={`/pnr-lookup?pnr=${booking.pnr}`} 
                              variant="outline-primary" 
                              size="sm"
                              className="me-2"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            {booking.bookingStatus === 'CONFIRMED' && (
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleCancelBooking(booking.pnr)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
