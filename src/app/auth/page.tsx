"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function doSignup() {
    setBusy(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    setBusy(false);
    if (res.ok) alert("Signup successful! Please log in.");
    else alert("Signup failed.");
  }

  async function doLogin() {
    setBusy(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/vote",
    });
    setBusy(false);
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-extrabold text-center mb-6">Log in / Sign up</h1>

      <div className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-3 rounded"
        />
        <input
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border p-3 rounded"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full border p-3 rounded"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={doLogin}
          disabled={busy}
          className="flex-1 px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-60"
        >
          Log in
        </button>
        <button
          onClick={doSignup}
          disabled={busy}
          className="flex-1 px-4 py-2 border rounded disabled:opacity-60"
        >
          Sign up
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        For testing outside Tue–Thu 7 pm ET, set <code>FORCE_VOTING_OPEN=true</code> in your <code>.env</code>.
      </p>
    </main>
  );
}
