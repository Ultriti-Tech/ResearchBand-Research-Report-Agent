import { Link } from "react-router-dom";

const CAPABILITIES = [
  {
    number: "01",
    title: "Explore a topic",
    description:
      "Start with a subject you want to understand. ResearchMind prepares a structured report with source links so you can follow up on the material.",
  },
  {
    number: "02",
    title: "Review the result",
    description:
      "Read the report alongside a separate review that highlights strengths and possible areas to improve.",
  },
  {
    number: "03",
    title: "Keep the work yours",
    description:
      "Ask questions about the report, make your own edits, or request a suggested change. AI-proposed edits stay pending until you accept them.",
  },
];

const HIGHLIGHTS = [
  {
    title: "Sources you can inspect",
    description:
      "Reports include links to supporting material. Open those sources and verify important details for yourself.",
  },
  {
    title: "A report and its assistant, together",
    description:
      "Keep the research in view while asking follow-up questions or refining the draft.",
  },
  {
    title: "Useful output beyond the app",
    description:
      "Copy the report or download it as a PDF, Markdown, or Word document to continue working in your preferred tools.",
  },
];

const PROJECT_OBJECTIVES = [
  "Make it easier to get an organized first look at a research topic.",
  "Keep a readable report, a separate review, and its source links together.",
  "Let people ask follow-up questions and stay in control of report changes.",
];

const AUDIENCES = [
  {
    title: "Students and educators",
    description:
      "Use a report as a starting point for exploring a subject and finding material to review.",
  },
  {
    title: "Analysts and product teams",
    description:
      "Organize an initial view of a public topic or trend before deeper investigation.",
  },
  {
    title: "Writers and communicators",
    description:
      "Prepare a background draft that can be checked, edited, and developed further.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-raised)] px-6 py-9 shadow-[var(--shadow-card)] sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--accent)" }}
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            About ResearchMind
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            Turn a question into a clearer starting point.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            ResearchMind is an AI-assisted research workspace for exploring a
            topic, organizing an initial report, and deciding what to do next.
            It brings the report, a separate review, and a report-focused
            assistant into one place.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
            >
              Open research workspace
              <span aria-hidden="true">→</span>
            </Link>
            <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
              AI-assisted · Human-reviewed
            </span>
          </div>
        </div>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="how-it-helps">
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            A practical research companion
          </p>
          <h2
            id="how-it-helps"
            className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          >
            From first question to useful draft
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Use it to get oriented, inspect a report, and shape the result
            around what you actually need.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <article
              key={item.number}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6"
            >
              <span className="mb-5 inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[var(--accent-muted)] px-2 text-xs font-bold text-[var(--accent)]">
                {item.number}
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow-card)] sm:mt-16 sm:grid-cols-2 sm:gap-10 sm:p-8">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Project objectives
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Built to make early research more manageable
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            ResearchMind focuses on the first stretch of a research task:
            getting oriented, bringing information into a coherent draft, and
            making it easier to decide what needs further attention.
          </p>
        </div>
        <ul className="grid content-center gap-3">
          {PROJECT_OBJECTIVES.map((objective) => (
            <li
              key={objective}
              className="flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-sm leading-6 text-[var(--text-secondary)]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 grid gap-8 border-t border-[var(--border-subtle)] pt-10 sm:mt-16 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:pt-12">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Designed for momentum
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Less busywork. More room to think.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Early research often means juggling links, notes, drafts, and
            feedback. ResearchMind brings those first steps into a focused
            workspace while leaving the judgment and final decisions with you.
          </p>
        </div>
        <div className="grid gap-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 sm:mt-16" aria-labelledby="who-its-for">
        <div className="mb-6 max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Who it can help
          </p>
          <h2
            id="who-its-for"
            className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          >
            A useful first step for curious minds and busy teams
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            The project is suited to exploratory, human-reviewed research—not
            as a replacement for expert analysis or primary-source review.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <article
              key={audience.title}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {audience.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
        <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Project profile
          </p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
            <dt className="text-[var(--text-tertiary)]">Category</dt>
            <dd className="text-[var(--text-primary)]">
              AI-assisted research productivity
            </dd>
            <dt className="text-[var(--text-tertiary)]">Experience</dt>
            <dd className="text-[var(--text-primary)]">
              Browser-based, responsive workspace
            </dd>
            <dt className="text-[var(--text-tertiary)]">Project stage</dt>
            <dd className="text-[var(--text-primary)]">
              Working prototype
            </dd>
          </dl>
        </article>
        <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Technology overview
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            The project combines a React-based web experience with a Python
            service and integrations for AI-assisted research. Its user
            interface is built with React, Vite, and Tailwind CSS.
          </p>
          <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">
            This overview describes the project at a product level; detailed
            internal design is intentionally not included here.
          </p>
        </article>
      </section>

      <aside className="mt-10 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-muted)] p-5 sm:mt-14 sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          Use AI as a starting point, not the final authority
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
          Generated reports and answers can be incomplete or inaccurate.
          Review the linked sources and independently verify important claims.
          Suggested report changes are shown for your approval before they are
          applied. This prototype does not provide user accounts or saved
          report history, and its research features require external service
          configuration.
        </p>
      </aside>
    </main>
  );
}