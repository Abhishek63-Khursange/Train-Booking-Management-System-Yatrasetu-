/**
 * Test data setup utilities for development and testing
 * These functions help set up test coaches and seats in the database
 */

const API_BASE_URL = 'http://localhost:8080';

/**
 * Set up test coaches for a train
 * @param {string} trainId - ID of the train to set up coaches for
 * @returns {Promise<Object>} Response from the API
 */
export const setupTestCoaches = async (trainId) => {
  if (!trainId) {
    console.error('Train ID is required');
    return { error: 'Train ID is required' };
  }

  try {
    console.log(`Setting up test coaches for train ${trainId}...`);
    const response = await fetch(`${API_BASE_URL}/api/trains/${trainId}/setup-test-coaches`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Successfully set up test coaches:', result);
    } else {
      console.error('Failed to set up test coaches:', result.error || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error('Error setting up test coaches:', error);
    return { error: error.message };
  }
};

/**
 * Check coaches for a train
 * @param {string} trainId - ID of the train to check coaches for
 * @returns {Promise<Object>} List of coaches
 */
export const checkCoaches = async (trainId) => {
  if (!trainId) {
    console.error('Train ID is required');
    return { error: 'Train ID is required' };
  }

  try {
    console.log(`Checking coaches for train ${trainId}...`);
    const response = await fetch(`${API_BASE_URL}/api/trains/${trainId}/coaches`, {
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Coaches:', result);
    } else {
      console.error('Failed to fetch coaches:', result.error || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error('Error checking coaches:', error);
    return { error: error.message };
  }
};

/**
 * Set up test seats for coaches of a train
 * @param {string} trainId - ID of the train
 * @returns {Promise<Object>} Response from the API
 */
export const setupSeatsForCoaches = async (trainId) => {
  if (!trainId) {
    console.error('Train ID is required');
    return { error: 'Train ID is required' };
  }

  try {
    console.log(`Setting up test seats for coaches of train ${trainId}...`);
    const response = await fetch(`${API_BASE_URL}/trains/${trainId}/setup-test-seats`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Successfully set up test seats:', result);
    } else {
      console.error('Failed to set up test seats:', result.error || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error('Error setting up test seats:', error);
    return { error: error.message };
  }
};

/**
 * Check seats for a specific coach
 * @param {string} coachId - ID of the coach to check seats for
 * @returns {Promise<Object>} List of seats
 */
export const checkSeatsForCoach = async (coachId) => {
  if (!coachId) {
    console.error('Coach ID is required');
    return { error: 'Coach ID is required' };
  }

  try {
    console.log(`Checking seats for coach ${coachId}...`);
    const response = await fetch(`${API_BASE_URL}/api/coaches/${coachId}/seats`, {
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Seats:', result);
    } else {
      console.error('Failed to fetch seats:', result.error || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error('Error checking seats:', error);
    return { error: error.message };
  }
};

/**
 * Clear test data for a train
 * @param {string} trainId - ID of the train to clear test data for
 * @returns {Promise<Object>} Response from the API
 */
export const clearTestData = async (trainId) => {
  if (!trainId) {
    console.error('Train ID is required');
    return { error: 'Train ID is required' };
  }

  try {
    console.log(`Clearing test data for train ${trainId}...`);
    const response = await fetch(`${API_BASE_URL}/api/trains/${trainId}/clear-test-data`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Successfully cleared test data:', result);
    } else {
      console.error('Failed to clear test data:', result.error || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error('Error clearing test data:', error);
    return { error: error.message };
  }
};

// Helper function to get auth headers
function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  
  return headers;
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.setupTestCoaches = setupTestCoaches;
  window.checkCoaches = checkCoaches;
  window.setupSeatsForCoaches = setupSeatsForCoaches;
  window.checkSeatsForCoach = checkSeatsForCoach;
  window.clearTestData = clearTestData;
}
