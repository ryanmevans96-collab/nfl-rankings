// scripts/set-logos.ts
import { prisma } from "../src/lib/prisma";

// All 32 NFL team abbreviations
const ABBRS = [
  "ARI","ATL","BAL","BUF","CAR","CHI","CIN","CLE","DAL","DEN","DET","GB",
  "HOU","IND","JAX","KC","LV","LAC","LAR","MIA","MIN","NE","NO","NYG",
  "NYJ","PHI","PIT","SF","SEA","TB","TEN","WAS"
];

async function main() {
  for (const abbr of ABBRS) {
    // 👇 Change to .png if your files use .png
    const url = `/logos/${abbr}.png`;

    await prisma.team.updateMany({
      where: { abbr },
      data: { logoUrl: url },
    });

    console.log(`Updated ${abbr} → ${url}`);
  }

  console.log("✅ Logos assigned to all teams!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
