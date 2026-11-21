import React, { useState } from "react";
import axios from "axios";

const Demotextupdate = () => {
  const [topic, setTopic] = useState("LLM agents 2025");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("RHD_v1_dashed_t");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/research/report/ba83cbb2-2d42-4ddb-b236-6288d8caaf36",
        {
          topic: topic,
          report: text,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      setResponse(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <span className="mb-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            API Playground
          </span>

          <h1 className="text-3xl font-bold tracking-tight">
            Update Research Report
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Update your research topic and report content.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Endpoint */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                API Endpoint
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3">
                <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
                  PUT
                </span>
                <p className="break-all text-xs text-slate-400">
                  /api/v1/research/report/ba83cbb2-2d42-4ddb-b236-6288d8caaf36
                </p>
              </div>
            </div>

            {/* Topic Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Research Topic
              </label>

              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter research topic..."
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Report Content */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-300">
                  Report Content
                </label>

                <span className="text-xs text-slate-500">
                  {text.length} characters
                </span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your updated research report content..."
                rows={10}
                required
                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !topic.trim() || !text.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating Report...
                </>
              ) : (
                <>Update Report →</>
              )}
            </button>
          </form>

          {/* Success */}
          {response && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-400">
                Report Updated Successfully
              </h3>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <h3 className="mb-1 text-sm font-semibold text-red-400">
                Request Failed
              </h3>
              <p className="break-words text-sm text-red-300">{error}</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          ResearchMind · Development API Playground
        </p>
      </div>
    </div>
  );
};

export default Demotextupdate;
