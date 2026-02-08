import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicketAlt,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faReply,
  faEye,
  faEnvelope,
  faCog,
  faCalendar,
  faSearch,
  faFilter,
  faSync,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form } from 'react-bootstrap';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'OPEN': { color: 'warning', text: 'OPEN', icon: '⏳' },
    'pending': { color: 'warning', text: 'OPEN', icon: '⏳' },
    'IN_PROGRESS': { color: 'info', text: 'IN PROGRESS', icon: '🔄' },
    'in-progress': { color: 'info', text: 'IN PROGRESS', icon: '🔄' },
    'RESOLVED': { color: 'success', text: 'RESOLVED', icon: '✅' },
    'resolved': { color: 'success', text: 'RESOLVED', icon: '✅' },
    'CLOSED': { color: 'secondary', text: 'CLOSED', icon: '🔒' },
    'closed': { color: 'secondary', text: 'CLOSED', icon: '🔒' }
  };

  const config = statusConfig[status] || { color: 'light', text: status, icon: '❓' };

  return (
    <span className={`badge bg-${config.color} text-white`}>
      {config.icon} {config.text}
    </span>
  );
};

// Main HelpDeskDashboard component
const HelpDeskDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || replyMessage.trim().length < 10) {
      setError('Reply message must be at least 10 characters long.');
      return;
    }
    if (!selectedTicket) return;
    
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }
      
      // Use the response endpoint that matches the backend API
      const response = await fetch(`http://localhost:8080/api/support/${selectedTicket.id}/response`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${user.token}`
        },
        body: new URLSearchParams({
          response: `[AGENT REPLY]\n${replyMessage}`
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to send reply');
      }
      
      // Refresh tickets and close modal
      await fetchTickets();
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedTicket(null);
      
      // Show success message
      setError('');
    } catch (err) {
      console.error('Error sending reply:', err);
      setError(err.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ticket status update
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }
      
      // Map the frontend status to the backend SupportStatus enum
      const statusMap = {
        'RESOLVED': 'RESOLVED',
        'CLOSED': 'CLOSED',
        'IN_PROGRESS': 'IN_PROGRESS',
        'OPEN': 'OPEN'
      };
      
      const backendStatus = statusMap[newStatus] || 'OPEN';
      
      // Use the status update endpoint
      const response = await fetch(`http://localhost:8080/api/support/${ticketId}/status?status=${backendStatus}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Status update error response:', errorData);
        throw new Error(errorData.message || 'Failed to update ticket status');
      }
      
      // Show success message
      setError(`Ticket marked as ${backendStatus} successfully!`);
      
      // Refresh tickets after a short delay to show the success message
      setTimeout(fetchTickets, 1000);
      
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError(err.message || 'Failed to update ticket status. Please try again.');
    }
  };

  // Fetch tickets from backend API (admin endpoint)
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch('http://localhost:8080/api/support', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // The backend returns a Page object, we need to extract the content
        setTickets(data.content || []);
      } else {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    // Search term filter
    const matchesSearch = 
      !searchTerm ||
      (ticket.issue?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.id?.toString().includes(searchTerm)) ||
      (ticket.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = 
      filters.status === 'all' || 
      ticket.status?.toLowerCase() === filters.status.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-primary" />
              Help Desk Dashboard
            </h2>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchTickets}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} className={loading ? 'fa-spin' : ''} />
              <span className="ms-1">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tickets by ID, issue, description, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    status: 'all',
                    priority: 'all',
                    dateRange: 'all'
                  });
                }}
              >
                <FontAwesomeIcon icon={faFilter} className="me-1" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center p-5">
              <FontAwesomeIcon icon={faTicketAlt} className="text-muted mb-3" size="3x" />
              <h5>No tickets found</h5>
              <p className="text-muted">
                {searchTerm || filters.status !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No tickets have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id}>
                      <td>#{ticket.id}</td>
                      <td>
                        <div className="fw-semibold">{ticket.issue || 'No Subject'}</div>
                        <small className="text-muted">
                          {ticket.description ? 
                            `${ticket.description.substring(0, 60)}${ticket.description.length > 60 ? '...' : ''}` : 
                            'No description'}
                        </small>
                      </td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center">
                              <FontAwesomeIcon 
                                icon={faUser} 
                                className="text-muted" 
                              />
                            </div>
                          </div>
                          <div>
                            <div className="fw-medium">{ticket.name || 'Unknown User'}</div>
                            <small className="text-muted">{ticket.email || 'No email'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {ticket.createdAt ? 
                          new Date(ticket.createdAt).toLocaleDateString() : 
                          'N/A'}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            title="View Details"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              // You can implement view details functionality here
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success"
                            title="Reply"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowReplyModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faReply} />
                          </button>
                          {ticket.status?.toLowerCase() !== 'resolved' && ticket.status?.toLowerCase() !== 'closed' && (
                            <button 
                              className="btn btn-sm btn-outline-success"
                              title="Mark as Resolved"
                              onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          )}
                          {ticket.status?.toLowerCase() !== 'closed' && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              title="Close Ticket"
                              onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Ticket #{selectedTicket?.id}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReplySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Your Reply</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                required
              />
            </Form.Group>
            {error && <div className="alert alert-danger">{error}</div>}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowReplyModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting || !replyMessage.trim()}
            >
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HelpDeskDashboard;
