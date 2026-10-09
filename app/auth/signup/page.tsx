"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || `Signup failed (${response.status}).`);
        return;
      }

      router.push("/login");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-4xl font-black">
          IRL<span className="text-purple-500">.</span>
        </Link>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#111] p-8">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Join IRL and start talking.
          </p>

          {error && (
            <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <form onSubmit={handleSignup} className="mt-7 space-y-4">
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
            />

            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
            />

            <input
              type="password"
              placeholder="Password (at least 6 characters)"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-purple-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}