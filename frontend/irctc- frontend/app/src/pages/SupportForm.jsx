import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTicketAlt,
  faUser,
  faEnvelope,
  faExclamationTriangle,
  faSpinner,
  faCheckCircle,
  faClock,
  faArrowLeft,
  faComment,
  faPaperPlane,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'OPEN': { color: 'warning', text: 'OPEN', icon: '⏳' },
    'PENDING': { color: 'warning', text: 'PENDING', icon: '⏳' },
    'IN_PROGRESS': { color: 'info', text: 'IN PROGRESS', icon: '🔄' },
    'RESOLVED': { color: 'success', text: 'RESOLVED', icon: '✅' },
    'CLOSED': { color: 'secondary', text: 'CLOSED', icon: '🔒' }
  };

  const config = statusConfig[status] || { color: 'light', text: status, icon: '❓' };

  return (
    <span className={`badge bg-${config.color} text-white`}>
      {config.icon} {config.text}
    </span>
  );
};

// Message component for the chat interface
const Message = ({ message, isAgent }) => (
  <div className={`d-flex mb-3 ${isAgent ? 'justify-content-end' : 'justify-content-start'}`}>
    <div className={`card ${isAgent ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '80%' }}>
      <div className="card-body p-2">
        <div className="d-flex align-items-center mb-1">
          <FontAwesomeIcon 
            icon={isAgent ? faUserTie : faUser} 
            className={`me-2 ${isAgent ? 'text-white' : 'text-muted'}`} 
          />
          <small className="text-muted">
            {isAgent ? 'Help Desk Agent' : 'You'} • {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </small>
        </div>
        <p className="mb-0">{message.text}</p>
        {message.statusChange && (
          <small className="d-block mt-1">
            <em>Status changed to: <StatusBadge status={message.statusChange} /></em>
          </small>
        )}
      </div>
    </div>
  </div>
);

function SupportForm({ ticketId, onSuccess }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'OPEN'
  });
  
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticketStatus, setTicketStatus] = useState('OPEN');
  const [statusHistory, setStatusHistory] = useState([]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is an agent
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAgent(user?.role === 'ADMIN' || user?.role === 'AGENT');
  }, []);

  // Load ticket data and messages
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const ticketIdToFetch = ticketId || id;
        if (!ticketIdToFetch) return;
        
        setIsEditing(true);
        
        // Fetch ticket data
        const response = await axios.get(`http://localhost:8080/api/support/${ticketIdToFetch}`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
          }
        });
        
        const ticketData = response.data;
        setFormData({
          subject: ticketData.subject || '',
          description: ticketData.description || '',
          priority: ticketData.priority || 'medium',
          category: ticketData.category || 'general',
          status: ticketData.status || 'OPEN'
        });
        
        setTicketStatus(ticketData.status || 'OPEN');
        
        // Fetch messages
        const messagesResponse = await axios.get(`http://localhost:8080/api/support/${ticketIdToFetch}/messages`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
          }
        });
        
        setMessages(messagesResponse.data || []);
        
        // Fetch status history
        const historyResponse = await axios.get(`http://localhost:8080/api/support/${ticketIdToFetch}/history`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
          }
        });
        
        setStatusHistory(historyResponse.data || []);
        
      } catch (err) {
        console.error('Error fetching ticket data:', err);
        toast.error('Failed to load ticket data');
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100); // Scroll after content loads
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageToSend = {
      text: newMessage,
      isAgent: isAgent,
      timestamp: new Date().toISOString()
    };
    
    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:8080/api/support/${ticketId || id}/messages`,
        { message: newMessage },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
          }
        }
      );
      
      setMessages([...messages, messageToSend]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8080/api/support/${ticketId || id}/status`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
          }
        }
      );
      
      setTicketStatus(newStatus);
      
      // Add status change to messages
      const statusMessage = {
        text: `Status updated to ${newStatus}`,
        isAgent: true,
        timestamp: new Date().toISOString(),
        statusChange: newStatus
      };
      
      setMessages([...messages, statusMessage]);
      toast.success('Status updated successfully');
      setTimeout(scrollToBottom, 100);
      
      // Refresh status history
      const historyResponse = await axios.get(`http://localhost:8080/api/support/${ticketId || id}/history`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}')?.token}`
        }
      });
      
      setStatusHistory(historyResponse.data || []);
      
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.description || formData.description.trim().length < 10) {
      toast.error('Please provide a more detailed description (minimum 10 characters)');
      return;
    }
    
    if (formData.description.length > 2000) {
      toast.error('Description is too long (maximum 2000 characters)');
      return;
    }
    
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.email) {
        throw new Error('Please log in to submit a support ticket.');
      }

      // Format data according to backend's SupportRequest DTO
      const requestData = {
        issue: formData.description, // Backend expects 'issue' instead of 'description'
        name: user.name || 'Anonymous User', // Make sure name is always provided
        email: user.email || 'no-email@example.com', // Make sure email is always provided
        // Include additional fields if needed by the backend
        subject: formData.subject,
        priority: formData.priority,
        category: formData.category,
        status: formData.status
      };
      
      console.log('Sending request data:', requestData); // For debugging

      let response;
      if (isEditing && ticketId) {
        // For updates, we'll use the update status endpoint
        response = await axios.put(
          `http://localhost:8080/api/support/${ticketId}/status`,
          null, // No request body for this endpoint
          { 
            params: {
              status: formData.status,
              notes: formData.description
            },
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            } 
          }
        );
      } else {
        // Create new ticket
        response = await axios.post(
          'http://localhost:8080/api/support/public',
          requestData,
          { 
            headers: { 
              'Content-Type': 'application/json'
              // Note: No Authorization header for public endpoint
            } 
          }
        );
      }

      toast.success(isEditing ? 'Ticket updated successfully!' : 'Ticket submitted successfully!');
      
      // Reset form if not in edit mode
      if (!isEditing) {
        setFormData({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'general',
          status: 'OPEN'
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Redirect to support dashboard after 2 seconds
      setTimeout(() => {
        navigate('/support');
      }, 2000);

    } catch (err) {
      console.error('Error submitting ticket:', err);
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to submit ticket. Please try again.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'info' },
    { value: 'medium', label: 'Medium', color: 'warning' },
    { value: 'high', label: 'High', color: 'danger' },
    { value: 'urgent', label: 'Urgent', color: 'danger' }
  ];

  const categoryOptions = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Booking Issue' },
    { value: 'payment', label: 'Payment Problem' },
    { value: 'refund', label: 'Refund Request' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'other', label: 'Other' }
  ];

  if (loading && !isEditing) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading ticket data...</p>
      </div>
    );
  }

  // Render status selector for agents
  const renderStatusSelector = () => {
    if (!isAgent) return null;
    
    return (
      <div className="mb-3">
        <label className="form-label">Update Status</label>
        <div className="btn-group w-100" role="group">
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn btn-outline-${status === ticketStatus ? 'primary' : 'secondary'}`}
              onClick={() => handleStatusChange(status)}
              disabled={loading || status === ticketStatus}
            >
              <StatusBadge status={status} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render message input area
  const renderMessageInput = () => (
    <form onSubmit={handleSendMessage} className="mt-3">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <button 
          className="btn btn-primary" 
          type="submit"
          disabled={loading || !newMessage.trim()}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </form>
  );

  // Render status history
  const renderStatusHistory = () => {
    if (statusHistory.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h5>Status History</h5>
        <div className="list-group">
          {statusHistory.map((record, index) => (
            <div key={index} className="list-group-item">
              <div className="d-flex w-100 justify-content-between">
                <h6 className="mb-1">
                  <StatusBadge status={record.status} />
                </h6>
                <small className="text-muted">
                  {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                </small>
              </div>
              <p className="mb-0">
                <small className="text-muted">
                  Updated by: {record.updatedBy || 'System'}
                </small>
              </p>
              {record.notes && (
                <p className="mt-1 mb-0">{record.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isEditing) {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <button 
              className="btn btn-link mb-3 p-0"
              onClick={() => navigate(-1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to {isAgent ? 'Dashboard' : 'Support'}
            </button>
          </div>
        </div>
        
        <div className="row mt-3">
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Status</label>
                  <p className="mb-0"><StatusBadge status={ticketStatus} /></p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Priority</label>
                  <p className="mb-0">{formData.priority?.charAt(0).toUpperCase() + formData.priority?.slice(1) || 'Medium'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Category</label>
                  <p className="mb-0">{formData.category?.charAt(0).toUpperCase() + formData.category?.slice(1) || 'General'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Created</label>
                  <p className="mb-0">
                    {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {isAgent && renderStatusSelector()}
              </div>
            </div>
            {renderStatusHistory()}
          </div>
          
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Conversation</h5>
                <span className="badge bg-light text-dark">
                  <FontAwesomeIcon icon={faComment} className="me-1" />
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </span>
              </div>
              <div 
                className="card-body" 
                style={{ 
                  height: '500px', 
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa'
                }}
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <Message 
                      key={index} 
                      message={msg} 
                      isAgent={msg.isAgent} 
                    />
                  ))
                ) : (
                  <div className="text-center text-muted p-5">
                    <FontAwesomeIcon icon={faComment} size="3x" className="mb-3" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="card-footer">
                {renderMessageInput()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New ticket form
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Create New Support Ticket</h4>
            </div>
            <form onSubmit={handleSubmit} id="supportForm">
              <div className="card-body">
                <div className="row mb-3">
                <div className="col-md-12">
                  <label htmlFor="subject" className="form-label">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    disabled={loading}
                  />
                  <div className="form-text mb-3">
                    Please include any relevant details, error messages, or steps to reproduce the issue.
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="description" className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="5"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="priority" className="form-label">Priority</label>
                        <select
                          className="form-select"
                          id="priority"
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          disabled={loading}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group mb-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select
                          className="form-select"
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          disabled={loading}
                        >
                          <option value="general">General</option>
                          <option value="booking">Booking</option>
                          <option value="payment">Payment</option>
                          <option value="cancellation">Cancellation</option>
                          <option value="refund">Refund</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-md-2"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      {isEditing ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={isEditing ? faCheckCircle : faTicketAlt} className="me-2" />
                      {isEditing ? 'Update Ticket' : 'Submit Ticket'}
                    </>
                  )}
                </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportForm;
