import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import { getReportHistory, getUser } from "../../api";
import Pricing from "../Payment/Payment";

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getContext = (report) => {
  const context = (report || "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!context) return "No report preview is available.";
  return context.length > 240 ? `${context.slice(0, 240).trimEnd()}…` : context;
};

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBillingPlan, setshowBillingPlan] = useState(false);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      const [historyResult, userResult] = await Promise.all([
        getReportHistory(),
        getUser(),
      ]);

      if (!active) return;

      if (!historyResult.ok) {
        setError(
          historyResult.error?.detail ||
            historyResult.error ||
            "Unable to load research history.",
        );
      } else {
        setReports(historyResult.reports);
      }

      if (userResult.ok && typeof userResult.credits === "number") {
        setCredits(userResult.credits);
      }

      setLoading(false);
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar credits={credits} setshowBillingPlan={setshowBillingPlan} />

      {showBillingPlan && (
        <Pricing setshowBillingPlan={setshowBillingPlan} />
      )}

      <section className="mx-auto w-full max-w-5xl px-3.5 py-6 sm:px-6 sm:py-10 lg:py-12 flex-1">
        <header className="mb-6 sm:mb-8">
          <p className="mb-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Your workspace
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Research history
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
            Revisit your past research reports, summaries, and critiques.
          </p>
        </header>

        {loading ? (
          <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 sm:p-5 text-xs sm:text-sm text-[var(--text-secondary)]">
            Loading your research history…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-muted)] p-4 sm:p-5 text-xs sm:text-sm text-[var(--text-primary)]"
          >
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-6 sm:p-8 text-center">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
              No reports yet
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
              Reports you create will appear here with their summary and critique.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Start research
            </Link>
          </div>
        ) : (
          <ul className="space-y-3.5 sm:space-y-4">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  to={`/reportHistory/${report.id}`}
                  className="block rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 sm:p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--border-focus)] active:scale-[0.99]"
                  aria-label={`Open report: ${report.title}`}
                >
                  <article>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h2 className="break-words text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                        {report.title}
                      </h2>
                      <time
                        className="shrink-0 text-[11px] sm:text-xs text-[var(--text-tertiary)]"
                        dateTime={report.created_at}
                      >
                        {formatDate(report.created_at)}
                      </time>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {getContext(report.report_content)}
                    </p>

                    {report.report_critic && (
                      <section className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:p-4">
                        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                          Critique
                        </h3>
                        <p className="mt-1.5 whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-3">
                          {report.report_critic}
                        </p>
                      </section>
                    )}
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
