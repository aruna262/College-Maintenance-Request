import React, { useState } from "react";
import { api } from "../services/api";

export default function Login({ onLoginSuccess, onSwitchToRegister, defaultTab = "Student" }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // "Student" | "Staff" | "Admin"
  const [email, setEmail] = useState(() => {
    if (defaultTab === "Admin") return "admin@college.edu";
    if (defaultTab === "Staff") return "staff@college.edu";
    return "";
  });
  const [password, setPassword] = useState(() => {
    if (defaultTab === "Admin") return "admin123";
    if (defaultTab === "Staff") return "staff123";
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (role) => {
    setActiveTab(role);
    setError("");
    // Helpful pre-fills for demo / testing
    if (role === "Admin") {
      setEmail("admin@college.edu");
      setPassword("admin123");
    } else if (role === "Staff") {
      setEmail("staff@college.edu");
      setPassword("staff123");
    } else {
      setEmail("");
      setPassword("");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      let res;
      if (activeTab === "Staff") {
        res = await api.staffLogin({ email, password });
      } else if (activeTab === "Admin") {
        res = await api.adminLogin({ email, password });
      } else {
        res = await api.login({ email, password });
      }

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: "36px" }}>
            {activeTab === "Student" && "🎓"}
            {activeTab === "Staff" && "🛠️"}
            {activeTab === "Admin" && "💼"}
          </div>
          <h2>Campus Maintenance Portal</h2>
          <p>Sign in to access your portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === "Student" ? "active" : ""}`}
            onClick={() => handleTabChange("Student")}
          >
            Student
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "Staff" ? "active" : ""}`}
            onClick={() => handleTabChange("Staff")}
          >
            Staff
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "Admin" ? "active" : ""}`}
            onClick={() => handleTabChange("Admin")}
          >
            Admin
          </button>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        {/* Demo credentials hint banner */}
        {(activeTab === "Admin" || activeTab === "Staff") && (
          <div className="alert alert-info" style={{ fontSize: "12px", marginBottom: "16px" }}>
            ℹ️ Demo Credentials Pre-filled:
            <br />
            <strong>{email}</strong> / <strong>{password}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{activeTab} Email</label>
            <input
              type="email"
              className="form-control"
              placeholder={`Enter ${activeTab.toLowerCase()} email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "12px" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : `Sign In as ${activeTab}`}
          </button>
        </form>

        {activeTab === "Student" && (
          <div className="auth-footer">
            Don't have an account yet?{" "}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
            >
              Register here
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
