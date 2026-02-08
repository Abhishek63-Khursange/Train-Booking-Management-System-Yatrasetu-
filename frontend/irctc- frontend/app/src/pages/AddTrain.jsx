import React, { useState } from "react";
import api from "../services/api";

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

const AddTrain = () => {
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

    if (!form.name.trim() || !/^[a-zA-Z\s]+$/.test(form.name))
      newErrors.name = "Train name must contain only letters and spaces";
    if (!form.number || isNaN(form.number) || form.number < 10000)
      newErrors.number = "Train number must be at least 5 digits";
    if (!form.fromStation.trim() || !/^[a-zA-Z\s]+$/.test(form.fromStation))
      newErrors.fromStation = "From station must contain only letters and spaces";
    if (!form.toStation.trim() || !/^[a-zA-Z\s]+$/.test(form.toStation))
      newErrors.toStation = "To station must contain only letters and spaces";
    if (!form.departureTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/))
      newErrors.departureTime = "Departure time must be in HH:mm format";
    if (!form.arrivalTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/))
      newErrors.arrivalTime = "Arrival time must be in HH:mm format";
    if (form.runningDays.length === 0)
      newErrors.runningDays = "Select at least one running day";
    if (!form.scheduledDate) {
      newErrors.scheduledDate = "Scheduled date is required";
    } else {
      const today = new Date();
      const scheduled = new Date(form.scheduledDate);
      today.setHours(0, 0, 0, 0); // Compare dates only
      if (scheduled < today) {
        newErrors.scheduledDate = "Scheduled date cannot be in the past";
      }
    }

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
      const payload = {
        name: form.name,
        number: parseInt(form.number),
        fromStation: form.fromStation,
        toStation: form.toStation,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        runningDays: form.runningDays.join(","),
        scheduledDate: form.scheduledDate,
        actualRunningDate: form.actualRunningDate || null
      };

      console.log("Sending payload:", payload);
      const response = await api.post("/trains", payload);
      console.log("Response:", response);

      setMessage("Train added successfully ✅");
      setForm({
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
    } catch (err) {
      console.error(err);
      setMessage("Error: Failed to add train ❌");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Train</h2>
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

        <button className="btn btn-primary">Add Train</button>
      </form>
    </div>
  );
};

export default AddTrain;
