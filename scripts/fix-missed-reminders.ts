
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { inArray } from "drizzle-orm";
import { sendWhatsAppMessage } from "../lib/services/whatsapp";
import * as dotenv from "dotenv";

dotenv.config();

async function sendMissedReminders() {
  console.log("🚀 Enviando lembretes para os usuários que faltaram...");

  const targetEmails = ['davichicarelli09@gmail.com', 'thadeurios@hotmail.com'];

  const missedUsers = await db.select({
    id: users.id,
    name: users.name,
    phone: users.phone,
    email: users.email,
  })
  .from(users)
  .where(inArray(users.email, targetEmails));

  console.log(`📋 Processando ${missedUsers.length} usuários.`);

  const matchInfo = "🇨🇦  Canadá x Bósnia  🇧🇦  às 16:00!";

  for (const user of missedUsers) {
    if (!user.phone) continue;

    const message = `⚽ *BOLÃO 26 - AVISO GERAL*\n\nFala, *${user.name || 'Craque'}*! \n\nPassando para lembrar que hoje tem:\n${matchInfo}\n\nMesmo que você já tenha enviado seu palpite, vale dar aquela conferida ou avisar os amigos que ainda não mandaram! 🏃💨\n\n🔗 *Acesse aqui:* ${process.env.NEXT_PUBLIC_APP_URL || 'https://bolao26-nine.vercel.app'}/palpites\n\nBoa sorte!`;

    console.log(`📤 Enviando para ${user.name} (${user.phone})...`);
    
    try {
      const result = await sendWhatsAppMessage(user.phone, message);
      if (result?.success) {
        console.log(`✅ Sucesso: ${user.name}`);
      } else {
        console.log(`❌ Erro para ${user.name}:`, result?.error);
      }
    } catch (error) {
      console.error(`💥 Erro fatal para ${user.name}:`, error);
    }

    // Delay de 5 segundos entre esses dois últimos
    console.log("⏱️ Aguardando 5 segundos...");
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(5000);
  }

  console.log("🏁 Disparo manual finalizado!");
  process.exit(0);
}

sendMissedReminders().catch(err => {
  console.error(err);
  process.exit(1);
});
