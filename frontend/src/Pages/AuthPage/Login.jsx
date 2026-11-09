import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { Field } from "./AuthLayout";
import FloatingAlert from "../../Components/FloatingAlert";

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFloatingAlert, setisFloatingAlert] = useState(false);
  const [alertInformation, setalertInformation] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // { email, password }
      });
      const data = await res.json();

      if (!res.ok) {

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

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Email or password is incorrect.",
        );
      }

      // adjust the key if your backend names it differently
      localStorage.setItem("RHD_v1_dashed_t", data.access_token || data.token);
      navigate("/");

      // console.log('res', data)
      // setisFloatingAlert(true);
      // setalertInformation({
      //   text: data.message,
      //   desc: `User Logged in  Sucessfully`,
      // });
      


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
        title="Welcome back."
        subtitle="Log in to pick up your research reports."
        footer={
          <>
            New to ResearchMind?{" "}
            <Link to="/register" className="text-orange-500 hover:underline">
              Create an account
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
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
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default Login;
