import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { suggestReportEdit, suggestReportInfo } from "../api";

const SUGGESTIONS = [
  "Make the report shorter",
  "Add a concise executive summary",
];

export default function ChatBot({ topic, report, onReportChange, setCredits }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [pendingEdit, setPendingEdit] = useState(null);
  const messagesEndRef = useRef(null);

  const [isCodeFix, setisCodeFix] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (text = input) => {
    const question = text.trim();
    if (!question || !report || sending || pendingEdit) return;

    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      if (isCodeFix) {
        const proposal = await suggestReportEdit(question, report);
        if (proposal?.credits && setCredits) setCredits(proposal.credits);
        if (!proposal.success || !proposal.changes?.length) {
          setMessages([
            ...nextMessages,
            {
              role: "assistant",
              content:
                proposal.message ||
                "No changes were suggested. Try a more specific instruction.",
            },
          ]);
        } else {
          setPendingEdit({
            explanation: proposal.explanation,
            changes: proposal.changes,
            updatedReport: proposal.updated_code,
          });
          setMessages([
            ...nextMessages,
            {
              role: "assistant",
              content:
                proposal.explanation ||
                "Review the suggested report changes below.",
            },
          ]);
        }
      } else {
        const response = await suggestReportInfo(topic, report, nextMessages);
        if (response?.credits && setCredits) setCredits(response.credits);
        setMessages([
          ...nextMessages,
          { role: "assistant", content: response.answer },
        ]);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };

  const acceptEdit = () => {
    if (!pendingEdit) return;
    onReportChange(pendingEdit.updatedReport);
    setPendingEdit(null);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: "Changes accepted. The report has been updated.",
      },
    ]);
  };

  const rejectEdit = () => {
    setPendingEdit(null);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: "Suggested changes rejected. The report is unchanged.",
      },
    ]);
  };

  return (
    <section className="workspace-chat flex h-full min-h-[460px] sm:min-h-0 flex-col overflow-hidden border border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-card)] rounded-[var(--radius-lg)]">
      {/* Chat Header */}
      <header className="shrink-0 border-b border-[var(--border-subtle)] px-3.5 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 9a6 6 0 1 1 2.1 4.55L2.5 14l.55-2.6A5.97 5.97 0 0 1 3 9Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 9h.01M9 9h.01M11.5 9h.01"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-[14px] font-semibold text-[var(--text-primary)] truncate">
              {isCodeFix ? "Edit Assistant (2 cr)" : "Report Assistant (1 cr)"}
            </h2>
            <p className="truncate text-[11px] text-[var(--text-secondary)]">
              {topic
                ? `Ask anything about ${topic}`
                : "Ask questions about your research"}
            </p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] sm:text-[11px] text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            AI Active
          </span>
        </div>
      </header>

      {/* Messages area */}
      <div
        className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-3 sm:p-4 text-xs sm:text-sm"
        aria-live="polite"
      >
        {!report ? (
          <div className="m-auto max-w-xs text-center p-4">
            <div className="mx-auto mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 22 22"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 3.75h8l4 4v10.5H5V3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 3.75v4h4M8 12h6M8 15h6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
              Run research first
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">
              Generate a report to ask questions, request revisions, or propose edits.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="m-auto max-w-xs text-center p-2">
            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
              Ready to assist with your report
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Ask questions about the findings, or switch to Edit Assistant to modify sections.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-white"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed break-words ${
                    msg.role === "user"
                      ? "bg-[var(--accent)] text-white rounded-br-sm"
                      : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-sm"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Pending Edit Proposal Diff */}
            {pendingEdit && (
              <section
                className="my-2 flex flex-col overflow-hidden rounded-xl border border-[var(--accent)]/50 bg-[var(--bg-surface)] shadow-lg"
                aria-label="Suggested report changes"
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2 bg-[var(--bg-raised)]">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Suggested changes
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {pendingEdit.changes.length}{" "}
                      {pendingEdit.changes.length === 1 ? "edit" : "edits"} · Review before applying
                    </p>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto p-2.5 space-y-2">
                  {pendingEdit.changes.map((change, changeIndex) => (
                    <article
                      key={`${changeIndex}-${change.old_text}`}
                      className="overflow-hidden rounded-lg border border-[var(--border-subtle)]"
                    >
                      {change.reason && (
                        <p className="border-b border-[var(--border-subtle)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)]">
                          {change.reason}
                        </p>
                      )}
                      <div className="divide-y divide-[var(--border-subtle)] font-mono text-[10px] sm:text-[11px] leading-5 overflow-x-auto">
                        {change.old_text &&
                          change.old_text.split("\n").map((line, lineIndex) => (
                            <pre
                              key={`removed-${lineIndex}`}
                              className="whitespace-pre-wrap break-all bg-[var(--danger-muted)] px-2.5 py-1 text-[var(--danger)]"
                            >
                              <span className="mr-1.5 select-none font-bold">−</span>
                              {line || " "}
                            </pre>
                          ))}
                        {change.new_text &&
                          change.new_text.split("\n").map((line, lineIndex) => (
                            <pre
                              key={`added-${lineIndex}`}
                              className="whitespace-pre-wrap break-all bg-[var(--success-muted)] px-2.5 py-1 text-[var(--success)]"
                            >
                              <span className="mr-1.5 select-none font-bold">+</span>
                              {line || " "}
                            </pre>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-raised)] p-2.5">
                  <button
                    type="button"
                    onClick={rejectEdit}
                    className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-white"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={acceptEdit}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-[var(--accent-hover)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="m3.5 8.25 3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Accept
                  </button>
                </div>
              </section>
            )}

            {sending && (
              <div className="mr-auto flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--text-tertiary)]/30 border-t-[var(--accent)]" />
                <span>Thinking…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
        className="shrink-0 border-t border-[var(--border-subtle)] p-2.5 sm:p-3"
      >
        {error && (
          <p
            role="alert"
            className="mb-2 rounded-md bg-[var(--danger-muted)] px-2.5 py-1.5 text-xs text-[var(--danger)]"
          >
            {error}
          </p>
        )}

        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setisCodeFix(!isCodeFix)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isCodeFix ? "bg-amber-400" : "bg-emerald-400"}`} />
            <span>{isCodeFix ? "Mode: Edit Assistant" : "Mode: Report Chat"}</span>
          </button>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {isCodeFix ? "2 credits" : "1 credit"}
          </span>
        </div>

        <div className="flex items-end gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-1.5 sm:p-2 focus-within:border-[var(--accent)]">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            disabled={!report || sending || Boolean(pendingEdit)}
            placeholder={
              !report
                ? "Generate a report to start"
                : pendingEdit
                ? "Review pending edits above"
                : isCodeFix
                ? "Instruct changes to the report…"
                : "Ask about this report…"
            }
            rows={1}
            aria-label="Message the report assistant"
            className="max-h-24 min-h-[38px] min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-xs sm:text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!report || !input.trim() || sending || Boolean(pendingEdit)}
            aria-label="Send message"
            className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition hover:bg-[var(--accent-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M8 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
