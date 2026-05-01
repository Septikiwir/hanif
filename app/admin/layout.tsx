"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Invitations", href: "/admin", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    )},
    { name: "Settings", href: "/admin/settings", icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    )},
  ];

  return (
    <div className="admin-root" style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f8fafc",
      fontFamily: "var(--font-body), sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{ 
        width: "260px", 
        backgroundColor: "#1e293b", 
        color: "white",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh"
      }}>
        <div style={{ marginBottom: "40px", padding: "0 8px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "1px" }}>NIMANTRA <span style={{ color: "#38bdf8" }}>ADMIN</span></h1>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  color: isActive ? "white" : "#94a3b8",
                  backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  textDecoration: "none",
                  marginBottom: "8px",
                  transition: "all 0.2s"
                }}
              >
                {item.icon}
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600
          }}>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: "260px", 
        padding: "40px",
        maxWidth: "1200px"
      }}>
        {children}
      </main>
    </div>
  );
}
