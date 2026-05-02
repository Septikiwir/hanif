"use client";

import React from "react";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "800px" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 className="admin-h1">Settings</h1>
        <p className="admin-p">Manage your application configurations and preferences.</p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <section className="admin-card">
          <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>General Settings</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Application Name</label>
              <input type="text" className="admin-input" defaultValue="Nimantra Wedding" />
            </div>
            <div>
              <label style={labelStyle}>Admin Email</label>
              <input type="email" className="admin-input" defaultValue="admin@nimantra.id" />
            </div>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-h2" style={{ marginBottom: "1.5rem" }}>Security</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <button className="admin-btn admin-btn-ghost" style={{ justifyContent: "flex-start" }}>
              Change Password
            </button>
            <button className="admin-btn admin-btn-ghost" style={{ justifyContent: "flex-start" }}>
              Two-Factor Authentication
            </button>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="admin-btn admin-btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--admin-text-sub)",
  marginBottom: "0.5rem"
};
