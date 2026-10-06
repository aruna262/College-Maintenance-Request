import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function StaffDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("In Progress");
  const [staffNotes, setStaffNotes] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Fetch ALL complaints so staff can see every request campus-wide
      const res = await api.getAllComplaints();
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
    fetchComplaints();
  }, [user.userid]);


  const handleOpenUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status);
    setStaffNotes(complaint.staffnotes || "");
  };

  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setStaffNotes("");
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setLoading(true);
      const res = await api.updateComplaintStatus(selectedComplaint.complaintid, {
        status: updateStatus,
        staffnotes: staffNotes
      });

      if (res.success) {
        setAlertMsg(`Request #${selectedComplaint.complaintid} updated to '${updateStatus}'!`);
        setTimeout(() => setAlertMsg(""), 4000);
        handleCloseModal();
        fetchComplaints();
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const completedCount = complaints.filter((c) => c.status === "Completed").length;
  const myCount = complaints.filter((c) => c.staffid === user.userid).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Staff Workspace 🛠️</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Welcome, {user.name} | Specialization: {user.department || "Maintenance Staff"} | Staff ID: #{user.userid}
        </p>
      </div>

      {alertMsg && <div className="alert alert-success">✅ {alertMsg}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-value">{complaints.length}</div>
            <div className="stat-label">Total Campus Requests</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            📋
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
            <div className="stat-label">Pending (Unassigned)</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--info)" }}>{inProgressCount}</div>
            <div className="stat-label">Currently In Progress</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
            ⚙️
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{completedCount}</div>
            <div className="stat-label">Completed Repairs</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            ✅
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Campus Maintenance Requests</h3>
          <button className="btn btn-secondary btn-sm" onClick={fetchComplaints}>
            🔄 Refresh
          </button>
        </div>


        <div className="card-body" style={{ padding: 0 }}>
          {complaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "28px" }}>🎉</p>
              <p>No campus complaints found. All clear!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Problem Description</th>
                    <th>Student Info</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Staff Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => {
                    const isMyTask = c.staffid === user.userid;
                    return (
                      <tr
                        key={c.complaintid}
                        style={{
                          borderLeft: isMyTask ? "4px solid var(--primary)" : "4px solid transparent",
                          background: isMyTask ? "var(--primary-light)" : undefined
                        }}
                      >
                        <td>
                          <strong>#{c.complaintid}</strong>
                          {isMyTask && (
                            <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>
                              📌 MY TASK
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{c.type}</strong>
                        </td>
                        <td>{c.location}</td>
                        <td style={{ maxWidth: "200px" }}>{c.description}</td>
                        <td>
                          <div>{c.studentname}</div>
                          <small style={{ color: "var(--text-muted)" }}>{c.studentemail}</small>
                        </td>
                        <td>
                          <span className={`badge-priority ${c.priority}`}>{c.priority}</span>
                        </td>
                        <td>
                          <span className={`badge-status ${c.status.replace(/\s+/g, "")}`}>
                            ● {c.status}
                          </span>
                        </td>
                        <td>
                          {c.staffname ? (
                            <span style={{ color: isMyTask ? "var(--primary)" : "var(--text-muted)", fontWeight: 600, fontSize: "13px" }}>
                              🛠️ {c.staffname}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "12px" }}>
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {c.staffnotes || "—"}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenUpdateModal(c)}
                          >
                            ✏️ Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">Update Status: #{selectedComplaint.complaintid}</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              <p style={{ marginBottom: "14px", fontSize: "14px" }}>
                <strong>{selectedComplaint.type}</strong> at <strong>{selectedComplaint.location}</strong>
                <br />
                <span style={{ color: "var(--text-muted)" }}>
                  {selectedComplaint.description}
                </span>
              </p>

              <form onSubmit={handleSaveStatus}>
                <div className="form-group">
                  <label className="form-label">Change Status</label>
                  <select
                    className="form-control"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress (Currently Working)</option>
                    <option value="Completed">Completed (Problem Fixed)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Work / Resolution Notes</label>
                  <textarea
                    className="form-control"
                    placeholder="e.g. Replaced capacitor and tested fan speed. Working properly now."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
