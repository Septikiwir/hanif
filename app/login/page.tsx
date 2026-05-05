"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "../admin/admin.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="admin-body min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl font-bold rounded-2xl shadow-lg mb-4">
            N
          </div>
          <h1 className="admin-h1">Admin Login</h1>
          <p className="admin-p">Sign in to manage your invitations</p>
        </div>

        <div className="admin-card">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium">
                {message}
              </div>
            )}

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="admin-input"
                placeholder="admin@nimantra.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <div className="flex items-center justify-between">
                <label className="admin-label" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-emerald-600 hover:underline font-medium">Forgot?</a>
              </div>
              <input
                id="password"
                type="password"
                className="admin-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500">
          &copy; 2026 Nimantra. All rights reserved.
        </p>
      </div>
    </div>
  );
}
