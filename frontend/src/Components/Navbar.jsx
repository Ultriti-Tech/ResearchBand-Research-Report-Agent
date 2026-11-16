import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const linkClass = ({ isActive }) =>
  [
    "relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-200",
    isActive
      ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]",
  ].join(" ");

const mobileLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150",
    isActive
      ? "text-white bg-[var(--bg-surface-hover)] border border-[var(--border-default)]"
      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]",
  ].join(" ");

export default function Navbar({ credits = 0, setshowBillingPlan }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/85 backdrop-blur-md">
      <nav className="flex h-14 items-center justify-between px-3 sm:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-sm transition group-hover:scale-105">
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            Researc<span className="text-[var(--accent)]">Hand</span>
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5">
          {setshowBillingPlan && (
            <button
              type="button"
              onClick={() => setshowBillingPlan(true)}
              title="Daily credits reset every day at 12:00 AM IST. Click to get more."
              aria-label={`${credits} credits. Daily credits reset every day at 12:00 AM IST.`}
              className="mr-3 inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-[13px] font-medium text-amber-300 transition-colors hover:bg-amber-500/20 active:scale-95"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{credits} credits</span>
            </button>
          )}

          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/reportHistory" className={linkClass}>
            History
          </NavLink>
          <NavLink to="/logout" className={linkClass} end>
            Logout
          </NavLink>
        </div>

        {/* Mobile Actions: Credits Badge + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {setshowBillingPlan && (
            <button
              type="button"
              onClick={() => setshowBillingPlan(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition active:scale-95"
              aria-label={`${credits} credits. Tap to view plans.`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>{credits}</span>
              <span className="hidden xs:inline">cr</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition hover:text-white hover:bg-[var(--bg-surface-hover)] focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-raised)] px-4 py-4 shadow-2xl animate-fade-in">
          {setshowBillingPlan && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium text-amber-200">Balance</p>
                  <p className="text-sm font-bold text-amber-300">{credits} credits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setshowBillingPlan(true);
                }}
                className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
              >
                Top up
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <NavLink to="/" className={mobileLinkClass} end>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Home</span>
            </NavLink>
            <NavLink to="/about" className={mobileLinkClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <span>About</span>
            </NavLink>
            <NavLink to="/reportHistory" className={mobileLinkClass}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>History</span>
            </NavLink>
            <NavLink to="/logout" className={mobileLinkClass} end>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
