import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "./AddTrain.css";

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

const UpdateTrain = () => {
  const { trainId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    number: "",
    fromStation: "",
    toStation: "",
    departureTime: "",
    arrivalTime: "",
    runningDays: [],
    scheduledDate: "",
    actualRunningDate: "",
  });

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTrain = async () => {
      try {
        const response = await API.get(`/trains/${trainId}`);
        const data = response.data;
        setForm({
          ...data,
          runningDays: data.runningDays ? data.runningDays.split(",") : [],
        });
      } catch (err) {
        console.error(err);
        setMessage("Error: Failed to fetch train data ");
      }
    };
    fetchTrain();
  }, [trainId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRunningDayChange = (day) => {
    setForm((prev) => {
      const updated = prev.runningDays.includes(day)
        ? prev.runningDays.filter((d) => d !== day)
        : [...prev.runningDays, day];
      return { ...prev, runningDays: updated };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Train name is required";
    if (!form.number || isNaN(form.number) || form.number < 10000)
      newErrors.number = "Train number must be at least 5 digits";
    if (!form.fromStation.trim()) newErrors.fromStation = "From station is required";
    if (!form.toStation.trim()) newErrors.toStation = "To station is required";
    if (!form.departureTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/))
      newErrors.departureTime = "Departure time must be in HH:mm format";
    if (!form.arrivalTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/))
      newErrors.arrivalTime = "Arrival time must be in HH:mm format";
    if (form.runningDays.length === 0)
      newErrors.runningDays = "Select at least one running day";
    if (!form.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      setMessage("Please fix the validation errors.");
      return;
    }

    try {
      // Get the current user's token
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;
      
      if (!token) {
        setMessage('Authentication required. Please log in again.');
        return;
      }

      // Format runningDays as a comma-separated string of day codes (e.g., "MO,TU,WE,TH,FR")
      // The backend expects the format to match the pattern: ^(MO|TU|WE|TH|FR|SA|SU)(,(MO|TU|WE|TH|FR|SA|SU))*$
      const formatRunningDays = (days) => {
        if (!Array.isArray(days)) return '';
        
        const dayMap = {
          'MONDAY': 'MO',
          'TUESDAY': 'TU',
          'WEDNESDAY': 'WE',
          'THURSDAY': 'TH',
          'FRIDAY': 'FR',
          'SATURDAY': 'SA',
          'SUNDAY': 'SU',
          'MO': 'MO',
          'TU': 'TU',
          'WE': 'WE',
          'TH': 'TH',
          'FR': 'FR',
          'SA': 'SA',
          'SU': 'SU',
          'MTWTF': 'MO,TU,WE,TH,FR',
          'MTWTF,TH,FR': 'MO,TU,WE,TH,FR',
          'MTWTF,SA,SU': 'MO,TU,WE,TH,FR,SA,SU'
        };
        
        // Handle special cases
        if (days.length === 1 && dayMap[days[0]]) {
          return dayMap[days[0]];
        }
        
        // Process each day, convert to code, and remove duplicates
        const daySet = new Set();
        days.forEach(day => {
          const code = dayMap[day] || day;
          if (code.includes(',')) {
            code.split(',').forEach(d => daySet.add(d));
          } else {
            daySet.add(code);
          }
        });
        
        return Array.from(daySet).join(',');
      };

      const payload = {
        name: form.name,
        number: parseInt(form.number),
        fromStation: form.fromStation,
        toStation: form.toStation,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        runningDays: formatRunningDays(form.runningDays),
        scheduledDate: form.scheduledDate,
        actualRunningDate: form.actualRunningDate || null,
      };

      // Log the payload for debugging
      console.log('Sending update payload:', JSON.stringify(payload, null, 2));
      
      // Make the update request with authorization header
      const response = await API.put(`/trains/${trainId}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        setMessage("Train updated successfully!");
        setTimeout(() => navigate("/train-detail"), 2000);
      } else {
        console.error('Unexpected response:', response);
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      
      if (err.response?.status === 500) {
        // Log full error details for 500 errors
        console.error('Server error details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          headers: err.response.headers,
          data: err.response.data
        });
        setMessage('Server error occurred while updating the train. Please check the console for details.');
      } else if (err.response?.status === 403) {
        setMessage('Error: You do not have permission to update this train.');
      } else if (err.response?.status === 401) {
        setMessage('Error: Session expired. Please log in again.');
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setMessage(`Error: ${errorData}`);
        } else if (errorData.message) {
          setMessage(`Error: ${errorData.message}`);
        } else {
          const errorMessages = Object.values(errorData).join(", ");
          setMessage(`Error: ${errorMessages}`);
        }
      } else {
        setMessage(`Error: ${err.message || 'Failed to update train. Please try again.'}`);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Update Train</h2>
      {message && (
        <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-danger"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow">
        {[
          { label: "Train Name", name: "name", type: "text" },
          { label: "Train Number", name: "number", type: "number" },
          { label: "From Station", name: "fromStation", type: "text" },
          { label: "To Station", name: "toStation", type: "text" },
          { label: "Departure Time", name: "departureTime", type: "time" },
          { label: "Arrival Time", name: "arrivalTime", type: "time" },
          { label: "Scheduled Date", name: "scheduledDate", type: "date" },
          { label: "Actual Running Date", name: "actualRunningDate", type: "date" },
        ].map(({ label, name, type }) => (
          <div key={name} className="mb-3">
            <label className="form-label">{label}</label>
            <input
              type={type}
              name={name}
              className={`form-control ${errors[name] ? "is-invalid" : ""}`}
              value={form[name]}
              onChange={handleChange}
              required={name !== "actualRunningDate"}
            />
            {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
          </div>
        ))}

        <div className="mb-3">
          <label className="form-label">Running Days</label>
          <div className="d-flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="form-check form-check-inline">
                <input
                  type="checkbox"
                  id={day}
                  className="form-check-input"
                  checked={form.runningDays.includes(day)}
                  onChange={() => handleRunningDayChange(day)}
                />
                <label htmlFor={day} className="form-check-label">{day}</label>
              </div>
            ))}
          </div>
          {errors.runningDays && <div className="text-danger mt-1">{errors.runningDays}</div>}
        </div>

        <button className="btn btn-primary">Update Train</button>
      </form>
    </div>
  );
};

export default UpdateTrain;
