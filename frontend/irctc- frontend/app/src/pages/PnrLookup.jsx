import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faInfoCircle, faTrain, faUser, faCalendarAlt, faChair, faRupeeSign, faPrint } from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";

export default function PnrLookup() {
  const [pnr, setPnr] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const performPnrLookup = async (pnrToLookup) => {
    setError("");
    setMessage("");
    setBookingDetails(null);

    if (!pnrToLookup.trim()) {
      setError("Please enter a PNR number");
      return;
    }

    if (!pnrToLookup.match(/^PNR-[A-Z0-9]+$/i)) {
      setError("Please enter a valid PNR number (format: PNR-XXXXXX)");
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(`/api/bookings/pnr/${pnrToLookup}`);
      
      if (response.data) {
        // Check if booking belongs to current user
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserEmail = currentUser.email || currentUser.username;
        
        if (response.data.userEmail !== currentUserEmail) {
          setError("This booking belongs to another user. You can only view your own bookings.");
          setMessage("");
          return;
        }
        
        setBookingDetails(response.data);
        setMessage("✅ Your booking details found!");
      } else {
        setError("No booking found for this PNR");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No booking found for this PNR");
      } else if (err.response?.status === 403) {
        setError("This booking belongs to another user. You can only view your own bookings.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to lookup PNR. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePnrLookup = (e) => {
    e.preventDefault();
    performPnrLookup(pnr);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                PNR Lookup
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handlePnrLookup}>
                <div className="mb-3">
                  <label htmlFor="pnrInput" className="form-label">
                    Enter your PNR Number
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="pnrInput"
                      className="form-control"
                      placeholder="e.g., PNR-123456"
                      value={pnr}
                      onChange={(e) => setPnr(e.target.value.toUpperCase())}
                      required
                      pattern="^PNR-[A-Z0-9]+$"
                    />
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                  </div>
                )}
                
                {message && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {bookingDetails && (
            <div className="card shadow-sm mt-4" id="booking-details">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  Booking Details
                </h4>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>PNR Number:</strong>
                      <span className="text-primary">{bookingDetails.pnr}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Booking Status:</strong>
                      <span className="badge bg-success">{bookingDetails.bookingStatus}</span>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Train Name:</strong>
                      <span>{bookingDetails.trainName}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Train ID:</strong>
                      <span>{bookingDetails.trainId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>From Station:</strong>
                      <span>{bookingDetails.fromStation}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>To Station:</strong>
                      <span>{bookingDetails.toStation}</span>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Travel Date:</strong>
                      <span>{bookingDetails.travelDate}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Booking Time:</strong>
                      <span>{new Date(bookingDetails.bookingTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>Seat Class:</strong>
                      <span>{bookingDetails.seatClass}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <strong>User Email:</strong>
                      <span>{bookingDetails.userEmail}</span>
                    </div>
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12">
                    <h5 className="mt-3">Passenger Details:</h5>
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Phone</th>
                            <th>Seat ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingDetails.passengers && bookingDetails.passengers.map((passenger, index) => (
                            <tr key={index}>
                              <td>{passenger.name}</td>
                              <td>{passenger.age}</td>
                              <td>{passenger.gender}</td>
                              <td>{passenger.phone}</td>
                              <td>{passenger.seatId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    className="btn btn-success"
                    onClick={handlePrint}
                  >
                    <FontAwesomeIcon icon={faPrint} className="me-2" />
                    Print Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}