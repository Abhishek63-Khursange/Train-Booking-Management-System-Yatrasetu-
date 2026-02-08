import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import api from '../services/api';

const TrainSearch = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedSource = source.trim();
    const trimmedDestination = destination.trim();

    if (!trimmedSource || !trimmedDestination || !date) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedSource)) {
      setError('Source station must contain only letters and spaces.');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedDestination)) {
      setError('Destination station must contain only letters and spaces.');
      return;
    }
    setLoading(true);
    setError('');
    setTrains([]);

    try {
      // Ensure the date is in YYYY-MM-DD format
      const formattedDate = new Date(date).toISOString().split('T')[0];

      const response = await api.get('/trains/search', {
        params: {
          source: source,
          destination: destination,
          date: formattedDate,
        },
      });
      setTrains(response.data);
      if (response.data.length === 0) {
        setError('No trains found for the selected route and date.');
      }
    } catch (err) {
      setError('Failed to fetch trains. Please try again later.');
      console.error('Train search error:', err);
    }
    setLoading(false);
  };

  const handleTrainSelect = (train) => {
    console.log('Selected Train:', train); // Diagnostic log
    navigate(`/train-selection`, { state: { train, searchParams: { source, destination, date } } });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="bg-primary text-white">
              Search Trains
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="source">
                      <Form.Label>From</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Source Station"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="destination">
                      <Form.Label>To</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Destination Station"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="date">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" className="mt-3 w-100" disabled={loading}>
                  {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <FaSearch />}
                  <span className="ms-2">{loading ? 'Searching...' : 'Search'}</span>
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {error && <Alert variant="danger" className="mt-4">{error}</Alert>}

          <div className="mt-4">
            {trains.map((train) => (
              <Card key={train.id} className="mb-3 train-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">
                        {train.name} ({train.number})
                      </h5>
                      <p className="mb-1">
                        {train.fromStation} to {train.toStation}
                      </p>
                      <p className="text-muted small">
                        Departure: {train.departureTime} | Arrival: {train.arrivalTime}
                      </p>
                    </div>
                    <div className="text-end">
                      <Button variant="success" onClick={() => handleTrainSelect(train)}>
                        Select Train
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TrainSearch;
