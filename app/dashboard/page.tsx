"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [showRoom, setShowRoom] = useState(false);
  const [createdRoom, setCreatedRoom] = useState("");
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (data.user?.username) {
          setUsername(data.user.username);
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  function createRoom() {
    const newRoom = `irl-${Math.floor(1000 + Math.random() * 9000)}`;

    setCreatedRoom(newRoom);
    setShowRoom(true);
  }

  function joinRoom() {
    const code = roomCode.trim();

    if (!code) {
      alert("Please enter a room code");
      return;
    }

    window.location.href = `/call?room=${encodeURIComponent(code)}`;
  }

  function copyRoomCode() {
    navigator.clipboard?.writeText(createdRoom);
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p className="text-gray-400">Loading IRL...</p>
      </main>
    );
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
            href="/downloads"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white sm:block"
          >
            Downloads
          </Link>

          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500 font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-10">
            <p className="text-sm text-purple-400">
              Welcome back, {username}
            </p>

            <h1 className="mt-2 text-4xl font-bold md:text-5xl">
              Ready to talk?
            </h1>

            <p className="mt-3 text-gray-400">
              Start a new conversation or jump back into one.
            </p>
          </div>

          {/* MAIN ACTIONS */}
          <div className="grid gap-5 md:grid-cols-2">

            {/* CREATE ROOM */}
            <div className="group rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:border-purple-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl text-purple-400">
                +
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Start a new call
              </h2>

              <p className="mt-2 max-w-md text-gray-400">
                Create a private room and invite people instantly.
              </p>

              <button
                type="button"
                onClick={createRoom}
                className="mt-7 rounded-full bg-purple-500 px-6 py-3 font-semibold transition hover:bg-purple-400"
              >
                Create room →
              </button>
            </div>

            {/* JOIN ROOM */}
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl">
                ↗
              </div>

              <h2 className="mt-6 text-2xl font-semibold">
                Join a call
              </h2>

              <p className="mt-2 max-w-md text-gray-400">
                Have a room code? Enter it below and join the conversation.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinRoom();
                    }
                  }}
                  placeholder="Enter room code"
                  className="w-full rounded-full border border-white/10 bg-black px-5 py-3 text-sm outline-none placeholder:text-gray-600 focus:border-purple-500"
                />

                <button
                  type="button"
                  onClick={joinRoom}
                  className="rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
                >
                  Join
                </button>
              </div>
            </div>

          </div>

          {/* DOWNLOADS */}
          <section className="mt-5">
            <Link
              href="/downloads"
              className="group block rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:border-purple-500/40 hover:bg-[#141414]"
            >
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl text-purple-400">
                    ↓
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold">
                      Downloads
                    </h2>

                    <p className="mt-1 text-gray-400">
                      View your downloaded videos and download history.
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 transition group-hover:bg-white/5 group-hover:text-white">
                  Open Downloads →
                </span>
              </div>
            </Link>
          </section>

          {/* RECENT CALLS */}
          <section className="mt-14">
            <p className="text-sm text-purple-400">
              Your activity
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Recent calls
            </h2>

            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e0e]">
              <Meeting
                name="Friday Night"
                people="4 participants"
                time="Today · 8:30 PM"
                room="irl-4821"
              />

              <Meeting
                name="Project Discussion"
                people="3 participants"
                time="Yesterday · 6:15 PM"
                room="irl-7314"
              />

              <Meeting
                name="Study Room"
                people="5 participants"
                time="Sep 20 · 7:00 PM"
                room="irl-2951"
              />
            </div>
          </section>

          {/* UPCOMING */}
          <section className="mt-14">
            <p className="text-sm text-purple-400">
              Coming up
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Upcoming
            </h2>

            <div className="mt-5 rounded-3xl border border-white/10 bg-[#111111] p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-lg font-semibold">
                    Team sync
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Tomorrow · 5:00 PM
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert("Team sync details coming soon")
                  }
                  className="rounded-full border border-white/10 px-5 py-2 text-sm transition hover:bg-white/5"
                >
                  View details
                </button>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-20 border-t border-white/10 py-8">
            <div className="flex flex-col justify-between gap-3 text-sm text-gray-600 sm:flex-row">
              <p>© 2026 IRL</p>

              <div className="flex gap-5">
                <Link
                  href="/security"
                  className="transition hover:text-white"
                >
                  Security
                </Link>

                <Link
                  href="/downloads"
                  className="transition hover:text-white"
                >
                  Downloads
                </Link>

                <Link
                  href="/subscr"
                  className="transition hover:text-white"
                >
                  Plans
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </section>

      {/* ROOM CREATED MODAL */}
      {showRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-7 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-purple-400">
                  Room created
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Your room is ready.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowRoom(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Share this code with the people you want to invite.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black p-4">
              <span className="flex-1 font-mono text-lg">
                {createdRoom}
              </span>

              <button
                type="button"
                onClick={copyRoomCode}
                className="rounded-full bg-white/10 px-4 py-2 text-xs transition hover:bg-white/20"
              >
                Copy
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = `/call?room=${createdRoom}`;
              }}
              className="mt-5 w-full rounded-2xl bg-purple-500 py-4 font-semibold transition hover:bg-purple-400"
            >
              Enter room →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Meeting({
  name,
  people,
  time,
  room,
}: {
  name: string;
  people: string;
  time: string;
  room: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `/call?room=${room}`;
      }}
      className="flex w-full flex-col justify-between gap-4 border-b border-white/10 px-6 py-5 text-left transition hover:bg-white/[0.03] last:border-b-0 sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
          ◉
        </div>

        <div>
          <p className="font-medium">{name}</p>

          <p className="text-xs text-gray-500">
            {people} · {room}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {time}
      </p>
    </button>
  );
}