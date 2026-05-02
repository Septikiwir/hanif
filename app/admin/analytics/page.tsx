"use client";

import React from "react";

export default function AnalyticsPage() {
  return (
    <div>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 className="admin-h1">Analytics</h1>
        <p className="admin-p">Overview of invitation views and guest interactions.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="admin-card">
          <p className="admin-p">Total Views</p>
          <h2 className="admin-h2" style={{ fontSize: "2rem" }}>1,284</h2>
        </div>
        <div className="admin-card">
          <p className="admin-p">RSVP Responses</p>
          <h2 className="admin-h2" style={{ fontSize: "2rem" }}>452</h2>
        </div>
        <div className="admin-card">
          <p className="admin-p">Avg. Session Duration</p>
          <h2 className="admin-h2" style={{ fontSize: "2rem" }}>2m 45s</h2>
        </div>
      </div>

      <div className="admin-card" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)" }}>
        <p style={{ textAlign: "center", width: "100%" }}>Chart visualization will appear here.</p>
      </div>
    </div>
  );
}
