import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicketAlt, 
  faExclamationTriangle, 
  faSpinner,
  faCheckCircle,
  faSync,
  faPlus,
  faEye,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

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

function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Handle both string and JSON user formats
      let user = null;
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (err) {
          // If JSON parsing fails, treat as string (email)
          user = { email: userData };
        }
      }
      const token = user?.token;

      const response = await axios.get('http://localhost:8080/api/support/my-tickets', {
        params: {
          page: 0,
          size: 50
        },
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // The backend returns a Page object, we need to extract the content
      const responseData = response.data.content || [];
      
      setTickets(responseData);
      toast.success(`Loaded ${responseData.length} ticket(s)`);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to load your support tickets. Please try again later.');
      
      // Fallback to localStorage if available
      const savedTickets = localStorage.getItem('mySupportTickets');
      if (savedTickets) {
        try {
          setTickets(JSON.parse(savedTickets));
          toast.info('Loaded tickets from local storage (offline mode)');
        } catch (e) {
          console.error('Error parsing saved tickets:', e);
          toast.error('Failed to parse saved tickets.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        await axios.delete(`http://localhost:8080/api/support/public/${ticketId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Remove the ticket from the local state
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        toast.success('Ticket deleted successfully');
      } catch (err) {
        console.error('Error deleting ticket:', err);
        toast.error('Failed to delete ticket. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <FontAwesomeIcon icon={faTicketAlt} className="me-2 text-primary" />
              My Support Tickets
            </h2>
            <div className="d-flex gap-2">

              <button 
                className="btn btn-primary btn-sm"
                onClick={() => window.location.href = '/support/new'}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                New Ticket
              </button>
            </div>
          </div>
        </div>
      </div>



      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card">
          <div className="card-body text-center p-5">
            <FontAwesomeIcon 
              icon={faTicketAlt} 
              className="text-muted mb-3" 
              size="3x"
            />
            <h5>No support tickets found</h5>
            <p className="text-muted">
              You haven't created any support tickets yet.
            </p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => window.location.href = '/contact'}
            >
              Create New Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  // Extract subject and description from the issue field
                  const issueText = ticket.issue || '';
                  const subjectMatch = issueText.match(/^\[(.*?)\]/);
                  const subject = subjectMatch ? subjectMatch[1] : 'No Subject';
                  const description = issueText.replace(/^\[.*?\]\s*\n*/, '').trim() || 'No description';
                  
                  return (
                    <tr key={ticket.id} style={{ cursor: 'pointer' }}>
                      <td>#{ticket.id}</td>
                      <td>
                        <div className="fw-semibold">
                          <a 
                            href={`/support/${ticket.id}`} 
                            className="text-decoration-none"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/support/${ticket.id}`;
                            }}
                          >
                            {subject}
                          </a>
                        </div>
                        <small className="text-muted">
                          {`${description.substring(0, 60)}${description.length > 60 ? '...' : ''}`}
                        </small>
                      </td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a 
                            href={`/support/${ticket.id}`}
                            className="btn btn-outline-primary"
                            title="View/Edit Ticket"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/support/${ticket.id}`;
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </a>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            disabled={loading}
                            title="Delete Ticket"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportDashboard;
