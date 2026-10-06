const API_BASE_URL = "http://localhost:8000";

// General request helper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  register: (userData) =>
    request("/register", {
      method: "POST",
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    request("/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  staffLogin: (credentials) =>
    request("/staff/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  adminLogin: (credentials) =>
    request("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  // Users (Admin)
  getStudents: () => request("/users/students"),
  getStaff: () => request("/users/staff"),
  addStaff: (staffData) =>
    request("/users/staff", {
      method: "POST",
      body: JSON.stringify(staffData)
    }),

  // Complaints
  getStats: () => request("/complaints/stats"),

  getAllComplaints: (statusFilter = "") => {
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    return request(`/complaints${query}`);
  },

  getStudentComplaints: (studentId) =>
    request(`/complaints/student/${studentId}`),

  getStaffComplaints: (staffId) =>
    request(`/complaints/staff/${staffId}`),

  getComplaintById: (id) =>
    request(`/complaint/${id}`),

  createComplaint: (complaintData) =>
    request("/complaint", {
      method: "POST",
      body: JSON.stringify(complaintData)
    }),

  updateComplaintStatus: (id, payload) =>
    request(`/complaint/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  assignStaff: (id, payload) =>
    request(`/complaint/assign/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteComplaint: (id) =>
    request(`/complaint/${id}`, {
      method: "DELETE"
    })
};
