"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setInvitations(data);
    }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "32px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>Invitations</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Manage all your wedding invitation clients from here.</p>
        </div>
        <Link 
          href="/admin/new"
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Invitation
        </Link>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        borderRadius: "12px", 
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#64748b" }}>CLIENT NAME</th>
              <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#64748b" }}>URL SLUG</th>
              <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#64748b" }}>TEMPLATE</th>
              <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#64748b" }}>STATUS</th>
              <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: "#64748b" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading...</td>
              </tr>
            ) : invitations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No invitations found.</td>
              </tr>
            ) : (
              invitations.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                      {inv.content.couple?.bride?.shortName} & {inv.content.couple?.groom?.shortName}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <code style={{ backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      /{inv.slug}
                    </code>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ 
                      backgroundColor: "#e0f2fe", 
                      color: "#0369a1", 
                      padding: "4px 10px", 
                      borderRadius: "20px", 
                      fontSize: "12px",
                      fontWeight: 600
                    }}>
                      {inv.template_version}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ 
                        width: "8px", 
                        height: "8px", 
                        borderRadius: "50%", 
                        backgroundColor: inv.is_active ? "#22c55e" : "#cbd5e1" 
                      }} />
                      <span style={{ fontSize: "13px", color: "#475569" }}>
                        {inv.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <Link href={`/${inv.slug}/${inv.template_version}`} target="_blank" style={{ color: "#2563eb", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>View</Link>
                      <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
