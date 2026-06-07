"use server";

import { db } from "@/lib/db";
import { users, usersToPools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

export async function ensureApproved(userId: string, poolId?: string) {
  if (!poolId) {
    const userPools = await db.select({
      poolId: usersToPools.poolId,
      status: usersToPools.status,
    })
    .from(usersToPools)
    .where(eq(usersToPools.userId, userId));

    if (userPools.length === 0) {
      redirect("/onboarding");
    }

    if (userPools.every(p => p.status === "pending")) {
      redirect("/waiting-approval");
    }
    
    return userPools[0].poolId;
  }

  const [membership] = await db.select()
    .from(usersToPools)
    .where(
      and(
        eq(usersToPools.userId, userId),
        eq(usersToPools.poolId, poolId)
      )
    );

  if (!membership) {
    redirect("/onboarding");
  }

  if (membership.status === "pending") {
    redirect("/waiting-approval");
  }

  return poolId;
}

function translateError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (message.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("Password should be at least 6 characters")) return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Por favor, confirme seu e-mail para entrar.";
  if (message.includes("Database error saving new user")) return "Erro ao criar conta. Por favor, tente novamente.";
  // For development/debugging, let's show the original error if we don't know it
  return message || "Ocorreu um erro inesperado. Tente novamente.";
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  const supabase = await createClient();

  // 1. Sign up with Supabase - Passing name and phone as metadata
  const { data: { user }, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone,
      },
    },
  });

  if (authError) {
    console.error("Supabase Sign-Up Error:", authError.message, authError.status);
    return { error: translateError(authError.message) };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/palpites");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
