"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Plan = {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: 0,
    description: "For casual IRL users.",
    features: [
      "1-to-1 video calls",
      "Standard video quality",
      "In-call chat",
      "Screen sharing",
      "1 download per day",
    ],
  },
  {
    name: "Bronze",
    price: 149,
    description: "More freedom for regular users.",
    features: [
      "Everything in Free",
      "HD video quality",
      "Higher download limits",
      "Priority content",
      "Ad-free viewing",
    ],
  },
  {
    name: "Silver",
    price: 299,
    description: "For people who use IRL a lot.",
    popular: true,
    features: [
      "Everything in Bronze",
      "Full premium access",
      "Full HD video quality",
      "More daily downloads",
      "Exclusive content",
    ],
  },
  {
    name: "Gold",
    price: 499,
    description: "The complete IRL experience.",
    features: [
      "Everything in Silver",
      "Maximum video quality",
      "Highest download limits",
      "Priority streaming",
      "Premium courses & content",
    ],
  },
];

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  function getPrice(price: number) {
    if (price === 0) return 0;

    if (billing === "yearly") {
      return Math.round(price * 10);
    }

    return price;
  }

  async function handlePlan(planName: string) {
    if (planName === "Free") {
      alert("You are already on the Free plan.");
      return;
    }

    setLoadingPlan(planName);

    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          billing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please log in before purchasing a plan.");
        } else {
          alert(data.message || "Could not start payment.");
        }

        setLoadingPlan(null);
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay is still loading. Please try again.");
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "IRL",

        description: `${planName} ${billing === "yearly" ? "Yearly" : "Monthly"} Membership`,

        order_id: data.order.id,

        handler: function (paymentResponse: any) {
          console.log("PAYMENT SUCCESS:", paymentResponse);

          alert(
            `${planName} payment successful!\n\nPayment ID: ${paymentResponse.razorpay_payment_id}`
          );

          setLoadingPlan(null);
        },

        prefill: {
          name: "",
          email: "",
        },

        notes: {
          plan: planName.toLowerCase(),
          billing,
        },

        theme: {
          color: "#9b5cff",
        },

        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("PAYMENT FAILED:", response.error);

        alert(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoadingPlan(null);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        "Something went wrong while starting the payment."
      );

      setLoadingPlan(null);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#fff",
          padding: "32px 24px 70px",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            maxWidth: 1200,
            margin: "0 auto 70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              color: "#fff",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            IRL<span style={{ color: "#9b5cff" }}>.</span>
          </Link>

          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              color: "#aaa",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ← Back to dashboard
          </Link>
        </nav>

        {/* HERO */}
        <section
          style={{
            maxWidth: 850,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "7px 13px",
              borderRadius: 999,
              background: "rgba(155,92,255,0.1)",
              border: "1px solid rgba(155,92,255,0.25)",
              color: "#b98cff",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "1px",
              marginBottom: 20,
            }}
          >
            IRL MEMBERSHIP
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 7vw, 72px)",
              lineHeight: 0.98,
              letterSpacing: "-4px",
              fontWeight: 900,
            }}
          >
            Choose your
            <br />
            <span style={{ color: "#9b5cff" }}>IRL.</span>
          </h1>

          <p
            style={{
              maxWidth: 600,
              margin: "24px auto 30px",
              color: "#999",
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            Upgrade your experience with better quality, more access,
            higher limits and exclusive content.
          </p>

          {/* BILLING TOGGLE */}
          <div
            style={{
              display: "inline-flex",
              padding: 5,
              borderRadius: 999,
              background: "#111",
              border: "1px solid #242424",
              marginBottom: 55,
            }}
          >
            <button
              onClick={() => setBilling("monthly")}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 20px",
                background:
                  billing === "monthly"
                    ? "#9b5cff"
                    : "transparent",
                color:
                  billing === "monthly" ? "#fff" : "#888",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilling("yearly")}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 20px",
                background:
                  billing === "yearly"
                    ? "#9b5cff"
                    : "transparent",
                color:
                  billing === "yearly" ? "#fff" : "#888",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Yearly
            </button>
          </div>
        </section>

        {/* PLANS */}
        <section
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(245px, 1fr))",
            gap: 18,
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                position: "relative",
                padding: 26,
                borderRadius: 24,
                background: plan.popular
                  ? "linear-gradient(145deg, #171022, #0e0e0e)"
                  : "#101010",
                border: plan.popular
                  ? "1px solid rgba(155,92,255,0.65)"
                  : "1px solid #242424",
                boxShadow: plan.popular
                  ? "0 0 35px rgba(155,92,255,0.12)"
                  : "none",
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#9b5cff",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.7px",
                  }}
                >
                  POPULAR
                </div>
              )}

              <div
                style={{
                  color: "#b98cff",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                {plan.name}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: 42,
                  letterSpacing: "-2px",
                }}
              >
                ₹{getPrice(plan.price)}

                <span
                  style={{
                    color: "#666",
                    fontSize: 14,
                    letterSpacing: 0,
                  }}
                >
                  {plan.price === 0
                    ? " forever"
                    : billing === "monthly"
                      ? " / month"
                      : " / year"}
                </span>
              </h2>

              <p
                style={{
                  minHeight: 45,
                  color: "#888",
                  fontSize: 13,
                  lineHeight: 1.5,
                  margin: "15px 0 24px",
                }}
              >
                {plan.description}
              </p>

              <button
                onClick={() => handlePlan(plan.name)}
                disabled={loadingPlan !== null}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: 13,
                  border: plan.popular
                    ? "none"
                    : "1px solid #333",
                  background: plan.popular
                    ? "#9b5cff"
                    : "#171717",
                  color: "#fff",
                  fontWeight: 800,
                  cursor:
                    loadingPlan !== null
                      ? "not-allowed"
                      : "pointer",
                  marginBottom: 25,
                  opacity:
                    loadingPlan !== null &&
                    loadingPlan !== plan.name
                      ? 0.5
                      : 1,
                }}
              >
                {loadingPlan === plan.name
                  ? "Opening payment..."
                  : plan.name === "Free"
                    ? "Current plan"
                    : `Choose ${plan.name}`}
              </button>

              <div
                style={{
                  height: 1,
                  background: "#242424",
                  marginBottom: 22,
                }}
              />

              <div
                style={{
                  color: "#777",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  marginBottom: 15,
                }}
              >
                INCLUDES
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 13,
                }}
              >
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      color: "#ccc",
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        color: "#9b5cff",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>

                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* PAYMENT NOTE */}
        <div
          style={{
            maxWidth: 700,
            margin: "45px auto 0",
            textAlign: "center",
            color: "#666",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          Payments are securely processed through Razorpay.
          <br />
          You can manage your subscription from your account.
        </div>
      </main>
    </>
  );
}