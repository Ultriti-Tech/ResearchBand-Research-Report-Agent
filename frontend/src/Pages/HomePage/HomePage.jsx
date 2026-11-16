import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import ReportView from "../../Components/ReportView";
import ChatBot from "../../Components/ChatBot";
import { STEPS } from "../../steps";
import { getUser, runResearch } from "../../api";
import FormatForm from "../../Components/FormatSubmitForm";
import FloatingAlert from "../../Components/FloatingAlert";
import Navbar from "../../Components/Navbar";
import Pricing from "../Payment/Payment";

const SUGGESTIONS = [
  "LLM agents 2025",
  "CRISPR gene editing",
  "Fusion energy progress",
];

const IDLE = STEPS.map(() => "waiting");
const stepIndex = (id) => STEPS.findIndex((s) => s.id === id);

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const [statuses, setStatuses] = useState(IDLE);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [isFormatUi, setisFormatUi] = useState(false);
  const [reportFormat, setreportFormat] = useState(null);
  const [isFloatingAlert, setisFloatingAlert] = useState(false);
  const [alertInformation, setalertInformation] = useState(null);
  const [Credits, setCredits] = useState(0);
  const [showBillingPlan, setshowBillingPlan] = useState(false);

  // Mobile view tab toggle: 'report' or 'chat'
  const [mobileTab, setMobileTab] = useState("report");

  const mark = (i, status) =>
    setStatuses((prev) => prev.map((s, idx) => (idx === i ? status : s)));

  const handleEvent = (ev) => {
    if (ev.type === "status") {
      mark(stepIndex(ev.step), ev.status);
    } else if (ev.type === "result") {
      if (typeof ev.credits_balance === "number") {
        setCredits(ev.credits_balance);
      }
      setResult({ topic, report: ev.report, feedback: ev.feedback });
      // On mobile, keep user on report tab when result arrives
      setMobileTab("report");
    } else if (ev.type === "error") {
      if (ev.step) mark(stepIndex(ev.step), "error");
      setError(ev.message);
    }
  };

  const runPipeline = async () => {
    if (error === "Invalid or expired authentication token") {
      setisFloatingAlert(true);
      setalertInformation({
        text: error,
        desc: `Login to get enough tokens`,
        type: "warning",
      });
      return;
    }

    if (!topic.trim() || running) return;
    setRunning(true);
    setError("");
    setResult(null);
    setStatuses(IDLE);

    try {
      const res = await runResearch(topic, reportFormat, handleEvent);

      if (res.ok) {
        setisFloatingAlert(true);
        setalertInformation({
          text: `Request successful`,
          desc: `Research and Report Generation completed`,
          type: "success",
        });
      }

      if (res.status === 429) {
        setisFloatingAlert(true);
        setalertInformation({
          text: res.data?.statusText || "Too Many Requests",
          desc: `Retry after ${res.retryafter || 60} seconds`,
          type: "warning",
        });
      }
    } catch (e) {
      setStatuses((prev) => prev.map((s) => (s === "running" ? "error" : s)));
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      const userDetails = await getUser();

      if (!active) return;
      if (!userDetails.ok) {
        setError(
          userDetails.error?.detail || "Unable to load account details.",
        );
        return;
      }

      if (typeof userDetails.credits === "number") {
        setCredits(userDetails.credits);
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="workspace-main flex flex-col min-h-screen">
      <Navbar credits={Credits} setshowBillingPlan={setshowBillingPlan} />

      {/* Floating notifications */}
      {isFloatingAlert && alertInformation && (
        <FloatingAlert
          message={alertInformation.desc}
          title={alertInformation.text}
          type={alertInformation.type}
          duration={4000}
          onClose={() => setisFloatingAlert(false)}
        />
      )}

      {/* Full-screen Pricing Modal */}
      {showBillingPlan && (
        <Pricing setshowBillingPlan={setshowBillingPlan} />
      )}

      {/* Format Form Modal */}
      {isFormatUi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg">
            <FormatForm
              initialValue={reportFormat || ""}
              onSubmit={setreportFormat}
              onCancel={setisFormatUi}
            />
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher (shown when result exists on screens < 900px) */}
      {result && (
        <div className="sticky top-14 z-20 flex border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 px-3 py-2 backdrop-blur-md min-[900px]:hidden">
          <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-[var(--bg-surface)] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMobileTab("report")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                mobileTab === "report"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 2.5A1.5 1.5 0 0 1 4.5 1h5.586a1.5 1.5 0 0 1 1.06.44l2.415 2.414A1.5 1.5 0 0 1 14 4.914V13.5a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 3 13.5v-11Z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9 1.5V5h3.5M6 8h4M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Report</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("chat")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                mobileTab === "chat"
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2.5 8a5.5 5.5 0 1 1 1.93 4.18L2 13.5l1.32-2.38A5.47 5.47 0 0 1 2.5 8Z" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="workspace-grid flex-1">
        {/* Left Column: Research Input, Progress & Report */}
        <section
          className={`workspace-content space-y-5 sm:space-y-6 ${
            result && mobileTab === "chat" ? "hidden min-[900px]:block" : "block"
          }`}
        >
          {/* Header */}
          <div className="max-w-2xl">
            <p className="mb-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Research workspace
            </p>
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
              Research, with sources you can follow.
            </h1>
            <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              Choose a topic to create a clear report, backed by links to verified sources.
            </p>
          </div>

          {/* Input Card */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] p-3.5 sm:p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-[15px] font-semibold text-[var(--text-primary)]">
                    Start a research report
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    Enter a subject or pick one of the suggestions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setisFormatUi(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L5 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{reportFormat ? "Edit format" : "Format"}</span>
                </button>
              </div>

              {/* Format indicator */}
              {reportFormat && (
                <div
                  onClick={() => setisFormatUi(true)}
                  className="mt-3 max-h-20 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 text-xs text-zinc-300 cursor-pointer hover:border-zinc-700"
                >
                  <span className="font-semibold text-amber-400">Custom format: </span>
                  {reportFormat}
                </div>
              )}
            </div>

            <label
              htmlFor="research-topic"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
            >
              Research Topic
            </label>

            {/* Input & Action: Responsive stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                id="research-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                placeholder="e.g. Quantum computing breakthroughs in 2025"
                className="w-full min-w-0 flex-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-2.5 sm:py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]"
                aria-label="Research topic"
              />
              <button
                type="button"
                onClick={runPipeline}
                disabled={running || !topic.trim()}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 sm:px-5 py-2.5 text-xs sm:text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                      style={{ animation: "spin-smooth 0.8s linear infinite" }}
                    />
                    <span>Running…</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M7 1.5v11M1.5 7h11"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>Start research</span>
                    <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] text-amber-200">
                      20 cr
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                Try:
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Research Progress Pipeline */}
          <Sidebar statuses={statuses} />

          {/* Errors */}
          {error && (
            <div className="animate-fade-in rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-muted)] px-3.5 py-2.5 sm:px-4 sm:py-3">
              <div className="flex items-start gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="mt-0.5 shrink-0 text-[var(--danger)]"
                >
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--danger)]">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Generated Result */}
          {result && (
            <ReportView
              {...result}
              onReportChange={(report) =>
                setResult((current) =>
                  current ? { ...current, report } : current,
                )
              }
            />
          )}
        </section>

        {/* Right Column: AI Assistant Chatbot */}
        <div
          className={`workspace-chat-panel ${
            result && mobileTab === "report"
              ? "hidden min-[900px]:flex"
              : "flex"
          }`}
        >
          <ChatBot
            setCredits={setCredits}
            key={result?.topic || "empty"}
            topic={result?.topic}
            report={result?.report}
            onReportChange={(report) =>
              setResult((current) =>
                current ? { ...current, report } : current,
              )
            }
          />
        </div>
      </div>
    </main>
  );
}
