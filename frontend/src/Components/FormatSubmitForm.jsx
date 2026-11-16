import { useState } from "react";

/**
 * FormatForm – UI for specifying customized report structure.
 */
export default function FormatForm({ initialValue, onSubmit, onCancel }) {
  const [format, setFormat] = useState(
    typeof initialValue === "object" ? initialValue?.format ?? "" : "",
  );
  const [instructions, setInstructions] = useState(
    typeof initialValue === "object"
      ? initialValue?.instructions ?? ""
      : initialValue || "",
  );

  const isEmpty = !format.trim() && !instructions.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(instructions.trim());
    onCancel(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Report format"
      className="w-full flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#0f0f14] p-4 sm:p-6 text-zinc-100 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-base font-semibold text-white">Customize report format</h3>
          <p className="text-xs text-zinc-400">Specify report style, sections, and tone</p>
        </div>
        <button
          type="button"
          onClick={() => onCancel(false)}
          aria-label="Close"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="format-name" className="text-xs font-medium text-zinc-400">
          Format name (optional)
        </label>
        <input
          id="format-name"
          type="text"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder="e.g. Executive brief, Academic review, Action list"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="format-instructions" className="text-xs font-medium text-zinc-400">
          Format instructions
        </label>
        <textarea
          id="format-instructions"
          rows={5}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe how the report should look: required sections, depth, tone, citations, bullet points…"
          className="min-h-[120px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
        />
        <span className="self-end text-[11px] text-zinc-500">
          {instructions.length} characters
        </span>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onCancel(false)}
          className="w-full sm:w-auto rounded-xl border border-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-98"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isEmpty}
          className="w-full sm:w-auto rounded-xl bg-orange-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-orange-500 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save format
        </button>
      </div>
    </form>
  );
}
