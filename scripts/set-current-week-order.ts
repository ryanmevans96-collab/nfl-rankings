import { prisma } from "../src/lib/prisma";
import { ensureCurrentWeek } from "../src/lib/utils";

// Your desired order, top (1) -> bottom (32), using Team IDs from the seed:
// 1 ARI, 2 ATL, 3 BAL, 4 BUF, 5 CAR, 6 CHI, 7 CIN, 8 CLE,
// 9 DAL, 10 DEN, 11 DET, 12 GB, 13 HOU, 14 IND, 15 JAX, 16 KC,
// 17 LV, 18 LAC, 19 LAR, 20 MIA, 21 MIN, 22 NE, 23 NO, 24 NYG,
// 25 NYJ, 26 PHI, 27 PIT, 28 SF, 29 SEA, 30 TB, 31 TEN, 32 WAS

const RANKING_THIS_WEEK: number[] = [
  14, // 1. Indianapolis Colts
  11, // 2. Detroit Lions
  30, // 3. Buccaneers (TB)
  19, // 4. Rams (LAR)
  12, // 5. Green Bay Packers
  29, // 6. Seattle Seahawks
  4,  // 7. Buffalo Bills
  22, // 8. Patriots (NE)
  26, // 9. Philadelphia Eagles
  10, // 10. Denver Broncos
  16, // 11. Kansas City Chiefs
  27, // 12. Pittsburgh Steelers
  18, // 13. Chargers (LAC)
  28, // 14. 49ers (SF)
  15, // 15. Jaguars (JAX)
  6,  // 16. Chicago Bears
  21, // 17. Vikings (MIN)
  32, // 18. Commanders (WAS)
  9,  // 19. Dallas Cowboys
  2,  // 20. Atlanta Falcons
  5,  // 21. Carolina Panthers
  13, // 22. Houston Texans
  7,  // 23. Cincinnati Bengals
  24, // 24. New York Giants
  1,  // 25. Arizona Cardinals
  8,  // 26. Browns (CLE)
  17, // 27. Raiders (LV)
  3,  // 28. Ravens (BAL)
  23, // 29. Saints (NO)
  20, // 30. Miami Dolphins
  31, // 31. Tennessee Titans
  25, // 32. New York Jets
];

async function main() {
  // Make sure this week's record exists (Tue 00:00 -> Thu 7:00pm window key)
  const week = await ensureCurrentWeek();

  // Create or reuse a dedicated system user for seeding this order
  const user = await prisma.user.upsert({
    where: { email: "seed@system.local" },
    update: {},
    create: {
      email: "seed@system.local",
      name: "Seed User",
      password: "$2a$10$abcdefghijklmnopqrstuv" // dummy hash; not used to log in
    },
  });

  // Insert (or replace if you rerun) this week's ranking for that user
  // If you want to allow reruns, delete existing first:
  await prisma.userRanking.deleteMany({ where: { userId: user.id, weekId: week.id } });

  await prisma.userRanking.create({
    data: {
      userId: user.id,
      weekId: week.id,
      ranking: RANKING_THIS_WEEK,
    },
  });

  console.log("✅ Set this week's homepage order.");
}

main().finally(async () => prisma.$disconnect());
