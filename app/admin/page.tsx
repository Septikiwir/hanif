"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, slug: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete(id: string, slug: string) {
    setDeleteConfirm({ id, slug });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/invitations/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        const error = await response.json();
        alert("Failed to delete: " + error.error);
      }
    } catch (err: any) {
      alert("Error deleting invitation: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  const filteredInvitations = invitations.filter(inv => 
    inv.slug.toLowerCase().includes(search.toLowerCase()) ||
    inv.content.couple?.bride?.shortName.toLowerCase().includes(search.toLowerCase()) ||
    inv.content.couple?.groom?.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Invitations", value: invitations.length, icon: "📋", color: "blue" },
    { label: "Active", value: invitations.filter(i => i.is_active).length, icon: "✅", color: "green" },
    { label: "Draft/Inactive", value: invitations.filter(i => !i.is_active).length, icon: "⏳", color: "gray" },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {stats.map((stat, i) => (
          <div key={i} className="admin-card admin-card-hover" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ 
              fontSize: "1.5rem", 
              width: "48px", 
              height: "48px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              backgroundColor: `var(--admin-primary-light)`,
              borderRadius: "12px"
            }}>
              {stat.icon}
            </div>
            <div>
              <p className="admin-p" style={{ margin: 0, fontWeight: 500 }}>{stat.label}</p>
              <h2 className="admin-h2" style={{ fontSize: "1.5rem" }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex-between" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className="admin-h1">Invitations</h1>
          <p className="admin-p">Manage and monitor all wedding invitation clients.</p>
        </div>
        <Link href="/admin/new" className="admin-btn admin-btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Invitation
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="admin-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--admin-text-muted)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by client name or slug..." 
              className="admin-input" 
              style={{ paddingLeft: "40px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="admin-btn admin-btn-ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>URL Slug</th>
              <th>Template</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "80px", textAlign: "center" }}>
                  <div style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid var(--admin-primary-light)", borderTopColor: "var(--admin-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  <p className="admin-p" style={{ marginTop: "1rem" }}>Loading invitations...</p>
                </td>
              </tr>
            ) : filteredInvitations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "80px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
                  <p className="admin-h2">No invitations found</p>
                  <p className="admin-p">Try adjusting your search or create a new one.</p>
                </td>
              </tr>
            ) : (
              filteredInvitations.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "8px", 
                        backgroundColor: "var(--admin-primary-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem"
                      }}>
                        {inv.content.couple?.bride?.shortName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{inv.content.couple?.bride?.shortName} & {inv.content.couple?.groom?.shortName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>ID: {inv.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code style={{ backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", color: "var(--admin-primary-dark)" }}>
                      /{inv.slug}
                    </code>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-blue">
                      {inv.template_version}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${inv.is_active ? "admin-badge-success" : "admin-badge-gray"}`}>
                      {inv.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <Link href={`/${inv.slug}/${inv.template_version}`} target="_blank" className="admin-btn admin-btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>
                        View
                      </Link>
                      <Link href={`/admin/edit/${inv.slug}`} className="admin-btn admin-btn-ghost" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}>
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(inv.id, inv.slug)}
                        className="admin-btn admin-btn-ghost" 
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div className="admin-card" style={{ width: "100%", maxWidth: "400px", textAlign: "center", padding: "2.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 className="admin-h2">Delete Invitation?</h2>
            <p className="admin-p" style={{ marginBottom: "2rem" }}>
              Are you sure you want to delete <strong>/{deleteConfirm.slug}</strong>? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                className="admin-btn admin-btn-ghost" 
                style={{ flex: 1 }} 
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="admin-btn" 
                style={{ flex: 1, backgroundColor: "#ef4444", color: "white" }} 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

