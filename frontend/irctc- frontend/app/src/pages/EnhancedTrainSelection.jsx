import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrain, 
  faCalendarAlt, 
  faRoute, 
  faClock, 
  faRupeeSign, 
  faChair, 
  faUsers, 
  faSearch,
  faArrowRight,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import RailwayTheme from '../components/RailwayTheme';
import api from '../services/api';

const EnhancedTrainSelection = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    class: 'ALL'
  });
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [showSeats, setShowSeats] = useState(false);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.get(`/api/trains/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`);
      setTrains(response.data);
      setBookingStep(2);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainSelect = (train) => {
    setSelectedTrain(train);
    setBookingStep(3);
    loadSeats(train.id);
  };

  const loadSeats = async (trainId) => {
    try {
      const response = await api.get(`/api/trains/${trainId}/seats`);
      setSeats(response.data);
      setShowSeats(true);
    } catch (error) {
      console.error('Seats loading error:', error);
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.isBooked) return;
    
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    try {
      const bookingData = {
        trainId: selectedTrain.id,
        seatIds: selectedSeats.map(s => s.id),
        travelDate: searchData.date,
        fromStation: searchData.from,
        toStation: searchData.to,
        passengers: selectedSeats.map((seat, index) => ({
          name: `Passenger ${index + 1}`,
          age: 25,
          gender: 'MALE',
          phone: '9876543210',
          seatId: seat.id
        }))
      };

      const response = await api.post('/api/bookings/book', bookingData);
      navigate('/booking/confirmation', { state: { booking: response.data } });
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const getSeatColor = (seat) => {
    if (seat.isBooked) return 'seat-booked';
    if (selectedSeats.find(s => s.id === seat.id)) return 'seat-selected';
    return 'seat-available';
  };

  return (
    <>
      <RailwayTheme />
      
      {/* Search Section */}
      <div className="page-header">
        <Container>
          <h1 className="text-white mb-4">
            <FontAwesomeIcon icon={faTrain} className="me-3" />
            Find Your Perfect Journey
          </h1>
          
          <Card className="bg-white bg-opacity-10">
            <Card.Body>
              <form onSubmit={handleSearch}>
                <Row className="g-3">
                  <Col md={3}>
                    <label className="form-label text-white">From Station</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter departure station"
                      value={searchData.from}
                      onChange={(e) => setSearchData({...searchData, from: e.target.value.toUpperCase()})}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <label className="form-label text-white">To Station</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter destination station"
                      value={searchData.to}
                      onChange={(e) => setSearchData({...searchData, to: e.target.value.toUpperCase()})}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <label className="form-label text-white">Travel Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={searchData.date}
                      onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Col>
                  <Col md={3}>
                    <label className="form-label text-white">Class</label>
                    <select 
                      className="form-control"
                      value={searchData.class}
                      onChange={(e) => setSearchData({...searchData, class: e.target.value})}
                    >
                      <option value="ALL">All Classes</option>
                      <option value="1A">1st AC</option>
                      <option value="2A">2nd AC</option>
                      <option value="3A">3rd AC</option>
                      <option value="SL">Sleeper</option>
                    </select>
                  </Col>
                </Row>
                <div className="text-center mt-3">
                  <Button type="submit" size="lg" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                        Search Trains
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Train Selection */}
      {bookingStep >= 2 && (
        <Container className="py-5">
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faRoute} className="me-2" />
            Available Trains
          </h2>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Finding best trains for your journey...</p>
            </div>
          ) : (
            <Row className="g-4">
              {trains.map((train, index) => (
                <Col md={6} key={train.id}>
                  <Card 
                    className={`booking-card-hover h-100 ${selectedTrain?.id === train.id ? 'border-primary' : ''}`}
                    onClick={() => handleTrainSelect(train)}
                  >
                    <Card.Header className="bg-light">
                      <Row className="align-items-center">
                        <Col>
                          <Badge bg="primary" className="me-2">{train.number}</Badge>
                          <strong>{train.name}</strong>
                        </Col>
                        <Col className="text-end">
                          <Badge bg="success">{train.class}</Badge>
                        </Col>
                      </Row>
                    </Card.Header>
                    <Card.Body>
                      <Row className="mb-2">
                        <Col>
                          <FontAwesomeIcon icon={faRoute} className="text-primary me-2" />
                          <strong>{train.fromStation}</strong>
                        </Col>
                        <Col className="text-end">
                          <FontAwesomeIcon icon={faArrowRight} className="text-muted" />
                        </Col>
                        <Col>
                          <strong>{train.toStation}</strong>
                          <FontAwesomeIcon icon={faRoute} className="text-primary ms-2" />
                        </Col>
                      </Row>
                      
                      <Row className="mb-2">
                        <Col>
                          <FontAwesomeIcon icon={faClock} className="text-info me-2" />
                          Departure: {train.departureTime}
                        </Col>
                        <Col className="text-end">
                          Arrival: {train.arrivalTime}
                          <FontAwesomeIcon icon={faClock} className="text-info ms-2" />
                        </Col>
                      </Row>
                      
                      <Row className="mb-2">
                        <Col>
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-warning me-2" />
                          Duration: {train.duration}
                        </Col>
                        <Col className="text-end">
                          <FontAwesomeIcon icon={faRupeeSign} className="text-success me-2" />
                          <strong className="text-success">₹{train.fare}</strong>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col>
                          <FontAwesomeIcon icon={faChair} className="text-muted me-2" />
                          Available: {train.availableSeats} seats
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      )}

      {/* Seat Selection */}
      {showSeats && selectedTrain && (
        <Container className="py-5">
          <h2 className="text-center mb-4">
            <FontAwesomeIcon icon={faChair} className="me-2" />
            Select Your Seats - {selectedTrain.name}
          </h2>
          
          <Alert variant="info">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            Click on available seats to select them. Selected seats will be highlighted in yellow.
          </Alert>
          
          <div className="seat-map mb-4">
            <Row className="g-2">
              {seats.map((seat) => (
                <Col key={seat.id} xs="auto">
                  <div
                    className={`seat p-3 text-center ${getSeatColor(seat)}`}
                    onClick={() => handleSeatSelect(seat)}
                    style={{
                      cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                      borderRadius: '8px',
                      minWidth: '60px',
                      minHeight: '60px'
                    }}
                  >
                    <div>
                      <small className="d-block">{seat.seatNumber}</small>
                      <FontAwesomeIcon icon={faChair} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
          
          <Row className="mt-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Selected Seats</h5>
                </Card.Header>
                <Card.Body>
                  {selectedSeats.length === 0 ? (
                    <p className="text-muted">No seats selected</p>
                  ) : (
                    <>
                      {selectedSeats.map((seat, index) => (
                        <Badge key={seat.id} bg="warning" className="me-2 mb-2">
                          {seat.seatNumber}
                        </Badge>
                      ))}
                      <hr />
                      <h5>Total: ₹{selectedSeats.reduce((sum, seat) => sum + seat.fare, 0)}</h5>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Booking Summary</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Train:</strong> {selectedTrain.name}</p>
                  <p><strong>Route:</strong> {selectedTrain.fromStation} → {selectedTrain.toStation}</p>
                  <p><strong>Date:</strong> {searchData.date}</p>
                  <p><strong>Class:</strong> {selectedTrain.class}</p>
                  <p><strong>Passengers:</strong> {selectedSeats.length}</p>
                  <hr />
                  <Button 
                    size="lg" 
                    className="btn-primary w-100"
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Proceed to Booking
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default EnhancedTrainSelection;
