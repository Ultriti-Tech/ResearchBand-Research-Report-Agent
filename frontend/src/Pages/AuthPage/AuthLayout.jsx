import { Link } from "react-router-dom";

// Shared text input used by both pages
export function Field({ label, id, ...props }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-zinc-500"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-[#26262c] bg-[#14141a] px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
      />
    </div>
  );
}

// Mobile-responsive auth layout with home link
export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen bg-[#08080b] text-zinc-100 flex flex-col">
      {/* Top minimal header */}
      <header className="border-b border-[#1c1c24] px-4 py-3 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-sm">
            R
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            Researc<span className="text-[var(--accent)]">Hand</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-3.5 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            {eyebrow}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">{subtitle}</p>

          <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border border-[#26262c] bg-[#0f0f13] p-5 sm:p-8 shadow-xl">
            {children}
          </div>

          <p className="mt-5 text-center text-xs sm:text-sm text-zinc-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
