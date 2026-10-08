"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  function joinRoom() {
    const code = roomCode.trim();

    if (!code) {
      alert("Please enter a room code");
      return;
    }

    window.location.href = `/call?room=${encodeURIComponent(code)}`;
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="text-2xl font-black tracking-tight">
          IRL<span className="text-purple-500">.</span>
        </Link>

        
        
        <div className="hidden gap-8 text-sm text-gray-400 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#security" className="hover:text-white">Security</a>
        </div>

        <Link
          href="/login"
          className="rounded-full border border-white/10 px-5 py-2 text-sm hover:bg-white/10"
        >
          Sign in
        </Link>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-8 pb-24 pt-20">

        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.3em] text-purple-400">
            Video calling, reimagined
          </p>

          <h1 className="text-6xl font-black leading-[0.95] tracking-tight md:text-8xl">
            Be there.
            <br />
            Even when
            <br />
            you can't.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-400">
            IRL makes video calls feel less like meetings and more like
            actually being there.
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">

            <Link
              href="/call?new=true"
              className="rounded-full bg-purple-500 px-8 py-4 text-center font-semibold transition hover:bg-purple-400"
            >
              Start a call →
            </Link>

            <button
              type="button"
              onClick={() =>  setShowJoin(true)}
              > 
              Join a call
            </button>

          </div>
        </div>

        {/* VIDEO PREVIEW */}
        <div className="mt-24 grid grid-cols-2 gap-3 md:grid-cols-4">

          <VideoTile label="You" />
          <VideoTile label="Alex" />
          <VideoTile label="Maya" />
          <VideoTile label="Sam" />

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-white/10 px-8 py-24">
        <div className="mx-auto max-w-7xl">

          <p className="text-sm uppercase tracking-widest text-purple-400">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Everything you need to stay close.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <Feature
              title="Crystal clear"
              text="Smooth, high-quality video and audio designed for real conversations."
            />

            <Feature
              title="Instant rooms"
              text="Create a room and invite people without unnecessary setup."
            />

            <Feature
              title="Private by design"
              text="Your conversations stay yours with privacy-focused controls."
            />

          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-white/10 px-8 py-24">
        <div className="mx-auto max-w-4xl">

          <p className="text-sm uppercase tracking-widest text-purple-400">
            About IRL
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Technology that feels human.
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-400">
            IRL is built around a simple idea: distance shouldn't make
            conversations feel distant.
          </p>

        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="border-t border-white/10 px-8 py-24">
        <div className="mx-auto max-w-4xl">

          <p className="text-sm uppercase tracking-widest text-purple-400">
            Security
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Your conversations are yours.
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-400">
            IRL is designed with privacy and security at the center of the
            experience.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-32 text-center">

        <h2 className="text-5xl font-black">
          See you on IRL.
        </h2>

        <Link
          href="/call?new=true"
          className="mt-8 inline-block rounded-full bg-purple-500 px-8 py-4 font-semibold transition hover:bg-purple-400"
        >
          Start a call →
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-8 py-8 text-sm text-gray-500">
        <div className="mx-auto flex max-w-7xl justify-between">
          <span>IRL.</span>
          <span>Be there.</span>
        </div>
      </footer>

      {/* JOIN MODAL */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-7 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-purple-400">
                  Join a room
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Enter your room code
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowJoin(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>

            </div>

            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  joinRoom();
                }
              }}
              placeholder="e.g. irl-4821"
              autoFocus
              className="mt-7 w-full rounded-2xl border border-white/10 bg-black px-5 py-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
            />

            <button
              type="button"
              onClick={joinRoom}
              className="mt-4 w-full rounded-2xl bg-purple-500 py-4 font-semibold text-white transition hover:bg-purple-400"
            >
              Join room →
            </button>

          </div>
        </div>
      )}

    </main>
  );
}


/* VIDEO TILE */

function VideoTile({ label }: { label: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 text-xl font-bold text-purple-300">
          {label[0]}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs">
        {label}
      </div>

    </div>
  );
}


/* FEATURE */

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-400">
        {text}
      </p>

    </div>
  );
}