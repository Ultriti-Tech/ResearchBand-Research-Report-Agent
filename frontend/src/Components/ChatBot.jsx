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
  // const [credits, setCredits] = useState(0);

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
        setCredits(proposal.credits);
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

        setCredits(response.credits);
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

  // useEffect(() => {
  //     let active = true;

  //     const loadCurrentUser = async () => {
  //       const userDetails = await getUser();

  //       if (!active) return;
  //       if (!userDetails.ok) {
  //         setError(
  //           userDetails.error?.detail || "Unable to load account details.",
  //         );
  //         return;
  //       }

  //       console.log("userDetails", userDetails);

  //       if (typeof userDetails.credits === "number") {
  //         setCredits(userDetails.credits);
  //       }
  //     };

  //     loadCurrentUser();

  //     return () => {
  //       active = false;
  //     };
  //   }, []);

  return (
    <section className="workspace-chat flex max-h-[90vh] min-h-0 flex-col overflow-hidden border border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-card)]">
      <header className="shrink-0 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
            <svg
              width="18"
              height="18"
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
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
              {isCodeFix ? "Edit Assistant ( 2 credits )" : "Report Assistant ( 1 credit )"}
            </h2>
            <p className="truncate text-[12px] text-[var(--text-secondary)]">
              {topic
                ? `Ask anything about ${topic}`
                : "Ask questions about your research report"}
            </p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            AI
          </span>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-4"
        aria-live="polite"
      >
        {!report ? (
          <div className="m-auto max-w-xs text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)]">
              <svg
                width="22"
                height="22"
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
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Your report chat is ready
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              Start a research report and you can discuss its findings here.
            </p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
                <p className="text-[13px] leading-5 text-[var(--text-secondary)]">
                  I’ve read your report on{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {topic}
                  </span>
                  . Tell me what you’d like changed. I’ll show a proposal before
                  updating it.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      disabled={sending}
                      className="rounded-lg border border-[var(--border-default)] px-2.5 py-1.5 text-left text-[11px] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`max-w-[90%] break-words rounded-xl px-3.5 py-2.5 text-[13px] leading-5 ${
                  message.role === "user"
                    ? "ml-auto bg-[var(--accent)] text-white"
                    : "mr-auto border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-invert max-w-none prose-p:my-1 prose-p:text-[var(--text-secondary)] prose-ul:my-1 prose-li:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)]">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  message.content
                )}
              </div>
            ))}
            {pendingEdit && (
              <section
                className="flex max-h-72 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
                aria-label="Suggested report changes"
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3.5 py-2.5">
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">
                      Suggested changes
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {pendingEdit.changes.length}{" "}
                      {pendingEdit.changes.length === 1 ? "edit" : "edits"} ·
                      Review before applying
                    </p>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {pendingEdit.changes.map((change, changeIndex) => (
                    <article
                      key={`${changeIndex}-${change.old_text}`}
                      className="overflow-hidden rounded-lg border border-[var(--border-subtle)]"
                    >
                      {change.reason && (
                        <p className="border-b border-[var(--border-subtle)] px-2.5 py-2 text-[11px] leading-4 text-[var(--text-secondary)]">
                          {change.reason}
                        </p>
                      )}
                      <div className="divide-y divide-[var(--border-subtle)] font-mono text-[11px] leading-5">
                        {change.old_text &&
                          change.old_text.split("\n").map((line, lineIndex) => (
                            <pre
                              key={`removed-${lineIndex}`}
                              className="whitespace-pre-wrap break-words bg-[var(--danger-muted)] px-2.5 py-1 text-[var(--danger)]"
                            >
                              <span className="mr-2 select-none">−</span>
                              {line || " "}
                            </pre>
                          ))}
                        {change.new_text &&
                          change.new_text.split("\n").map((line, lineIndex) => (
                            <pre
                              key={`added-${lineIndex}`}
                              className="whitespace-pre-wrap break-words bg-[var(--success-muted)] px-2.5 py-1 text-[var(--success)]"
                            >
                              <span className="mr-2 select-none">+</span>
                              {line || " "}
                            </pre>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                  <button
                    type="button"
                    onClick={rejectEdit}
                    className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={acceptEdit}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-[var(--accent-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] active:translate-y-0 active:shadow-sm"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m3.5 8.25 3 3 6-6.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Accept changes
                  </button>
                </div>
              </section>
            )}
            {sending && (
              <div className="mr-auto flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[12px] text-[var(--text-secondary)]">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--text-tertiary)]/30 border-t-[var(--accent)]" />
                Preparing report changes…
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

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
            className="mb-2 rounded-md bg-[var(--danger-muted)] px-2.5 py-2 text-[12px] text-[var(--danger)]"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setisCodeFix(!isCodeFix);
          }}
          className="mb-2 inline-flex min-h-9 max-w-full items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--text-primary)] sm:text-[13px]"
        >
          {isCodeFix
            ? "Switch to report chat"
            : "Switch to edit assistant"}
        </button>
        <div className="flex items-end gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 focus-within:border-[var(--accent)]">
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
                ? "Generate a report to start editing"
                : pendingEdit
                  ? "Accept or reject the suggested changes"
                  : "Describe a change to the report…"
            }
            rows={1}
            aria-label="Message the report assistant"
            className="max-h-28 min-h-9 min-w-0 flex-1 resize-y bg-transparent px-1.5 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={
              !report || !input.trim() || sending || Boolean(pendingEdit)
            }
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M8 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[var(--text-tertiary)]">
          Your report changes only when you accept a suggestion
        </p>
      </form>
    </section>
  );
}
