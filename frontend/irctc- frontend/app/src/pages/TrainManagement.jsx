import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaTrain, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axiosConfig';
import './TrainManagement.css';

const TrainManagement = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrains = async (currentPage) => {
      try {
        setLoading(true);
        const response = await api.get(`/trains?page=${currentPage}&size=10`);
        const responseData = response.data;

        if (responseData && Array.isArray(responseData.content)) {
          setTrains(responseData.content);
          setTotalPages(responseData.totalPages);
        } else {
          console.error("API response did not contain a 'content' array:", responseData);
          setTrains([]);
          setError('Received invalid data structure from server.');
        }
      } catch (err) {
        setError('Failed to fetch trains. Please try again later.');
        toast.error('Failed to fetch trains.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrains(page);
  }, [page]);

  const handleDeleteClick = (train) => {
    setSelectedTrain(train);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTrain) return;
    
    setIsDeleting(true);
    const toastId = toast.loading('Deleting train...');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;
      
      if (!token) {
        toast.update(toastId, {
          render: 'Authentication required. Please log in again.',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          closeButton: true
        });
        return;
      }

      await api.delete(`/trains/${selectedTrain.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTrains(trains.filter(train => train.id !== selectedTrain.id));
      
      toast.update(toastId, {
        render: 'Train deleted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeButton: true
      });
    } catch (err) {
      console.error('Delete error:', err);
      let errorMessage = 'Failed to delete train. Please try again.';
      
      if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this train.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.update(toastId, {
        render: errorMessage,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
        closeButton: true
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedTrain(null);
    }
  };

  const handleUpdateTrain = (trainId) => {
    navigate(`/update-train/${trainId}`, { state: { from: window.location.pathname } });
  };

  if (loading) {
    return <div className="text-center"><Spinner animation="border" /> <p>Loading trains...</p></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="train-management">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="page-header">
        <h2 className="page-title">
          <FaTrain className="me-2" />
          Train Management
        </h2>
        <Button 
          variant="primary" 
          className="add-train-btn"
          onClick={() => navigate('/add-train', { state: { from: window.location.pathname } })}
        >
          <FaPlus className="me-2" />
          Add New Train
        </Button>
      </div>
      
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Train Name</th>
            <th>Train Number</th>
            <th>From</th>
            <th>To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((train, index) => (
            <tr key={train.id}>
              <td>{index + 1}</td>
              <td>{train.name}</td>
              <td>{train.number}</td>
              <td>{train.fromStation}</td>
              <td>{train.toStation}</td>
              <td>
                <div className="action-buttons">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="btn-update d-flex align-items-center justify-content-center"
                    onClick={() => handleUpdateTrain(train.id)}
                    disabled={isDeleting}
                  >
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="btn-delete d-flex align-items-center justify-content-center"
                    onClick={() => handleDeleteClick(train)}
                    disabled={isDeleting}
                  >
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center">
        <Button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
          <FaArrowLeft className="me-1" />
          Previous
        </Button>
        <span className="mx-3">Page {page + 1} of {totalPages}</span>
        <Button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}>
          <FaArrowRight className="me-1" />
          Next
        </Button>
      </div>
    </div>
  );
};

export default TrainManagement;
