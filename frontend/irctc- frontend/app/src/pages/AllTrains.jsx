import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrain,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";

axios.defaults.baseURL = "http://localhost:8080";

export default function AllTrains() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/trains/all") // Assuming a backend endpoint for all trains
      .then((res) => {
        setTrains(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch train list.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container mt-4 alert alert-info">Loading trains...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  if (trains.length === 0) {
    return <div className="container mt-4 alert alert-warning">No trains found.</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">
        <FontAwesomeIcon icon={faTrain} className="me-2" />
        All Available Trains
      </h2>
      <div className="row">
        {trains.map((train) => (
          <div className="col-md-6 col-lg-4 mb-4" key={train.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <Link to={`/train-detail/${train.id}`} className="text-decoration-none">
                    {train.name} (<FontAwesomeIcon icon={faHashtag} className="me-1" />{train.number})
                  </Link>
                </h5>
                <p className="card-text mb-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  From: {train.fromStation} To: {train.toStation}
                </p>
                <p className="card-text mb-1">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Departure: {train.departureTime} Arrival: {train.arrivalTime}
                </p>
                <p className="card-text mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Scheduled: {train.scheduledDate}
                </p>
                <p className="card-text mb-1">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Running Days: {train.runningDays}
                </p>
                <Link to={`/train-detail/${train.id}`} className="btn btn-sm btn-outline-primary mt-3">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 