import { Link } from "react-router-dom";

// Shared text input used by both pages
export function Field({ label, id, ...props }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-widest text-zinc-500"
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-[#26262c] bg-[#14141a] px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
      />
    </div>
  );
}

// Same dark page + top bar as the home page, with a centered card
export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="min-h-screen bg-[#08080b] text-zinc-100">
      <main className="flex justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-zinc-400">{subtitle}</p>

          <div className="mt-8 rounded-3xl border border-[#26262c] bg-[#0f0f13] p-8">
            {children}
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">{footer}</p>
        </div>
      </main>
    </div>
  );
}
