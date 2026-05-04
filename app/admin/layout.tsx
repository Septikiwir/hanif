"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.display = "block";
    document.body.style.justifyContent = "initial";
    document.body.style.width = "100%";
    document.body.style.minHeight = "100vh";
    return () => {
      document.body.style.display = "";
      document.body.style.justifyContent = "";
      document.body.style.width = "";
      document.body.style.minHeight = "";
    };
  }, []);

  const navItems = [
    { name: "Invitations", href: "/admin", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
    { name: "Analytics", href: "/admin/analytics", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20V14"/></svg> },
    { name: "Settings", href: "/admin/settings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  ];

  const isNavActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname.startsWith("/admin/new") || pathname.startsWith("/admin/edit");
    }
    return pathname.startsWith(href);
  };

  // Check if we're on a form page (new/edit) - hide bottom nav there since they have sticky action bar
  const isFormPage = pathname.startsWith("/admin/new") || pathname.startsWith("/admin/edit");

  // Generate breadcrumb segments
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href: string }[] = [];
    if (segments.length >= 1) crumbs.push({ label: "Dashboard", href: "/admin" });
    if (segments.includes("new")) crumbs.push({ label: "Create New", href: "/admin/new" });
    else if (segments.includes("edit")) {
      crumbs.push({ label: "Edit", href: pathname });
      const slug = segments[segments.length - 1];
      if (slug !== "edit") crumbs.push({ label: decodeURIComponent(slug), href: pathname });
    }
    else if (segments.includes("analytics")) crumbs.push({ label: "Analytics", href: "/admin/analytics" });
    else if (segments.includes("settings")) crumbs.push({ label: "Settings", href: "/admin/settings" });
    return crumbs;
  }, [pathname]);

  const sidebarWidth = isCollapsed ? "72px" : "260px";

  return (
    <div className="admin-body" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══ Mobile Top Bar ═══ */}
      <div className="admin-mobile-topbar">
        <div className="admin-logo-container" style={{ margin: 0, padding: 0 }}>
          <div className="admin-logo-box" style={{ width: 32, height: 32, fontSize: "0.875rem" }}>N</div>
          <span className="admin-logo-text" style={{ fontSize: "1rem" }}>Nimantra</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="admin-btn-icon" title="Notifications" style={{ border: "none", width: 40, height: 40 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
        </div>
      </div>

      {/* ═══ Desktop Sidebar ═══ */}
      <aside 
        className={`admin-sidebar ${mobileOpen ? "open" : ""}`} 
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-6 px-2">
          {!isCollapsed && (
            <div className="admin-logo-container" style={{ margin: 0, padding: 0 }}>
              <div className="admin-logo-box">N</div>
              <span className="admin-logo-text">Nimantra</span>
            </div>
          )}
          <button
            className="admin-btn-icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ border: "none" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <div className={`px-3 mb-3 ${isCollapsed ? "hidden" : ""}`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-admin-text-muted">Menu</span>
          </div>
          {navItems.map((item) => {
            const isActive = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActive ? "active" : ""}`}
                style={{
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  padding: isCollapsed ? "0.625rem 0" : undefined,
                }}
                title={isCollapsed ? item.name : ""}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="pt-3 mt-auto" style={{ borderTop: "1px solid var(--color-admin-border)" }}>
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                A
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-admin-text truncate">Administrator</div>
                <div className="text-[11px] text-admin-text-muted truncate">admin@nimantra.id</div>
              </div>
            </div>
          )}
          <button
            className="admin-nav-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0.625rem 0" : undefined,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            {!isCollapsed && <span className="text-sm">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="admin-main-content flex-1 flex flex-col min-h-screen" style={{ marginLeft: sidebarWidth, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Desktop Top Header */}
        <header className="admin-desktop-header h-16 bg-white border-b border-admin-border flex items-center justify-between px-8 sticky top-0 z-40">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4">
            <div className="admin-breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="separator">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="current">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="admin-btn-icon" title="Search" style={{ border: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button className="admin-btn-icon relative" title="Notifications" style={{ border: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-admin-border mx-1"></div>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-content w-full animate-fade-in">
          {children}
        </main>
      </div>

      {/* ═══ Mobile Bottom Navigation ═══ */}
      {!isFormPage && (
        <nav className="admin-bottom-nav">
          {navItems.map((item) => {
            const isActive = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-bottom-nav-item ${isActive ? "active" : ""}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
          <Link href="/admin/new" className="admin-bottom-nav-item fab-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </Link>
        </nav>
      )}
    </div>
  );
}
