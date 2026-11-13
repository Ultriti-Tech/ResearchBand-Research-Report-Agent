import { useState } from "react";

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
    priceNote: "per year (about ₹417 a month)",
    credits: 800, // per month, 200 more than Monthly
    creditNote: "every month",
    bonus: "200 more credits than Monthly",
    features: [
      "Save ₹989 compared to 12 monthly payments",
      "9,600 credits over the year",
      "Credits arrive on the same day each month",
    ],
    button: "Subscribe for ₹4,999",
    popular: true,
  },
];

const formatPrice = (n) => (n === 0 ? "₹0" : `₹${n.toLocaleString("en-IN")}`);

export default function Pricing({ onSelect,setshowBillingPlan }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleClick = async (plan) => {
    setLoadingId(plan.id);
    try {
      // Replace with your payment flow (e.g. create a Razorpay order, then open checkout)
      if (onSelect) await onSelect(plan);
      else console.log("Selected plan:", plan);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen mb-10  rounded-2xl bg-[#0a0a0c] px-4 pb-12 text-zinc-100 sm:px-8">
      <div className="max-w-6xl mt-3">
        <div onClick={()=>{setshowBillingPlan(false)}} className="close-icon cursor-pointer flex items-center justify-center bg-red-600 h-10 w-10 rounded-[50%] absolute right-50 ">
          x
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Credits for every report
        </h1>
        <p className="mt-2 max-w-xl text-zinc-400">
          Pick a plan, get credits, and spend them on research reports, chat,
          and code edits.
        </p>

        {/* What credits buy */}
        <div className="mt-6 flex flex-wrap gap-2">
          {ACTION_COSTS.map((a) => (
            <span
              key={a.label}
              className="rounded-full border border-zinc-800 bg-[#111114] px-4 py-1.5 text-sm text-zinc-300"
            >
              {a.label}:{" "}
              <span className="font-semibold text-orange-400">
                {a.credits} credits
              </span>
            </span>
          ))}
        </div>

        {/* Plans */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const reports = Math.floor(plan.credits / 20);
            const perCredit = plan.price / (plan.credits * (plan.months || 1));
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-[#111114] p-6 ${
                  plan.popular ? "border-orange-500/70" : "border-zinc-800"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-black">
                    Best value
                  </span>
                )}

                <h2 className="text-lg font-semibold">{plan.name}</h2>

                <p className="mt-4 text-4xl font-bold text-orange-400">
                  {plan.credits}
                </p>
                <p className="text-sm text-zinc-400">
                  credits {plan.creditNote}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  About {reports} research{" "}
                  {reports === 1 ? "report" : "reports"}
                </p>
                {plan.bonus && (
                  <p className="mt-1 text-sm font-medium text-orange-300">
                    {plan.bonus}
                  </p>
                )}

                <ul className="mt-5 flex-1 space-y-2 text-sm text-zinc-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-orange-400">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-sm text-zinc-500">
                  {plan.originalPrice && (
                    <span className="mr-2 line-through">
                      {formatPrice(plan.originalPrice)}
                    </span>
                  )}
                  <span className="font-semibold text-zinc-200">
                    {formatPrice(plan.price)}
                  </span>{" "}
                  {plan.priceNote}
                </p>

                <button
                  onClick={() => handleClick(plan)}
                  disabled={loadingId !== null}
                  className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                    plan.popular
                      ? "bg-orange-500 text-black hover:bg-orange-400"
                      : "bg-orange-900/50 text-orange-200 hover:bg-orange-900/80"
                  }`}
                >
                  {loadingId === plan.id ? "Please wait..." : plan.button}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Credits are used only when a report, chat message, or edit succeeds.
          If something fails, your credits are returned.
        </p>
      </div>
    </div>
  );
}
