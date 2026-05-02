"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    // Force body to occupy full width and reset global centering
    document.body.style.display = "block";
    document.body.style.justifyContent = "initial";
    document.body.style.width = "100%";
    document.body.style.minHeight = "100vh";
    
    return () => {
      // Restore global styles when leaving admin
      document.body.style.display = "";
      document.body.style.justifyContent = "";
      document.body.style.width = "";
      document.body.style.minHeight = "";
    };
  }, []);

  const navItems = [
    { 
      name: "Invitations", 
      href: "/admin", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      name: "Analytics", 
      href: "/admin/analytics", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20V14" />
        </svg>
      )
    },
    { 
      name: "Settings", 
      href: "/admin/settings", 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      )
    },
  ];

  const sidebarWidth = isCollapsed ? "80px" : "280px";

  return (
    <div className="admin-body" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: sidebarWidth, transition: "width 0.3s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", marginBottom: "2rem" }}>
          {!isCollapsed && (
            <div className="admin-logo-container" style={{ margin: 0, padding: 0 }}>
              <div className="admin-logo-box">W</div>
              <span className="admin-logo-text">Dashboard</span>
            </div>
          )}
          <button 
            className="admin-btn admin-btn-ghost" 
            style={{ padding: "0.5rem" }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = item.href === "/admin" 
              ? (pathname === "/admin" || pathname.startsWith("/admin/new") || pathname.startsWith("/admin/edit"))
              : pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`admin-nav-link ${isActive ? "active" : ""}`}
                style={{ justifyContent: isCollapsed ? "center" : "flex-start", padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem" }}
                title={isCollapsed ? item.name : ""}
              >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem 0", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" }}>
          <button className="admin-btn admin-btn-danger" style={{ width: "100%", justifyContent: isCollapsed ? "center" : "flex-start", borderRadius: "12px", padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!isCollapsed && <span style={{ fontSize: "0.9375rem" }}>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <header style={{ 
          height: "72px", 
          backgroundColor: "white", 
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 2.5rem",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Administrator</div>
              <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>Admin Access</div>
            </div>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Wedding" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ 
          padding: "2.5rem",
          width: "100%"
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

