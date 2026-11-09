import React, { useEffect } from "react";

const TYPES = {
  success: { color: "#22c55e", icon: "M5 13l4 4L19 7" },
  error: { color: "#ef4444", icon: "M6 6l12 12M18 6L6 18" },
  warning: { color: "#f59e0b", icon: "M12 8v5M12 17h.01" },
  info: { color: "#f97316", icon: "M12 11v5M12 8h.01" }, // theme orange
};

const FloatingAlert = ({
  message,
  title,
  type = "info",
  duration = 4000, // ms, set 0 to keep it until closed
  onClose,
}) => {
  const { color, icon } = TYPES[type] || TYPES.info;

  // auto close
  useEffect(() => {
    if (!message || !duration) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <>
      <style>{`
        @keyframes alert-in { from { opacity: 0; transform: translateY(-12px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes alert-bar { from { width: 100%; } to { width: 0%; } }
      `}</style>

      <div
        role="alert"
        className="fixed right-5 top-20 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#26262c] bg-[#0f0f13] shadow-2xl shadow-black/60"
        style={{ animation: "alert-in .25s ease-out" }}
      >
        <div className="flex items-start gap-3 p-4">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${color}22` }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {type === "info" || type === "warning" ? (
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
              ) : null}
              <path d={icon} />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            {title && (
              <p className="text-sm font-semibold text-zinc-100">{title}</p>
            )}
            <p
              className={`text-sm text-zinc-400 ${title ? "mt-0.5" : "pt-1.5"}`}
            >
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* time-left bar */}
        {duration > 0 && (
          <div className="h-0.5 w-full bg-[#1a1a20]">
            <div
              className="h-full"
              style={{
                background: color,
                animation: `alert-bar ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingAlert;
