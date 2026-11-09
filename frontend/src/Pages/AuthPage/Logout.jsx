import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "RHD_v1_dashed_t"; // same key the login page saves

const LogoutPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // the body may be empty / not JSON, so don't let parsing crash the flow
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Unable to sign out. Please try again."
        );
      }

      localStorage.removeItem(TOKEN_KEY);

      navigate("/login", {
        replace: true,
        state: { message: result.message || "You have been signed out." },
      });
    } catch (requestError) {
      setError(requestError.message || "Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account"
      title="Sign out of ResearchMind?"
      subtitle="Your reports stay saved to your account. You can log back in whenever you are ready."
      footer={
        <>
          Changed your mind?{" "}
          <Link to="/" className="text-orange-500 hover:underline">
            Return to ResearchMind
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {/* icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>

        <Link
          to="/"
          className="block w-full rounded-xl border border-[#26262c] bg-[#14141a] px-4 py-3 text-center font-medium text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-500"
        >
          Cancel
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LogoutPage;