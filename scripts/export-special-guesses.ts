import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db";
import { users, usersToPools } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function exportSpecialGuesses() {
  try {
    console.log("Fetching special guesses...");
    
    const results = await db
      .select({
        userName: users.name,
        userEmail: users.email,
        campeao: usersToPools.campeao,
        artilheiro: usersToPools.artilheiro,
        craque: usersToPools.craque,
        poolId: usersToPools.poolId,
      })
      .from(usersToPools)
      .innerJoin(users, eq(usersToPools.userId, users.id));

    if (results.length === 0) {
      console.log("No special guesses found.");
      return;
    }

    const csvRows = [
      ["User Name", "User Email", "Champion (Campeão)", "Top Scorer (Artilheiro)", "Best Player (Craque)"].join(",")
    ];

    for (const row of results) {
      const csvRow = [
        `"${(row.userName || "N/A").replace(/"/g, '""')}"`,
        `"${(row.userEmail || "N/A").replace(/"/g, '""')}"`,
        `"${(row.campeao || "N/A").replace(/"/g, '""')}"`,
        `"${(row.artilheiro || "N/A").replace(/"/g, '""')}"`,
        `"${(row.craque || "N/A").replace(/"/g, '""')}"`,
      ].join(",");
      csvRows.push(csvRow);
    }

    const csvContent = csvRows.join("\n");
    const filePath = path.join(process.cwd(), "special_guesses.csv");
    
    fs.writeFileSync(filePath, csvContent);
    console.log(`Successfully exported ${results.length} rows to ${filePath}`);
  } catch (error) {
    console.error("Error exporting special guesses:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

exportSpecialGuesses();
