"use client";

import useSWR from "swr";
import Logo from "@/components/Logo";
import { chipStyle } from "@/lib/branding";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const { data } = useSWR("/api/aggregate", fetcher, { refreshInterval: 5000 });
  const isOpen = data?.window?.isOpen;
  const rankings = data?.rankings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-10">
        <h1 className="text-4xl font-extrabold">NFL Power Rankings</h1>
        <span
          className={`px-4 py-2 text-sm rounded-full font-medium ${
            isOpen ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {isOpen ? "Voting: OPEN (Tue–Thu 7pm ET)" : "Voting: LOCKED"}
        </span>
      </div>

      {/* 4-column layout on large/2xl screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 px-10">
        {rankings.map((r: any, idx: number) => {
          const team = r.team;

          return (
            <div
              key={r.teamId}
              className="rounded-3xl border bg-white p-8 shadow-md transition hover:shadow-xl hover:scale-[1.02] overflow-hidden"
            >
              {/* Rank + Logo */}
              <div className="flex items-center gap-6 min-w-0">
                <span className="inline-block w-12 text-4xl font-extrabold tabular-nums text-right shrink-0">
                  {idx + 1}
                </span>

                <div
                  className="flex items-center justify-center rounded-2xl text-white font-bold overflow-hidden shrink-0"
                  style={{
                    ...chipStyle(team.abbr),
                    height: "5.5rem", // custom h-22
                    width: "5.5rem",  // custom w-22
                  }}
                  aria-label={`${team.name} logo`}
                >
                  <Logo
                    abbr={team.abbr}
                    name={team.name}
                    srcFromDb={team.logoUrl}
                    size={88}
                  />
                </div>
              </div>

              {/* Stats below */}
              <div className="mt-6 text-sm text-gray-700 text-left">
                <div className="font-medium">
                  Avg: {r.avg === 999 ? "—" : r.avg.toFixed(2)}
                </div>
                <div>Votes: {r.count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

