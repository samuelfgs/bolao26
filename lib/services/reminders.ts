import { db } from "@/lib/db";
import { matches, guesses, users, usersToPools, sentReminders } from "@/lib/db/schema";
import { eq, and, between, isNull, sql } from "drizzle-orm";
import { sendWhatsAppMessage } from "./whatsapp";

export async function sendMatchReminders() {
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
  
  // Window: 25 to 35 minutes from now
  const startWindow = new Date(now.getTime() + 25 * 60 * 1000);
  const endWindow = new Date(now.getTime() + 35 * 60 * 1000);

  console.log(`Checking for matches starting between ${startWindow.toISOString()} and ${endWindow.toISOString()}`);

  // 1. Find matches starting soon
  const upcomingMatches = await db.select()
    .from(matches)
    .where(
      and(
        between(matches.startTime, startWindow, endWindow),
        eq(matches.status, "scheduled")
      )
    );

  if (upcomingMatches.length === 0) {
    console.log("No upcoming matches in the reminder window.");
    return;
  }

  console.log(`Found ${upcomingMatches.length} upcoming matches. Checking for missing guesses...`);

  for (const match of upcomingMatches) {
    // 2. Find users who are in pools but haven't guessed for this match
    // and haven't received a reminder yet
    const pendingUsers = await db.select({
      userId: users.id,
      userName: users.name,
      userNickname: users.nickname,
      phone: users.phone,
    })
    .from(users)
    .innerJoin(usersToPools, eq(users.id, usersToPools.userId))
    .leftJoin(guesses, and(
      eq(guesses.userId, users.id),
      eq(guesses.matchId, match.id),
      eq(guesses.poolId, usersToPools.poolId)
    ))
    .leftJoin(sentReminders, and(
      eq(sentReminders.userId, users.id),
      eq(sentReminders.matchId, match.id),
      eq(sentReminders.type, "match_reminder")
    ))
    .where(
      and(
        eq(usersToPools.status, "approved"),
        isNull(guesses.id),
        isNull(sentReminders.id),
        sql`${users.phone} IS NOT NULL`
      )
    );

    // Group by user ID to avoid duplicate messages if user is in multiple pools
    const uniqueUsers = Array.from(new Map<string, any>(pendingUsers.map((u: any) => [u.userId, u])).values());

    console.log(`Match ${match.homeTeam} vs ${match.awayTeam}: Found ${uniqueUsers.length} users to remind.`);

    for (const user of uniqueUsers) {
      if (!user.phone) continue;

      const firstName = user.userNickname || (user.userName || 'Craque').split(' ')[0];
      const message = `⚠️ *LEMBRETE DE PALPITE*\n\nFala, *${firstName}*! ⚽\n\nA partida *${match.homeTeam} x ${match.awayTeam}* começa em 30 minutos e você ainda não enviou seu palpite!\n\nCorre lá e não perca esses pontos: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bolao26-nine.vercel.app'}/palpites`;

      console.log(`Sending reminder to ${user.userNickname || user.userName} (${user.phone}) for match ${match.id}`);
      
      const result = await sendWhatsAppMessage(user.phone, message);

      if (result?.success) {
        await db.insert(sentReminders).values({
          userId: user.userId,
          matchId: match.id,
          type: "match_reminder",
        }).onConflictDoNothing();
      }
    }
  }
}
