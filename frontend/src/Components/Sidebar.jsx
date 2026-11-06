import { STEPS } from "../steps";

export default function Sidebar({ statuses }) {
  const runningStep = statuses.findIndex((status) => status === "running");
  const completeCount = statuses.filter((status) => status === "done").length;
  const hasError = statuses.includes("error");
  const isComplete = completeCount === STEPS.length;
  const isRunning = runningStep >= 0;
  const errorStep = statuses.findIndex((status) => status === "error");
  const activeStep = isRunning ? runningStep : errorStep;
  const label = isComplete
    ? `${STEPS.length}/${STEPS.length} - Research complete`
    : activeStep >= 0
    ? `${activeStep + 1}/${STEPS.length} - ${STEPS[activeStep].title}${hasError ? " failed" : ""}`
    : "Pipeline ready";
  const progress = isComplete
    ? 100
    : isRunning
    ? ((runningStep + 0.5) / STEPS.length) * 100
    : (completeCount / STEPS.length) * 100;

  return (
    <aside
      className="animate-fade-in rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-4 py-3"
      aria-live="polite"
    >
      <div className="mb-2.5 flex items-center gap-2">
        {isRunning && (
          <span
            className="h-3 w-3 shrink-0 rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]"
            style={{ animation: "spin-smooth 0.8s linear infinite" }}
          />
        )}
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          {label}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-surface)]"
        role="progressbar"
        aria-label="Research progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            hasError ? "bg-[var(--danger)]" : "bg-[var(--accent)]"
          }`}
          style={{
            width: `${progress}%`,
            ...(isRunning
              ? {
                  background:
                    "linear-gradient(90deg, var(--accent), #f5a66b, var(--accent))",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }
              : {}),
          }}
        />
      </div>
    </aside>
  );
}