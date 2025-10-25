export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureCurrentWeek, getAggregateForWeek } from "@/lib/utils";
import { getCurrentWeekWindow, isVotingOpen } from "@/lib/time";



export async function GET() {
  const week = await ensureCurrentWeek();
  const aggregate = await getAggregateForWeek(week.id);
  const teamMap = new Map((await prisma.team.findMany()).map(t => [t.id, t]));
  const enriched = aggregate.map(a => ({ ...a, team: teamMap.get(a.teamId)! }));

  const { start, end } = getCurrentWeekWindow();
  return NextResponse.json({
    weekKey: week.weekKey,
    window: { start: start.toISO(), end: end.toISO(), isOpen: isVotingOpen() },
    rankings: enriched,
  });
}
