export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isVotingOpen } from "@/lib/time";

export async function POST(req: Request) {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Window gate
    if (!isVotingOpen()) {
      return NextResponse.json({ error: "Voting is closed" }, { status: 403 });
    }

    // Parse body safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { ranking } = body;
    if (!Array.isArray(ranking) || ranking.length !== 32) {
      return NextResponse.json({ error: "Invalid ranking payload" }, { status: 400 });
    }

    // Ensure an active week exists (auto-create if missing)
    const now = new Date();
    let week = await prisma.week.findFirst({
      where: { startAt: { lte: now }, endAt: { gte: now } },
      select: { id: true },
    });

    if (!week) {
      const startAt = new Date(now);
      startAt.setHours(0, 0, 0, 0);
      const endAt = new Date(startAt);
      endAt.setDate(endAt.getDate() + 7);
      const weekKey = `week-${startAt.toISOString().slice(0, 10)}`;
      week = await prisma.week.upsert({
        where: { weekKey },
        create: { weekKey, startAt, endAt },
        update: { startAt, endAt },
        select: { id: true },
      });
    }

    // Guard: all team IDs valid
    const ids = ranking as number[];
    const count = await prisma.team.count({ where: { id: { in: ids } } });
    if (count !== 32) {
      return NextResponse.json({ error: "One or more team IDs are invalid" }, { status: 400 });
    }

    // Write votes. Adjust model/field names here if your schema differs.
    // If your model is called Ranking or Vote, change the next two lines accordingly.
    const model = (prisma as any).vote ?? (prisma as any).ranking; // prefer Vote, fallback Ranking
    const voterField = "voter"; // change to "voterEmail" if that's your column

    await prisma.$transaction(async (tx) => {
      const table = (tx as any).vote ?? (tx as any).ranking;

      await table.deleteMany({
        where: { weekId: week!.id, [voterField]: email },
      });

      const rows = ids.map((teamId, i) => {
        const base: any = { weekId: week!.id, teamId, rank: i + 1 };
        base[voterField] = email;
        return base;
      });

      await table.createMany({ data: rows });
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("submit error:", err);
    // Always return JSON so the client can parse error safely
    return NextResponse.json(
      { error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
