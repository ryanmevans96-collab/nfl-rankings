import { prisma } from "../src/lib/prisma";
(async () => {
  const now = new Date();
  const week = await prisma.week.findFirst({
    where: { startAt: { lte: now }, endAt: { gte: now } },
  });
  console.log("Active week:", week);
  process.exit(0);
})();
