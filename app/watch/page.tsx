"use client";

import { useState } from "react";
import Link from "next/link";

export default function WatchPage() {
  const [videoId, setVideoId] = useState("demo-video-1");
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDownload() {
    if (downloading) return;

    setDownloading(true);
    setMessage("");

    try {
      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Download unavailable.");
        return;
      }

      /*
       * Download is approved by the quota system.
       *
       * For now there is no real video file/storage connected
       * to the project, so we show the successful approval.
       */
      setMessage(
        `Download approved. ${data.remaining} download${
          data.remaining === 1 ? "" : "s"
        } remaining today.`
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">
        <Link
          href="/"
          className="text-3xl font-black tracking-tighter"
        >
          IRL<span className="text-purple-500">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/downloads"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Downloads
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {/* VIDEO */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <div className="aspect-video flex items-center justify-center bg-zinc-950">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10 text-3xl text-purple-400">
                ▶
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Video player
              </p>

              <p className="mt-1 text-xs text-gray-700">
                Demo video
              </p>
            </div>
          </div>
        </div>

        {/* VIDEO INFO */}
        <div className="mt-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-purple-400">
                IRL Recording
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Demo Recorded Video
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Your recorded IRL conversation
              </p>
            </div>

            {/* DOWNLOAD */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-full bg-purple-500 px-6 py-3 font-semibold transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Checking..." : "↓ Download"}
            </button>
          </div>

          {/* DOWNLOAD MESSAGE */}
          {message && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 text-sm text-gray-300">
              {message}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <section className="mt-12">
          <p className="text-sm uppercase tracking-widest text-purple-400">
            Video details
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Video ID"
              value={videoId}
            />

            <InfoCard
              title="Access"
              value="Available to your account"
            />

            <InfoCard
              title="Downloads"
              value="Daily quota applies"
            />
          </div>
        </section>

        {/* DOWNLOAD HISTORY */}
        <section className="mt-12 rounded-3xl border border-white/10 bg-[#111111] p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-purple-400">
                Your downloads
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Download history
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                View your previous video downloads.
              </p>
            </div>

            <Link
              href="/downloads"
              className="rounded-full border border-white/10 px-5 py-3 text-sm transition hover:bg-white/5"
            >
              View history →
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-sm font-medium text-gray-200">
        {value}
      </p>
    </div>
  );
}