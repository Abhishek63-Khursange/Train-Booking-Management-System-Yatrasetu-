import React, { useState } from 'react';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const CancelTicket = () => {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCancel = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pnr.trim()) {
      setError('⚠️ Please enter a PNR number to cancel the ticket.');
      return;
    }
    
    if (pnr.length < 8) {
      setError('⚠️ PNR number must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      // First check if booking belongs to current user
      const checkResponse = await api.get(`/api/bookings/pnr/${pnr}`);
      
      if (checkResponse.data) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserEmail = currentUser.email || currentUser.username;
        
        if (checkResponse.data.userEmail !== currentUserEmail) {
          setError("This booking belongs to another user. You can only cancel your own bookings.");
          return;
        }
      }
      
      // If booking belongs to user, proceed with cancellation
      await api.delete(`/api/bookings/cancel/${pnr}`);
      setSuccess(`✅ Success! Your booking with PNR ${pnr} has been cancelled. A confirmation email will be sent to your registered email address.`);
      setPnr('');
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No booking found with PNR: ${pnr}. Please check the PNR number and try again.`);
      } else if (err.response?.status === 403) {
        setError(`⚠️ Access Denied: You can only cancel your own bookings.`);
      } else if (err.response?.data?.error) {
        setError(`Failed to cancel booking: ${err.response.data.error}`);
      } else if (err.response?.data?.message) {
        setError(`Failed to cancel booking: ${err.response.data.message}`);
      } else {
        setError('Unable to cancel ticket. Please check your PNR number and try again. If the problem persists, contact support.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4>Cancel Ticket</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleCancel}>
                <div className="mb-3">
                  <label htmlFor="pnrInput" className="form-label">Enter PNR Number</label>
                  <input
                    type="text"
                    id="pnrInput"
                    className="form-control"
                    placeholder="Enter PNR to cancel"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  />
                </div>
                {error && (
                  <div className="alert alert-danger">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    {success}
                  </div>
                )}
                <div className="d-grid">
                  <button type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? 'Cancelling...' : (
                      <><FontAwesomeIcon icon={faTrashAlt} className="me-2" />Cancel Ticket</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelTicket;
