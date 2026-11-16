import { useState, useEffect } from "react";
import RazorpayPayment from "./Razorpy";
import axios from "axios";

// What each action costs, in credits (matches your backend)
const ACTION_COSTS = [
  { label: "Research report", credits: 20 },
  { label: "Report chat message", credits: 1 },
  { label: "Code edit", credits: 2 },
];

// Edit prices and credits here
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceNote: "one time",
    credits: 20,
    creditNote: "on signup",
    features: [
      "Try one full report",
      "Report chat and code edits",
      "Email verification needed",
    ],
    button: "Start free",
  },
  {
    id: "topup",
    name: "Top-up",
    price: 50,
    priceNote: "one time",
    credits: 50,
    creditNote: "valid for 90 days",
    features: [
      "Pay only when you need it",
      "No subscription",
      "Stacks with any plan",
    ],
    button: "Buy for ₹50",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 499,
    priceNote: "per month",
    credits: 600,
    creditNote: "every month",
    features: [
      "Credits reset each month",
      "Best for regular research",
      "Cancel anytime",
    ],
    button: "Subscribe for ₹499",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 4999,
    originalPrice: 5988, // 12 x ₹499
    months: 12,
    priceNote: "per year (~₹417/mo)",
    credits: 800, // per month, 200 more than Monthly
    creditNote: "every month",
    bonus: "200 more credits/mo",
    features: [
      "Save ₹989 vs monthly",
      "9,600 credits over the year",
      "Monthly credit refill",
    ],
    button: "Subscribe for ₹4,999",
    popular: true,
  },
];

const formatPrice = (n) => (n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`);

export default function Pricing({ onSelect, setshowBillingPlan }) {
  const [loadingId, setLoadingId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setshowBillingPlan?.(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setshowBillingPlan]);

  const handleClick = async (plan) => {
    setLoadingId(plan.id);
    console.log("plan", plan);
    try {
      if (plan.price === 0) {
        onSelect?.(plan);
        return;
      }
      setSelectedPlan(plan);
    } finally {
      setLoadingId(null);
    }
  };

  const updateSubscription = async ({}) => {

    const updateSubscriptionAxios = axios.post(`${import.meta.env.VITE_BASE_URL}/v1/api/`);


  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-6 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setshowBillingPlan?.(false);
      }}
    >
      {selectedPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#121217] p-6">
            <h2 className="text-lg font-bold text-white">
              Confirm {selectedPlan.name} Plan
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {selectedPlan.credits} credits for{" "}
              {formatPrice(selectedPlan.price)}
            </p>

            <div className="mt-5">
              <RazorpayPayment
                planId={selectedPlan.id}
                appName="Ultriti"
                description={`${selectedPlan.name} Plan`}
                buttonText={`Pay ${formatPrice(selectedPlan.price)}`}
                onSuccess={(payment) => {
                  console.log("Payment successful:", payment);
                  setSelectedPlan(false);
                }}
                onFailure={(error) => {
                  console.error(error);
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-3 w-full rounded-lg bg-zinc-800 py-2 text-sm text-white hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="relative my-auto w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#0c0c10] p-4 sm:p-8 text-zinc-100 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setshowBillingPlan?.(false)}
          aria-label="Close billing plans"
          className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="pr-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Billing & Credits
          </p>
          <h1
            id="pricing-title"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Credits for every report
          </h1>
          <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-zinc-400">
            Pick a plan to get credits for deep research reports, follow-up
            chats, and automated edits.
          </p>
        </div>

        {/* What credits buy */}
        <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
          {ACTION_COSTS.map((a) => (
            <span
              key={a.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#14141a] px-3 py-1 text-xs text-zinc-300"
            >
              <span>{a.label}:</span>
              <span className="font-semibold text-orange-400">
                {a.credits} cr
              </span>
            </span>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="mt-6 sm:mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const reports = Math.floor(plan.credits / 20);
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition ${
                  plan.popular
                    ? "border-orange-500 bg-[#161311] shadow-lg shadow-orange-500/10"
                    : "border-zinc-800/90 bg-[#121217]"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-bold text-black uppercase tracking-wider">
                    Best value
                  </span>
                )}

                <h2 className="text-base font-semibold text-white">
                  {plan.name}
                </h2>

                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-orange-400">
                    {plan.credits}
                  </span>
                  <span className="text-xs text-zinc-400">
                    credits {plan.creditNote}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  ≈ {reports} research {reports === 1 ? "report" : "reports"}
                </p>

                {plan.bonus && (
                  <p className="mt-1 text-xs font-medium text-orange-300">
                    {plan.bonus}
                  </p>
                )}

                <ul className="mt-4 mb-5 flex-1 space-y-2 text-xs text-zinc-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <span className="text-orange-400 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto border-t border-zinc-800/80 pt-3">
                  <div className="mb-2 text-xs text-zinc-400">
                    {plan.originalPrice && (
                      <span className="mr-1.5 line-through text-zinc-600">
                        {formatPrice(plan.originalPrice)}
                      </span>
                    )}
                    <span className="font-bold text-zinc-100 text-sm">
                      {formatPrice(plan.price)}
                    </span>{" "}
                    {plan.priceNote}
                  </div>

                  <button
                    onClick={() => handleClick(plan)}
                    disabled={loadingId !== null}
                    className={`w-full rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.popular
                        ? "bg-orange-500 text-black hover:bg-orange-400 shadow-md"
                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    }`}
                  >
                    {loadingId === plan.id ? "Please wait..." : plan.button}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Credits are only deducted when a report, chat message, or edit
          completes successfully.
        </p>
      </div>
    </div>
  );
}
