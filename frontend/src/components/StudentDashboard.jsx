import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function StudentDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("submit"); // "submit" | "history"
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    type: "Fan",
    location: "",
    description: "",
    priority: "Medium"
  });

  const fetchStudentComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentComplaints(user.userid);
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentComplaints();
  }, [user.userid]);

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!form.location || !form.description) {
      setMessage({ text: "Please enter the location and description.", type: "danger" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        studentid: user.userid,
        studentname: user.name,
        studentemail: user.email
      };

      const res = await api.createComplaint(payload);
      if (res.success) {
        setMessage({
          text: `Complaint #${res.complaint.complaintid} submitted successfully! Status is Pending.`,
          type: "success"
        });
        setForm({
          type: "Fan",
          location: "",
          description: "",
          priority: "Medium"
        });
        fetchStudentComplaints();
        setActiveTab("history");
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to submit complaint.", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const completedCount = complaints.filter((c) => c.status === "Completed").length;

  return (
    <div>
      {/* Student Welcome Banner */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Welcome, {user.name} 🎓</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Department: {user.department || "General"} | Student ID: #{user.userid}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-value">{complaints.length}</div>
            <div className="stat-label">Total Submitted</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            📋
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--info)" }}>{inProgressCount}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
            ⚙️
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{completedCount}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            ✅
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === "success" ? "✅" : "⚠️"} {message.text}
        </div>
      )}

      {/* Action Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "submit" ? "active" : ""}`}
          onClick={() => setActiveTab("submit")}
        >
          ➕ Submit New Request
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 My Requests ({complaints.length})
        </button>
      </div>

      {/* Submit Form Tab */}
      {activeTab === "submit" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">New Campus Maintenance Request</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Issue Category *</label>
                  <select
                    name="type"
                    className="form-control"
                    value={form.type}
                    onChange={handleInputChange}
                  >
                    <option value="Fan">Fan (Ceiling / Table Fan)</option>
                    <option value="Light">Light (Tube light / Bulb)</option>
                    <option value="Projector">Projector / Smart Board</option>
                    <option value="Bench">Bench / Desk / Furniture</option>
                    <option value="Electrical">Electrical Switch / Socket</option>
                    <option value="Plumbing">Plumbing / Tap / Restroom</option>
                    <option value="Air Conditioner">Air Conditioner (AC)</option>
                    <option value="Cleanliness">Classroom / Hall Cleanliness</option>
                    <option value="Other">Other Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    name="priority"
                    className="form-control"
                    value={form.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low - Normal repair</option>
                    <option value="Medium">Medium - Affects daily class</option>
                    <option value="High">High - Urgent / Exam hall issue</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location (Building / Room / Floor) *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. Block B - Room 302 or Main Library 1st Floor"
                  value={form.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description of Problem *</label>
                <textarea
                  name="description"
                  className="form-control"
                  placeholder="Describe the exact fault (e.g. Fan speed regulator is broken and sparking when turned on)..."
                  value={form.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Maintenance Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Maintenance Requests</h3>
            <button className="btn btn-secondary btn-sm" onClick={fetchStudentComplaints}>
              🔄 Refresh
            </button>
          </div>
          <div className="card-body" style={{ padding: "0" }}>
            {complaints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>📭</p>
                <p>No complaints submitted yet.</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "12px" }}
                  onClick={() => setActiveTab("submit")}
                >
                  Submit your first request
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Req ID</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Staff</th>
                      <th>Submitted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.complaintid}>
                        <td>
                          <strong>#{c.complaintid}</strong>
                        </td>
                        <td>
                          <strong>{c.type}</strong>
                        </td>
                        <td>{c.location}</td>
                        <td style={{ maxWidth: "260px" }}>{c.description}</td>
                        <td>
                          <span className={`badge-priority ${c.priority}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${c.status.replace(/\s+/g, "")}`}>
                            ● {c.status}
                          </span>
                        </td>
                        <td>
                          {c.staffname ? (
                            <span style={{ color: "#1e40af", fontWeight: "600" }}>
                              🛠️ {c.staffname}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
