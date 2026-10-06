import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import StaffDashboard from "./components/StaffDashboard";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cmr_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState("login"); // "login" | "register"
  const [loginTab, setLoginTab] = useState("Student"); // "Student" | "Staff" | "Admin"

  useEffect(() => {
    if (user) {
      localStorage.setItem("cmr_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cmr_user");
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("login");
  };

  // Called when user clicks a role badge in the Navbar while already logged in
  // Logs out current user and jumps to that role's login tab
  const handleRoleSwitch = (role) => {
    setUser(null);
    localStorage.removeItem("cmr_user");
    setLoginTab(role);
    setCurrentView("login");
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onRoleSwitch={handleRoleSwitch}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="main-content">
        {!user ? (
          currentView === "login" ? (
            <Login
              defaultTab={loginTab}
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setCurrentView("register")}
            />
          ) : (
            <Register
              onSwitchToLogin={() => setCurrentView("login")}
              onRegisterSuccess={() => setCurrentView("login")}
            />
          )
        ) : (
          <>
            {user.role === "Student" && <StudentDashboard user={user} />}
            {user.role === "Staff" && <StaffDashboard user={user} />}
            {user.role === "Admin" && <AdminDashboard user={user} />}
          </>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          color: "var(--text-muted)",
          fontSize: "13px",
          borderTop: "1px solid var(--border)",
          background: "#ffffff"
        }}
      >
        <p>
          🎓 <strong>Campus Maintenance Request Management System</strong> — Built with MERN Stack (MongoDB, Express, React, Node.js)
        </p>
      </footer>
    </div>
  );
}
