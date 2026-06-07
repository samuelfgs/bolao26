"use server";

import { db } from "@/lib/db";
import { usersToPools, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
  return dbUser?.isAdmin === "admin";
}

export async function getPendingApprovals() {
  if (!await isAdmin()) throw new Error("Não autorizado");

  const pending = await db.select({
    userId: usersToPools.userId,
    poolId: usersToPools.poolId,
    userName: users.name,
    userEmail: users.email,
    userPhone: users.phone,
    status: usersToPools.status,
  })
  .from(usersToPools)
  .innerJoin(users, eq(usersToPools.userId, users.id))
  .where(eq(usersToPools.status, "pending"));

  return pending;
}

export async function updateApprovalStatus(userId: string, poolId: string, status: "approved" | "rejected") {
  if (!await isAdmin()) throw new Error("Não autorizado");

  await db.update(usersToPools)
    .set({ status })
    .where(
      and(
        eq(usersToPools.userId, userId),
        eq(usersToPools.poolId, poolId)
      )
    );

  revalidatePath("/admin/approvals");
  revalidatePath("/palpites");
}
