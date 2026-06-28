
import { calculatePoints } from "../lib/actions/calculate-points";
import "dotenv/config";

async function main() {
  console.log("Starting points recalculation...");
  await calculatePoints();
  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
