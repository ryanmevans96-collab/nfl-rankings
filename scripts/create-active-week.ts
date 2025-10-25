import { prisma } from "../src/lib/prisma";

(async () => {
  console.log("Connecting to:", process.env.DATABASE_URL);

  try {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const weekKey = `week-${start.toISOString().slice(0, 10)}`;

    const w = await prisma.week.upsert({
      where: { weekKey },
      create: { weekKey, startAt: start, endAt: end },
      update: { startAt: start, endAt: end },
    });

    console.log("✅ Created active week:", w);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
