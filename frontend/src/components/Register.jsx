import React, { useState } from "react";
import { api } from "../services/api";

export default function Register({ onSwitchToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "Computer Science & Engineering"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields (Name, Email, Password).");
      return;
    }

    try {
      setLoading(true);
      const res = await api.register(formData);
      setSuccessMsg(res.message || "Registration successful! You can now login.");
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: "36px" }}>🎓</div>
          <h2>Student Registration</h2>
          <p>Create an account to submit campus maintenance requests</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Mahasri K"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="e.g. student@college.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              name="department"
              className="form-control"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
              <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Hostel Resident">Hostel Resident</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Student"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}
          >
            Sign in here
          </a>
        </div>
      </div>
    </div>
  );
}
