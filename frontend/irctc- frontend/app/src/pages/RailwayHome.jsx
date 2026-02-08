import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain, faSearch, faTicketAlt, faClock, faRoute, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import RailwayTheme from '../components/RailwayTheme';

const RailwayHome = () => {
  return (
    <>
      <RailwayTheme />
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="text-center text-white">
              <div className="mb-4">
                <FontAwesomeIcon icon={faTrain} className="train-icon mb-4" />
              </div>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Yatrasetu
              </h1>
              <p className="lead mb-4">
                Your trusted partner for seamless railway journeys across India
              </p>
              <div className="d-grid gap-3 col-12">
                <Button as={Link} to="/train-search" size="lg" className="btn-primary">
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search Trains
                </Button>
                <Button as={Link} to="/pnr-lookup" variant="outline-light" size="lg">
                  <FontAwesomeIcon icon={faTicketAlt} className="me-2" />
                  Track Booking
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="g-4">
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <FontAwesomeIcon icon={faSearch} size="3x" className="text-primary" />
                </div>
                <h4>Easy Search</h4>
                <p className="text-muted">
                  Find trains between any stations in India with our intelligent search system
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <FontAwesomeIcon icon={faRoute} size="3x" className="text-success" />
                </div>
                <h4>Multiple Routes</h4>
                <p className="text-muted">
                  Choose from various train types and classes for your comfort
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <FontAwesomeIcon icon={faShieldAlt} size="3x" className="text-warning" />
                </div>
                <h4>Secure Booking</h4>
                <p className="text-muted">
                  Safe and secure payment options with instant confirmation
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Quick Actions */}
      <Container className="py-4">
        <div className="text-center">
          <h3 className="mb-4">Quick Actions</h3>
          <Row className="g-3 justify-content-center">
            <Col md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faTicketAlt} size="2x" className="text-primary mb-3" />
                  <h5>My Bookings</h5>
                  <Button as={Link} to="/my-bookings" variant="outline-primary" className="w-100">
                    View Tickets
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faClock} size="2x" className="text-info mb-3" />
                  <h5>PNR Status</h5>
                  <Button as={Link} to="/pnr-lookup" variant="outline-info" className="w-100">
                    Track Status
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faTrain} size="2x" className="text-success mb-3" />
                  <h5>Cancel Ticket</h5>
                  <Button as={Link} to="/cancel" variant="outline-danger" className="w-100">
                    Cancel Booking
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <FontAwesomeIcon icon={faShieldAlt} size="2x" className="text-warning mb-3" />
                  <h5>Support</h5>
                  <Button as={Link} to="/support" variant="outline-warning" className="w-100">
                    Get Help
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Footer Stats */}
      <Container className="py-5 bg-light">
        <Row className="text-center">
          <Col md={3}>
            <div>
              <h2 className="stats-number">50K+</h2>
              <p className="text-muted">Daily Bookings</p>
            </div>
          </Col>
          <Col md={3}>
            <div>
              <h2 className="stats-number">500+</h2>
              <p className="text-muted">Train Routes</p>
            </div>
          </Col>
          <Col md={3}>
            <div>
              <h2 className="stats-number">99.9%</h2>
              <p className="text-muted">Uptime</p>
            </div>
          </Col>
          <Col md={3}>
            <div>
              <h2 className="stats-number">24/7</h2>
              <p className="text-muted">Support</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RailwayHome;
