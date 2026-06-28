
import { db } from "../lib/db";
import { users, usersToPools } from "../lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendWhatsAppMessage } from "../lib/services/whatsapp";
import * as dotenv from "dotenv";

dotenv.config();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function sendFinalBroadcast() {
  console.log("🚀 Iniciando disparo FINAL de lembrete geral...");

  const approvedUsers = await db.select({
    id: users.id,
    name: users.name,
    phone: users.phone,
    email: users.email,
  })
  .from(users)
  .innerJoin(usersToPools, eq(users.id, usersToPools.userId))
  .where(
    and(
      eq(usersToPools.status, "approved"),
      sql`${users.phone} IS NOT NULL`
    )
  );

  console.log(`📋 Encontrados ${approvedUsers.length} usuários aprovados com telefone.`);

  const matchInfo = "🇨🇦  Canadá x Bósnia  🇧🇦  às 16:00!";
  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < approvedUsers.length; i++) {
    const user = approvedUsers[i];

    // Pular os primeiros 17 usuários que já receberam com sucesso
    if (i < 17) {
      console.log(`⏭️ [${i+1}/${approvedUsers.length}] Pulando ${user.name} (Já enviado)`);
      skippedCount++;
      continue;
    }

    if (!user.phone || user.phone.includes("00000000")) {
      console.log(`⚠️ [${i+1}/${approvedUsers.length}] Pulando ${user.name} - Telefone inválido`);
      failCount++;
      continue;
    }

    const message = `⚽ *BOLÃO 26 - AVISO GERAL*\n\nFala, *${user.name || 'Craque'}*! \n\nPassando para lembrar que hoje tem:\n${matchInfo}\n\nMesmo que você já tenha enviado seu palpite, vale dar aquela conferida ou avisar os amigos que ainda não mandaram! 🏃💨\n\n🔗 *Acesse aqui:* ${process.env.NEXT_PUBLIC_APP_URL || 'https://bolao26-nine.vercel.app'}/palpites\n\nBoa sorte!`;

    console.log(`📤 [${i+1}/${approvedUsers.length}] Enviando para ${user.name} (${user.phone})...`);
    
    try {
      const result = await sendWhatsAppMessage(user.phone, message);
      
      if (result?.success) {
        console.log(`✅ Sucesso: ${user.name}`);
        successCount++;
      } else {
        console.log(`❌ Erro para ${user.name}:`, result?.error);
        failCount++;
      }
    } catch (error) {
      console.error(`💥 Erro fatal ao enviar para ${user.name}:`, error);
      failCount++;
    }

    // Delay de 15 segundos para máxima estabilidade
    if (i < approvedUsers.length - 1) {
      console.log("⏱️ Aguardando 15 segundos para o próximo envio...");
      await sleep(15000);
    }
  }

  console.log("\n--- RESULTADO FINAL ---");
  console.log(`✅ Sucesso (nesta rodada): ${successCount}`);
  console.log(`⏭️ Pulados (já enviados): ${skippedCount}`);
  console.log(`❌ Falhas/Inválidos: ${failCount}`);
  console.log(`Total processado: ${approvedUsers.length}`);

  console.log("🏁 Disparo finalizado!");
  process.exit(0);
}

sendFinalBroadcast().catch(err => {
  console.error("Erro fatal no processo:", err);
  process.exit(1);
});
