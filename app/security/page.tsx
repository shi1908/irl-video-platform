"use client";

import { useState } from "react";
import Link from "next/link";

export default function SecurityPage() {
  const [name, setName] = useState("IRL User");
  const [email, setEmail] = useState("test@irl.com");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [camera, setCamera] = useState("Default Camera");
  const [microphone, setMicrophone] = useState("Default Microphone");
  const [speaker, setSpeaker] = useState("Default Speaker");

  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    allowInvites: true,
    saveCallHistory: true,
  });

  const [securityMessage, setSecurityMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    const confirmed = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (!confirmed) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setLoggingOut(false);
        alert(data.message || "Unable to sign out.");
        return;
      }

      // Replace the current page instead of adding login to browser history
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      alert("Unable to connect to the server.");
    }
  }

  function handleSaveProfile() {
    setEditingProfile(false);
    setProfileMessage("Profile updated successfully.");

    setTimeout(() => {
      setProfileMessage("");
    }, 2500);
  }

  function handleDeviceChange(
    type: "camera" | "microphone" | "speaker"
  ) {
    if (type === "camera") {
      setCamera(
        camera === "Default Camera"
          ? "Front Camera"
          : camera === "Front Camera"
          ? "Rear Camera"
          : "Default Camera"
      );
    }

    if (type === "microphone") {
      setMicrophone(
        microphone === "Default Microphone"
          ? "External Microphone"
          : "Default Microphone"
      );
    }

    if (type === "speaker") {
      setSpeaker(
        speaker === "Default Speaker"
          ? "External Speaker"
          : "Default Speaker"
      );
    }

    setSecurityMessage("Device preference updated.");

    setTimeout(() => {
      setSecurityMessage("");
    }, 2000);
  }

  function togglePrivacy(key: keyof typeof privacy) {
    setPrivacy((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function handleTrustedDevices() {
    setSecurityMessage(
      "Trusted device management will be connected to the authentication system."
    );

    setTimeout(() => {
      setSecurityMessage("");
    }, 3000);
  }

  function handleTwoFactor() {
    setSecurityMessage(
      "Two-factor authentication will be added in the next security step."
    );

    setTimeout(() => {
      setSecurityMessage("");
    }, 3000);
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-10">
        <Link
          href="/dashboard"
          className="text-3xl font-black tracking-tighter"
        >
          IRL<span className="text-purple-500">.</span>
        </Link>

        <Link
          href="/dashboard"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to dashboard
        </Link>
      </nav>

      {/* PAGE */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        {/* HEADER */}
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-purple-400">
            Settings
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Security & Privacy
          </h1>

          <p className="mt-3 max-w-2xl text-gray-500">
            Manage your profile, devices, privacy preferences, and account
            security.
          </p>
        </div>

        {/* SECURITY MESSAGE */}
        {securityMessage && (
          <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 px-5 py-4 text-sm text-purple-300">
            {securityMessage}
          </div>
        )}

        {/* PROFILE */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-semibold">Profile</p>

              <p className="mt-1 text-sm text-gray-500">
                Manage your basic account information.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingProfile(!editingProfile);
                setProfileMessage("");
              }}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              {editingProfile ? "Cancel" : "Edit profile"}
            </button>
          </div>

          {profileMessage && (
            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
              {profileMessage}
            </div>
          )}

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Name
              </label>

              <input
                value={name}
                disabled={!editingProfile}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email
              </label>

              <input
                value={email}
                disabled={!editingProfile}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {editingProfile && (
            <button
              onClick={handleSaveProfile}
              className="mt-5 rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold transition hover:bg-purple-400"
            >
              Save changes
            </button>
          )}
        </section>

        {/* CALL DEVICES */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
          <div>
            <p className="text-lg font-semibold">Call devices</p>

            <p className="mt-1 text-sm text-gray-500">
              Choose the devices IRL should use during calls.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {/* CAMERA */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium">Camera</p>

                <p className="mt-1 text-xs text-gray-600">
                  {camera}
                </p>
              </div>

              <button
                onClick={() => handleDeviceChange("camera")}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                Change
              </button>
            </div>

            {/* MICROPHONE */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium">Microphone</p>

                <p className="mt-1 text-xs text-gray-600">
                  {microphone}
                </p>
              </div>

              <button
                onClick={() => handleDeviceChange("microphone")}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                Change
              </button>
            </div>

            {/* SPEAKER */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium">Speaker</p>

                <p className="mt-1 text-xs text-gray-600">
                  {speaker}
                </p>
              </div>

              <button
                onClick={() => handleDeviceChange("speaker")}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                Change
              </button>
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
          <div>
            <p className="text-lg font-semibold">Privacy</p>

            <p className="mt-1 text-sm text-gray-500">
              Control what other users can see and do.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {/* ONLINE STATUS */}
            <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black p-4">
              <div>
                <p className="text-sm font-medium">
                  Show online status
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Let people know when you're online.
                </p>
              </div>

              <button
                onClick={() => togglePrivacy("showOnlineStatus")}
                className={`h-7 w-12 rounded-full p-1 transition ${
                  privacy.showOnlineStatus
                    ? "bg-purple-500"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    privacy.showOnlineStatus
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* INVITES */}
            <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black p-4">
              <div>
                <p className="text-sm font-medium">
                  Allow meeting invites
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Allow other users to invite you to rooms.
                </p>
              </div>

              <button
                onClick={() => togglePrivacy("allowInvites")}
                className={`h-7 w-12 rounded-full p-1 transition ${
                  privacy.allowInvites
                    ? "bg-purple-500"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    privacy.allowInvites
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* CALL HISTORY */}
            <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black p-4">
              <div>
                <p className="text-sm font-medium">
                  Save call history
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Keep your recent meeting history available.
                </p>
              </div>

              <button
                onClick={() => togglePrivacy("saveCallHistory")}
                className={`h-7 w-12 rounded-full p-1 transition ${
                  privacy.saveCallHistory
                    ? "bg-purple-500"
                    : "bg-gray-700"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white transition ${
                    privacy.saveCallHistory
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ACCOUNT SECURITY */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#111111] p-6 md:p-8">
          <div>
            <p className="text-lg font-semibold">
              Account security
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Additional security options for your IRL account.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {/* TRUSTED DEVICES */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium">
                  Trusted devices
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Review devices that are trusted to access your account.
                </p>
              </div>

              <button
                onClick={handleTrustedDevices}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                Manage
              </button>
            </div>

            {/* TWO FACTOR */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black p-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium">
                  Two-factor authentication
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Add an extra layer of protection to your account.
                </p>
              </div>

              <button
                onClick={handleTwoFactor}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                Set up
              </button>
            </div>
          </div>
        </section>

        {/* SIGN OUT */}
        <section className="mt-6 rounded-3xl border border-red-500/10 bg-[#111111] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-semibold">Sign out</p>

              <p className="mt-1 text-sm text-gray-500">
                Sign out of your IRL account on this device.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-gray-600 md:flex-row">
          <p>IRL. Security & Privacy</p>

          <div className="flex gap-5">
            <Link
              href="/dashboard"
              className="transition hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}