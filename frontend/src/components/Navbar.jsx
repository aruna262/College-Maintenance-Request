import React from "react";

export default function Navbar({ user, onLogout, onRoleSwitch, currentView, onViewChange }) {
  const roles = ["Student", "Staff", "Admin"];

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🔧</div>
        <div>
          <h1 className="navbar-title">Campus Maintenance Request</h1>
          <p className="navbar-subtitle">College Infrastructure & Facility Support</p>
        </div>
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            {/* All three role badges — current role is active; others are clickable to switch */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600, marginRight: "4px" }}>
                👋 <strong style={{ color: "var(--text-main)" }}>{user.name}</strong>
              </span>

              {roles.map((role) => {
                const isActive = user.role === role;
                return (
                  <span
                    key={role}
                    className={`role-tag ${role.toLowerCase()}`}
                    onClick={() => !isActive && onRoleSwitch(role)}
                    title={
                      isActive
                        ? `Logged in as ${role}`
                        : `Switch to ${role} Login`
                    }
                    style={{
                      opacity: isActive ? 1 : 0.45,
                      fontWeight: isActive ? 800 : 600,
                      border: isActive
                        ? "1.5px solid currentColor"
                        : "1px dashed currentColor",
                      fontSize: "11px",
                      cursor: isActive ? "default" : "pointer",
                      transition: "opacity 0.15s, transform 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.opacity = "0.85";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.opacity = "0.45";
                    }}
                  >
                    {role}
                  </span>
                );
              })}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`btn btn-sm ${currentView === "login" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => onViewChange("login")}
            >
              Login
            </button>
            <button
              className={`btn btn-sm ${currentView === "register" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => onViewChange("register")}
            >
              Student Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
