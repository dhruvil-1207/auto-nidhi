// client/src/pages/Home.tsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../home-premium.css'
import logoLight from '../assets/AutoNidhi Logo 1.png'

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroStatsRef = useRef<HTMLDivElement>(null)
  const aboutStatsRef = useRef<HTMLDivElement>(null)
  const heroCountsDone = useRef(false)
  const aboutCountsDone = useRef(false)

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Counter animation helper
  const animateCounter = (el: HTMLElement, target: number, duration = 1200) => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      el.textContent = String(Math.floor(start))
      if (start >= target) clearInterval(timer)
    }, 16)
  }

  // Intersection observer for counter animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === heroStatsRef.current && !heroCountsDone.current) {
              heroCountsDone.current = true
              const els = entry.target.querySelectorAll<HTMLElement>('[data-count]')
              els.forEach((el) => animateCounter(el, Number(el.dataset.count)))
            }
            if (entry.target === aboutStatsRef.current && !aboutCountsDone.current) {
              aboutCountsDone.current = true
              const els = entry.target.querySelectorAll<HTMLElement>('[data-count]')
              els.forEach((el) => animateCounter(el, Number(el.dataset.count)))
            }
          }
        })
      },
      { threshold: 0.3 }
    )
    if (heroStatsRef.current) observer.observe(heroStatsRef.current)
    if (aboutStatsRef.current) observer.observe(aboutStatsRef.current)
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* ── Mobile Overlay ── */}
      <div
        className={`hp-mobile-overlay${menuOpen ? ' open' : ''}`}
        onClick={closeMenu}
      />

      {/* ── Mobile Drawer ── */}
      <div className={`hp-mobile-drawer${menuOpen ? ' open' : ''}`} id="hpMobileDrawer">
        <div className="hp-drawer-header">
          <div className="hp-navbar-logo">
            <img src={logoLight} alt="AutoNidhi" className="hp-navbar-logo-img" />
          </div>
          <button className="hp-drawer-close" onClick={closeMenu} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="hp-mobile-nav-links">
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#about" onClick={closeMenu}>About Us</a>
          <a href="#services" onClick={closeMenu}>Our Services</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </div>
        <div className="hp-mobile-nav-actions">
          <Link to="/login" className="hp-btn hp-btn-ghost" onClick={closeMenu}>Sign In</Link>
          <Link to="/signup" className="hp-btn hp-btn-primary" onClick={closeMenu}>Get Started</Link>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className={`hp-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="hp-container">
          <div className="hp-navbar-logo">
            <Link to="/">
              <img src={logoLight} alt="AutoNidhi" className="hp-navbar-logo-img" />
            </Link>
          </div>
          <ul className="hp-navbar-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Our Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="hp-navbar-actions">
            <Link to="/login" className="hp-btn hp-btn-ghost hp-btn-sm">Sign In</Link>
            <Link to="/signup" className="hp-btn hp-btn-primary hp-btn-sm">Get Started ↗</Link>
          </div>
          <button className="hp-hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-orb hp-orb-1" />
        <div className="hp-orb hp-orb-2" />
        <div className="hp-orb hp-orb-3" />
        <div className="hp-container">
          <div className="hp-hero-content">
            <div className="hp-hero-badge">
              <div className="hp-badge-dot" />
              India's #1 Smart Auto Finance Platform
            </div>
            <h1 className="hp-hero-title">
              Manage Loans &amp;<br />
              <span className="hp-grad-blue">Insurance Files</span><br />
              the <span className="hp-grad-gold">Smart Way</span>
            </h1>
            <p className="hp-hero-desc">
              AutoNidhi is a complete consultancy management system for auto loans and
              insurance — built for agents, brokers, and finance consultants across India.
            </p>
            <div className="hp-hero-actions">
              <Link to="/signup" className="hp-btn hp-btn-primary hp-btn-lg">Start Free &nbsp;→</Link>
              <Link to="/login" className="hp-btn hp-btn-ghost hp-btn-lg">Sign In</Link>
            </div>
            <div className="hp-hero-stats" ref={heroStatsRef}>
              <div className="hp-hero-stat">
                <div className="hp-stat-val"><span data-count="248">0</span></div>
                <div className="hp-stat-lbl">Active Files</div>
              </div>
              <div className="hp-hero-stat">
                <div className="hp-stat-val">₹<span data-count="42">0</span>L</div>
                <div className="hp-stat-lbl">Commission In</div>
              </div>
              <div className="hp-hero-stat">
                <div className="hp-stat-val"><span data-count="96">0</span></div>
                <div className="hp-stat-lbl">Disbursed</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Panel */}
          <div className="hp-hero-visual">
            <div className="hp-glass-card">
              <div className="hp-glass-card-header">
                <div className="hp-glass-card-title">📋 Active Files</div>
                <div className="hp-live-dot">Live</div>
              </div>
              <div className="hp-glass-metric">248</div>
              <div className="hp-glass-sub">+12 new this week &nbsp;<span className="hp-badge-green">↑ 5.1%</span></div>
            </div>

            <div className="hp-mini-cards-row">
              <div className="hp-mini-glass-card">
                <div className="hp-mini-icon hp-blue">📈</div>
                <div className="hp-mini-val">₹42L</div>
                <div className="hp-mini-lbl">Commission In</div>
              </div>
              <div className="hp-mini-glass-card">
                <div className="hp-mini-icon hp-gold">🛡️</div>
                <div className="hp-mini-val">18</div>
                <div className="hp-mini-lbl">Expiring Soon</div>
              </div>
              <div className="hp-mini-glass-card">
                <div className="hp-mini-icon hp-green">✅</div>
                <div className="hp-mini-val">96</div>
                <div className="hp-mini-lbl">Disbursed</div>
              </div>
            </div>

            <div className="hp-glass-card">
              <div className="hp-glass-card-header">
                <div className="hp-glass-card-title">💳 Today's Payments</div>
                <div className="hp-badge-gold-pill">4 new</div>
              </div>
              {[
                { label: 'HDFC Bank — Commission', amt: '+₹38,500', cls: 'hp-amt-in' },
                { label: 'New India — Insurance',  amt: '+₹12,200', cls: 'hp-amt-in' },
                { label: 'Dealer Payout',          amt: '-₹8,000',  cls: 'hp-amt-out' },
              ].map((p, i) => (
                <div className="hp-pay-row" key={i}>
                  <span className="hp-pay-label">{p.label}</span>
                  <span className={`hp-pay-amt ${p.cls}`}>{p.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <div className="hp-trust-strip">
        <div className="hp-container">
          <div className="hp-trust-inner">
            <div className="hp-trust-item"><span>🏦</span> HDFC Bank Network</div>
            <div className="hp-trust-item"><span>🛡️</span> New India Assurance</div>
            <div className="hp-trust-item"><span>🚗</span> 500+ Dealers</div>
            <div className="hp-trust-item"><span>📍</span> Pan-India Operations</div>
            <div className="hp-trust-item"><span>🔒</span> Bank-grade Security</div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="hp-section-features" id="features">
        <div className="hp-container">
          <div className="hp-eyebrow">What We Offer</div>
          <h2 className="hp-section-heading">Everything your consultancy needs</h2>
          <p className="hp-section-sub">From file creation to final disbursement — AutoNidhi handles every step with precision, transparency, and zero paperwork hassle.</p>
          <div className="hp-features-grid">
            {[
              { icon: '📁', bg: '#eff6ff', title: 'File Management',        desc: 'Track every loan & insurance file through its entire lifecycle — from enquiry to disbursement with real-time status updates.',      chip: 'Loan · Insurance · Renewal',         chipStyle: {} },
              { icon: '💰', bg: '#fef3c7', title: 'Payment Tracking',       desc: 'Record all inward and outward payments with full mode-specific details — RTGS, UPI, cheque, NEFT, and cash.',                           chip: 'Payment IN · Payment OUT',           chipStyle: { background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' } },
              { icon: '🏦', bg: '#dcfce7', title: 'Commission Management',  desc: 'Track commissions from banks & insurers and payouts to agents, brokers, and dealers with full audit trails.',                           chip: 'Banks · Insurers · Dealers',         chipStyle: { background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' } },
              { icon: '📄', bg: '#fce7f3', title: 'Document Management',    desc: 'Upload, verify, and manage all KYC and vehicle documents with status tracking and instant approval workflows.',                          chip: 'KYC · Vehicle Docs',                 chipStyle: { background: '#fdf4ff', color: '#9333ea', borderColor: '#e9d5ff' } },
              { icon: '🔔', bg: '#fff7ed', title: 'Insurance Alerts',       desc: 'Automated expiry alerts ensure no customer policy goes unrenewed — with 30, 20, and 10-day advance notifications.',                     chip: 'Auto Reminders · Expiry Tracking',   chipStyle: { background: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' } },
              { icon: '📊', bg: '#f3e8ff', title: 'Reports & Analytics',    desc: 'Monthly KPIs, advance balances, and commission outstanding at a glance — with beautiful dashboards for every role.',                    chip: 'KPIs · Exports · PDF/Excel',         chipStyle: { background: '#f3e8ff', color: '#7c3aed', borderColor: '#ddd6fe' } },
            ].map((f) => (
              <div className="hp-feature-card" key={f.title}>
                <div className="hp-feature-icon-wrap" style={{ background: f.bg }}>{f.icon}</div>
                <div className="hp-feature-card-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <span className="hp-feature-chip" style={f.chipStyle}>{f.chip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="hp-section-about" id="about">
        <div className="hp-container">
          <div className="hp-about-layout">
            <div className="hp-about-left">
              <div className="hp-about-eyebrow">About AutoNidhi</div>
              <h2 className="hp-about-heading">Empowering Auto Finance Consultants Across India</h2>
              <p className="hp-about-desc">
                AutoNidhi was founded to simplify and digitize the complex workflow of auto loan and insurance consultancies.
                We believe in providing robust tools that let you focus on growing your business while we handle the organization.
              </p>
              <div className="hp-about-stats" ref={aboutStatsRef}>
                <div className="hp-about-stat">
                  <div className="hp-about-stat-val"><span data-count="350">0</span><span className="hp-accent">+</span></div>
                  <div className="hp-about-stat-lbl">Active Consultants</div>
                </div>
                <div className="hp-about-stat">
                  <div className="hp-about-stat-val">₹<span data-count="12">0</span>Cr<span className="hp-accent">+</span></div>
                  <div className="hp-about-stat-lbl">Loans Processed</div>
                </div>
                <div className="hp-about-stat">
                  <div className="hp-about-stat-val"><span data-count="18">0</span><span className="hp-accent">+</span></div>
                  <div className="hp-about-stat-lbl">Cities Covered</div>
                </div>
              </div>
            </div>
            <div className="hp-about-right">
              {[
                { icon: '🎯', bg: '#f3e8ff', title: 'Our Mission',         desc: 'Eliminate paperwork bottlenecks and provide a centralized, secure digital space for agents and brokers to manage customer files seamlessly.' },
                { icon: '🔭', bg: '#ecfeff', title: 'Our Vision',          desc: 'To become the leading digital backbone of India\'s auto finance ecosystem, connecting banking protocols, insurer networks, and consultants.' },
                { icon: '🛡️', bg: '#fef3c7', title: 'Trusted Reliability', desc: 'Leading agencies, top insurance brokers, and DSA networks across major Indian cities rely on AutoNidhi\'s infrastructure every day.' },
              ].map((c) => (
                <div className="hp-about-card" key={c.title}>
                  <div className="hp-about-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <div>
                    <div className="hp-about-card-title">{c.title}</div>
                    <div className="hp-about-card-desc">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="hp-section-services" id="services">
        <div className="hp-svc-orb hp-svc-orb-1" />
        <div className="hp-svc-orb hp-svc-orb-2" />
        <div className="hp-container">
          <div className="hp-svc-eyebrow">What We Offer You</div>
          <h2 className="hp-svc-heading">Premium services, built around you</h2>
          <p className="hp-svc-sub">Whether you're buying your first car or renewing an old policy, AutoNidhi's consultancy handles everything — fast, transparent, and stress-free.</p>
          <div className="hp-svc-grid">
            <div className="hp-svc-card hp-svc-loan">
              <span className="hp-svc-badge">Auto Loans</span>
              <div className="hp-svc-icon-wrap">🚗</div>
              <div className="hp-svc-title">Instant Auto Loans &amp; Refinancing</div>
              <div className="hp-svc-desc">Get behind the wheel faster. We partner with India's leading banks — HDFC, SBI, Axis, and more — to secure the lowest interest rates and highest LTV ratios for new and used vehicles.</div>
              <ul className="hp-svc-list">
                <li><span className="hp-svc-check">✓</span> Lowest interest rates &amp; quick approvals</li>
                <li><span className="hp-svc-check">✓</span> Minimal paperwork, doorstep service</li>
                <li><span className="hp-svc-check">✓</span> Flexible tenures up to 7 years</li>
                <li><span className="hp-svc-check">✓</span> Used car refinancing &amp; top-up loans</li>
              </ul>
            </div>
            <div className="hp-svc-card hp-svc-insure">
              <span className="hp-svc-badge">Vehicle Insurance</span>
              <div className="hp-svc-icon-wrap">🛡️</div>
              <div className="hp-svc-title">Comprehensive Vehicle Insurance &amp; Claims</div>
              <div className="hp-svc-desc">Protect your journey with premium motor insurance from top insurers. We guarantee maximum coverage, zero-depreciation add-ons, and dedicated claim settlement assistance when it matters most.</div>
              <ul className="hp-svc-list">
                <li><span className="hp-svc-check">✓</span> Instant policy issuance &amp; renewals</li>
                <li><span className="hp-svc-check">✓</span> Cashless repairs at 500+ garages</li>
                <li><span className="hp-svc-check">✓</span> Dedicated claim settlement support</li>
                <li><span className="hp-svc-check">✓</span> Auto renewal alerts — never miss a deadline</li>
              </ul>
            </div>
            <div className="hp-svc-card hp-svc-portal">
              <span className="hp-svc-badge">Customer Portal</span>
              <div className="hp-svc-icon-wrap">📱</div>
              <div className="hp-svc-title">Your 24/7 Digital Finance Dashboard</div>
              <div className="hp-svc-desc">No more chasing agents for updates. Every AutoNidhi customer gets a secure, personal portal to track their loan status, download receipts, and view policy documents — anytime, anywhere.</div>
              <ul className="hp-svc-list">
                <li><span className="hp-svc-check">✓</span> Real-time loan &amp; disbursement tracking</li>
                <li><span className="hp-svc-check">✓</span> Download receipts &amp; policy docs instantly</li>
                <li><span className="hp-svc-check">✓</span> Transparent payment &amp; advance ledger</li>
                <li><span className="hp-svc-check">✓</span> Direct chat with your finance consultant</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="hp-section-contact" id="contact">
        <div className="hp-container">
          <div className="hp-eyebrow" style={{ color: '#60a5fa' }}>Get in Touch</div>
          <h2 className="hp-section-heading" style={{ color: '#fff', marginBottom: 14 }}>We're here to help</h2>
          <p className="hp-section-sub" style={{ color: 'rgba(255,255,255,.45)', marginBottom: 48 }}>
            Have questions about integrating AutoNidhi into your consultancy? Our dedicated support team is here to get you started.
          </p>
          <div className="hp-contact-grid">
            {[
              { icon: '📧', label: 'Email Support',      value: 'support@autonidhi.com' },
              { icon: '📞', label: 'Sales & Inquiries',  value: '+91 98765 43210' },
              { icon: '📍', label: 'Head Office',        value: 'Vadodara, Gujarat' },
            ].map((c) => (
              <div className="hp-contact-card" key={c.label}>
                <div className="hp-contact-icon">{c.icon}</div>
                <div className="hp-contact-label">{c.label}</div>
                <div className="hp-contact-value">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-section-cta">
        <div className="hp-container">
          <h2 className="hp-cta-title">Ready to streamline your consultancy?</h2>
          <p className="hp-cta-desc">Join hundreds of auto finance consultants already using AutoNidhi to manage files, payments, and commissions — all in one place.</p>
          <div className="hp-cta-actions">
            <Link to="/signup" className="hp-btn hp-btn-white hp-btn-lg">Create Free Account &nbsp;→</Link>
            <Link to="/login" className="hp-btn hp-btn-outline-white hp-btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="hp-footer">
        <div className="hp-container">
          <div className="hp-footer-top">
            <div className="hp-footer-brand">
              <div className="hp-footer-logo">Auto<span>Nidhi</span></div>
              <div className="hp-footer-tagline">India's smart auto finance consultancy management platform. Built for agents, brokers, and consultants.</div>
            </div>
            <div className="hp-footer-links-section">
              <div className="hp-footer-col">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="#services">Services</a>
                <a href="#about">About Us</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="hp-footer-col">
                <h4>Account</h4>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Get Started</Link>
              </div>
            </div>
          </div>
          <div className="hp-footer-bottom">
            <div className="hp-footer-copy">© 2026 AutoNidhi. Built for India's auto finance consultants.</div>
            <div className="hp-footer-made">Made with ♥ in Gujarat, India</div>
          </div>
        </div>
      </footer>
    </>
  )
}