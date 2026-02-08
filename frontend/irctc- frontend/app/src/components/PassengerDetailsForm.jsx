import React from 'react';
import { Row, Col, Form, Card } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';

const PassengerDetailsForm = ({ passengers, onPassengerChange, formErrors }) => {
  return (
    <Card className="mt-4">
      <Card.Header>
        <h5><FaUser className="me-2" />Passenger Details</h5>
      </Card.Header>
      <Card.Body>
        {passengers.map((passenger, index) => (
          <div key={index} className={index > 0 ? 'mt-4 pt-4 border-top' : ''}>
            <h6>Passenger {index + 1} (Seat: {passenger.seatId})</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={passenger.name}
                    onChange={(e) => onPassengerChange(index, 'name', e.target.value)}
                    isInvalid={!!formErrors[`passenger-${index}-name`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`passenger-${index}-name`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Age"
                    value={passenger.age}
                    onChange={(e) => onPassengerChange(index, 'age', e.target.value)}
                    isInvalid={!!formErrors[`passenger-${index}-age`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`passenger-${index}-age`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={passenger.gender}
                    onChange={(e) => onPassengerChange(index, 'gender', e.target.value)}
                    isInvalid={!!formErrors[`passenger-${index}-gender`]}
                  >
                    <option value="">Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`passenger-${index}-gender`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Aadhaar Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="12-digit Aadhaar number"
                    value={passenger.aadhaar}
                    onChange={(e) => onPassengerChange(index, 'aadhaar', e.target.value)}
                    isInvalid={!!formErrors[`aadhaar_${index}`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`aadhaar_${index}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="10-digit phone number"
                    value={passenger.phone}
                    onChange={(e) => onPassengerChange(index, 'phone', e.target.value)}
                    isInvalid={!!formErrors[`phone_${index}`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`phone_${index}`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default PassengerDetailsForm;
