import { useState } from "react";

/**
 * FormatForm – UI only (React + Tailwind CSS).
 * Collects a format name (input) + detailed instructions (textarea)
 * and hands them to the parent via onSubmit({ format, instructions }).
 *
 * Usage:
 *   const [showFormat, setShowFormat] = useState(false);
 *   const [format, setFormat] = useState(null);
 *
 *   <button onClick={() => setShowFormat((v) => !v)}>Format</button>
 *   {showFormat && (
 *     <FormatForm
 *       initialValue={format}
 *       onSubmit={(f) => { setFormat(f); setShowFormat(false); }}
 *       onCancel={() => setShowFormat(false)}
 *     />
 *   )}
 *
 * Later, send it with the topic to your backend:
 *   body: JSON.stringify({ topic, format })
 */
export default function FormatForm({ initialValue, onSubmit, onCancel }) {
  const [format, setFormat] = useState(initialValue?.format ?? "");
  const [instructions, setInstructions] = useState(
    initialValue?.instructions ?? "",
  );

  const isEmpty = !format.trim() && !instructions.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "{ format: format.trim(), instructions: instructions.trim() }",
      {instructions: instructions.trim() },
    );
    onSubmit?.(instructions.trim());
    onCancel(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Report format"
      className="mt-3 w-full flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-100"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="format-name" className="text-sm text-zinc-400">
          Format name
        </label>
        <input
          id="format-name"
          type="text"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder="e.g. Executive summary, Academic paper, Bullet brief"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="format-instructions" className="text-sm text-zinc-400">
          Format instructions
        </label>
        <textarea
          id="format-instructions"
          rows={5}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe how the report should look: sections, length, tone, citation style…"
          className="min-h-[110px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />
        <span className="self-end text-xs text-zinc-500">
          {instructions.length} characters
        </span>
      </div>

      <div className="flex justify-end gap-2.5">
        <button
          type="button"
          onClick={() => {
            onCancel(false);
          }}
          className="rounded-xl border border-zinc-800 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isEmpty}
          className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save format
        </button>
      </div>
    </form>
  );
}
