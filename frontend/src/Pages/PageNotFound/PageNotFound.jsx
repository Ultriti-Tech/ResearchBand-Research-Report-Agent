import React from "react";
import { Link, useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08080b] text-zinc-100">


      <main className="flex justify-center px-4 py-20">
        <div className="w-full max-w-lg text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            Error 404
          </p>

          {/* big 404 */}
          <h1 className="text-8xl font-bold tracking-tight sm:text-9xl">
            4<span className="text-orange-500">0</span>4
          </h1>

          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            This page can't be found.
          </h2>
          <p className="mt-3 text-zinc-400">
            The link may be broken, or the page may have been moved. Head back
            and start a new research report.
          </p>

          <div className="mt-8 rounded-3xl border border-[#26262c] bg-[#0f0f13] p-6">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
                <path d="M9 9l4 4M13 9l-4 4" />
              </svg>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="flex-1 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-500"
              >
                Go to Home
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 rounded-xl border border-[#26262c] bg-[#14141a] px-4 py-3 font-medium text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-500"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageNotFound;