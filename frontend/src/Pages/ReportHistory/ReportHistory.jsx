import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import { getReportHistory, getUser } from "../../api";

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
    <main className="min-h-screen bg-[var(--bg-base)]">
      <Navbar credits={credits} />

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Your workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
            Research history
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Revisit your past research reports, summaries, and critiques.
          </p>
        </header>

        {loading ? (
          <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-5 text-sm text-[var(--text-secondary)]">
            Loading your research history…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-muted)] p-5 text-sm text-[var(--text-primary)]"
          >
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-8 text-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              No reports yet
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Reports you create will appear here with their summary and
              critique.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  to={`/reportHistory/${report.id}`}
                  className="block rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--border-focus)] sm:p-6"
                  aria-label={`Open report: ${report.title}`}
                >
                  <article>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h2 className="break-words text-lg font-semibold text-[var(--text-primary)]">
                        {report.title}
                      </h2>
                      <time
                        className="shrink-0 text-xs text-[var(--text-tertiary)]"
                        dateTime={report.created_at}
                      >
                        {formatDate(report.created_at)}
                      </time>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {getContext(report.report_content)}
                    </p>

                    <section className="mt-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Critique
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text-secondary)]">
                        {report.report_critic || "No critique is available."}
                      </p>
                    </section>
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
