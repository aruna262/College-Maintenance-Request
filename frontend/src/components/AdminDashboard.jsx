import React, { useState, useEffect } from "react";
import { api } from "../services/api";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("complaints"); // "complaints" | "staff" | "students"
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [staffList, setStaffList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Assign Staff Modal State
  const [assignModal, setAssignModal] = useState({
    open: false,
    complaint: null,
    selectedStaffId: ""
  });

  // Add Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "Electrical"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, statsRes, staffRes, studentRes] = await Promise.all([
        api.getAllComplaints(filterStatus),
        api.getStats(),
        api.getStaff(),
        api.getStudents()
      ]);

      if (compRes.success) setComplaints(compRes.complaints);
      if (statsRes.success) setStats(statsRes.stats);
      if (staffRes.success) setStaffList(staffRes.staff);
      if (studentRes.success) setStudentList(studentRes.students);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleOpenAssign = (complaint) => {
    setAssignModal({
      open: true,
      complaint,
      selectedStaffId: staffList[0]?.userid || ""
    });
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    const staff = staffList.find((s) => s.userid === Number(assignModal.selectedStaffId));
    if (!staff) {
      alert("Please select a staff member");
      return;
    }

    try {
      setLoading(true);
      const res = await api.assignStaff(assignModal.complaint.complaintid, {
        staffid: staff.userid,
        staffname: staff.name
      });

      if (res.success) {
        setAlertMsg(`Assigned to ${staff.name} and set to 'In Progress'!`);
        setTimeout(() => setAlertMsg(""), 4000);
        setAssignModal({ open: false, complaint: null, selectedStaffId: "" });
        loadData();
      }
    } catch (err) {
      alert("Assignment failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm(`Are you sure you want to delete complaint #${id}?`)) return;
    try {
      const res = await api.deleteComplaint(id);
      if (res.success) {
        setAlertMsg(`Complaint #${id} deleted!`);
        setTimeout(() => setAlertMsg(""), 4000);
        loadData();
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.addStaff(newStaffForm);
      if (res.success) {
        setAlertMsg(`Staff member ${newStaffForm.name} added successfully!`);
        setTimeout(() => setAlertMsg(""), 4000);
        setNewStaffForm({
          name: "",
          email: "",
          password: "",
          phone: "",
          department: "Electrical"
        });
        loadData();
      }
    } catch (err) {
      alert("Failed to add staff: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Admin Title */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Campus Administration Dashboard 💼</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Maintenance Operations, Complaint Dispatch, and Staff Allocation
        </p>
      </div>

      {alertMsg && <div className="alert alert-success">✅ {alertMsg}</div>}

      {/* Global Campus Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Campus Complaints</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
            📊
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>{stats.pending}</div>
            <div className="stat-label">Pending Allocation</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
            ⏳
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--info)" }}>{stats.inProgress}</div>
            <div className="stat-label">Under Repair (In Progress)</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
            ⚙️
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{stats.completed}</div>
            <div className="stat-label">Resolved / Fixed</div>
          </div>
          <div className="stat-icon" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            ✅
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          📋 All Requests ({complaints.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "staff" ? "active" : ""}`}
          onClick={() => setActiveTab("staff")}
        >
          🛠️ Maintenance Staff ({staffList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          🎓 Registered Students ({studentList.length})
        </button>
      </div>

      {/* TAB 1: ALL COMPLAINTS */}
      {activeTab === "complaints" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Campus Maintenance Requests</h3>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                className="form-control"
                style={{ width: "160px", padding: "6px 10px", fontSize: "13px" }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={loadData}>
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {complaints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                No complaints found matching criteria.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Req ID</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Problem Description</th>
                      <th>Reported By</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned Staff</th>
                      <th>Actions</th>
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
                        <td style={{ maxWidth: "220px" }}>{c.description}</td>
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
                            <span style={{ color: "var(--primary)", fontWeight: "600" }}>
                              🛠️ {c.staffname}
                            </span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => handleOpenAssign(c)}
                            >
                              Assign Staff
                            </button>
                          )}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {c.staffname && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: "4px 8px", fontSize: "11px" }}
                                onClick={() => handleOpenAssign(c)}
                                title="Reassign Staff"
                              >
                                🔄 Reassign
                              </button>
                            )}
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => handleDeleteComplaint(c.complaintid)}
                              title="Delete Request"
                            >
                              🗑️
                            </button>
                          </div>
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

      {/* TAB 2: STAFF MANAGEMENT */}
      {activeTab === "staff" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px" }}>
          {/* Add Staff Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">➕ Add New Staff</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddStaffSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ramesh K"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. ramesh@college.edu"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Temporary login password"
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Trade</label>
                  <select
                    className="form-control"
                    value={newStaffForm.department}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, department: e.target.value })}
                  >
                    <option value="Electrical">Electrical Works</option>
                    <option value="Plumbing">Plumbing & Water Supply</option>
                    <option value="Civil & Carpentry">Civil & Carpentry</option>
                    <option value="IT & Audio-Visual">IT, Network & Projector</option>
                    <option value="HVAC & AC">Air Conditioning & Cooling</option>
                    <option value="General Housekeeping">General Housekeeping</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                  {loading ? "Adding..." : "Add Staff Account"}
                </button>
              </form>
            </div>
          </div>

          {/* Staff List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Maintenance Staff Directory</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s.userid}>
                        <td><strong>#{s.userid}</strong></td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.department || "General"}</td>
                        <td>{s.email}</td>
                        <td>{s.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED STUDENTS */}
      {activeTab === "students" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Registered Students</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((stu) => (
                    <tr key={stu.userid}>
                      <td><strong>#{stu.userid}</strong></td>
                      <td><strong>{stu.name}</strong></td>
                      <td>{stu.email}</td>
                      <td>{stu.department || "General"}</td>
                      <td>{stu.phone || "—"}</td>
                      <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(stu.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Staff */}
      {assignModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3 className="card-title">
                Assign Staff to #{assignModal.complaint.complaintid}
              </h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setAssignModal({ open: false, complaint: null, selectedStaffId: "" })}
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                <strong>Issue:</strong> {assignModal.complaint.type} at {assignModal.complaint.location}
                <br />
                <span style={{ color: "var(--text-muted)" }}>
                  {assignModal.complaint.description}
                </span>
              </p>

              <form onSubmit={handleAssignStaff}>
                <div className="form-group">
                  <label className="form-label">Select Maintenance Staff *</label>
                  <select
                    className="form-control"
                    value={assignModal.selectedStaffId}
                    onChange={(e) => setAssignModal({ ...assignModal, selectedStaffId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {staffList.map((s) => (
                      <option key={s.userid} value={s.userid}>
                        {s.name} ({s.department || "Staff"}) - #{s.userid}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAssignModal({ open: false, complaint: null, selectedStaffId: "" })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Confirm Assignment
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
