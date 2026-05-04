"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ITEMS_PER_PAGE = 8;

export default function AdminPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; slug: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => { fetchInvitations(); }, []);

  async function fetchInvitations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setInvitations(data);
    setLoading(false);
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(id: string, slug: string) {
    setDeleteConfirm({ id, slug });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/invitations/${deleteConfirm.id}`, { method: "DELETE" });
      if (response.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== deleteConfirm.id));
        setDeleteConfirm(null);
        showToast("Invitation deleted successfully", "success");
      } else {
        const error = await response.json();
        showToast("Failed to delete: " + error.error, "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally { setDeleting(false); }
  }

  const filteredInvitations = invitations.filter(inv => {
    const matchesSearch = inv.slug.toLowerCase().includes(search.toLowerCase()) ||
      inv.content.couple?.bride?.shortName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.content.couple?.groom?.shortName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : statusFilter === "active" ? inv.is_active : !inv.is_active;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvitations.length / ITEMS_PER_PAGE);
  const paginatedInvitations = filteredInvitations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const metrics = {
    total: invitations.length,
    active: invitations.filter(i => i.is_active).length,
    inactive: invitations.filter(i => !i.is_active).length,
    v1: invitations.filter(i => i.template_version === "v1").length
  };

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {[
          { label: "Total Invites", value: metrics.total, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-50 to-white" },
          { label: "Active Live", value: metrics.active, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-50 to-white" },
          { label: "Inactive", value: metrics.inactive, color: "text-slate-600", bg: "bg-slate-50", gradient: "from-slate-50 to-white" },
          { label: "V1 Templates", value: metrics.v1, color: "text-purple-600", bg: "bg-purple-50", gradient: "from-purple-50 to-white" },
        ].map((stat, i) => (
          <div key={i} className={`admin-card overflow-hidden relative p-4 md:p-5 border border-slate-100 bg-gradient-to-br ${stat.gradient}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-3 ${stat.bg}`}>
               <span className={`font-bold ${stat.color}`}>#</span>
            </div>
            <div className={`text-2xl md:text-4xl font-extrabold tracking-tight ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Header + Actions (Desktop) */}
      <div className="hide-mobile flex-between mb-5">
        <div>
          <h1 className="admin-h1 flex items-center gap-2.5">
            Invitations
            <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-admin-primary-light text-admin-primary text-xs font-bold">
              {filteredInvitations.length}
            </span>
          </h1>
          <p className="admin-p">Manage and monitor all wedding invitation clients.</p>
        </div>
        <Link href="/admin/new" className="admin-btn admin-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Invitation
        </Link>
      </div>

      {/* Mobile Title */}
      <div className="show-mobile-block mb-4">
        <h1 className="text-lg font-bold text-admin-text flex items-center gap-2">
          Invitations
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-admin-primary-light text-admin-primary text-[10px] font-bold">
            {filteredInvitations.length}
          </span>
        </h1>
      </div>

      {/* ═══ Search & Filter Bar ═══ */}
      {/* Mobile: sticky search + filter button */}
      <div className="show-mobile-block mb-3" style={{ position: "sticky", top: 56, zIndex: 30, background: "var(--color-admin-bg)", paddingTop: 4, paddingBottom: 4 }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search..." className="admin-input pl-9" style={{ fontSize: "0.8125rem", height: 44 }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="admin-btn-icon" style={{ width: 44, height: 44, flexShrink: 0 }} onClick={() => setFilterOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>
      </div>

      {/* Desktop: inline filter bar */}
      <div className="admin-card mb-5 hide-mobile" style={{ padding: "0.75rem 1rem" }}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by name or slug..." className="admin-input pl-9" style={{ fontSize: "0.8125rem" }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="admin-input" style={{ width: "auto", minWidth: "140px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ═══ Mobile Card List ═══ */}
      <div className="show-mobile-block">
        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-card-item">
                <div className="admin-card-item-header">
                  <div className="admin-skeleton w-10 h-10 rounded-xl"/>
                  <div className="flex-1"><div className="admin-skeleton h-4 w-32 mb-1.5"/><div className="admin-skeleton h-3 w-20"/></div>
                </div>
                <div className="admin-card-item-meta"><div className="admin-skeleton h-5 w-16 rounded-full"/><div className="admin-skeleton h-3 w-20"/></div>
              </div>
            ))
          ) : paginatedInvitations.length === 0 ? (
            <div className="admin-card-item" style={{ cursor: "default" }}>
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <h3 className="text-sm font-semibold text-admin-text mb-1">No invitations found</h3>
                <p className="text-xs text-admin-text-muted mb-3">Try adjusting your search or create a new one.</p>
              </div>
            </div>
          ) : (
            paginatedInvitations.map((inv) => (
              <div key={inv.id} className="admin-card-item relative group">
                <Link href={`/admin/edit/${inv.slug}`} className="block flex-1">
                  <div className="admin-card-item-header pr-8">
                    <div className="admin-card-item-avatar shadow-sm overflow-hidden">
                      {inv.content.couple?.bride?.photo ? (
                        <img src={inv.content.couple.bride.photo} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        inv.content.couple?.bride?.shortName?.[0] || "?"
                      )}
                    </div>
                    <div className="admin-card-item-body">
                      <div className="admin-card-item-title group-hover:text-emerald-600 transition-colors">
                        {inv.content.couple?.bride?.shortName || "—"} & {inv.content.couple?.groom?.shortName || "—"}
                      </div>
                      <div className="admin-card-item-sub">/{inv.slug}</div>
                    </div>
                    <span className={`admin-badge ${inv.is_active ? "admin-badge-success" : "admin-badge-gray"}`} style={{ fontSize: "0.625rem", padding: "0.125rem 0.5rem" }}>
                      <span className={`admin-status-dot ${inv.is_active ? "active" : "inactive"}`}/>
                      {inv.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <div className="admin-card-item-meta mt-2">
                    <span className="admin-badge admin-badge-blue" style={{ fontSize: "0.625rem", padding: "0.125rem 0.5rem" }}>{inv.template_version}</span>
                    <span className="text-[11px] text-admin-text-muted">
                      {new Date(inv.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </Link>
                
                {/* Options Menu Toggle */}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedCard(expandedCard === inv.id ? null : inv.id); }} 
                  className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>

                {/* Expanded actions */}
                {expandedCard === inv.id && (
                  <div className="admin-card-item-actions mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <Link href={`/${inv.slug}/${inv.template_version}`} target="_blank" className="admin-btn admin-btn-ghost flex-1 text-xs justify-center" style={{ minHeight: 36, padding: "0 0.5rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Preview
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(inv.id, inv.slug); }} className="admin-btn flex-1 text-xs justify-center bg-red-50 text-red-600 hover:bg-red-100" style={{ minHeight: 36, padding: "0 0.5rem", border: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ═══ Desktop Table ═══ */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Slug</th>
              <th>Template</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="flex items-center gap-3"><div className="admin-skeleton w-8 h-8 rounded-lg"/><div><div className="admin-skeleton h-3.5 w-28 mb-1.5"/><div className="admin-skeleton h-2.5 w-16"/></div></div></td>
                  <td><div className="admin-skeleton h-3.5 w-20"/></td>
                  <td><div className="admin-skeleton h-5 w-12 rounded-full"/></td>
                  <td><div className="admin-skeleton h-5 w-16 rounded-full"/></td>
                  <td><div className="admin-skeleton h-3.5 w-20"/></td>
                  <td><div className="flex justify-end gap-1.5"><div className="admin-skeleton w-8 h-8 rounded-lg"/><div className="admin-skeleton w-8 h-8 rounded-lg"/><div className="admin-skeleton w-8 h-8 rounded-lg"/></div></td>
                </tr>
              ))
            ) : paginatedInvitations.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="admin-empty-state">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <h3 className="text-sm font-semibold text-admin-text mb-1">No invitations found</h3>
                    <p className="text-xs text-admin-text-muted mb-4">Try adjusting your search or create a new one.</p>
                    <Link href="/admin/new" className="admin-btn admin-btn-primary text-xs">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Create Invitation
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInvitations.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0 overflow-hidden">
                        {inv.content.couple?.bride?.photo ? (
                          <img src={inv.content.couple.bride.photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          inv.content.couple?.bride?.shortName?.[0] || "?"
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-admin-text truncate">
                          {inv.content.couple?.bride?.shortName || "—"} & {inv.content.couple?.groom?.shortName || "—"}
                        </div>
                        <div className="text-[11px] text-admin-text-muted font-mono">{inv.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td><code className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-slate-600">/{inv.slug}</code></td>
                  <td><span className="admin-badge admin-badge-blue">{inv.template_version}</span></td>
                  <td>
                    <span className={`admin-badge ${inv.is_active ? "admin-badge-success" : "admin-badge-gray"}`}>
                      <span className={`admin-status-dot ${inv.is_active ? "active" : "inactive"}`}/>
                      {inv.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td><span className="text-xs text-admin-text-muted">{new Date(inv.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span></td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/${inv.slug}/${inv.template_version}`} target="_blank" className="admin-btn-icon" title="View">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </Link>
                      <Link href={`/admin/edit/${inv.slug}`} className="admin-btn-icon" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <button onClick={() => handleDelete(inv.id, inv.slug)} className="admin-btn-icon danger" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-admin-text-muted">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvitations.length)} of {filteredInvitations.length}
          </span>
          <div className="flex gap-1.5">
            <button className="admin-btn-icon" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ opacity: currentPage === 1 ? 0.4 : 1, minWidth: 36, minHeight: 36 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="flex items-center text-xs font-medium text-admin-text-sub px-2">{currentPage} / {totalPages}</span>
            <button className="admin-btn-icon" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ opacity: currentPage === totalPages ? 0.4 : 1, minWidth: 36, minHeight: 36 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Mobile Filter Bottom Sheet ═══ */}
      {filterOpen && (
        <>
          <div className="admin-bottom-sheet-overlay" onClick={() => setFilterOpen(false)} />
          <div className="admin-bottom-sheet">
            <div className="admin-bottom-sheet-handle" />
            <h3 className="text-base font-bold text-admin-text mb-4">Filter</h3>
            <div className="space-y-4">
              <div className="admin-form-group">
                <label className="admin-label">Status</label>
                <select className="admin-input" style={{ height: 44 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button className="admin-btn admin-btn-primary w-full" style={{ minHeight: 44 }} onClick={() => setFilterOpen(false)}>Apply Filter</button>
            </div>
          </div>
        </>
      )}

      {/* ═══ Delete Confirmation (Bottom Sheet on mobile, Modal on desktop) ═══ */}
      {deleteConfirm && (
        <>
          <div className="admin-bottom-sheet-overlay" onClick={() => !deleting && setDeleteConfirm(null)} />
          <div className="admin-bottom-sheet">
            <div className="admin-bottom-sheet-handle show-mobile" />
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h2 className="text-lg font-bold text-admin-text mb-1.5">Delete Invitation?</h2>
              <p className="text-sm text-admin-text-sub mb-6">
                This will permanently delete <strong className="text-admin-text">/{deleteConfirm.slug}</strong>. This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button className="admin-btn admin-btn-ghost flex-1" style={{ minHeight: 44 }} onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</button>
                <button className="admin-btn flex-1" style={{ background: "#ef4444", color: "white", borderColor: "#ef4444", minHeight: 44 }} onClick={confirmDelete} disabled={deleting}>
                  {deleting ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.6s linear infinite" }}/> Deleting...</>) : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
