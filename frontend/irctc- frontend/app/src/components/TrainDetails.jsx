import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FaTrain, FaClock, FaLocationDot, FaCalendarDay } from 'react-icons/fa6';

const TrainDetails = ({ train, searchParams }) => {
  if (!train || !searchParams) return null;

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return "--";
    
    const depTime = departure.split(":");
    const arrTime = arrival.split(":");
    
    const depDate = new Date();
    depDate.setHours(parseInt(depTime[0]), parseInt(depTime[1]));
    
    const arrDate = new Date();
    arrDate.setHours(parseInt(arrTime[0]), parseInt(arrTime[1]));
    
    if (arrDate < depDate) {
      arrDate.setDate(arrDate.getDate() + 1);
    }
    
    const diffMs = arrDate - depDate;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">
          <FaTrain className="me-2 text-primary" />
          Journey Details
        </h5>
      </Card.Header>
      <Card.Body>
        <Row className="align-items-center mb-3">
          <Col md={8}>
            <h4 className="mb-1">{train.name || 'Train Name'}</h4>
            <div className="text-muted">#{train.number || '--'}</div>
          </Col>
        </Row>

        <Row className="text-center mb-3">
          <Col xs={5}> 
            <div className="fw-bold">{formatTime(train.departureTime)}</div>
            <div className="text-muted small">
              <FaLocationDot className="me-1" />
              {train.fromStation || '--'}
            </div>
          </Col>
          <Col xs={2} className="d-flex flex-column align-items-center justify-content-center">
            <FaClock className="text-muted"/>
            <div className="text-muted small mt-1">
              {calculateDuration(train.departureTime, train.arrivalTime)}
            </div>
          </Col>
          <Col xs={5}>
            <div className="fw-bold">{formatTime(train.arrivalTime)}</div>
            <div className="text-muted small">
              <FaLocationDot className="me-1" />
              {train.toStation || '--'}
            </div>
          </Col>
        </Row>

        <Row className="mt-3 pt-3 border-top">
          <Col>
            <div className="text-muted small text-center">
              <FaCalendarDay className="me-1" />
              Journey Date: {new Date(searchParams.date).toLocaleDateString('en-GB', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TrainDetails;
