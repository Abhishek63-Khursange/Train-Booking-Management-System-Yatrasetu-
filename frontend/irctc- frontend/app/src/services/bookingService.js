import api from './api';

// Get seat layout for a specific coach
export const getSeatLayout = async (coachId) => {
  try {
    const response = await api.get(`/api/seats/coach/${coachId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching seat layout:', error);
    throw error;
  }
};

// Get available seats for a specific coach
export const getAvailableSeats = async (coachId) => {
  try {
    const response = await api.get(`/api/seats/available/${coachId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available seats:', error);
    throw error;
  }
};

// Book a specific seat
export const bookSeat = async (seatId) => {
  try {
    const response = await api.post(
      `/api/seats/book/${seatId}`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error('Error booking seat:', error);
    throw error;
  }
};

// Book multiple seats in a single transaction
export const bookMultipleSeats = async (bookingRequest) => {
  try {
    console.log('=== BOOKING REQUEST ===');
    console.log('Endpoint:', '/api/bookings/book');
    console.log('Request data:', JSON.stringify(bookingRequest, null, 2));
    
    const response = await api.post(
      '/api/bookings/book',
      bookingRequest
    );

    console.log('=== BOOKING RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('Headers:', response.headers);

    // Handle non-2xx responses
    if (response.status >= 400) {
      const error = new Error(response.data?.message || 'Failed to book seats');
      error.response = response;
      throw error;
    }

    // Ensure we have a booking ID in the response
    if (!response.data.bookingId) {
      throw new Error('Invalid response from server: Missing booking ID');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in bookMultipleSeats:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    throw error;
  }
};

// Get booking details by PNR
export const getBookingByPnr = async (pnr) => {
    try {
    console.log(`Fetching booking for PNR: ${pnr}`);
    
    const response = await api.get(`/api/bookings/pnr/${pnr}`);
    console.log('Response status:', response.status);
    
    // Handle different status codes
    if (response.status === 200) {
      console.log('Booking details:', response.data);
      return response.data;
    } else {
      console.error('Unexpected status code:', response.status);
      console.error('Response data:', response.data);
      throw new Error(response.data?.message || 'Failed to fetch booking details');
    }
  } catch (error) {
    const errorDetails = {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      };
      
      console.error('Error in getBookingByPnr:', errorDetails);
      
      // If it's an authentication error, clear the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
      }
      
      throw error;
    }
  };

// Get coach layouts for a train
export const getCoachLayouts = async (trainId) => {
  try {
    const response = await api.get(`/api/layout/coaches/${trainId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching coach layouts:', error);
    throw error;
  }
};
