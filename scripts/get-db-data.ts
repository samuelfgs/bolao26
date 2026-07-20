import * as dotenv from "dotenv";
dotenv.config({ path: ".env" }); // Load from .env which has DATABASE_URL
dotenv.config({ path: ".env.local" }); // Load from .env.local if exists

async function main() {
  const { db } = await import("../lib/db");
  const { users, pools, usersToPools, matches, guesses } = await import("../lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const fs = await import("fs");
  const path = await import("path");

  console.log("Fetching database pools...");
  const allPools = await db.select().from(pools);
  if (allPools.length === 0) {
    console.error("No pools found in database.");
    process.exit(1);
  }
  const pool = allPools[0];
  const poolId = pool.id;
  console.log(`Using Pool: ${pool.name} (${pool.code})`);

  console.log("Fetching users in pool...");
  const poolMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      nickname: users.nickname,
      totalPoints: usersToPools.totalPoints,
      totalCravadas: usersToPools.totalCravadas,
      totalAcertos: usersToPools.totalAcertos,
      campeao: usersToPools.campeao,
      artilheiro: usersToPools.artilheiro,
      craque: usersToPools.craque,
      status: usersToPools.status,
    })
    .from(usersToPools)
    .innerJoin(users, eq(usersToPools.userId, users.id))
    .where(eq(usersToPools.poolId, poolId));

  console.log("Fetching matches...");
  const allMatches = await db.select().from(matches);

  console.log("Fetching guesses...");
  const allGuesses = await db
    .select()
    .from(guesses)
    .where(eq(guesses.poolId, poolId));

  const data = {
    pool: {
      id: pool.id,
      name: pool.name,
      code: pool.code,
    },
    users: poolMembers.filter(u => u.status === "approved"),
    matches: allMatches,
    guesses: allGuesses,
  };

  const outputPath = path.join(process.cwd(), "scripts", "scenarios-data.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Successfully exported database data to ${outputPath}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
