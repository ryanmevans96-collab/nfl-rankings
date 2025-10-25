"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { signIn, useSession } from "next-auth/react";
import Logo from "@/components/Logo";
import { chipStyle } from "@/lib/branding";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

type Team = { id: number; name: string; abbr: string; logoUrl?: string | null };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function VotePage() {
  const { data } = useSWR("/api/aggregate", fetcher, { refreshInterval: 5000 });
  const isOpen = data?.window?.isOpen;
  const { data: session } = useSession();

  const [teams, setTeams] = useState<Team[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Build initial list: ranked teams first, then unranked
  useEffect(() => {
    async function init() {
      if (!data?.rankings) return;
      const ranked: Team[] = data.rankings
        .filter((x: any) => x.avg !== 999)
        .map((x: any) => x.team);
      const unranked: Team[] = data.rankings
        .filter((x: any) => x.avg === 999)
        .map((x: any) => x.team);
      setTeams([...ranked, ...unranked]);
    }
    init();
  }, [data]);

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const updated = Array.from(teams);
    const [removed] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, removed);
    setTeams(updated);
  }

  async function doSignup() {
    try {
      setBusy(true);
      setMsg(null);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Sign up failed");
      setMsg("✅ Sign up successful. You can now log in.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function doLogin() {
    try {
      setBusy(true);
      setMsg(null);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) throw new Error(res.error);
      setMsg("✅ Logged in.");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
  try {
    setBusy(true);
    setMsg(null);

    if (!isOpen) throw new Error("Voting is closed. (Use FORCE_VOTING_OPEN=true to test.)");
    if (!session?.user) throw new Error("Please log in first.");
    if (teams.length !== 32) throw new Error("Team list is incomplete.");

    const ids = teams.map((t) => t.id);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranking: ids }),
    });

    // Parse JSON if possible; otherwise read text
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      const text = await res.text();
      payload = { error: text || `HTTP ${res.status}` };
    }

    if (!res.ok) {
      throw new Error(payload?.error || `HTTP ${res.status}`);
    }

    setMsg("✅ Vote submitted! Thanks.");
  } catch (e: any) {
    setMsg(`❌ ${e.message}`);
  } finally {
    setBusy(false);
  }
}


  if (isOpen === false) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Voting is locked 🔒</h1>
        <p className="text-sm text-gray-600">
          Voting opens Tuesday 12:00 AM → Thursday 7:00 PM (America/New_York).
          {process.env.NEXT_PUBLIC_FORCE_HINT ?? ""}
        </p>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <section>
        {/* 👋 Welcome Banner */}
        {session?.user && (
          <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm">
            Welcome, <strong>{session.user.name ?? session.user.email}</strong>!{" "}
            Ready to make your picks?
          </div>
        )}

        <h1 className="text-2xl font-bold mb-2">Your Weekly Rankings</h1>
        <p className="text-sm text-gray-600 mb-4">
          Status: <strong>{isOpen ? "OPEN" : "CLOSED"}</strong> · Drag and drop to
          reorder, top to bottom.
        </p>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="teams">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="rounded-xl border bg-white divide-y"
              >
                {teams.map((t, index) => (
                  <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                    {(prov, snapshot) => (
                      <li
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        className={`flex items-center gap-3 p-3 ${
                          snapshot.isDragging ? "bg-gray-50" : ""
                        }`}
                      >
                        <span className="w-6 text-right font-semibold tabular-nums">
                          {index + 1}
                        </span>

                        {/* Logo in colored chip */}
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-md text-white text-sm font-bold overflow-hidden"
                          style={chipStyle(t.abbr)}
                        >
                          <Logo
                            abbr={t.abbr}
                            name={t.name}
                            srcFromDb={t.logoUrl}
                            size={32}
                          />
                        </div>

                        <span className="truncate">
                          {t.name} ({t.abbr})
                        </span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {busy ? "Submitting..." : "Submit"}
        </button>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-gray-600">
          {session?.user ? (
            <>
              You are logged in as{" "}
              <strong>{session.user.name ?? session.user.email}</strong>.
            </>
          ) : (
            <>
              Please{" "}
              <a href="/auth" className="underline">
                sign in or sign up
              </a>{" "}
              to submit a vote.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
