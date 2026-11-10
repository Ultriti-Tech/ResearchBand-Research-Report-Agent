import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { Field } from "./AuthLayout";
import FloatingAlert from "../../Components/FloatingAlert";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFloatingAlert, setisFloatingAlert] = useState(false);
  const [alertInformation, setalertInformation] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // { username, email, password }
      });
      const data = await res.json();

      // token limit exceeded
      if (res.status == 429) {
        const retryAfter = res.headers.get("Retry-After");
        setisFloatingAlert(true);
        setalertInformation({
          text: res.statusText,
          desc: `retry after ${retryAfter} seconds`,
        });
      }

      // unatuhorized login
      if (res.status == 401) {
        setisFloatingAlert(true);
        setalertInformation({
          text: res.statusText,
          desc: `Email or password is incorrect.`,
        });
      }

      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not create your account.",
        );
      }
      localStorage.setItem("RHD_v1_dashed_t", data.access_token || data.token);

      navigate("/");
    } catch (err) {
      setError(err.message || "Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isFloatingAlert ? (
        <>
          <div className="">
            <FloatingAlert
              message={alertInformation?.desc}
              title={alertInformation?.text}
              type={"warning"}
              duration={4000} // ms, set 0 to keep it until closed
              onClose={() => setisFloatingAlert(false)}
            />
          </div>
        </>
      ) : null}

      <AuthLayout
        eyebrow="Account"
        title="Create your account."
        subtitle="Save your reports and chat with them anytime."
        footer={
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            id="username"
            name="username"
            type="text"
            label="Username"
            placeholder="yashash"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
          <Field
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <Field
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default Register;
