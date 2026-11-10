import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChatBot from "../../Components/ChatBot";
import Navbar from "../../Components/Navbar";
import ReportView from "../../Components/ReportView";
import { getReportHistoryItem, getUser } from "../../api";

export default function ResultPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // useEffect(() => {
  //   let active = true;

  //   const loadCurrentUser = async () => {
  //     const userDetails = await getUser();

  //     if (!active) return;
  //     if (!userDetails.ok) {
  //       setError(
  //         userDetails.error?.detail || "Unable to load account details.",
  //       );
  //       return;
  //     }

  //     console.log("userDetails", userDetails);

  //     if (typeof userDetails.credits === "number") {
  //       setCredits(userDetails.credits);
  //     }
  //   };

  //   loadCurrentUser();

  //   return () => {
  //     active = false;
  //   };
  // }, []);

  return (
    <main className="workspace-main">
      <nav className="navbarFrame">
        <Navbar credits={credits} />
      </nav>

      <div className="workspace-grid max-h-[93vh] mt-[7vh]">
        <section className="workspace-content max-h-[92vh] mt-1">
          <Link
            to="/reportHistory"
            className="mb-5 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            <span aria-hidden="true">←</span>
            Back to history
          </Link>

          {loading ? (
            <p className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-5 text-sm text-[var(--text-secondary)]">
              Loading report…
            </p>
          ) : error ? (
            <div
              role="alert"
              className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-muted)] p-5 text-sm text-[var(--text-primary)]"
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
              {report.sources.length > 0 && (
                <section className="mt-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-5">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Sources
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {report.sources.map((source, index) => (
                      <li key={`${source.url}-${index}`}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[var(--accent)] underline-offset-4 hover:underline"
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

        <aside className="workspace-chat-panel max-h-[100vh] mt-1">
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
