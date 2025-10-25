import { prisma } from "./prisma";
import { getCurrentWeekWindow, weekKeyFor } from "./time";

export async function ensureCurrentWeek() {
  const key = weekKeyFor();
  let week = await prisma.week.findUnique({ where: { weekKey: key } });
  if (!week) {
    const { start, end } = getCurrentWeekWindow();
    week = await prisma.week.create({
      data: { weekKey: key, startAt: start.toJSDate(), endAt: end.toJSDate() },
    });
  }
  return week;
}

export async function getAggregateForWeek(weekId: string) {
  const submissions = await prisma.userRanking.findMany({ where: { weekId } });
  if (submissions.length === 0) return [] as { teamId: number; avg: number; count: number }[];

  const nTeams = 32;
  const sums = new Array(nTeams + 1).fill(0);
  const counts = new Array(nTeams + 1).fill(0);

  for (const s of submissions) {
    const arr = s.ranking as number[];
    arr.forEach((teamId, idx) => {
      sums[teamId] += idx + 1;
      counts[teamId] += 1;
    });
  }

  const out = [] as { teamId: number; avg: number; count: number }[];
  for (let teamId = 1; teamId <= nTeams; teamId++) {
    if (counts[teamId] > 0) out.push({ teamId, avg: sums[teamId] / counts[teamId], count: counts[teamId] });
    else out.push({ teamId, avg: 999, count: 0 });
  }

  out.sort((a, b) => a.avg - b.avg);
  return out;
}
