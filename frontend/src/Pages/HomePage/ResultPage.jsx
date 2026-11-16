import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChatBot from "../../Components/ChatBot";
import Navbar from "../../Components/Navbar";
import ReportView from "../../Components/ReportView";
import { getReportHistoryItem, getUser } from "../../api";
import Pricing from "../Payment/Payment";

export default function ResultPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBillingPlan, setshowBillingPlan] = useState(false);
  const [mobileTab, setMobileTab] = useState("report");

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      const [reportResult, userResult] = await Promise.all([
        getReportHistoryItem(reportId),
        getUser(),
      ]);

      if (!active) return;

      if (!reportResult.ok) {
        setError(
          reportResult.error?.detail ||
            reportResult.error ||
            "Unable to load this report.",
        );
      } else {
        setReport({
          id: reportResult.report.id,
          topic: reportResult.report.title,
          report: reportResult.report.report_content || "",
          feedback: reportResult.report.report_critic || "",
          sources: reportResult.report.sources || [],
        });
      }

      if (userResult.ok && typeof userResult.credits === "number") {
        setCredits(userResult.credits);
      }

      setLoading(false);
    };

    loadReport();

    return () => {
      active = false;
    };
  }, [reportId]);

  const updateReport = (updatedReport) => {
    setReport((current) =>
      current ? { ...current, report: updatedReport } : current,
    );
  };

  return (
    <main className="workspace-main flex flex-col min-h-screen">
      <Navbar credits={credits} setshowBillingPlan={setshowBillingPlan} />

      {/* Pricing Modal */}
      {showBillingPlan && (
        <Pricing setshowBillingPlan={setshowBillingPlan} />
      )}

      {/* Mobile Tab Switcher for small screens */}
      {report && (
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
        {/* Left Column: Report & Sources */}
        <section
          className={`workspace-content space-y-4 ${
            report && mobileTab === "chat" ? "hidden min-[900px]:block" : "block"
          }`}
        >
          <Link
            to="/reportHistory"
            className="mb-3 inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <span aria-hidden="true">←</span>
            Back to history
          </Link>

          {loading ? (
            <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 text-xs sm:text-sm text-[var(--text-secondary)]">
              Loading report…
            </p>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-muted)] p-4 text-xs sm:text-sm text-[var(--text-primary)]"
            >
              {error}
            </div>
          ) : report ? (
            <>
              <ReportView
                topic={report.topic}
                report={report.report}
                feedback={report.feedback}
                onReportChange={updateReport}
              />
              {report.sources?.length > 0 && (
                <section className="mt-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 sm:p-5">
                  <h2 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                    Sources ({report.sources.length})
                  </h2>
                  <ul className="mt-2.5 space-y-2">
                    {report.sources.map((source, index) => (
                      <li key={`${source.url}-${index}`} className="truncate">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs sm:text-sm text-[var(--accent)] underline-offset-4 hover:underline break-all"
                        >
                          {source.title || source.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : null}
        </section>

        {/* Right Column: AI Assistant Chat */}
        <aside
          className={`workspace-chat-panel ${
            report && mobileTab === "report"
              ? "hidden min-[900px]:flex"
              : "flex"
          }`}
        >
          <ChatBot
            setCredits={setCredits}
            key={report?.id || reportId}
            topic={report?.topic}
            report={report?.report}
            onReportChange={updateReport}
          />
        </aside>
      </div>
    </main>
  );
}
