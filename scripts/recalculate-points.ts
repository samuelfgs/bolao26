import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Starting points recalculation...");
  const { calculatePoints } = await import("../lib/actions/calculate-points");
  await calculatePoints();
  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
