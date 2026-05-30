"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function translateError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (message.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("Password should be at least 6 characters")) return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Por favor, confirme seu e-mail para entrar.";
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
