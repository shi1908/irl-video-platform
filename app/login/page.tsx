
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setFormError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Please enter your email.");
      hasError = true;
    } else if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.success) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login request failed:", error);

      setFormError(
        "Unable to connect to the server. Please try again."
      );

      setLoading(false);
    }
  }

  function handleForgotPassword() {
    setFormError(
      "Password recovery will be added in the next authentication step."
    );
  }

  function handleGoogle() {
    setFormError(
      "Google sign-in will be connected in a later authentication step."
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-3xl font-black tracking-tighter"
        >
          IRL<span className="text-purple-500">.</span>
        </Link>

        <Link
          href="/"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Back home
        </Link>
      </nav>

      {/* LOGIN AREA */}
      <section className="flex min-h-[calc(100vh-100px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* HEADER */}
          <div className="text-center">

            <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
              Welcome back
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Good to see you.
            </h1>

            <p className="mt-3 text-gray-500">
              Sign in to continue to IRL.
            </p>

          </div>

          {/* FORM */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>

                <label className="mb-2 block text-sm text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setFormError("");
                  }}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border bg-black px-5 py-3.5 text-sm outline-none transition placeholder:text-gray-600 ${
                    emailError
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/10 focus:border-purple-500"
                  }`}
                />

                {emailError && (
                  <p className="mt-2 text-xs text-red-400">
                    {emailError}
                  </p>
                )}

              </div>

              {/* PASSWORD */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm text-gray-400">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs text-purple-400 transition hover:text-purple-300 disabled:opacity-50"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    disabled={loading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                      setFormError("");
                    }}
                    placeholder="••••••••"
                    className={`w-full rounded-2xl border bg-black px-5 py-3.5 pr-16 text-sm outline-none transition placeholder:text-gray-600 ${
                      passwordError
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-white/10 focus:border-purple-500"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 transition hover:text-white disabled:opacity-50"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                {passwordError && (
                  <p className="mt-2 text-xs text-red-400">
                    {passwordError}
                  </p>
                )}

              </div>

              {/* FORM ERROR */}
              {formError && (
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 text-xs leading-5 text-purple-300">
                  {formError}
                </div>
              )}

              {/* SIGN IN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-purple-500 py-3.5 text-sm font-semibold transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing you in..." : "Sign in →"}
              </button>

            </form>

            {/* DIVIDER */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-gray-600">
                OR
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            {/* GOOGLE */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full rounded-2xl border border-white/10 py-3.5 text-sm font-medium transition hover:bg-white/5 disabled:opacity-50"
            >
              Continue with Google
            </button>

            {/* SIGN UP */}
            <p className="mt-7 text-center text-sm text-gray-500">
              Don't have an account?

              <Link
                href="/auth/signup"
                className="ml-1 text-purple-400 transition hover:text-purple-300"
              >
                Create one
              </Link>
            </p>

          </div>

          {/* FOOTNOTE */}
          <p className="mt-6 text-center text-xs leading-5 text-gray-600">
            By continuing, you agree to IRL's Terms of Service and
            Privacy Policy.
          </p>

        </div>

      </section>

    </main>
  );
}
