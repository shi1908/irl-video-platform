"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Verification failed. Please try again.");
        return;
      }

      setSuccess("Verified! Redirecting to your dashboard...");
      router.replace("/dashboard");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8 shadow-2xl">
        <p className="mb-6 text-2xl font-bold tracking-tight">
          IRL<span className="text-purple-500">.</span>
        </p>

        <h1 className="text-3xl font-semibold">Verify your sign-in</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Enter the 6-digit code sent to your email to continue.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <label htmlFor="otp" className="block text-sm text-gray-300">
            Verification code
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-xl border border-white/15 bg-black px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none transition focus:border-purple-500"
          />

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-xl bg-purple-600 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & continue"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="mt-5 w-full text-sm text-gray-400 transition hover:text-white"
        >
          Back to login
        </button>
      </section>
    </main>
  );
}