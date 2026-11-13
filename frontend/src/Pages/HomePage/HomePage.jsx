import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import ReportView from "../../Components/ReportView";
import ChatBot from "../../Components/ChatBot";
import { STEPS } from "../../steps";
import { getUser, runResearch } from "../../api";
import FormatForm from "../../Components/FormatSubmitForm";
import FloatingAlert from "../../Components/FloatingAlert";
import Navbar from "../../Components/Navbar";
import Pricing from "../Payment/Payment"

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
    } else if (ev.type === "error") {
      if (ev.step) mark(stepIndex(ev.step), "error");
      setError(ev.message);
    }
  };

  const runPipeline = async () => {
    console.log("error", error);

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

      console.log("response run piplin", res);

      // ----------- success ( Reseach and Report Generation completed ) ----------------
      if (res.ok) {
        setisFloatingAlert(true);
        setalertInformation({
          text: `Request successfull`,
          desc: `Research and Report Generation completed`,
          type: "success",
        });
      }

      // ----------- warning ( too many resuest) ----------------
      if (res.status === 429) {
        setisFloatingAlert(true);
        setalertInformation({
          text: res.data.statusText,
          desc: `retry after ${res.retryafter} seconds`,
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

      console.log("userDetails", userDetails);

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
    <main className="workspace-main">
      <nav className="navbarFrame">
        <Navbar credits={Credits} setshowBillingPlan={setshowBillingPlan} />
      </nav>
      {isFloatingAlert ? (
        <>
          <div className="">
            <FloatingAlert
              message={alertInformation?.desc}
              title={alertInformation?.text}
              type={alertInformation.type}
              duration={4000} // ms, set 0 to keep it until closed
              onClose={() => setisFloatingAlert(false)}
            />
          </div>
        </>
      ) : null}

      {showBillingPlan ? <div className="h-[90vh] w-[100%] flex items-center justify-center overflow-auto mt-[4vw] pt-[10vw]"><Pricing setshowBillingPlan={setshowBillingPlan}/></div> : null}

      {/* report format input ui */}
      {isFormatUi ? (
        <div className="h-[100%] w-[100%] flex items-center justify-center">
          <div className="h-[40vh] w-[50vw] items-center justify-center flex">
            <FormatForm
              initialValue={reportFormat ? reportFormat : ""}
              onSubmit={setreportFormat}
              onCancel={setisFormatUi}
            />
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="workspace-grid max-h-[93vh]  mt-[7vh]">
        {/* ---------------------- inout topic ui -------------------- */}
        <section className="workspace-content space-y-6 max-h-[92vh] mt-1">
          {/* Header area */}
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Research workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[30px]">
              Research, with sources you can follow.
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-6 text-[var(--text-secondary)]">
              Choose a topic to create a clear report, backed by links to its
              sources.
            </p>
          </div>

          {/* Input card */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow-card)] sm:p-5">
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Start a research report
              </h2>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)] mb-4">
                Enter a subject or pick one of the suggested topics.
              </p>

              {/* ---------------------------------------------- */}
              {/* report format  */}

              <p className="mb-2">provided format</p>

              {reportFormat ? (
                <p className="min-h-0 max-h-[10vh] w-full overflow-y-auto text-[10px] pl-3 pr-3 pt-2 pb-3 cursor-pointer mb-3 border border-gray-700 rounded-[10px] bg-gray-900">
                  {reportFormat}
                </p>
              ) : (
                <ul className="text-[10px] pl-6 mb-3 list-disc">
                  <li>Introduction</li>
                  <li>Key Findings (minimum 3 well-explained points)</li>
                  <li>Conclusion</li>
                </ul>
              )}
              <div
                onClick={() => {
                  setisFormatUi(true);
                }}
                className="h-[1.5vw] w-[4vw] border border-amber-600 rounded-2xl flex items-center justify-center cursor-pointer"
              >
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {reportFormat ? "edit" : "format"}
                </p>
              </div>
            </div>
            <label
              htmlFor="research-topic"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
            >
              Research Topic
            </label>
            <div className="flex gap-3">
              <input
                id="research-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPipeline()}
                placeholder="e.g. Quantum computing breakthroughs in 2025"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]"
                aria-label="Research topic"
              />
              <button
                onClick={runPipeline}
                disabled={running || !topic.trim()}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                      style={{ animation: "spin-smooth 0.8s linear infinite" }}
                    />
                    Running…
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
                    <div className="flex flex-col items-center justify-center">
                      <p>Start research</p>
                      <p className="text-amber-100">20 credits</p>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                Suggestions
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Sidebar statuses={statuses} />

          {/* Status / Error / Result */}
          <div className="space-y-4">
            {error && (
              <div className="animate-fade-in rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-muted)] px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 shrink-0 text-[var(--danger)]"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 5v3.5M8 10.5v.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-[13px] leading-relaxed text-[var(--danger)]">
                    {error}
                  </p>
                </div>
              </div>
            )}

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
          </div>
        </section>

        {/* -------------- chat bot ui ------------- */}
        <div className="workspace-chat-panel max-h-[100vh] mt-1">
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
