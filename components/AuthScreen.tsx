"use client";

import { useState } from "react";
import { Globe, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  onLogin: () => void;
};

export default function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      backgroundColor: "var(--bg-base-start)",
      backgroundImage: "radial-gradient(circle at 50% -20%, var(--bg-base-start) 0%, var(--bg-base-end) 100%)",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Background static texture/map hint */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.15,
        backgroundImage: 'url("https://unpkg.com/leaflet@1.9.4/dist/images/layers.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(4px) grayscale(100%)",
        pointerEvents: "none"
      }} />

      {/* Hero Left Side (Hidden on Mobile) */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        position: "relative",
        zIndex: 10
      }} className="auth-hero">
        <style>{`
          @media (max-width: 768px) { .auth-hero { display: none !important; } }
          @keyframes slowOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
        
        {/* Animated Background Element */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "600px",
          height: "600px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "1px dashed var(--glass-border-light)",
          animation: "slowOrbit 60s linear infinite",
          pointerEvents: "none"
        }}>
          <div style={{ width: 12, height: 12, background: "var(--accent-teal)", borderRadius: "50%", position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", boxShadow: "0 0 16px var(--accent-teal-glow)" }} />
        </div>

        <div style={{ zIndex: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "8px", background: "var(--accent-teal)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bg-base-end)" }}>
              <Globe size={24} strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "0.1em", margin: 0, color: "var(--text-primary)" }}>Pelagos</h1>
          </div>
          <h2 style={{ fontSize: "42px", fontWeight: 300, lineHeight: 1.2, color: "var(--text-primary)", marginBottom: "20px", maxWidth: "500px" }}>
            Orbital Intelligence for <br/> Maritime Recovery
          </h2>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "440px", lineHeight: 1.6 }}>
            Mission control dashboard for Sentinel-1 SAR oil spill detection and circular recovery operations.
          </p>
          {/* Ambient background glows */}
          <div style={{ position: "absolute", top: "20%", left: "10%", width: "40vw", height: "40vw", background: "var(--text-primary)", filter: "blur(140px)", opacity: 0.03, pointerEvents: "none", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "30vw", height: "30vw", background: "var(--text-secondary)", filter: "blur(140px)", opacity: 0.03, pointerEvents: "none", borderRadius: "50%" }} />
        </div>

        <div style={{ position: "absolute", bottom: "40px", left: "60px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-tertiary)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-primary)", boxShadow: "0 0 8px var(--text-secondary)" }} />
          System Status: Constellation Online
        </div>
      </div>

      {/* Form Right Side */}
      <div style={{
        width: "480px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        zIndex: 10
      }} className="auth-form-container">
        <style>{`
          @media (max-width: 768px) { .auth-form-container { width: 100% !important; } }
        `}</style>
        
        <div className="glass-panel" style={{
          width: "100%",
          padding: "40px",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "32px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
            <button 
              onClick={() => setMode("login")}
              style={{ background: "none", border: "none", color: mode === "login" ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "16px", fontWeight: mode === "login" ? 600 : 400, cursor: "pointer", transition: "color 0.2s" }}
            >
              Command Login
            </button>
            <button 
              onClick={() => setMode("signup")}
              style={{ background: "none", border: "none", color: mode === "signup" ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "16px", fontWeight: mode === "signup" ? 600 : 400, cursor: "pointer", transition: "color 0.2s" }}
            >
              Request Access
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Full Name</label>
                <input type="text" required className="auth-input" placeholder="Operator Name" />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Gov ID</label>
              <input type="email" required className="auth-input" placeholder="id@agency.gov" defaultValue="admin@pelagos.az" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Security Clearance</label>
                {mode === "login" && <a href="#" style={{ fontSize: "11px", color: "var(--accent-teal)", textDecoration: "none" }}>Forgot key?</a>}
              </div>
              <input type="password" required className="auth-input" placeholder="••••••••" defaultValue="password123" />
            </div>

            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Confirm Clearance</label>
                <input type="password" required className="auth-input" placeholder="••••••••" />
              </div>
            )}

            {mode === "login" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "-4px" }}>
                <input type="checkbox" id="remember" style={{ accentColor: "var(--accent-teal)" }} />
                <label htmlFor="remember" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Maintain persistent session</label>
              </div>
            )}

            <button type="submit" className="auth-button" style={{ marginTop: "12px" }} disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="spinner" />
              ) : mode === "login" ? (
                <>Initialize Uplink <ArrowRight size={18} /></>
              ) : (
                <>Submit Request <CheckCircle2 size={18} /></>
              )}
            </button>

          </form>

          <div style={{
            marginTop: "32px", textAlign: "center", fontSize: "10px", color: "var(--text-tertiary)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            <Shield size={12} />
            Pelagos Core v2.1.0 • Secure Connection
          </div>
        </div>
      </div>
    </div>
  );
}
