import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TEAMS = [
  [1, "Arizona Cardinals", "ARI"],
  [2, "Atlanta Falcons", "ATL"],
  [3, "Baltimore Ravens", "BAL"],
  [4, "Buffalo Bills", "BUF"],
  [5, "Carolina Panthers", "CAR"],
  [6, "Chicago Bears", "CHI"],
  [7, "Cincinnati Bengals", "CIN"],
  [8, "Cleveland Browns", "CLE"],
  [9, "Dallas Cowboys", "DAL"],
  [10, "Denver Broncos", "DEN"],
  [11, "Detroit Lions", "DET"],
  [12, "Green Bay Packers", "GB"],
  [13, "Houston Texans", "HOU"],
  [14, "Indianapolis Colts", "IND"],
  [15, "Jacksonville Jaguars", "JAX"],
  [16, "Kansas City Chiefs", "KC"],
  [17, "Las Vegas Raiders", "LV"],
  [18, "Los Angeles Chargers", "LAC"],
  [19, "Los Angeles Rams", "LAR"],
  [20, "Miami Dolphins", "MIA"],
  [21, "Minnesota Vikings", "MIN"],
  [22, "New England Patriots", "NE"],
  [23, "New Orleans Saints", "NO"],
  [24, "New York Giants", "NYG"],
  [25, "New York Jets", "NYJ"],
  [26, "Philadelphia Eagles", "PHI"],
  [27, "Pittsburgh Steelers", "PIT"],
  [28, "San Francisco 49ers", "SF"],
  [29, "Seattle Seahawks", "SEA"],
  [30, "Tampa Bay Buccaneers", "TB"],
  [31, "Tennessee Titans", "TEN"],
  [32, "Washington Commanders", "WAS"],
] as const;

async function main() {
  for (const [id, name, abbr] of TEAMS) {
    await prisma.team.upsert({
      where: { id },
      update: { name, abbr },
      create: { id, name, abbr },
    });
  }
  console.log("Seeded teams.");
}

main().finally(async () => prisma.$disconnect());
