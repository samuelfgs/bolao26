import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db";
import { usersToPools } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const yellowCardUpdates = [
  { userId: "33452768-2d11-45ae-af4e-583c4eae7c55", cards: 7 }, // Filipe Araujo
  { userId: "857d0b2f-8915-401d-a68c-6e8ca03ebe85", cards: 2 }, // Junior Dionizio
  { userId: "274f7835-4750-427a-8956-c1efc82c6dbe", cards: 2 }, // Joao Pedro Ferreira
  { userId: "05dabbe6-5a50-40b4-9af5-a2ebed4b821c", cards: 1 }, // Pedro Henrique de Matos Procópio
  { userId: "726393d5-12c8-43a4-a990-abad36e5039d", cards: 1 }, // Samuel Ferreira Guimarães Santos
  { userId: "1ef01be9-3d59-46ee-891b-ce53082d5541", cards: 1 }, // Elvis Ferreira
];

async function main() {
  try {
    console.log("Updating yellow card counts in the database...");
    for (const update of yellowCardUpdates) {
      console.log(`Setting cards = ${update.cards} for user ID ${update.userId}...`);
      await db
        .update(usersToPools)
        .set({ yellowCards: update.cards })
        .where(eq(usersToPools.userId, update.userId));
    }
    console.log("Yellow card counts updated successfully!");
  } catch (err) {
    console.error("Failed to update yellow cards:", err);
  } finally {
    process.exit(0);
  }
}

main();
