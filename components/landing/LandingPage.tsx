"use client";

import Link from "next/link";
import { Waves, Satellite, Brain, Ship, UserCheck, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    title: "Satellite Monitoring",
    text: "Track Caspian Sea surface conditions with SAR satellite imagery to identify suspicious oil signatures early.",
    icon: <Satellite size={20} strokeWidth={1.75} />,
  },
  {
    title: "AI-Powered Analysis",
    text: "Estimate spill area, confidence and risk from detections — providing specialists with structured recommendations.",
    icon: <Brain size={20} strokeWidth={1.75} />,
  },
  {
    title: "Vessel & Environmental Intelligence",
    text: "Combine detections with vessel context and environmental conditions for clearer operational situational awareness.",
    icon: <Ship size={20} strokeWidth={1.75} />,
  },
  {
    title: "Human-in-the-Loop Response",
    text: "Operators review AI output, make the final decision, and coordinate cleanup from detection through recovery.",
    icon: <UserCheck size={20} strokeWidth={1.75} />,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Detect",
    text: "Satellite imagery identifies suspicious areas across the Caspian monitoring corridor.",
  },
  {
    n: "02",
    title: "Analyze",
    text: "AI analyzes the detected area and estimates spill characteristics and risk.",
  },
  {
    n: "03",
    title: "Review",
    text: "A human operator reviews the analysis and makes the operational decision.",
  },
  {
    n: "04",
    title: "Respond",
    text: "Cleanup and response activities can be coordinated and tracked through completion.",
  },
];

function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: "linear-gradient(145deg, #0ea5e9 0%, #0369a1 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f0f9ff",
        flexShrink: 0,
      }}
    >
      <Waves size={Math.round(size * 0.5)} strokeWidth={2.25} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand">
            <BrandMark />
            <div>
              <div className="landing-brand-name">PEYKGÖZ</div>
              <div className="landing-brand-tag">Satellite & AI Oil Spill Intelligence</div>
            </div>
          </Link>

          <nav className="landing-nav">
            <Link href="/login" className="landing-btn landing-btn-ghost">
              Login
            </Link>
            <Link href="/register" className="landing-btn landing-btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Caspian Sea monitoring platform</p>
          <h1 className="landing-headline">
            See the Spill.
            <br />
            Understand the Risk.
            <br />
            Act.
          </h1>
          <p className="landing-support">
            PEYKGÖZ combines satellite intelligence, AI analysis and operational data to help
            detect oil spills, assess risk, and support human-led response across the Caspian Sea.
          </p>
          <div className="landing-cta-row">
            <Link href="/register" className="landing-btn landing-btn-primary landing-btn-lg">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="landing-btn landing-btn-ghost landing-btn-lg">
              Login
            </Link>
          </div>
          <p className="landing-hitl-note">
            AI provides analysis and recommendations. Final operational decisions remain with
            human experts.
          </p>
        </div>

        <div className="landing-hero-visual" aria-hidden>
          <div className="caspian-visual">
            <div className="caspian-grid" />
            <div className="caspian-sea" />
            <div className="caspian-coast" />
            <div className="caspian-scan" />
            <div className="caspian-marker caspian-marker-a" />
            <div className="caspian-marker caspian-marker-b" />
            <div className="caspian-marker caspian-marker-c" />
            <div className="caspian-label">Caspian Sea · Azerbaijan corridor</div>
            <div className="caspian-sar-badge">
              <Satellite size={12} /> Sentinel-1 SAR overlay
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Operational intelligence, end to end</h2>
          <p className="landing-section-sub">
            From first satellite detection to coordinated cleanup — built for maritime and
            environmental response teams.
          </p>
          <div className="landing-feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="landing-feature">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">How it works</h2>
          <p className="landing-section-sub">
            A clear detection-to-response workflow with specialists in control at every decision
            point.
          </p>
          <div className="landing-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="landing-step">
                <div className="landing-step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <div className="landing-section-inner landing-bottom-inner">
          <h2>Ready to monitor smarter?</h2>
          <p>
            Enter PEYKGÖZ to access Caspian Sea oil spill intelligence, AI analysis support and
            human-led response workflows.
          </p>
          <Link href="/register" className="landing-btn landing-btn-primary landing-btn-lg">
            Enter PEYKGÖZ <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div className="landing-brand" style={{ marginBottom: 8 }}>
              <BrandMark size={28} />
              <div>
                <div className="landing-brand-name" style={{ fontSize: 13 }}>
                  PEYKGÖZ
                </div>
                <div className="landing-brand-tag">Satellite & AI Oil Spill Intelligence</div>
              </div>
            </div>
            <div className="landing-footer-meta">Caspian Sea monitoring</div>
          </div>
          <div className="landing-footer-links">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
