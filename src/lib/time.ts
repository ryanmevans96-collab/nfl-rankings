import { DateTime } from "luxon";

const ZONE = "America/New_York";

export function currentNyTime() {
  return DateTime.now().setZone(ZONE);
}

// Return Tuesday 00:00 and Thursday 19:00 for the current week (NY time)
export function getCurrentWeekWindow(now = currentNyTime()) {
  // ISO weeks start Monday(1)..Sunday(7)
  // Get the Tuesday of the current ISO week
  let monday = now.startOf("week"); // Monday
  let tuesday = monday.plus({ days: 1 }); // Tuesday

  // If current time is before this week's Tuesday 00:00, use last week's Tuesday
  if (now < tuesday.startOf("day")) {
    tuesday = tuesday.minus({ weeks: 1 });
  }

  const start = tuesday.startOf("day"); // Tuesday 00:00
  const end = tuesday.plus({ days: 2 }).set({ hour: 19, minute: 0, second: 0, millisecond: 0 }); // Thursday 19:00
  return { start, end };
}

export function isVotingOpen(now = currentNyTime()) {
  if (process.env.FORCE_VOTING_OPEN === "true") return true;   // dev override
  if (process.env.FORCE_VOTING_CLOSED === "true") return false; // dev override
  const { start, end } = getCurrentWeekWindow(now);
  return now >= start && now <= end;
}

export function weekKeyFor(now = currentNyTime()): string {
  const { start } = getCurrentWeekWindow(now);
  // toISODate() can be null in types, but for a valid DateTime it's safe to assert.
  return start.toISODate() ?? start.toFormat("yyyy-LL-dd");
}
