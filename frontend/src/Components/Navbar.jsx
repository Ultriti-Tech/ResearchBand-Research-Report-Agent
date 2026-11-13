import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  [
    "relative px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors duration-200",
    isActive
      ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]",
  ].join(" ");

export default function Navbar({ credits = 0, setshowBillingPlan }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-base)]/80 border-b border-[var(--border-subtle)] w-full">
      <nav className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-sm">
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            Researc<span className="text-[var(--accent)]">Hand</span>
          </span>
        </NavLink>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setshowBillingPlan(true);
            }}
            title="Daily credits reset every day at 12:00 AM IST."
            aria-label={`${credits} credits. Daily credits reset every day at 12:00 AM IST.`}
            className="relative mr-5 cursor-pointer rounded-md border border-amber-400 px-3 py-1.5 text-[13px] font-medium transition-colors duration-200"
          >
            {credits} credits
          </button>

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
      </nav>
    </header>
  );
}
